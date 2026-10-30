import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { EmptyState, PageHero } from "@/components/site/Section";
import { getCollaborators, getMediaMap, getReleases } from "@/lib/data/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Collaboration Network",
  description:
    "Artists, musicians, producers, vocalists and organisations who have worked with Cool Affair.",
  path: "/collaborators",
});

export default async function CollaboratorsPage() {
  const [people, media, releases] = await Promise.all([getCollaborators(), getMediaMap(), getReleases()]);
  const releaseById = new Map(releases.map((r) => [r.id, r]));

  return (
    <>
      <PageHero
        eyebrow="The Cool Affair Collaboration Network"
        title={
          <>
            Made with
            <br />
            <em className="text-silver">others.</em>
          </>
        }
        lede="The artists, musicians, producers, vocalists and organisations who have shaped the work. Only verified collaborations are listed."
      />
      <section className="container-ca">
        {people.length ? (
          <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => {
              const photo = person.image_id ? media[person.image_id] : undefined;
              const projects = person.release_ids.map((id) => releaseById.get(id)).filter(Boolean);
              const links = [
                { label: "Website", href: person.website_url },
                { label: "Instagram", href: person.instagram_url },
                { label: "More", href: person.other_url },
              ].filter((l) => l.href);
              return (
                <li key={person.id} id={person.slug} className="reveal scroll-mt-28 bg-ink p-6">
                  <div className="relative aspect-square overflow-hidden bg-charcoal">
                    {photo ? (
                      <MediaImage media={{ ...photo, alt: photo.alt || person.name }} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover" />
                    ) : (
                      <span aria-hidden className="absolute inset-0 flex items-center justify-center font-display text-7xl text-smoke">
                        {person.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-5 font-display text-3xl">{person.name}</h2>
                  {person.role && <p className="eyebrow mt-1">{person.role}</p>}
                  {person.bio && <p className="mt-4 text-sm leading-relaxed text-silver">{person.bio}</p>}
                  {projects.length > 0 && (
                    <p className="mt-4 text-sm text-mist">
                      Projects:{" "}
                      {projects.map((r, i) => (
                        <span key={r!.id}>
                          {i > 0 && ", "}
                          <Link href={`/sound/${r!.slug}`} className="text-bone hover:text-copper">
                            {r!.title}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                  {links.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-4 text-sm">
                      {links.map((l) => (
                        <li key={l.label}>
                          <a href={l.href!} target="_blank" rel="noopener noreferrer" className="text-silver hover:text-copper">
                            {l.label} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="No collaborators listed yet.">
            Collaborators are published once each working relationship is verified. If you have
            worked with Cool Affair, <Link href="/book?type=collaboration" className="text-bone underline decoration-copper underline-offset-4">get in touch</Link>.
          </EmptyState>
        )}
      </section>
    </>
  );
}
