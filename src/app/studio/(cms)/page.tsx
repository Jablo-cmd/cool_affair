import Link from "next/link";
import { StatusPill, StudioHeader } from "@/components/studio/PageHeader";
import { enquiryTypeLabels } from "@/lib/data/labels";
import type { EnquiryType } from "@/lib/data/types";
import { formatShortDate } from "@/lib/format";
import { requireStaff } from "@/lib/studio/auth";
import { resourceOrder, resources } from "@/lib/studio/resources";

export const metadata = { title: "Dashboard" };

const QUICK = [
  { href: "/studio/releases/new", label: "New release" },
  { href: "/studio/journal/new", label: "Write an article" },
  { href: "/studio/media/new", label: "Upload media" },
  { href: "/studio/events/new", label: "Add a performance" },
  { href: "/studio/archive/new", label: "Add to archive" },
  { href: "/studio/settings", label: "Edit artist story" },
];

export default async function Dashboard() {
  const { db } = await requireStaff();

  const counts = await Promise.all(
    resourceOrder.map(async (key) => {
      const r = resources[key];
      const statusColumn = "status";
      const published = key === "media" ? "approved" : "published";
      const [all, live] = await Promise.all([
        db.from(r.table).select("id", { count: "exact", head: true }),
        db.from(r.table).select("id", { count: "exact", head: true }).eq(statusColumn, published),
      ]);
      return { key, label: r.label, total: all.count ?? 0, live: live.count ?? 0, error: all.error };
    }),
  );
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: enquiries }, { count: newCount }, { data: events }] = await Promise.all([
    db.from("ca_enquiries").select("id, name, enquiry_type, status, created_at, event_date").order("created_at", { ascending: false }).limit(6),
    db.from("ca_enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    db.from("ca_events").select("id, title, event_date, city, status, confirmed").gte("event_date", today).order("event_date").limit(5),
  ]);
  const missingTables = counts.some((c) => c.error?.code === "42P01" || c.error?.code === "PGRST205");

  return (
    <>
      <StudioHeader title="The control room" description="Everything on the public site is managed from here." />

      {missingTables && (
        <p role="alert" className="mb-8 border border-signal/60 px-4 py-3 text-sm">
          Some content tables are missing. Apply <code>supabase/migrations/20261030000000_cool_affair_universe.sql</code> (see docs/SUPABASE.md).
        </p>
      )}

      <section aria-label="Quick actions" className="mb-10 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <Link key={q.href} href={q.href} className="border border-line px-4 py-2 text-sm text-silver hover:border-copper hover:text-copper">
            + {q.label}
          </Link>
        ))}
      </section>

      <section aria-label="Content" className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
        {counts.map((c) => (
          <Link key={c.key} href={`/studio/${c.key}`} className="bg-graphite p-5 hover:bg-charcoal">
            <p className="eyebrow">{c.label}</p>
            <p className="mt-3 font-display text-4xl">{c.total}</p>
            <p className="mt-1 text-xs text-mist">
              {c.live} {c.key === "media" ? "approved" : "published"} · {c.total - c.live} {c.key === "media" ? "awaiting" : "draft"}
            </p>
          </Link>
        ))}
        <Link href="/studio/enquiries?status=new" className="bg-graphite p-5 hover:bg-charcoal">
          <p className="eyebrow">New enquiries</p>
          <p className={`mt-3 font-display text-4xl ${newCount ? "text-copper" : ""}`}>{newCount ?? 0}</p>
          <p className="mt-1 text-xs text-mist">awaiting review</p>
        </Link>
      </section>

      <div className="mt-12 grid gap-10 xl:grid-cols-2">
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="eyebrow text-bone">Recent enquiries</h2>
            <Link href="/studio/enquiries" className="text-xs text-mist hover:text-bone">All →</Link>
          </div>
          {enquiries?.length ? (
            <ul className="border-t border-line">
              {enquiries.map((e) => (
                <li key={e.id}>
                  <Link href={`/studio/enquiries/${e.id}`} className="flex items-center justify-between gap-4 border-b border-line py-3 hover:bg-charcoal">
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{e.name}</span>
                      <span className="text-xs text-mist">
                        {enquiryTypeLabels[e.enquiry_type as EnquiryType]} · {formatShortDate(e.created_at)}
                      </span>
                    </span>
                    <StatusPill status={e.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mist">No enquiries yet.</p>
          )}
        </section>
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="eyebrow text-bone">Upcoming performances</h2>
            <Link href="/studio/events" className="text-xs text-mist hover:text-bone">All →</Link>
          </div>
          {events?.length ? (
            <ul className="border-t border-line">
              {events.map((e) => (
                <li key={e.id}>
                  <Link href={`/studio/events/${e.id}`} className="flex items-center justify-between gap-4 border-b border-line py-3 hover:bg-charcoal">
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{e.title}</span>
                      <span className="text-xs text-mist">
                        {formatShortDate(e.event_date)}
                        {e.city ? ` · ${e.city}` : ""}
                        {e.confirmed ? "" : " · unconfirmed"}
                      </span>
                    </span>
                    <StatusPill status={e.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mist">No upcoming dates.</p>
          )}
        </section>
      </div>
    </>
  );
}
