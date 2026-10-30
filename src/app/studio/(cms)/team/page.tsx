import { redirect } from "next/navigation";
import { setRole } from "../../actions";
import { StudioHeader } from "@/components/studio/PageHeader";
import { formatShortDate } from "@/lib/format";
import { requireStaff } from "@/lib/studio/auth";

export const metadata = { title: "Team" };

export default async function TeamPage({ searchParams }: PageProps<"/studio/team">) {
  const [{ db, session }, query] = await Promise.all([requireStaff(), searchParams]);
  if (session.role !== "admin") redirect("/studio");
  const { data } = await db.from("ca_profiles").select("id, email, role, created_at").order("created_at");
  const people = data ?? [];

  return (
    <>
      <StudioHeader
        title="Team"
        description="Admins manage everything including roles; editors manage content and enquiries; viewers have no Studio access. New accounts are created in Supabase Auth and start as viewers."
      />
      {query.saved && <p role="status" className="mb-6 border border-copper/60 px-4 py-3 text-sm">Role updated.</p>}
      <ul className="border-t border-line">
        {people.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-4">
            <div>
              <p className="text-sm text-bone">{p.email ?? p.id}</p>
              <p className="text-xs text-mist">Since {formatShortDate(p.created_at)}{p.id === session.userId ? " · you" : ""}</p>
            </div>
            <form action={setRole.bind(null, p.id)} className="flex items-center gap-2">
              <label htmlFor={`role-${p.id}`} className="sr-only">Role</label>
              <select id={`role-${p.id}`} name="role" defaultValue={p.role} className="border border-line bg-ink px-2 py-1.5 text-sm" disabled={p.id === session.userId}>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer (no access)</option>
              </select>
              {p.id !== session.userId && (
                <button type="submit" className="border border-line px-3 py-1.5 text-xs text-silver hover:text-bone">Update</button>
              )}
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
