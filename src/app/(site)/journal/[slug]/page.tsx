import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/site/JsonLd";
import { MediaImage } from "@/components/site/MediaImage";
import { Prose } from "@/components/site/Prose";
import { ArrowLink } from "@/components/site/Section";
import { journalCategoryLabels } from "@/lib/data/labels";
import { getJournalPost, getJournalPosts, getMediaMap, getSettings } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

const PLACEHOLDER_SLUG = "__none__";

export async function generateStaticParams() {
  const posts = await getJournalPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const [post, media] = await Promise.all([getJournalPost(slug), getMediaMap()]);
  if (!post) return { title: "Not found" };
  const cover = post.cover_id ? media[post.cover_id] : undefined;
  return pageMetadata({
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt,
    path: `/journal/${post.slug}`,
    image: cover?.kind === "image" ? cover.url : null,
    imageAlt: cover?.alt,
    type: "article",
    publishedTime: post.published_at,
  });
}

export default function JournalArticlePage(props: PageProps<"/journal/[slug]">) {
  return (
    <Suspense fallback={<div className="container-ca min-h-dvh pt-40" aria-busy="true" />}>
      <Article params={props.params} />
    </Suspense>
  );
}

async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === PLACEHOLDER_SLUG) notFound();
  const [post, posts, media, settings] = await Promise.all([
    getJournalPost(slug),
    getJournalPosts(),
    getMediaMap(),
    getSettings(),
  ]);
  if (!post) notFound();
  const cover = post.cover_id ? media[post.cover_id] : undefined;
  const index = posts.findIndex((p) => p.slug === post.slug);
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = index >= 0 ? posts[index + 1] : undefined;
  const author = post.author ?? settings.legal_name ?? settings.artist_name;

  return (
    <article>
      <header className="container-ca pb-12 pt-36 md:pt-48">
        <nav aria-label="Breadcrumb" className="eyebrow mb-10">
          <Link href="/journal" className="hover:text-bone">Journal</Link>
          <span aria-hidden className="mx-2 text-smoke">/</span>
          <span className="text-silver">{journalCategoryLabels[post.category]}</span>
        </nav>
        <h1 className="max-w-5xl font-display text-giant leading-[0.92] text-balance">{post.title}</h1>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-mist">
          <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
          <span aria-hidden className="mx-2 text-smoke">·</span>
          {author}
        </p>
      </header>

      {cover?.kind === "image" && (
        <figure className="container-ca">
          <div className="relative aspect-[16/9] overflow-hidden bg-charcoal">
            <MediaImage media={{ ...cover, alt: cover.alt || post.title }} sizes="100vw" priority className="object-cover" />
          </div>
          {cover.credit && <figcaption className="mt-3 text-xs text-mist">{cover.credit}</figcaption>}
        </figure>
      )}

      <div className="container-ca mt-14 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-8 md:col-start-3 lg:col-span-7 lg:col-start-4">
          {post.excerpt && <p className="mb-10 font-display text-3xl leading-snug text-bone">{post.excerpt}</p>}
          {post.body ? <Prose text={post.body} /> : null}
        </div>
      </div>

      <nav aria-label="More from the journal" className="container-ca mt-24 grid gap-6 border-t border-line pt-10 sm:grid-cols-2">
        <div>
          {older && (
            <Link href={`/journal/${older.slug}`} className="group block">
              <span className="eyebrow">← Earlier</span>
              <span className="mt-2 block font-display text-2xl group-hover:text-copper">{older.title}</span>
            </Link>
          )}
        </div>
        <div className="sm:text-right">
          {newer ? (
            <Link href={`/journal/${newer.slug}`} className="group block">
              <span className="eyebrow">Later →</span>
              <span className="mt-2 block font-display text-2xl group-hover:text-copper">{newer.title}</span>
            </Link>
          ) : (
            <ArrowLink href="/journal">All notes</ArrowLink>
          )}
        </div>
      </nav>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          ...(post.excerpt ? { description: post.excerpt } : {}),
          ...(post.published_at ? { datePublished: post.published_at } : {}),
          url: absoluteUrl(`/journal/${post.slug}`),
          mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
          author: { "@type": "Person", name: author },
          ...(cover?.kind === "image" ? { image: cover.url } : {}),
        }}
      />
    </article>
  );
}
