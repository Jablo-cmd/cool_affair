import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { getServerClient } from "@/lib/supabase/server";

export type Role = "admin" | "editor" | "viewer";

export interface StaffSession {
  userId: string;
  email: string | null;
  role: Role;
}

/**
 * Resolves the signed-in user and their Studio role. Uses getUser(), which
 * validates the session with Supabase rather than trusting the cookie.
 */
export async function getSession(): Promise<
  | { state: "unconfigured" }
  | { state: "signed-out" }
  | { state: "forbidden"; email: string | null }
  | { state: "staff"; session: StaffSession }
> {
  if (!isSupabaseConfigured) return { state: "unconfigured" };
  const db = await getServerClient();
  if (!db) return { state: "unconfigured" };
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { state: "signed-out" };
  const { data: profile } = await db.from("ca_profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile?.role as Role | undefined) ?? "viewer";
  if (role !== "admin" && role !== "editor") return { state: "forbidden", email: user.email ?? null };
  return { state: "staff", session: { userId: user.id, email: user.email ?? null, role } };
}

/**
 * For Server Actions: every mutation re-checks authorisation itself rather
 * than trusting that the page which rendered the form was protected.
 */
export async function requireStaff(options?: { admin?: boolean }) {
  const result = await getSession();
  if (result.state !== "staff") redirect("/studio/login");
  if (options?.admin && result.session.role !== "admin") {
    throw new Error("Only administrators can do this.");
  }
  const db = await getServerClient();
  if (!db) redirect("/studio/login");
  return { db, session: result.session };
}
