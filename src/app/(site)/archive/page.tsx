import { Suspense } from "react";
import { ArchiveBrowser } from "@/components/site/ArchiveBrowser";
import { EmptyState, PageHero } from "@/components/site/Section";
import { getArchive, getMediaMap } from "@/lib/data/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Archive: The Cool Affair Archive",
  description:
    "A visual archive of Cool Affair's creative output: releases, artwork, photography, video, live performances, collaborations and studio material.",
  path: "/archive",
});

export default async function ArchivePage() {
  const [items, media] = await Promise.all([getArchive(), getMediaMap()]);
  return (
    <>
      <PageHero
        eyebrow="Archive · The Cool Affair archive"
        title={
          <>
            Everything
            <br />
            <em className="text-silver">kept.</em>
          </>
        }
        lede="Releases, artwork, photography, video, live moments, collaborations and studio material. Every item is published only once its source and usage rights are recorded."
      />
      <section className="container-ca">
        {items.length ? (
          <Suspense fallback={<div className="h-96" aria-busy="true" />}>
            <ArchiveBrowser items={items} media={media} />
          </Suspense>
        ) : (
          <EmptyState title="The archive is being assembled.">
            Material is added from the Studio as each item&apos;s provenance and permissions are confirmed.
          </EmptyState>
        )}
      </section>
    </>
  );
}
