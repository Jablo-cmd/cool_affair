"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CONTENT_TAG } from "@/lib/data/queries";
import { MEDIA_BUCKET } from "@/lib/env";
import { enquiryStatusLabels } from "@/lib/data/labels";
import { requireStaff } from "@/lib/studio/auth";
import { parseFields, type FieldErrors } from "@/lib/studio/parse";
import { getResource, resources, settingsFields } from "@/lib/studio/resources";
import { getServerClient } from "@/lib/supabase/server";

export interface FormState {
  status: "idle" | "error" | "saved";
  message?: string;
  errors?: FieldErrors;
  /** Echoed back so a failed submission does not lose what was typed. */
  email?: string;
}

const APPROVABLE = ["owned", "licensed", "permission_granted"];

function dbMessage(error: { code?: string; message: string }) {
  if (error.code === "23505") return "Something with that URL slug already exists. Choose another slug.";
  if (error.code === "23514") return "One of the values is not allowed. Check the highlighted rules and try again.";
  if (error.code === "42501") return "You do not have permission to make this change.";
  if (error.code === "42P01") return "The database tables are missing. Apply the Supabase migration first.";
  return "The change could not be saved. Please try again.";
}

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/studio") && !next.startsWith("//") ? next : "/studio";
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const db = await getServerClient();
  if (!db) return { status: "error", message: "Supabase is not configured for this site yet." };
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { status: "error", message: "Enter your email and password.", email };
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: "Those details were not recognised.", email };
  redirect(safeNext(form.get("next")));
}

export async function signOut() {
  const db = await getServerClient();
  await db?.auth.signOut();
  redirect("/studio/login");
}

// ---------------------------------------------------------------------------
// Generic content records
// ---------------------------------------------------------------------------

export async function saveRecord(
  resourceKey: string,
  id: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const resource = getResource(resourceKey);
  if (!resource) return { status: "error", message: "Unknown content type." };
  const { db, session } = await requireStaff();

  const { values, errors } = parseFields(resource.fields, form);

  if (resource.key === "media" && values.status === "approved" && !APPROVABLE.includes(String(values.permission))) {
    errors.status = "Settle the usage permission (owned, licensed or granted) before approving.";
  }
  if (Object.keys(errors).length) {
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }

  if (resource.key === "journal" && values.status === "published" && !values.published_at) {
    values.published_at = new Date().toISOString();
  }

  let savedId = id;
  if (id) {
    const { error } = await db.from(resource.table).update(values).eq("id", id);
    if (error) return { status: "error", message: dbMessage(error) };
  } else {
    const row = resource.key === "media" ? { ...values, created_by: session.userId } : values;
    const { data, error } = await db.from(resource.table).insert(row).select("id").single();
    if (error) return { status: "error", message: dbMessage(error) };
    savedId = data.id as string;
  }

  updateTag(CONTENT_TAG);
  const back = typeof form.get("return_to") === "string" ? safeNext(form.get("return_to")) : null;
  redirect(back && !id ? back : `/studio/${resource.key}/${savedId}?saved=1`);
}

export async function deleteRecord(resourceKey: string, id: string) {
  const resource = getResource(resourceKey);
  if (!resource) throw new Error("Unknown content type.");
  const { db } = await requireStaff();

  if (resource.key === "media") {
    const { data } = await db.from(resource.table).select("storage_path").eq("id", id).maybeSingle();
    if (data?.storage_path) await db.storage.from(MEDIA_BUCKET).remove([data.storage_path]);
  }
  const { error } = await db.from(resource.table).delete().eq("id", id);
  if (error) throw new Error(dbMessage(error));

  updateTag(CONTENT_TAG);
  redirect(`/studio/${resource.key}?deleted=1`);
}

// ---------------------------------------------------------------------------
// Site settings (single row)
// ---------------------------------------------------------------------------

export async function saveSettings(_prev: FormState, form: FormData): Promise<FormState> {
  const { db } = await requireStaff();
  const { values, errors } = parseFields(settingsFields, form);
  if (Object.keys(errors).length) {
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }
  const { error } = await db.from("ca_site_settings").upsert({ id: 1, ...values });
  if (error) return { status: "error", message: dbMessage(error) };
  updateTag(CONTENT_TAG);
  return { status: "saved", message: "Settings saved. The public site is updated." };
}

