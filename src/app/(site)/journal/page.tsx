import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";
import { EmptyState, PageHero } from "@/components/site/Section";
import { Waveform } from "@/components/site/Waveform";
import { journalCategoryLabels } from "@/lib/data/labels";
import { getJournalPosts, getMediaMap } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Journal: Notes From the Universe",
  description:
    "Reflections, studio notes, production insight and cultural observations from Cool Affair.",
  path: "/journal",
});

export default async function JournalPage() {
  const [posts, media] = await Promise.all([getJournalPosts(), getMediaMap()]);
  const [lead, ...rest] = posts;
  const leadCover = lead?.cover_id ? media[lead.cover_id] : undefined;

  return (
    <>
      <PageHero
        eyebrow="Journal · Notes from the universe"
        title={
          <>
            Notes from
            <br />
            <em className="text-silver">the universe.</em>
          </>
        }
        lede="Reflections, studio notes, production insight and observations on culture and sound."
      />

      <div className="container-ca">
        {!lead ? (
          <EmptyState title="The first notes are being written.">
            Articles appear here once they are published from the Studio.
          </EmptyState>
        ) : (
          <>
            <Link href={`/journal/${lead.slug}`} className="group reveal grid gap-8 border-t border-line pt-8 md:grid-cols-12">
              <div className="relative aspect-[4/3] overflow-hidden bg-charcoal md:col-span-7">
                {leadCover ? (
                  <MediaImage media={{ ...leadCover, alt: leadCover.alt || lead.title }} sizes="(min-width: 768px) 58vw, 100vw" priority className="object-cover transition-transform duration-[1.6s] group-hover:scale-[1.03]" />
                ) : (
                  <Waveform seed={lead.slug} bars={64} className="absolute inset-10 h-[calc(100%-5rem)] w-[calc(100%-5rem)] text-line" />
                )}
              </div>
              <div className="flex flex-col justify-end md:col-span-5">
                <p className="eyebrow">
                  {journalCategoryLabels[lead.category]} · <time dateTime={lead.published_at ?? undefined}>{formatDate(lead.published_at)}</time>
                </p>
                <h2 className="mt-4 font-display text-display leading-[0.95] transition-colors group-hover:text-copper">{lead.title}</h2>
                {lead.excerpt && <p className="mt-5 text-lg leading-relaxed text-silver">{lead.excerpt}</p>}
                <span className="mt-8 text-sm text-bone">Read <span className="text-copper">→</span></span>
              </div>
            </Link>

            {rest.length > 0 && (
              <ol className="mt-20 border-t border-line">
                {rest.map((post) => (
                  <li key={post.id} className="reveal border-b border-line">
                    <Link href={`/journal/${post.slug}`} className="group grid gap-3 py-8 md:grid-cols-12 md:items-baseline">
                      <time dateTime={post.published_at ?? undefined} className="font-mono text-xs uppercase tracking-[0.14em] text-mist md:col-span-2">
                        {formatDate(post.published_at)}
                      </time>
                      <h3 className="font-display text-3xl leading-tight transition-colors group-hover:text-copper md:col-span-6 md:text-4xl">
                        {post.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-mist md:col-span-3">{post.excerpt}</p>
                      <span className="eyebrow md:col-span-1 md:text-right">{journalCategoryLabels[post.category]}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </>
  );
}
