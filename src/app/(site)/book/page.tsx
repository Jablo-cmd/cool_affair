import { Suspense } from "react";
import { BookingForm } from "@/components/site/BookingForm";
import { PageHero } from "@/components/site/Section";
import { enquiryTypeLabels } from "@/lib/data/labels";
import { getSettings } from "@/lib/data/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Book Cool Affair",
  description:
    "Booking and enquiries for Cool Affair: DJ sets, live performance, the Full Band Experience, music production, sound engineering, collaborations and label enquiries.",
  path: "/book",
});

const STEPS = [
  ["Send", "Share the date, place and idea. The more context, the better."],
  ["Review", "Every enquiry is read personally, usually within a few working days."],
  ["Confirm", "Availability, fees and requirements are agreed in writing before anything is booked."],
];

export default async function BookPage() {
  const settings = await getSettings();
  const email = settings.booking_email ?? settings.contact_email;
  return (
    <>
      <PageHero
        eyebrow="Book · Enquiries"
        title={
          <>
            Book
            <br />
            <em className="text-silver">Cool Affair.</em>
          </>
        }
        lede="DJ sets, live performance, the Full Band Experience, production, sound engineering, collaborations and label conversations."
      />
      <section className="container-ca grid gap-16 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <h2 className="eyebrow mb-6">What to expect</h2>
          <ol className="space-y-6 border-t border-line pt-6">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="font-mono text-xs text-copper">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-display text-2xl">{title}</p>
                  <p className="mt-1 text-sm text-mist">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <h2 className="eyebrow mb-4 mt-14">Enquiry types</h2>
          <ul className="flex flex-wrap gap-2">
            {Object.values(enquiryTypeLabels).map((label) => (
              <li key={label} className="border border-line px-3 py-1 text-xs text-silver">
                {label}
              </li>
            ))}
          </ul>
          {email && (
            <div className="mt-14">
              <h2 className="eyebrow mb-3">Direct</h2>
              <a href={`mailto:${email}`} className="break-all text-bone underline decoration-copper underline-offset-4">
                {email}
              </a>
            </div>
          )}
        </aside>
        <div className="lg:col-span-7 lg:col-start-6">
          <Suspense fallback={<div className="h-[40rem]" aria-busy="true" />}>
            <BookingForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
