// Verifies the Row Level Security rules against a LOCAL Supabase stack.
//
//   npx supabase start            # in a project with supabase/migrations
//   SUPABASE_URL=http://127.0.0.1:54321 \
//   SUPABASE_ANON_KEY=<local publishable key> \
//   SUPABASE_SERVICE_ROLE_KEY=<local secret key> \
//   npm run test:rls
//
// It creates throwaway users and rows, so it refuses to run against anything
// that is not localhost. Never point it at production.

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error("Set SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY (local stack only).");
  process.exit(2);
}
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(url)) {
  console.error(`Refusing to run against ${url}: this script is for a local Supabase stack only.`);
  process.exit(2);
}

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, serviceKey, opts);
const stamp = Date.now();
let failures = 0;

function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${!ok && detail ? `  (${detail})` : ""}`);
  if (!ok) failures++;
}

async function userClient(role) {
  const email = `rls-${role}-${stamp}@example.test`;
  const password = `pw-${stamp}-${role}-Xy9!`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  if (role !== "viewer") {
    const { error: e } = await admin.from("ca_profiles").update({ role }).eq("id", data.user.id);
    if (e) throw e;
  }
  const client = createClient(url, anonKey, opts);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  return { client, id: data.user.id };
}

const anon = createClient(url, anonKey, opts);
const viewer = await userClient("viewer");
const editor = await userClient("editor");
const adminUser = await userClient("admin");

// Fixtures created with the service role.
const { data: draft } = await admin.from("ca_releases").insert({ slug: `draft-${stamp}`, title: "Draft", status: "draft" }).select().single();
const { data: published } = await admin.from("ca_releases").insert({ slug: `pub-${stamp}`, title: "Published", status: "published" }).select().single();
const { data: pending } = await admin.from("ca_media_assets").insert({ kind: "image", title: "Pending", source: "test", external_url: "https://example.test/a.jpg" }).select().single();
const { data: future } = await admin.from("ca_journal_posts").insert({ slug: `future-${stamp}`, title: "Scheduled", status: "published", published_at: new Date(Date.now() + 86400000).toISOString() }).select().single();
const { data: unverified } = await admin.from("ca_collaborators").insert({ slug: `c-${stamp}`, name: "Unverified", status: "published", verified: false }).select().single();

// --- Anonymous visitors ---------------------------------------------------
{
  const { data } = await anon.from("ca_releases").select("id").in("id", [draft.id, published.id]);
  check("anon sees published releases only", data?.length === 1 && data[0].id === published.id, JSON.stringify(data));
  const { data: m } = await anon.from("ca_media_assets").select("id").eq("id", pending.id);
  check("anon cannot see unapproved media", m?.length === 0);
  const { data: j } = await anon.from("ca_journal_posts").select("id").eq("id", future.id);
  check("anon cannot see a scheduled (future) article", j?.length === 0);
  const { data: c } = await anon.from("ca_collaborators").select("id").eq("id", unverified.id);
  check("anon cannot see unverified collaborators", c?.length === 0);
  const { error: w } = await anon.from("ca_releases").insert({ slug: `x-${stamp}`, title: "x" });
  check("anon cannot create releases", Boolean(w));
  const { error: s } = await anon.from("ca_site_settings").upsert({ id: 1, artist_name: "Hacked" });
  check("anon cannot change settings", Boolean(s));
  const { error: e1 } = await anon.from("ca_enquiries").insert({ name: "Test", email: "t@example.test", enquiry_type: "general", message: "Hello there, testing." });
  check("anon can submit an enquiry", !e1, e1?.message);
  const { error: e2 } = await anon.from("ca_enquiries").insert({ name: "Test", email: "t@example.test", enquiry_type: "general", message: "Hello there, testing.", status: "confirmed" });
  check("anon cannot submit a pre-confirmed enquiry", Boolean(e2));
  const { data: e3 } = await anon.from("ca_enquiries").select("id");
  check("anon cannot read enquiries", (e3?.length ?? 0) === 0);
  const { error: up } = await anon.storage.from("ca-media").upload(`image/2026/anon-${stamp}.txt`, new Blob(["x"]), { contentType: "text/plain" });
  check("anon cannot upload to storage", Boolean(up));
}

// --- Signed-in viewer (no Studio role) -------------------------------------
{
  const { data } = await viewer.client.from("ca_releases").select("id").eq("id", draft.id);
  check("viewer cannot see drafts", data?.length === 0);
  const { error } = await viewer.client.from("ca_releases").update({ title: "x" }).eq("id", published.id).select().single();
  check("viewer cannot edit content", Boolean(error));
  const { data: e } = await viewer.client.from("ca_enquiries").select("id");
  check("viewer cannot read enquiries", (e?.length ?? 0) === 0);
  const { error: r } = await viewer.client.from("ca_profiles").update({ role: "admin" }).eq("id", viewer.id).select().single();
  check("viewer cannot promote themselves", Boolean(r));
}

// --- Editor ----------------------------------------------------------------
{
  const { data } = await editor.client.from("ca_releases").select("id").eq("id", draft.id);
  check("editor sees drafts", data?.length === 1);
  const { error } = await editor.client.from("ca_releases").update({ title: "Edited" }).eq("id", draft.id);
  check("editor can edit content", !error, error?.message);
  const { data: e } = await editor.client.from("ca_enquiries").select("id");
  check("editor can read enquiries", (e?.length ?? 0) > 0);
  const { error: approve } = await editor.client.from("ca_media_assets").update({ status: "approved" }).eq("id", pending.id);
  check("media cannot be approved while permission is pending", Boolean(approve));
  const { error: up } = await editor.client.storage.from("ca-media").upload(`image/2026/editor-${stamp}.txt`, new Blob(["x"]), { contentType: "text/plain" });
  check("editor can upload to storage", !up, up?.message);
  if (!up) await editor.client.storage.from("ca-media").remove([`image/2026/editor-${stamp}.txt`]);
  const { error: r } = await editor.client.from("ca_profiles").update({ role: "admin" }).eq("id", editor.id).select().single();
  check("editor cannot change roles", Boolean(r));
  const { data: del } = await editor.client.from("ca_enquiries").delete().neq("id", "00000000-0000-0000-0000-000000000000").select("id");
  check("editor cannot delete enquiries", (del?.length ?? 0) === 0);
}

// --- Admin -----------------------------------------------------------------
{
  const { error } = await adminUser.client.from("ca_profiles").update({ role: "editor" }).eq("id", viewer.id).select().single();
  check("admin can change roles", !error, error?.message);
}

// Clean up fixtures and test users.
await admin.from("ca_releases").delete().in("id", [draft.id, published.id]);
await admin.from("ca_media_assets").delete().eq("id", pending.id);
await admin.from("ca_journal_posts").delete().eq("id", future.id);
await admin.from("ca_collaborators").delete().eq("id", unverified.id);
await admin.from("ca_enquiries").delete().eq("email", "t@example.test");
for (const u of [viewer, editor, adminUser]) await admin.auth.admin.deleteUser(u.id);

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll RLS checks passed.");
process.exit(failures ? 1 : 0);
