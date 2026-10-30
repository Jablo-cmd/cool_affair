import { MediaImage } from "@/components/site/MediaImage";
import { Prose } from "@/components/site/Prose";
import { ArrowLink, Placeholder } from "@/components/site/Section";
import { getMediaMap, getSettings } from "@/lib/data/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Artist Story: Sibusiso Zephania Ntombela",
  description:
    "The person behind Cool Affair: Sibusiso Zephania Ntombela, a Johannesburg producer, DJ, musician, sound engineer and label owner.",
  path: "/story",
  type: "profile",
});

export default async function StoryPage() {
  const [settings, media] = await Promise.all([getSettings(), getMediaMap()]);
  const portrait = settings.portrait_media_id ? media[settings.portrait_media_id] : undefined;
  const name = settings.legal_name ?? settings.artist_name;

  const chapters = [
    { id: "introduction", title: "Introduction", text: settings.bio_intro, missing: "The artist introduction." },
    { id: "philosophy", title: "Musical philosophy", text: settings.philosophy, missing: "The musical philosophy, in the artist's words." },
    { id: "approach", title: "Creative approach", text: settings.creative_approach, missing: "How the work is made: process, studio and collaboration." },
    { id: "johannesburg", title: "Johannesburg", text: settings.johannesburg, missing: "The artist's connection to Johannesburg and its underground culture." },
    { id: "direction", title: "Artistic direction", text: settings.artistic_direction, missing: "Where the work is heading next." },
  ];

  return (
    <>
      <section className="container-ca pb-20 pt-36 md:pt-48">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow rise mb-8">Artist Story · The person behind the sound</p>
            <h1 className="rise font-display text-giant leading-[0.88]" style={{ animationDelay: "80ms" }}>
              {name.split(" ").map((part, i, all) => (
                <span key={i} className={`block ${i === all.length - 1 ? "italic text-silver" : ""}`}>
                  {part}
                </span>
              ))}
            </h1>
            <p className="rise mt-8 font-mono text-xs uppercase tracking-[0.18em] text-mist" style={{ animationDelay: "160ms" }}>
              Known as {settings.artist_name}
              {settings.base_city ? ` · ${settings.base_city}` : ""}
            </p>
            <ul className="rise mt-8 flex flex-wrap gap-2" style={{ animationDelay: "220ms" }}>
              {settings.roles.map((role) => (
                <li key={role} className="border border-line px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-silver">
                  {role}
                </li>
              ))}
            </ul>
          </div>
          <div className="rise relative aspect-[4/5] overflow-hidden bg-charcoal lg:col-span-5" style={{ animationDelay: "200ms" }}>
            {portrait ? (
              <MediaImage
                media={{ ...portrait, alt: portrait.alt || `Portrait of ${name}` }}
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex h-full flex-col justify-end border border-dashed border-smoke p-6">
                <p className="eyebrow text-copper">Portrait to be supplied</p>
                <p className="mt-2 text-sm text-mist">Upload an approved portrait in Studio → Media, then select it in Settings.</p>
              </div>
            )}
            {portrait?.credit && (
              <span className="absolute bottom-3 right-3 bg-ink/80 px-2 py-1 text-xs text-mist">Photo: {portrait.credit}</span>
            )}
          </div>
        </div>
      </section>

      <section className="container-ca">
        <div className="grid gap-12 lg:grid-cols-12">
          <nav aria-label="Chapters" className="hidden lg:col-span-3 lg:block">
            <ol className="sticky top-28 space-y-3">
              {[...chapters, { id: "influences", title: "Influences" }].map((c, i) => (
                <li key={c.id}>
                  <a href={`#${c.id}`} className="group flex gap-3 text-sm text-mist hover:text-bone">
                    <span className="font-mono text-xs text-copper">{String(i + 1).padStart(2, "0")}</span>
                    {c.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="lg:col-span-8 lg:col-start-5">
            {settings.intro_statement && (
              <p className="reveal-slow mb-20 font-display text-[clamp(1.75rem,3.4vw,2.9rem)] leading-[1.12] text-bone">
                {settings.intro_statement}
              </p>
            )}

            {chapters.map((chapter, i) => (
              <section key={chapter.id} id={chapter.id} className="reveal scroll-mt-28 border-t border-line py-12">
                <h2 className="mb-6 flex items-baseline gap-4">
                  <span className="font-mono text-xs text-copper">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-4xl md:text-5xl">{chapter.title}</span>
                </h2>
                {chapter.text ? (
                  <Prose text={chapter.text} />
                ) : (
                  <Placeholder label={`${chapter.missing}`} where="Settings → Artist story" />
                )}
              </section>
            ))}

            <section id="influences" className="reveal scroll-mt-28 border-t border-line py-12">
              <h2 className="mb-8 flex items-baseline gap-4">
                <span className="font-mono text-xs text-copper">{String(chapters.length + 1).padStart(2, "0")}</span>
                <span className="font-display text-4xl md:text-5xl">Influences</span>
              </h2>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {settings.influences.map((item, i) => (
                  <li key={item} className={`font-display text-3xl md:text-4xl ${i % 3 === 1 ? "italic text-silver" : "text-bone"}`}>
                    {item}
                    {i < settings.influences.length - 1 && <span className="ml-6 text-copper">/</span>}
                  </li>
                ))}
              </ul>
            </section>

            <div className="reveal flex flex-wrap gap-8 border-t border-line pt-10">
              <ArrowLink href="/sound">Hear the work</ArrowLink>
              <ArrowLink href="/collaborators">Collaboration Network</ArrowLink>
              <ArrowLink href="/book">Get in touch</ArrowLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
