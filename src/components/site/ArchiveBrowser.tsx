"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { archiveCategoryLabels } from "@/lib/data/labels";
import type { ArchiveCategory, ArchiveItem, ResolvedMedia } from "@/lib/data/types";
import { formatDate, yearOf } from "@/lib/format";
import { Embed } from "./Embed";
import { MediaImage } from "./MediaImage";

const chip = (active: boolean) =>
  `border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] transition-colors ${
    active ? "border-copper text-copper" : "border-line text-silver hover:border-smoke hover:text-bone"
  }`;

export function ArchiveBrowser({
  items,
  media,
}: {
  items: ArchiveItem[];
  media: Record<string, ResolvedMedia>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get("category") as ArchiveCategory | null;
  const category = requested && requested in archiveCategoryLabels ? requested : "all";
  const [selected, setSelected] = useState<ArchiveItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const present = useMemo(
    () => (Object.keys(archiveCategoryLabels) as ArchiveCategory[]).filter((c) => items.some((i) => i.category === c)),
    [items],
  );
  const visible = category === "all" ? items : items.filter((i) => i.category === category);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) dialog.showModal();
    if (!selected && dialog.open) dialog.close();
  }, [selected]);

  const setCategory = (value: ArchiveCategory | "all") => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("category");
    else next.set("category", value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const asset = selected?.media_id ? media[selected.media_id] : undefined;

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter the archive">
        <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")} className={chip(category === "all")}>
          Everything · {items.length}
        </button>
        {present.map((c) => (
          <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)} className={chip(category === c)}>
            {archiveCategoryLabels[c]} · {items.filter((i) => i.category === c).length}
          </button>
        ))}
      </div>

      <ul className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
        {visible.map((item) => {
          const m = item.media_id ? media[item.media_id] : undefined;
          return (
            <li key={item.id} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="group block w-full text-left"
                aria-haspopup="dialog"
              >
                <div
                  className={`relative overflow-hidden bg-charcoal ${
                    m?.kind === "image" && m.width && m.height ? "" : "aspect-[4/3]"
                  }`}
                  style={m?.kind === "image" && m.width && m.height ? { aspectRatio: `${m.width} / ${m.height}` } : undefined}
                >
                  {m?.kind === "image" ? (
                    <MediaImage
                      media={{ ...m, alt: m.alt || item.title }}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[1.6s] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full flex-col justify-between border border-line p-5">
                      <span className="eyebrow">{m?.kind === "video" || item.category === "video" ? "Video" : m?.kind === "audio" ? "Audio" : "Document"}</span>
                      <span className="font-display text-3xl leading-tight">{item.title}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm text-bone group-hover:text-copper">{item.title}</span>
                  <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-mist">
                    {archiveCategoryLabels[item.category]}
                    {item.item_date ? ` · ${yearOf(item.item_date)}` : ""}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {visible.length === 0 && (
        <p className="mt-10 text-sm text-mist">Nothing filed under this category yet.</p>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setSelected(null);
        }}
        aria-labelledby="archive-dialog-title"
        className="m-auto w-[min(64rem,calc(100vw-2rem))] max-h-[90dvh] overflow-y-auto border border-line bg-graphite p-0 text-bone backdrop:bg-ink/90"
      >
        {selected && (
          <div>
            <div className="relative">
              {asset?.kind === "image" && (
                <div
                  className="relative max-h-[65dvh] w-full bg-charcoal"
                  style={{ aspectRatio: asset.width && asset.height ? `${asset.width} / ${asset.height}` : "4 / 3" }}
                >
                  <MediaImage media={{ ...asset, alt: asset.alt || selected.title }} sizes="(min-width: 1024px) 64rem, 100vw" className="object-contain" />
                </div>
              )}
              {asset?.kind === "audio" && (
                <div className="p-6">
                  <audio controls src={asset.url} className="w-full" />
                </div>
              )}
              {asset?.kind === "video" && (
                <video controls src={asset.url} className="max-h-[65dvh] w-full bg-ink" />
              )}
              {!asset && selected.external_url && <Embed url={selected.external_url} title={selected.title} />}
            </div>
            <div className="grid gap-6 p-6 md:grid-cols-3 md:p-8">
              <div className="md:col-span-2">
                <p className="eyebrow mb-3">
                  {archiveCategoryLabels[selected.category]}
                  {selected.item_date ? ` · ${formatDate(selected.item_date)}` : ""}
                </p>
                <h2 id="archive-dialog-title" className="font-display text-4xl leading-tight">
                  {selected.title}
                </h2>
                {selected.description && <p className="mt-4 leading-relaxed text-silver">{selected.description}</p>}
              </div>
              <div className="flex flex-col items-start gap-4 md:items-end">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="border border-bone/30 px-4 py-2 text-xs tracking-wide hover:border-copper hover:text-copper"
                  autoFocus
                >
                  Close
                </button>
                {asset?.credit && <p className="text-xs text-mist">Credit: {asset.credit}</p>}
                {selected.external_url && (
                  <a href={selected.external_url} target="_blank" rel="noopener noreferrer" className="text-sm text-bone underline decoration-copper underline-offset-4">
                    View source ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
