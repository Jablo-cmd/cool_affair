import { notFound } from "next/navigation";
import { deleteEnquiry, updateEnquiry } from "../../../actions";
import { ConfirmForm } from "@/components/studio/ConfirmButton";
import { EnquiryUpdate } from "@/components/studio/EnquiryUpdate";
import { StatusPill, StudioHeader } from "@/components/studio/PageHeader";
import { enquiryTypeLabels } from "@/lib/data/labels";
import type { Enquiry, EnquiryNote } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { requireStaff } from "@/lib/studio/auth";

const UUID = /^[0-9a-f-]{36}$/i;
const stamp = new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Johannesburg" });

export default async function EnquiryDetail({ params }: PageProps<"/studio/enquiries/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { db, session } = await requireStaff();
  const [{ data }, { data: notes }] = await Promise.all([
    db.from("ca_enquiries").select("*").eq("id", id).maybeSingle(),
    db.from("ca_enquiry_notes").select("*").eq("enquiry_id", id).order("created_at", { ascending: false }),
  ]);
  if (!data) notFound();
  const e = data as Enquiry;
  const history = (notes ?? []) as EnquiryNote[];
  const subject = encodeURIComponent(`Re: ${enquiryTypeLabels[e.enquiry_type]} enquiry · Cool Affair`);

  const details: [string, string | null][] = [
    ["Email", e.email],
    ["Organisation", e.organisation],
    ["Type", enquiryTypeLabels[e.enquiry_type]],
    ["Event / project date", formatDate(e.event_date)],
    ["Location", e.location],
    ["Budget", e.budget_range],
    ["Received", stamp.format(new Date(e.created_at))],
  ];

  return (
    <>
      <StudioHeader
        title={e.name}
        crumbs={[{ href: "/studio/enquiries", label: "Enquiries" }]}
        actions={
          <>
            <StatusPill status={e.status} />
            <a href={`mailto:${e.email}?subject=${subject}`} className="inline-flex items-center gap-2 border border-line px-4 py-2 text-sm text-silver hover:border-bone hover:text-bone">
              Reply by email
            </a>
          </>
        }
      />
      <div className="grid gap-12 xl:grid-cols-[1fr_22rem]">
        <div>
          <dl className="grid gap-x-6 gap-y-3 border-b border-line pb-8 text-sm sm:grid-cols-[10rem_1fr]">
            {details.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-mist">{label}</dt>
                <dd className="break-words text-bone">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
          <h2 className="eyebrow mb-3 mt-8 text-bone">Message</h2>
          <p className="whitespace-pre-wrap leading-relaxed text-silver">{e.message}</p>

          <h2 className="eyebrow mb-3 mt-12 text-bone">History</h2>
          {history.length ? (
            <ol className="space-y-4 border-l border-line pl-5">
              {history.map((n) => (
                <li key={n.id}>
                  <p className="text-xs text-mist">
                    {stamp.format(new Date(n.created_at))} · {n.author_email ?? "Studio"}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-silver">{n.body}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-mist">No notes yet.</p>
          )}
        </div>
        <aside className="space-y-10">
          <EnquiryUpdate status={e.status} action={updateEnquiry.bind(null, e.id)} />
          {session.role === "admin" && (
            <div className="border-t border-line pt-6">
              <p className="mb-3 text-xs text-mist">Admins can delete an enquiry and its history, for example on a data-removal request.</p>
              <ConfirmForm action={deleteEnquiry.bind(null, e.id)} label="Delete enquiry" question="Delete this enquiry and its history permanently?" />
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
