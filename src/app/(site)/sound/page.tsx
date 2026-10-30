import Link from "next/link";
import { SoundLibrary } from "@/components/site/SoundLibrary";
import { EmptyState, PageHero, SectionHeader } from "@/components/site/Section";
import { releaseKindLabels } from "@/lib/data/labels";
import { getMediaMap, getReleases } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sound: The Sonic Universe",
  description:
    "The Cool Affair catalogue: releases, projects and experiments spanning broken beat, nu-jazz, Afrobeat, deep house and ambient music from Johannesburg.",
  path: "/sound",
});

export default async function SoundPage() {
  const [releases, media] = await Promise.all([getReleases(), getMediaMap()]);
  const dated = releases
    .filter((r) => r.stage === "released" && r.release_date)
    .sort((a, b) => b.release_date!.localeCompare(a.release_date!));
  const byYear = dated.reduce<Record<string, typeof dated>>((acc, r) => {
    const year = r.release_date!.slice(0, 4);
    (acc[year] ??= []).push(r);
    return acc;
  }, {});

  return (
    <>
      <PageHero
        eyebrow="Sound · The sonic universe"
        title={
          <>
            Explore the
            <br />
            <em className="text-silver">catalogue.</em>
          </>
        }
        lede="Releases, projects and experiments, presented the way an independent label keeps its catalogue. Entries marked as concepts are works in progress, not released records."
      />

      <section className="container-ca" aria-labelledby="catalogue-heading">
        <h2 id="catalogue-heading" className="sr-only">
          Catalogue
        </h2>
        {releases.length ? (
          <SoundLibrary releases={releases} artwork={media} />
        ) : (
          <EmptyState title="The catalogue is being prepared.">
            Releases will appear here once they are published from the Studio.
          </EmptyState>
        )}
      </section>

      <section className="container-ca pt-28 md:pt-40">
        <SectionHeader
          eyebrow="Release chronology"
          title={
            <>
              The record, <em className="text-silver">in order.</em>
            </>
          }
          intro="Only released work with a confirmed date appears on this timeline."
        />
        {dated.length ? (
          <ol className="reveal border-t border-line">
            {Object.entries(byYear).map(([year, items]) => (
              <li key={year} className="grid gap-4 border-b border-line py-6 md:grid-cols-12">
                <span className="font-display text-5xl text-mist md:col-span-3">{year}</span>
                <ul className="space-y-3 md:col-span-9">
                  {items.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link href={`/sound/${r.slug}`} className="font-display text-2xl hover:text-copper">
                        {r.title}
                      </Link>
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-mist">
                        {releaseKindLabels[r.kind]} · {formatDate(r.release_date)}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState title="No dated releases yet.">
            The chronology fills in as releases are published with confirmed dates.
          </EmptyState>
        )}
      </section>
    </>
  );
}
