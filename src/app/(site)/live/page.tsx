import Link from "next/link";
import { EventList } from "@/components/site/EventList";
import { JsonLd } from "@/components/site/JsonLd";
import { MediaImage } from "@/components/site/MediaImage";
import { ArrowLink, EmptyState, PageHero, SectionHeader } from "@/components/site/Section";
import { Waveform } from "@/components/site/Waveform";
import { getArchive, getEvents, getMediaMap, getSettings } from "@/lib/data/queries";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Live: The Performance Experience",
  description:
    "Cool Affair live: DJ performances, live electronic sets, collaborations and the Full Band Experience. Upcoming appearances, event archive and booking enquiries.",
  path: "/live",
});

const FORMATS = [
  {
    title: "DJ performance",
    body: "Selections that move between broken beat, nu-jazz, Afrobeat, soulful and deep house.",
    book: "dj_booking",
  },
  {
    title: "Live electronic",
    body: "Production performed live: arrangements built and reshaped in the moment.",
    book: "live_performance",
  },
  {
    title: "Collaborations",
    body: "Shared stages with musicians, vocalists and other artists.",
    book: "collaboration",
  },
  {
    title: "Full Band Experience",
    body: "An expanded format bringing musicians and electronic production together.",
    book: "full_band",
    href: "/live/full-band",
  },
] as const;

export default async function LivePage() {
  const [settings, events, archive, media] = await Promise.all([
    getSettings(),
    getEvents(),
    getArchive(),
    getMediaMap(),
  ]);
  const photos = archive
    .filter((a) => a.category === "live" && a.media_id && media[a.media_id]?.kind === "image")
    .slice(0, 7);

  return (
    <>
      <PageHero
        eyebrow="Live · The performance experience"
        title={
          <>
            The sound,
            <br />
            <em className="text-silver">in the room.</em>
          </>
        }
        lede={settings.live_intro}
      >
        <Waveform seed="live" bars={120} animated className="mt-16 h-16 w-full text-smoke" />
      </PageHero>

      <section className="container-ca pb-24 md:pb-36">
        <SectionHeader index="01" eyebrow="Formats" title="Four ways to experience it." />
        <ol className="border-t border-line">
          {FORMATS.map((format, i) => (
            <li key={format.title} className="reveal group grid gap-4 border-b border-line py-8 md:grid-cols-12 md:items-center">
              <span className="font-mono text-xs text-mist md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-4xl leading-none md:col-span-5 md:text-5xl">
                {"href" in format ? (
                  <Link href={format.href} className="hover:text-copper">
                    {format.title}
                  </Link>
                ) : (
                  format.title
                )}
              </h3>
              <p className="text-silver md:col-span-4">{format.body}</p>
              <div className="md:col-span-2 md:text-right">
                <ArrowLink href={`/book?type=${format.book}`}>Enquire</ArrowLink>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-ca pb-24 md:pb-36" id="upcoming">
        <SectionHeader index="02" eyebrow="Upcoming appearances" title="Where to hear it next." />
        {events.upcoming.length ? (
          <EventList events={events.upcoming} />
        ) : (
          <EmptyState title="No dates announced.">
            Confirmed appearances are listed here as soon as they are announced. Promoters and
            venues can <Link href="/book" className="text-bone underline decoration-copper underline-offset-4">enquire about availability</Link>.
          </EmptyState>
        )}
      </section>

      {photos.length > 0 && (
        <section className="pb-24 md:pb-36">
          <div className="container-ca">
            <SectionHeader index="03" eyebrow="Performance photography" title="Moments from the floor." />
          </div>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-8 xl:px-14">
            {photos.map((item) => {
              const photo = media[item.media_id!];
              return (
                <figure key={item.id} className="relative aspect-[3/4] w-[78vw] shrink-0 snap-start overflow-hidden bg-charcoal sm:w-[42vw] lg:w-[28vw]">
                  <MediaImage media={{ ...photo, alt: photo.alt || item.title }} sizes="(min-width: 1024px) 28vw, 78vw" className="object-cover" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-4 pt-12 text-sm text-silver">
                    {item.title}
                    {photo.credit && <span className="block text-xs text-mist">Photo: {photo.credit}</span>}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      <section className="container-ca pb-24 md:pb-36">
        <SectionHeader index={photos.length ? "04" : "03"} eyebrow="Event archive" title="Past performances." />
        {events.past.length ? (
          <EventList events={events.past} past />
        ) : (
          <EmptyState title="The event archive is empty.">
            Past performances are added from the Studio once their details are verified.
          </EmptyState>
        )}
      </section>

      <section className="container-ca">
        <div className="reveal grid gap-10 border border-line p-8 md:grid-cols-2 md:p-14">
          <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">
            Booking a performance?
          </h2>
          <div className="flex flex-col justify-between gap-6">
            <p className="text-silver">
              Tell us about the event, the room and the date. Enquiries are reviewed personally; a
              booking is only confirmed in writing.
            </p>
            <Link href="/book?type=dj_booking" className="w-fit bg-bone px-7 py-4 text-sm font-medium text-ink hover:bg-copper">
              Booking enquiry
            </Link>
          </div>
        </div>
      </section>

      {events.upcoming.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": events.upcoming.map((e) => ({
              "@type": "MusicEvent",
              name: e.title,
              startDate: e.event_date,
              eventStatus: "https://schema.org/EventScheduled",
              url: absoluteUrl(`/live#${e.slug}`),
              performer: { "@type": "Person", "@id": absoluteUrl("/#artist"), name: "Cool Affair" },
              ...(e.venue || e.city
                ? {
                    location: {
                      "@type": "Place",
                      name: e.venue ?? e.city,
                      address: [e.city, e.country].filter(Boolean).join(", "),
                    },
                  }
                : {}),
              ...(e.ticket_url ? { offers: { "@type": "Offer", url: e.ticket_url } } : {}),
            })),
          }}
        />
      )}
    </>
  );
}
