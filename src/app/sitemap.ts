import type { MetadataRoute } from "next";
import { getJournalPosts, getReleases } from "@/lib/data/queries";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [releases, posts] = await Promise.all([getReleases(), getJournalPosts()]);
  const pages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/sound", priority: 0.9, changeFrequency: "weekly" },
    { path: "/live", priority: 0.8, changeFrequency: "weekly" },
    { path: "/live/full-band", priority: 0.7, changeFrequency: "monthly" },
    { path: "/story", priority: 0.8, changeFrequency: "monthly" },
    { path: "/alchemy", priority: 0.6, changeFrequency: "monthly" },
    { path: "/archive", priority: 0.6, changeFrequency: "monthly" },
    { path: "/journal", priority: 0.7, changeFrequency: "weekly" },
    { path: "/collaborators", priority: 0.5, changeFrequency: "monthly" },
    { path: "/book", priority: 0.8, changeFrequency: "monthly" },
  ];
  return [
    ...pages.map((p) => ({ url: absoluteUrl(p.path), changeFrequency: p.changeFrequency, priority: p.priority })),
    ...releases.map((r) => ({
      url: absoluteUrl(`/sound/${r.slug}`),
      changeFrequency: "monthly" as const,
      priority: r.stage === "released" ? 0.7 : 0.4,
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/journal/${p.slug}`),
      ...(p.published_at ? { lastModified: p.published_at } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
