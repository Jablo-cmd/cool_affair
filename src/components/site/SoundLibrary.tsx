"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { releaseKindLabels, releaseStageLabels } from "@/lib/data/labels";
import type { Release, ReleaseKind, ReleaseStage, ResolvedMedia } from "@/lib/data/types";
import { ReleaseCard } from "./ReleaseCard";

type Sort = "curated" | "newest" | "oldest" | "title";
type View = "grid" | "index";

const chip = (active: boolean) =>
  `border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] transition-colors ${
    active ? "border-copper text-copper" : "border-line text-silver hover:border-smoke hover:text-bone"
  }`;

export function SoundLibrary({
  releases,
  artwork,
}: {
  releases: Release[];
  artwork: Record<string, ResolvedMedia>;
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ReleaseKind | "all">("all");
  const [stage, setStage] = useState<ReleaseStage | "all">("all");
  const [genre, setGenre] = useState<string | "all">("all");
  const [sort, setSort] = useState<Sort>("curated");
  const [view, setView] = useState<View>("grid");

  const kinds = useMemo(() => [...new Set(releases.map((r) => r.kind))], [releases]);
  const stages = useMemo(() => [...new Set(releases.map((r) => r.stage))], [releases]);
  const genres = useMemo(
    () => [...new Set(releases.flatMap((r) => r.genres))].sort((a, b) => a.localeCompare(b)),
    [releases],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = releases.filter(
      (r) =>
        (kind === "all" || r.kind === kind) &&
        (stage === "all" || r.stage === stage) &&
        (genre === "all" || r.genres.includes(genre)) &&
        (!q ||
          [r.title, r.subtitle, r.summary, r.catalogue_number, ...r.genres]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(q))),
    );
    const byDate = (a: Release, b: Release) => (a.release_date ?? "").localeCompare(b.release_date ?? "");
    switch (sort) {
      case "newest":
        return [...filtered].sort((a, b) => byDate(b, a));
      case "oldest":
        return [...filtered].sort((a, b) => {
          if (!a.release_date) return 1;
          if (!b.release_date) return -1;
          return byDate(a, b);
        });
      case "title":
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filtered;
    }
  }, [releases, query, kind, stage, genre, sort]);

  const reset = () => {
    setQuery("");
    setKind("all");
    setStage("all");
    setGenre("all");
    setSort("curated");
  };

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 border-y border-line bg-ink/90 px-4 py-4 backdrop-blur-md sm:-mx-8 sm:px-8 md:top-20 xl:-mx-14 xl:px-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex flex-1 items-center gap-3 border-b border-smoke pb-2 focus-within:border-copper lg:max-w-sm">
            <span className="eyebrow">Search</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, genre, catalogue no."
              className="w-full bg-transparent text-sm text-bone placeholder:text-smoke focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="eyebrow">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="border border-line bg-ink px-2 py-1.5 text-xs text-bone"
              >
                <option value="curated">Curated</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">A–Z</option>
              </select>
            </label>
            <div role="group" aria-label="View" className="flex">
              {(["grid", "index"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={chip(view === v)}>
                  {v === "grid" ? "Gallery" : "Index"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          <button type="button" aria-pressed={kind === "all"} onClick={() => setKind("all")} className={chip(kind === "all")}>
            All types
          </button>
          {kinds.map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chip(kind === k)}>
              {releaseKindLabels[k]}
            </button>
          ))}
          <span className="mx-1 hidden w-px bg-line sm:block" aria-hidden />
          <button type="button" aria-pressed={stage === "all"} onClick={() => setStage("all")} className={chip(stage === "all")}>
            Any stage
          </button>
          {stages.map((s) => (
            <button key={s} type="button" aria-pressed={stage === s} onClick={() => setStage(s)} className={chip(stage === s)}>
              {releaseStageLabels[s]}
            </button>
          ))}
        </div>
        {genres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
            <button type="button" aria-pressed={genre === "all"} onClick={() => setGenre("all")} className={chip(genre === "all")}>
              All genres
            </button>
            {genres.map((g) => (
              <button key={g} type="button" aria-pressed={genre === g} onClick={() => setGenre(g)} className={chip(genre === g)}>
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="eyebrow mt-8" aria-live="polite">
        {results.length} of {releases.length} {releases.length === 1 ? "entry" : "entries"}
      </p>

      {results.length === 0 ? (
        <div className="mt-8 border border-line px-6 py-16 text-center">
          <p className="font-display text-3xl">Nothing matches that filter.</p>
          <button type="button" onClick={reset} className="mt-6 text-sm text-copper underline underline-offset-4">
            Clear filters
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((release) => (
            <ReleaseCard
              key={release.id}
              release={release}
              index={release.sort_order}
              artwork={release.artwork_id ? artwork[release.artwork_id] ?? null : null}
            />
          ))}
        </div>
      ) : (
        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="eyebrow border-b border-line">
              <th scope="col" className="py-3 pr-4 font-normal">No.</th>
              <th scope="col" className="py-3 pr-4 font-normal">Title</th>
              <th scope="col" className="hidden py-3 pr-4 font-normal sm:table-cell">Type</th>
              <th scope="col" className="hidden py-3 pr-4 font-normal md:table-cell">Genres</th>
              <th scope="col" className="py-3 text-right font-normal">Stage / year</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="group border-b border-line">
                <td className="py-4 pr-4 font-mono text-xs text-mist">
                  {r.catalogue_number ?? `CA—${String(r.sort_order).padStart(3, "0")}`}
                </td>
                <td className="py-4 pr-4">
                  <Link href={`/sound/${r.slug}`} className="font-display text-xl text-bone group-hover:text-copper">
                    {r.title}
                  </Link>
                </td>
                <td className="hidden py-4 pr-4 text-mist sm:table-cell">{releaseKindLabels[r.kind]}</td>
                <td className="hidden py-4 pr-4 text-mist md:table-cell">{r.genres.join(", ") || "—"}</td>
                <td className="py-4 text-right font-mono text-xs uppercase tracking-[0.12em] text-mist">
                  {r.stage === "released" && r.release_date ? r.release_date.slice(0, 4) : releaseStageLabels[r.stage]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
