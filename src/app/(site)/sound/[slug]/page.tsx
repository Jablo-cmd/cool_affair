import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Cover } from "@/components/site/Cover";
import { Embed } from "@/components/site/Embed";
import { JsonLd } from "@/components/site/JsonLd";
import { Prose } from "@/components/site/Prose";
import { ReleaseCard } from "@/components/site/ReleaseCard";
import { ArrowLink } from "@/components/site/Section";
import { TrackPlayer, type PlayerTrack } from "@/components/site/TrackPlayer";
import { releaseKindLabels, releaseStageLabels } from "@/lib/data/labels";
import { getCollaborators, getMediaMap, getRelease, getReleases } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

const PLACEHOLDER_SLUG = "__none__";

export async function generateStaticParams() {
  const releases = await getReleases();
  // Cache Components needs at least one param; the placeholder 404s.
  return releases.length ? releases.map((r) => ({ slug: r.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/sound/[slug]">) {
  const { slug } = await params;
  const [data, media] = await Promise.all([getRelease(slug), getMediaMap()]);
  if (!data) return { title: "Not found" };
  const { release } = data;
  const artwork = release.artwork_id ? media[release.artwork_id] : undefined;
  return pageMetadata({
    title: release.seo_title ?? release.title,
    description:
      release.seo_description ??
      release.summary ??
      `${release.title}: ${releaseKindLabels[release.kind].toLowerCase()} by Cool Affair (${releaseStageLabels[release.stage].toLowerCase()}).`,
    path: `/sound/${release.slug}`,
    image: artwork?.kind === "image" ? artwork.url : null,
    imageAlt: artwork?.alt,
    type: release.stage === "released" ? "music.album" : "website",
  });
}

export default function ReleasePage(props: PageProps<"/sound/[slug]">) {
  return (
    <Suspense fallback={<div className="container-ca min-h-dvh pt-40" aria-busy="true" />}>
      <ReleaseDetail params={props.params} />
    </Suspense>
  );
}

const LISTEN = [
  ["spotify_url", "Spotify"],
  ["apple_music_url", "Apple Music"],
  ["soundcloud_url", "SoundCloud"],
  ["bandcamp_url", "Bandcamp"],
  ["youtube_url", "YouTube"],
  ["other_url", "Listen"],
] as const;

async function ReleaseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === PLACEHOLDER_SLUG) notFound();
  const [data, media, releases, collaborators] = await Promise.all([
    getRelease(slug),
    getMediaMap(),
    getReleases(),
    getCollaborators(),
  ]);
  if (!data) notFound();
  const { release, tracks } = data;
  const artwork = release.artwork_id ? media[release.artwork_id] ?? null : null;
  const links = LISTEN.flatMap(([key, label]) => {
    const href = release[key];
    return href ? [{ label, href }] : [];
  });
  const playerTracks: PlayerTrack[] = tracks.map((t) => {
    const preview = t.preview_id ? media[t.preview_id] : undefined;
    return {
      id: t.id,
      position: t.position,
      title: t.title,
      duration: t.duration,
      credits: t.credits,
      src: preview?.kind === "audio" ? preview.url : null,
    };
  });
  const related = releases
    .filter((r) => r.id !== release.id)
    .map((r) => ({
      r,
      score:
        r.genres.filter((g) => release.genres.includes(g)).length * 2 + (r.kind === release.kind ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.r.sort_order - b.r.sort_order)
    .slice(0, 3)
    .map(({ r }) => r);
  const people = collaborators.filter((c) => c.release_ids.includes(release.id));
  const isReleased = release.stage === "released";

  return (
    <article>
      <div className="container-ca pb-20 pt-32 md:pt-44">
        <nav aria-label="Breadcrumb" className="eyebrow mb-10">
          <Link href="/sound" className="hover:text-bone">
            Sound
          </Link>
          <span aria-hidden className="mx-2 text-smoke">/</span>
          <span className="text-silver">{release.title}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Cover
                title={release.title}
                index={release.sort_order}
                artwork={artwork}
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
              {artwork?.credit && <p className="mt-3 text-xs text-mist">Artwork: {artwork.credit}</p>}
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow">
              {releaseKindLabels[release.kind]}
              <span aria-hidden className="mx-2 text-smoke">·</span>
              <span className={isReleased ? "text-copper" : ""}>{releaseStageLabels[release.stage]}</span>
              {isReleased && release.release_date && (
                <>
                  <span aria-hidden className="mx-2 text-smoke">·</span>
                  <time dateTime={release.release_date}>{formatDate(release.release_date)}</time>
                </>
              )}
              {release.catalogue_number && (
                <>
                  <span aria-hidden className="mx-2 text-smoke">·</span>
                  {release.catalogue_number}
                </>
              )}
            </p>
            <h1 className="mt-5 font-display text-giant leading-[0.9] text-balance">{release.title}</h1>
            {release.subtitle && <p className="mt-3 text-xl text-silver">{release.subtitle}</p>}

            {release.summary && (
              <p className="mt-8 text-xl leading-relaxed text-bone">{release.summary}</p>
            )}

            {!isReleased && (
              <p className="mt-8 border-l border-copper pl-4 text-sm leading-relaxed text-silver">
                {release.stage === "concept"
                  ? "This is a project concept, not a released record. Details, artwork and listening links will be published here as they are confirmed."
                  : release.stage === "in_development"
                    ? "This project is in development. Release details have not been announced."
                    : "This release is forthcoming. Listening links will appear here on release."}
              </p>
            )}

            {release.embed_url && (
              <div className="mt-10">
                <Embed url={release.embed_url} title={release.title} />
              </div>
            )}

            {links.length > 0 && (
              <div className="mt-10">
                <p className="eyebrow mb-4">Listen</p>
                <ul className="flex flex-wrap gap-2">
                  {links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border border-line px-4 py-2 text-sm text-bone transition-colors hover:border-copper hover:text-copper"
                      >
                        {l.label} <span aria-hidden>↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tracks.length > 0 && (
              <section className="mt-14" aria-labelledby="tracklist">
                <h2 id="tracklist" className="eyebrow mb-4">
                  Track listing
                </h2>
                <TrackPlayer tracks={playerTracks} releaseTitle={release.title} />
                {playerTracks.some((t) => t.src) && (
                  <p className="mt-3 text-xs text-mist">Previews are authorised excerpts.</p>
                )}
              </section>
            )}

            {release.description && (
              <section className="mt-14">
                <h2 className="eyebrow mb-4">Notes</h2>
                <Prose text={release.description} />
              </section>
            )}

            {release.genres.length > 0 && (
              <ul className="mt-12 flex flex-wrap gap-2" aria-label="Genres">
                {release.genres.map((g) => (
                  <li key={g} className="border border-line px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-silver">
                    {g}
                  </li>
                ))}
              </ul>
            )}

            {people.length > 0 && (
              <section className="mt-14">
                <h2 className="eyebrow mb-4">With</h2>
                <ul className="space-y-2">
                  {people.map((p) => (
                    <li key={p.id} className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
                      <Link href={`/collaborators#${p.slug}`} className="text-bone hover:text-copper">
                        {p.name}
                      </Link>
                      {p.role && <span className="text-sm text-mist">{p.role}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-ca border-t border-line pt-16">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 className="font-display text-4xl">Related projects</h2>
            <ArrowLink href="/sound">Full catalogue</ArrowLink>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-3">
            {related.map((r) => (
              <ReleaseCard
                key={r.id}
                release={r}
                index={r.sort_order}
                artwork={r.artwork_id ? media[r.artwork_id] ?? null : null}
                sizes="(min-width: 640px) 33vw, 100vw"
              />
            ))}
          </div>
        </section>
      )}

      {isReleased && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "MusicAlbum",
            name: release.title,
            url: absoluteUrl(`/sound/${release.slug}`),
            byArtist: { "@type": "Person", "@id": absoluteUrl("/#artist"), name: "Cool Affair" },
            ...(release.release_date ? { datePublished: release.release_date } : {}),
            ...(release.genres.length ? { genre: release.genres } : {}),
            ...(artwork?.kind === "image" ? { image: artwork.url } : {}),
            ...(tracks.length
              ? {
                  numTracks: tracks.length,
                  track: tracks.map((t) => ({ "@type": "MusicRecording", name: t.title, position: t.position })),
                }
              : {}),
          }}
        />
      )}
    </article>
  );
}