// ---------------------------------------------------------------------------
// Media: the browser uploads the file to Storage, then registers it here with
// its provenance. Nothing is public until an editor approves it.
// ---------------------------------------------------------------------------

export async function registerMedia(_prev: FormState, form: FormData): Promise<FormState> {
  const { db, session } = await requireStaff();
  const { values, errors } = parseFields(resources.media.fields, form);

  const storagePath = String(form.get("storage_path") ?? "").trim();
  const kind = String(form.get("kind") ?? "");
  if (!["image", "audio", "video"].includes(kind)) errors.kind = "Choose the kind of media.";
  if (storagePath && !/^(image|audio|video)\/\d{4}\/[\w.-]+$/.test(storagePath)) {
    errors.file = "The upload path is not valid. Upload the file again.";
  }
  if (!storagePath && !values.external_url) errors.file = "Upload a file or give an external URL.";
  if (values.status === "approved" && !APPROVABLE.includes(String(values.permission))) {
    errors.status = "Settle the usage permission before approving.";
  }

  const cleanup = async () => {
    if (storagePath) await db.storage.from(MEDIA_BUCKET).remove([storagePath]);
  };

  if (Object.keys(errors).length) {
    await cleanup();
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }

  const dimension = (key: string) => {
    const n = Number(form.get(key));
    return Number.isInteger(n) && n > 0 && n < 100_000 ? n : null;
  };

  const { data, error } = await db
    .from("ca_media_assets")
    .insert({
      ...values,
      kind,
      storage_path: storagePath || null,
      width: dimension("width"),
      height: dimension("height"),
      created_by: session.userId,
    })
    .select("id")
    .single();
  if (error) {
    await cleanup();
    return { status: "error", message: dbMessage(error) };
  }
  updateTag(CONTENT_TAG);
  redirect(`/studio/media/${data.id}?saved=1`);
}

// ---------------------------------------------------------------------------
// Enquiries: status changes and internal notes form one history.
// ---------------------------------------------------------------------------

export async function updateEnquiry(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const { db, session } = await requireStaff();
  const status = String(form.get("status") ?? "");
  const note = String(form.get("note") ?? "").trim();
  if (!(status in enquiryStatusLabels)) return { status: "error", message: "Choose a valid status." };
  if (note.length > 4000) return { status: "error", message: "Keep the note under 4,000 characters." };

  const { data: current, error: readError } = await db
    .from("ca_enquiries")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (readError || !current) return { status: "error", message: "Enquiry not found." };

  const entries: string[] = [];
  if (current.status !== status) {
    const { error } = await db.from("ca_enquiries").update({ status }).eq("id", id);
    if (error) return { status: "error", message: dbMessage(error) };
    entries.push(
      `Status changed from ${enquiryStatusLabels[current.status as keyof typeof enquiryStatusLabels]} to ${enquiryStatusLabels[status as keyof typeof enquiryStatusLabels]}.`,
    );
  }
  if (note) entries.push(note);
  if (!entries.length) return { status: "idle" };

  const { error } = await db.from("ca_enquiry_notes").insert(
    entries.map((body) => ({ enquiry_id: id, body, author_id: session.userId, author_email: session.email })),
  );
  if (error) return { status: "error", message: dbMessage(error) };
  return { status: "saved", message: "Saved to the enquiry history." };
}

// ---------------------------------------------------------------------------
// Team roles (admins only)
// ---------------------------------------------------------------------------

export async function setRole(userId: string, form: FormData) {
  const { db, session } = await requireStaff({ admin: true });
  const role = String(form.get("role") ?? "");
  if (!["admin", "editor", "viewer"].includes(role)) throw new Error("Invalid role.");
  if (userId === session.userId && role !== "admin") {
    throw new Error("You cannot remove your own administrator role.");
  }
  const { error } = await db.from("ca_profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(dbMessage(error));
  redirect("/studio/team?saved=1");
}

export async function deleteEnquiry(id: string) {
  const { db } = await requireStaff({ admin: true });
  const { error } = await db.from("ca_enquiries").delete().eq("id", id);
  if (error) throw new Error(dbMessage(error));
  redirect("/studio/enquiries");
}
