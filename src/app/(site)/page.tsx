import Link from "next/link";
import { Cover } from "@/components/site/Cover";
import { Embed } from "@/components/site/Embed";
import { MediaImage } from "@/components/site/MediaImage";
import { ReleaseCard } from "@/components/site/ReleaseCard";
import { ArrowLink, EmptyState, Placeholder, SectionHeader } from "@/components/site/Section";
import { Waveform } from "@/components/site/Waveform";
import {
  archiveCategoryLabels,
  eventFormatLabels,
  journalCategoryLabels,
  releaseKindLabels,
  releaseStageLabels,
} from "@/lib/data/labels";
import {
  getArchive,
  getEvents,
  getJournalPosts,
  getMediaMap,
  getReleases,
  getSettings,
} from "@/lib/data/queries";
import { formatDate, formatShortDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const settings = await getSettings();
  return pageMetadata({
    title: settings.seo_title ?? "Cool Affair: The Cool Affair Universe",
    description: settings.seo_description,
    path: "/",
  });
}

export default async function HomePage() {
  const [settings, media, releases, events, archive, posts] = await Promise.all([
    getSettings(),
    getMediaMap(),
    getReleases(),
    getEvents(),
    getArchive(),
    getJournalPosts(),
  ]);

  const hero = settings.hero_media_id ? media[settings.hero_media_id] : undefined;
  const portrait = settings.portrait_media_id ? media[settings.portrait_media_id] : undefined;
  const featured =
    releases.find((r) => r.id === settings.featured_release_id) ??
    releases.find((r) => r.embed_url) ??
    releases.find((r) => r.featured) ??
    releases[0];
  const highlighted = releases.filter((r) => r.id !== featured?.id).slice(0, 4);
  const archiveGlimpse = archive.filter((a) => a.media_id && media[a.media_id]).slice(0, 5);

  return (
    <>
      {/* 01 — Opening: Enter the Universe */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-10 pt-28 md:pb-14">
        {hero ? (
          <div className="absolute inset-0">
            <MediaImage media={hero} sizes="100vw" priority className="object-cover opacity-55" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/70" />
          </div>
        ) : (
          <svg
            aria-hidden
            viewBox="0 0 800 800"
            className="orbit pointer-events-none absolute -right-[30vw] top-[6vh] h-[115vw] w-[115vw] max-h-[1100px] max-w-[1100px] text-line md:-right-[12vw] md:h-[75vw] md:w-[75vw]"
            fill="none"
            stroke="currentColor"
          >
            {[380, 320, 260, 200, 140, 80].map((r) => (
              <circle key={r} cx="400" cy="400" r={r} strokeWidth="0.75" />
            ))}
            <circle cx="400" cy="20" r="5" fill="var(--color-copper)" stroke="none" />
            <line x1="0" y1="400" x2="800" y2="400" strokeWidth="0.5" strokeDasharray="2 6" />
          </svg>
        )}

        <div className="container-ca relative">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="eyebrow rise">
              {settings.base_city ?? "Johannesburg"} · 26.2041° S · 28.0473° E
            </p>
            <p className="eyebrow rise hidden md:block" style={{ animationDelay: "120ms" }}>
              {settings.roles.join(" · ")}
            </p>
          </div>

          <h1 className="font-display text-mega leading-[0.8] tracking-[-0.035em]">
            <span className="rise block">Cool</span>
            <span className="rise block pl-[8vw] italic text-silver" style={{ animationDelay: "140ms" }}>
              Affair
            </span>
          </h1>

          <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
            <p
              className="rise text-xl leading-snug text-bone text-balance md:col-span-6 md:text-2xl"
              style={{ animationDelay: "260ms" }}
            >
              {settings.hero_statement}
            </p>
            <div className="rise md:col-span-5 md:col-start-8" style={{ animationDelay: "340ms" }}>
              <Waveform seed="cool-affair-universe" bars={96} animated className="h-14 w-full text-smoke" />
              <div className="mt-4 flex items-center justify-between">
                <span className="eyebrow">The Universe</span>
                <Link href="#enter" className="eyebrow text-bone hover:text-copper">
                  Enter ↓
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 — Statement */}
      <section id="enter" className="container-ca scroll-mt-24 py-24 md:py-40">
        <div className="grid gap-10 md:grid-cols-12">
          <p className="eyebrow reveal md:col-span-3">
            <span className="mr-3 text-copper">01</span>An introduction
          </p>
          <div className="md:col-span-9">
            <p className="reveal-slow font-display text-[clamp(1.9rem,4.2vw,3.6rem)] leading-[1.08] text-bone text-balance">
              {settings.intro_statement}
            </p>
            <div className="reveal mt-12 flex flex-wrap gap-x-8 gap-y-3">
              <ArrowLink href="/story">The artist story</ArrowLink>
              <ArrowLink href="/sound">Explore the sound</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      {/* Influences ticker */}
      {settings.influences.length > 0 && (
        <section aria-label="Influences" className="overflow-hidden border-y border-line py-6">
          <div className="marquee" aria-hidden>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {settings.influences.map((item) => (
                  <span key={`${copy}-${item}`} className="flex items-center">
                    <span className="font-display px-8 text-4xl italic text-silver md:text-5xl">{item}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-copper" />
                  </span>
                ))}
              </div>
            ))}
          </div>
          <p className="sr-only">Influences: {settings.influences.join(", ")}.</p>
        </section>
      )}

      {/* 03 — Featured music experience */}
      <section className="container-ca py-24 md:py-36">
        <SectionHeader
          index="02"
          eyebrow="The listening room"
          title={
            <>
              Start with <em className="text-silver">one record.</em>
            </>
          }
        />
        {featured ? (
          <div className="reveal grid gap-10 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-6 lg:col-span-5">
              <Cover
                title={featured.title}
                index={featured.sort_order}
                artwork={featured.artwork_id ? media[featured.artwork_id] : null}
                sizes="(min-width: 768px) 45vw, 100vw"
              />
            </div>
            <div className="flex flex-col justify-between gap-8 md:col-span-6 lg:col-span-6 lg:col-start-7">
              <div>
                <p className="eyebrow mb-4">
                  {releaseKindLabels[featured.kind]} · {releaseStageLabels[featured.stage]}
                  {featured.stage === "released" && featured.release_date
                    ? ` · ${formatDate(featured.release_date)}`
                    : ""}
                </p>
                <h3 className="font-display text-display leading-[0.95]">{featured.title}</h3>
                {featured.summary ? (
                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-silver">{featured.summary}</p>
                ) : (
                  <p className="mt-6 max-w-xl text-silver">
                    Details, artwork and listening links will appear here as they are confirmed.
                  </p>
                )}
              </div>
              <div className="space-y-6">
                <Embed url={featured.embed_url} title={featured.title} />
                <ArrowLink href={`/sound/${featured.slug}`}>Open in the catalogue</ArrowLink>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="The catalogue is being prepared.">
            Releases and projects will appear here once they are published.
          </EmptyState>
        )}
      </section>

      {/* 04 — Releases & projects */}
      {highlighted.length > 0 && (
        <section className="container-ca pb-24 md:pb-36">
          <SectionHeader
            index="03"
            eyebrow="Releases & projects"
            title={
              <>
                A catalogue,
                <br />
                <em className="text-silver">not a feed.</em>
              </>
            }
            action={{ href: "/sound", label: `All ${releases.length} entries in Sound` }}
          />
          <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {highlighted.map((release, i) => (
              <div key={release.id} className={`reveal ${i % 2 === 1 ? "lg:mt-24" : ""}`}>
                <ReleaseCard
                  release={release}
                  index={release.sort_order}
                  artwork={release.artwork_id ? media[release.artwork_id] ?? null : null}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 05 — The artist */}
      <section className="border-y border-line bg-graphite py-24 md:py-36">
        <div className="container-ca grid gap-12 md:grid-cols-12">
          <div className="reveal relative aspect-[4/5] overflow-hidden bg-charcoal md:col-span-5">
            {portrait ? (
              <MediaImage
                media={{ ...portrait, alt: portrait.alt || `Portrait of ${settings.legal_name ?? settings.artist_name}` }}
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover grayscale-[0.2]"
              />
            ) : (
              <div className="flex h-full flex-col justify-between border border-line p-6">
                <span className="eyebrow">Portrait</span>
                <span aria-hidden className="font-display text-5xl leading-none text-smoke md:text-6xl">
                  {settings.legal_name ?? settings.artist_name}
                </span>
                <span className="eyebrow text-copper">Photograph to be supplied</span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
            <p className="eyebrow reveal mb-6">
              <span className="mr-3 text-copper">04</span>The person behind the sound
            </p>
            <h2 className="reveal font-display text-display leading-[0.95]">
              {settings.legal_name ?? settings.artist_name}
            </h2>
            <ul className="reveal mt-6 flex flex-wrap gap-2">
              {settings.roles.map((role) => (
                <li key={role} className="border border-line px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-silver">
                  {role}
                </li>
              ))}
            </ul>
            <div className="reveal mt-8">
              {settings.bio_intro ? (
                <p className="text-lg leading-relaxed text-silver">{settings.bio_intro}</p>
              ) : (
                <Placeholder label="The artist introduction has not been written yet." where="Settings → Artist story" />
              )}
            </div>
            <ArrowLink href="/story" className="reveal mt-10">
              Read the artist story
            </ArrowLink>
          </div>
        </div>
      </section>

      {/* 06 — Live */}
      <section className="container-ca py-24 md:py-36">
        <SectionHeader
          index="05"
          eyebrow="The performance experience"
          title={
            <>
              In the room,
              <br />
              <em className="text-silver">in real time.</em>
            </>
          }
          intro={settings.live_intro}
          action={{ href: "/live", label: "The live experience" }}
        />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="reveal lg:col-span-7">
            {events.upcoming.length ? (
              <ul className="border-t border-line">
                {events.upcoming.slice(0, 4).map((event) => (
                  <li key={event.id} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-line py-5 md:grid-cols-[9rem_1fr_auto]">
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-copper">
                      {formatShortDate(event.event_date)}
                    </span>
                    <div>
                      <p className="text-bone">{event.title}</p>
                      <p className="text-sm text-mist">
                        {[event.venue, event.city].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <span className="eyebrow col-start-2 md:col-start-auto">{eventFormatLabels[event.format]}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No dates announced.">
                Upcoming appearances are published here once confirmed. To bring Cool Affair to your
                stage, <Link className="text-bone underline decoration-copper underline-offset-4" href="/book">send an enquiry</Link>.
              </EmptyState>
            )}
          </div>
          <Link
            href="/live/full-band"
            className="reveal group relative flex min-h-72 flex-col justify-between overflow-hidden border border-line p-6 transition-colors hover:border-copper lg:col-span-5"
          >
            <Waveform seed="full-band" bars={40} className="absolute inset-x-6 top-1/2 h-24 -translate-y-1/2 text-line" />
            <span className="eyebrow relative">Expanded format</span>
            <span className="relative">
              <span className="font-display block text-5xl leading-[0.95] transition-colors group-hover:text-copper">
                Full Band Experience
              </span>
              <span className="mt-3 block max-w-sm text-sm text-silver">{settings.band_concept}</span>
            </span>
          </Link>
        </div>
      </section>

      {/* 07 — Archive glimpse */}
      <section className="container-ca pb-24 md:pb-36">
        <SectionHeader
          index="06"
          eyebrow="The Cool Affair Archive"
          title={
            <>
              Everything <em className="text-silver">kept.</em>
            </>
          }
          action={{ href: "/archive", label: "Browse the archive" }}
        />
        {archiveGlimpse.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
            {archiveGlimpse.map((item, i) => {
              const asset = media[item.media_id!];
              const span = i === 0 ? "col-span-2 row-span-2 md:col-span-3" : "md:col-span-3 lg:col-span-1";
              return (
                <Link
                  key={item.id}
                  href={`/archive?category=${item.category}`}
                  className={`reveal group relative block overflow-hidden bg-charcoal ${span} ${i === 0 ? "aspect-square" : "aspect-[4/5]"}`}
                >
                  {asset.kind === "image" ? (
                    <MediaImage
                      media={{ ...asset, alt: asset.alt || item.title }}
                      sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 17vw, 50vw"}
                      className="object-cover transition-transform duration-[1.6s] group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center font-display text-2xl">
                      {item.title}
                    </div>
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-3 pt-10">
                    <span className="eyebrow block text-bone">{archiveCategoryLabels[item.category]}</span>
                    <span className="block truncate text-sm text-silver">{item.title}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState title="The archive is being assembled.">
            Artwork, photography, video and historical material will be added as each item&apos;s
            source and usage rights are confirmed.
          </EmptyState>
        )}
      </section>

      {/* 08 — Journal */}
      <section className="container-ca pb-24 md:pb-36">
        <SectionHeader
          index="07"
          eyebrow="Journal"
          title={
            <>
              Notes from <em className="text-silver">the universe.</em>
            </>
          }
          action={posts.length ? { href: "/journal", label: "Read the journal" } : undefined}
        />
        {posts.length ? (
          <div className="grid gap-10 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => {
              const cover = post.cover_id ? media[post.cover_id] : undefined;
              return (
                <Link key={post.id} href={`/journal/${post.slug}`} className="reveal group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
                    {cover ? (
                      <MediaImage
                        media={{ ...cover, alt: cover.alt || post.title }}
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-[1.6s] group-hover:scale-105"
                      />
                    ) : (
                      <Waveform seed={post.slug} bars={36} className="absolute inset-8 h-[calc(100%-4rem)] w-[calc(100%-4rem)] text-line" />
                    )}
                  </div>
                  <p className="eyebrow mt-5">
                    {journalCategoryLabels[post.category]} · {formatShortDate(post.published_at)}
                  </p>
                  <h3 className="mt-2 font-display text-3xl leading-tight transition-colors group-hover:text-copper">
                    {post.title}
                  </h3>
                  {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mist">{post.excerpt}</p>}
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState title="The first notes are being written.">
            Reflections, studio notes and production insight will be published here.
          </EmptyState>
        )}
      </section>

      {/* 09 — Booking invitation */}
      <section className="relative overflow-hidden border-t border-line">
        <div className="container-ca py-28 md:py-44">
          <p className="eyebrow reveal mb-8">
            <span className="mr-3 text-copper">08</span>Book Cool Affair
          </p>
          <Link href="/book" className="reveal-slow group block">
            <span className="font-display block text-giant leading-[0.88] text-balance">
              DJ sets, live performance,
              <em className="text-silver transition-colors group-hover:text-copper"> the full band</em>,
              production and sound.
            </span>
          </Link>
          <div className="reveal mt-12 flex flex-wrap items-center gap-8">
            <Link
              href="/book"
              className="bg-bone px-7 py-4 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-copper"
            >
              Start an enquiry
            </Link>
            <p className="max-w-sm text-sm text-mist">
              Every enquiry is read and answered personally. Nothing is booked automatically.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
