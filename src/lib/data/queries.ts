import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicStorageUrl } from "@/lib/env";
import { getPublicClient } from "@/lib/supabase/public";
import { seedReleases, seedSettings } from "./seed";
import type {
  AlchemyEntry,
  ArchiveItem,
  Collaborator,
  JournalPost,
  LiveEvent,
  MediaAsset,
  Release,
  ResolvedMedia,
  SiteSettings,
  Track,
} from "./types";

// Public, cached reads. Every function is tagged CONTENT_TAG; Studio mutations
// call updateTag(CONTENT_TAG) so edits appear immediately. Reads go through the
// anon client, so RLS decides what is public (published rows, approved media).
// When Supabase is not configured, or a query fails (for example before the
// migration has been applied), the site falls back to the seed content.

export const CONTENT_TAG = "content";

function warn(scope: string, error: unknown) {
  console.warn(`[content] ${scope} failed, using fallback:`, error);
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CONTENT_TAG);

  const db = getPublicClient();
  if (!db) return seedSettings;
  const { data, error } = await db.from("ca_site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) {
    warn("settings", error);
    return seedSettings;
  }
  if (!data) return seedSettings;
  return { ...seedSettings, ...(data as Partial<SiteSettings>) } as SiteSettings;
}

function resolve(asset: MediaAsset): ResolvedMedia | null {
  const url = asset.storage_path ? publicStorageUrl(asset.storage_path) : asset.external_url;
  if (!url) return null;
  return {
    id: asset.id,
    kind: asset.kind,
    url,
    alt: asset.alt_text ?? "",
    credit: asset.credit,
    width: asset.width,
    height: asset.height,
    isTemporary: asset.is_temporary,
  };
}

/** Approved media only, keyed by id. Anything unapproved simply resolves to nothing. */
export async function getMediaMap(): Promise<Record<string, ResolvedMedia>> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CONTENT_TAG);

  const db = getPublicClient();
  if (!db) return {};
  const { data, error } = await db.from("ca_media_assets").select("*").eq("status", "approved");
  if (error) {
    warn("media", error);
    return {};
  }
  const map: Record<string, ResolvedMedia> = {};
  for (const row of (data ?? []) as MediaAsset[]) {
    const resolved = resolve(row);
    if (resolved) map[row.id] = resolved;
  }
  return map;
}

export async function getReleases(): Promise<Release[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CONTENT_TAG);

  const db = getPublicClient();
  if (!db) return seedReleases;
  const { data, error } = await db
    .from("ca_releases")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("release_date", { ascending: false, nullsFirst: false });
  if (error) {
    warn("releases", error);
    return seedReleases;
  }
  return (data ?? []) as Release[];
}

export async function getRelease(
  slug: string,
): Promise<{ release: Release; tracks: Track[] } | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CONTENT_TAG);

  const db = getPublicClient();
  if (!db) {
    const release = seedReleases.find((r) => r.slug === slug);
    return release ? { release, tracks: [] } : null;
  }
  const { data, error } = await db
    .from("ca_releases")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) {
    warn("release", error);
    const release = seedReleases.find((r) => r.slug === slug);
    return release ? { release, tracks: [] } : null;
  }
  if (!data) return null;
  const release = data as Release;
  const { data: tracks } = await db
    .from("ca_tracks")
    .select("*")
    .eq("release_id", release.id)
    .order("position", { ascending: true });
  return { release, tracks: (tracks ?? []) as Track[] };
}

function todayInJohannesburg() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function getEvents(): Promise<{ upcoming: LiveEvent[]; past: LiveEvent[] }> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  const db = getPublicClient();
  if (!db) return { upcoming: [], past: [] };
  const { data, error } = await db
    .from("ca_events")
    .select("*")
    .eq("status", "published")
    .order("event_date", { ascending: true, nullsFirst: false });
  if (error) {
    warn("events", error);
    return { upcoming: [], past: [] };
  }
  const today = todayInJohannesburg();
  const events = (data ?? []) as LiveEvent[];
  return {
    // Upcoming means dated today or later and confirmed: unconfirmed dates stay off the public list.
    upcoming: events.filter((e) => e.confirmed && e.event_date && e.event_date >= today),
    past: events.filter((e) => e.event_date && e.event_date < today).reverse(),
  };
}

export async function getArchive(): Promise<ArchiveItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CONTENT_TAG);

  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("ca_archive_items")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("item_date", { ascending: false, nullsFirst: false });
  if (error) {
    warn("archive", error);
    return [];
  }
  return (data ?? []) as ArchiveItem[];
}

export async function getAlchemy(): Promise<AlchemyEntry[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CONTENT_TAG);

  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("ca_alchemy_entries")
    .select("*")
    .eq("status", "published")
    .order("entry_date", { ascending: false, nullsFirst: false });
  if (error) {
    warn("alchemy", error);
    return [];
  }
  return (data ?? []) as AlchemyEntry[];
}

export async function getJournalPosts(): Promise<JournalPost[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CONTENT_TAG);

  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("ca_journal_posts")
    .select("id, slug, title, category, status, published_at, excerpt, cover_id, author, seo_title, seo_description")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  if (error) {
    warn("journal", error);
    return [];
  }
  return ((data ?? []) as Omit<JournalPost, "body">[]).map((p) => ({ ...p, body: null }));
}

export async function getJournalPost(slug: string): Promise<JournalPost | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CONTENT_TAG);

  const db = getPublicClient();
  if (!db) return null;
  const { data, error } = await db
    .from("ca_journal_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) {
    warn("journal post", error);
    return null;
  }
  return (data as JournalPost | null) ?? null;
}

export async function getCollaborators(): Promise<Collaborator[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CONTENT_TAG);

  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("ca_collaborators")
    .select("*")
    .eq("status", "published")
    .eq("verified", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) {
    warn("collaborators", error);
    return [];
  }
  return (data ?? []) as Collaborator[];
}
