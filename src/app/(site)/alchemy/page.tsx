import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { Prose } from "@/components/site/Prose";
import { PageHero } from "@/components/site/Section";
import { alchemyKindLabels, releaseStageLabels } from "@/lib/data/labels";
import { getAlchemy, getMediaMap, getReleases, getSettings } from "@/lib/data/queries";
import type { AlchemyKind } from "@/lib/data/types";
import { formatShortDate } from "@/lib/format";
import { seededRandom } from "@/lib/hash";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Alchemy: The Creative Laboratory",
  description:
    "Inside the Cool Affair laboratory: sound experiments, sonic research, production notes and the philosophy behind the music.",
  path: "/alchemy",
});

const CHAMBERS: { kind: AlchemyKind; note: string }[] = [
  { kind: "experiment", note: "Sketches, textures and things that may never become songs." },
  { kind: "research", note: "Listening, references and the questions behind the sound." },
  { kind: "philosophy", note: "Why the music is made the way it is." },
  { kind: "production_note", note: "Process, tools and decisions from the studio." },
  { kind: "concept", note: "Ideas still forming. Not releases." },
  { kind: "collaboration", note: "Work in progress with other artists." },
];

/** An oscilloscope-like trace, unique per chamber. */
function Trace({ seed }: { seed: string }) {
  const rand = seededRandom(seed);
  const points = Array.from({ length: 60 }, (_, i) => {
    const x = (i / 59) * 300;
    const y = 30 + Math.sin(i * (0.25 + rand() * 0.2)) * (8 + rand() * 14);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg aria-hidden viewBox="0 0 300 60" className="h-12 w-full text-smoke transition-colors duration-700 group-hover:text-copper" fill="none" stroke="currentColor" strokeWidth="0.8">
      <line x1="0" y1="30" x2="300" y2="30" strokeDasharray="1 4" className="text-line" stroke="currentColor" />
      <polyline points={points} />
    </svg>
  );
}

export default async function AlchemyPage() {
  const [settings, entries, releases, media] = await Promise.all([
    getSettings(),
    getAlchemy(),
    getReleases(),
    getMediaMap(),
  ]);
  const bench = releases.filter((r) => r.stage === "concept" || r.stage === "in_development");

  return (
    <>
      <PageHero
        eyebrow="Alchemy · The creative laboratory"
        title={
          <>
            Turning sound
            <br />
            <em className="text-silver">into something else.</em>
          </>
        }
        lede={settings.alchemy_intro}
      />

      <section className="container-ca pb-24 md:pb-36" aria-label="Laboratory chambers">
        <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {CHAMBERS.map(({ kind, note }, i) => {
            const filed = entries.filter((e) => e.kind === kind);
            return (
              <section
                key={kind}
                aria-labelledby={`chamber-${kind}`}
                className={`group reveal flex flex-col bg-ink p-6 md:p-8 ${i % 3 === 1 ? "lg:pt-16" : ""}`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-copper">
                    Specimen {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist">
                    {filed.length} filed
                  </span>
                </div>
                <h2 id={`chamber-${kind}`} className="mt-6 font-display text-4xl leading-none">
                  {alchemyKindLabels[kind]}
                </h2>
                <p className="mt-3 text-sm text-mist">{note}</p>
                <div className="mt-6">
                  <Trace seed={kind} />
                </div>
                {filed.length ? (
                  <ul className="mt-6 space-y-3">
                    {filed.map((entry) => {
                      const asset = entry.media_id ? media[entry.media_id] : undefined;
                      return (
                        <li key={entry.id}>
                          <details className="group/entry border border-dashed border-smoke open:border-solid open:border-line">
                            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 p-4 marker:hidden">
                              <span className="text-bone group-open/entry:text-copper">{entry.title}</span>
                              <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-mist">
                                {formatShortDate(entry.entry_date) ?? "Undated"}
                              </span>
                            </summary>
                            <div className="space-y-4 px-4 pb-5">
                              {entry.summary && <p className="text-sm text-silver">{entry.summary}</p>}
                              {asset?.kind === "image" && (
                                <div className="relative aspect-video overflow-hidden bg-charcoal">
                                  <MediaImage media={{ ...asset, alt: asset.alt || entry.title }} sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" />
                                </div>
                              )}
                              {asset?.kind === "audio" && (
                                <audio controls preload="none" src={asset.url} className="w-full">
                                  <a href={asset.url}>Listen to {entry.title}</a>
                                </audio>
                              )}
                              {entry.body && <Prose text={entry.body} className="!text-sm" />}
                            </div>
                          </details>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-6 border border-dashed border-line p-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mist">
                    No notes filed yet
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </section>

      {bench.length > 0 && (
        <section className="container-ca">
          <div className="reveal border-t border-line pt-6">
            <p className="eyebrow mb-8">On the bench · Concepts in progress</p>
            <ul className="flex flex-wrap gap-x-10 gap-y-4">
              {bench.map((r) => (
                <li key={r.id}>
                  <Link href={`/sound/${r.slug}`} className="group inline-flex items-baseline gap-3">
                    <span className="font-display text-3xl italic text-silver transition-colors group-hover:text-copper md:text-4xl">
                      {r.title}
                    </span>
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-mist">
                      {releaseStageLabels[r.stage]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-10 max-w-xl text-sm text-mist">
              These are project identities still being developed. They are not released records.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
