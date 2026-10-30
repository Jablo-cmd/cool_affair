import Link from "next/link";
import { releaseKindLabels, releaseStageLabels } from "@/lib/data/labels";
import type { Release, ResolvedMedia } from "@/lib/data/types";
import { yearOf } from "@/lib/format";
import { Cover } from "./Cover";

export function ReleaseCard({
  release,
  artwork,
  index,
  sizes,
}: {
  release: Release;
  artwork: ResolvedMedia | null;
  index: number;
  sizes?: string;
}) {
  const year = release.stage === "released" ? yearOf(release.release_date) : null;
  return (
    <Link href={`/sound/${release.slug}`} className="group block">
      <Cover title={release.title} index={index} artwork={artwork} sizes={sizes} />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-2xl leading-tight text-bone transition-colors group-hover:text-copper">
            {release.title}
          </h3>
          {release.subtitle && <p className="text-sm text-mist">{release.subtitle}</p>}
        </div>
        <span className="shrink-0 pt-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mist">
          {year ?? releaseStageLabels[release.stage]}
        </span>
      </div>
      <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mist">
        {releaseKindLabels[release.kind]}
        {release.catalogue_number ? ` · ${release.catalogue_number}` : ""}
      </p>
    </Link>
  );
}
