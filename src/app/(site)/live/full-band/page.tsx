import Link from "next/link";
import { Embed } from "@/components/site/Embed";
import { EventList } from "@/components/site/EventList";
import { MediaImage } from "@/components/site/MediaImage";
import { Prose } from "@/components/site/Prose";
import { ArrowLink, PageHero, Placeholder } from "@/components/site/Section";
import { Waveform } from "@/components/site/Waveform";
import { getEvents, getMediaMap, getSettings } from "@/lib/data/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Full Band Experience",
  description:
    "The Cool Affair Full Band Experience: an expanded live format bringing musicians and electronic production together. Concept, configuration, technical requirements and booking.",
  path: "/live/full-band",
});

function Block({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="reveal grid gap-6 border-t border-line py-12 md:grid-cols-12">
      <h2 className="eyebrow md:col-span-3">
        <span className="mr-3 text-copper">{index}</span>
        {title}
      </h2>
      <div className="md:col-span-8">{children}</div>
    </section>
  );
}

export default async function FullBandPage() {
  const [settings, media, events] = await Promise.all([getSettings(), getMediaMap(), getEvents()]);
  const photo = settings.band_media_id ? media[settings.band_media_id] : undefined;
  const bandDates = [...events.upcoming, ...events.past].filter((e) => e.format === "full_band");

  return (
    <>
      <PageHero
        eyebrow="Live · Expanded format"
        title={
          <>
            Full Band
            <br />
            <em className="text-silver">Experience.</em>
          </>
        }
        lede={settings.band_concept}
      >
        <div className="mt-16 grid grid-cols-4 gap-3 md:grid-cols-8" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <Waveform key={i} seed={`band-voice-${i}`} bars={18} animated className={`h-20 w-full ${i === 3 ? "text-copper" : "text-smoke"} ${i > 3 ? "hidden md:block" : ""}`} />
          ))}
        </div>
      </PageHero>

      <div className="container-ca">
        {photo && (
          <figure className="reveal relative mb-12 aspect-[16/9] overflow-hidden bg-charcoal">
            <MediaImage media={{ ...photo, alt: photo.alt || "Full Band Experience" }} sizes="100vw" className="object-cover" />
            {photo.credit && (
              <figcaption className="absolute bottom-3 right-3 bg-ink/80 px-2 py-1 text-xs text-mist">
                Photo: {photo.credit}
              </figcaption>
            )}
          </figure>
        )}

        <Block index="01" title="Performance concept">
          {settings.band_concept ? (
            <p className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.1] text-bone">
              {settings.band_concept}
            </p>
          ) : (
            <Placeholder label="The performance concept has not been described yet." where="Settings → Full Band" />
          )}
        </Block>

        <Block index="02" title="Band configuration">
          {settings.band_configuration ? (
            <Prose text={settings.band_configuration} />
          ) : (
            <Placeholder
              label="No line-up has been published. The configuration is announced only once confirmed."
              where="Settings → Full Band"
            />
          )}
        </Block>

        <Block index="03" title="Instrumentation">
          {settings.band_instrumentation ? (
            <Prose text={settings.band_instrumentation} />
          ) : (
            <Placeholder label="Instrumentation details are still to be supplied." where="Settings → Full Band" />
          )}
        </Block>

        <Block index="04" title="Video">
          {settings.band_video_url ? (
            <Embed url={settings.band_video_url} title="Full Band Experience" />
          ) : (
            <p className="text-silver">Performance video will be published here when available.</p>
          )}
        </Block>

        <Block index="05" title="Technical requirements">
          {settings.band_technical ? (
            <Prose text={settings.band_technical} />
          ) : (
            <Placeholder
              label="The technical rider (stage plot, input list, backline) is not yet published. It is shared on request."
              where="Settings → Full Band"
            />
          )}
        </Block>

        {bandDates.length > 0 && (
          <Block index="06" title="Performances">
            <EventList events={bandDates} />
          </Block>
        )}

        <section className="reveal mt-12 grid gap-10 border border-line p-8 md:grid-cols-2 md:p-14">
          <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">
            Programme the <em className="text-silver">full band.</em>
          </h2>
          <div className="flex flex-col justify-between gap-6">
            <p className="text-silver">
              For festivals, concert halls and special events. Share the date, venue and context,
              and the technical rider will follow.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/book?type=full_band" className="bg-bone px-7 py-4 text-sm font-medium text-ink hover:bg-copper">
                Full Band enquiry
              </Link>
              <ArrowLink href="/live">All live formats</ArrowLink>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
