import Link from "next/link";
import { StatusPill, StudioHeader } from "@/components/studio/PageHeader";
import { enquiryStatusLabels, enquiryTypeLabels } from "@/lib/data/labels";
import type { Enquiry } from "@/lib/data/types";
import { formatShortDate } from "@/lib/format";
import { requireStaff } from "@/lib/studio/auth";

export const metadata = { title: "Enquiries" };

export default async function Enquiries({ searchParams }: PageProps<"/studio/enquiries">) {
  const query = await searchParams;
  const status = typeof query.status === "string" && query.status in enquiryStatusLabels ? query.status : null;
  const type = typeof query.type === "string" && query.type in enquiryTypeLabels ? query.type : null;
  const { db } = await requireStaff();

  let request = db.from("ca_enquiries").select("*").order("created_at", { ascending: false }).limit(300);
  if (status) request = request.eq("status", status);
  else request = request.neq("status", "archived");
  if (type) request = request.eq("enquiry_type", type);
  const { data, error } = await request;
  const enquiries = (data ?? []) as Enquiry[];

  const tab = (value: string | null, label: string) => {
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    if (type) params.set("type", type);
    const active = status === value;
    return (
      <Link
        key={label}
        href={`/studio/enquiries${params.size ? `?${params}` : ""}`}
        aria-current={active ? "page" : undefined}
        className={`border px-3 py-1.5 text-xs ${active ? "border-copper text-copper" : "border-line text-silver hover:text-bone"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <StudioHeader title="Enquiries" description="Bookings and messages from the public site. Reviewed by people, never auto-confirmed." />
      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
        {tab(null, "Open")}
        {Object.entries(enquiryStatusLabels).map(([value, label]) => tab(value, label))}
      </nav>
      <form className="mb-8 flex flex-wrap items-center gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <label htmlFor="type" className="eyebrow">Type</label>
        <select id="type" name="type" defaultValue={type ?? ""} className="border border-line bg-ink px-2 py-1.5 text-xs">
          <option value="">All types</option>
          {Object.entries(enquiryTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button type="submit" className="border border-line px-3 py-1.5 text-xs text-silver hover:text-bone">Apply</button>
      </form>

      {error ? (
        <p role="alert" className="border border-signal/60 px-4 py-3 text-sm">Could not load enquiries: {error.message}</p>
      ) : enquiries.length === 0 ? (
        <p className="border border-dashed border-line px-6 py-14 text-center text-sm text-mist">No enquiries in this view.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-[0.12em] text-mist">
                <th scope="col" className="py-3 pr-4 font-normal">Received</th>
                <th scope="col" className="py-3 pr-4 font-normal">From</th>
                <th scope="col" className="py-3 pr-4 font-normal">Type</th>
                <th scope="col" className="py-3 pr-4 font-normal">Date / place</th>
                <th scope="col" className="py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id} className="border-b border-line hover:bg-charcoal">
                  <td className="py-3 pr-4 text-mist">{formatShortDate(e.created_at)}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/studio/enquiries/${e.id}`} className="text-bone hover:text-copper">{e.name}</Link>
                    {e.organisation && <span className="block text-xs text-mist">{e.organisation}</span>}
                  </td>
                  <td className="py-3 pr-4 text-silver">{enquiryTypeLabels[e.enquiry_type]}</td>
                  <td className="py-3 pr-4 text-mist">{[formatShortDate(e.event_date), e.location].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="py-3"><StatusPill status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
