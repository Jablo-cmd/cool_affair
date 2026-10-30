import {
  alchemyKindLabels,
  archiveCategoryLabels,
  eventFormatLabels,
  journalCategoryLabels,
  mediaPermissionLabels,
  mediaStatusLabels,
  options,
  releaseKindLabels,
  releaseStageLabels,
} from "@/lib/data/labels";
import type { MediaKind } from "@/lib/data/types";

// Declarative description of every Studio content type. The list, form and
// save logic are generic; this file is the single place that knows which
// columns exist and how they should be edited. Everything here must stay
// serialisable (it is passed to Client Components).

export type FieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "url"
  | "email"
  | "date"
  | "datetime"
  | "number"
  | "boolean"
  | "select"
  | "tags"
  | "slug"
  | "media"
  | "relation"
  | "relations";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  maxLength?: number;
  options?: { value: string; label: string }[];
  /** slug: source field to derive from when left blank. */
  from?: string;
  /** media: restrict the picker to one kind. */
  mediaKind?: MediaKind;
  /** relation / relations: the table and label column to choose from. */
  table?: string;
  labelColumn?: string;
  /** Visual grouping in the form. */
  group?: string;
  wide?: boolean;
}

export interface ListColumn {
  name: string;
  label: string;
  format?: "date" | "datetime" | "label" | "boolean" | "status";
  labels?: Record<string, string>;
}

export interface Resource {
  key: string;
  table: string;
  label: string;
  singular: string;
  description: string;
  titleColumn: string;
  fields: Field[];
  list: ListColumn[];
  orderBy: { column: string; ascending: boolean }[];
  /** Public URL template, e.g. "/sound/{slug}". */
  publicPath?: string;
  /** Optional filter by a parent relation (?release=<id> for tracks). */
  parent?: { param: string; column: string; resource: string };
  /** Child resource linked from the edit page. */
  child?: { resource: string; param: string; label: string };
}

const publishStatus = [
  { value: "draft", label: "Draft (hidden)" },
  { value: "published", label: "Published" },
];

const seoFields: Field[] = [
  { name: "seo_title", label: "SEO title", type: "text", maxLength: 70, group: "Search & sharing", help: "Defaults to the title." },
  { name: "seo_description", label: "SEO description", type: "textarea", maxLength: 180, group: "Search & sharing", help: "One or two sentences, under 160 characters." },
];

export const resources: Record<string, Resource> = {
  releases: {
    key: "releases",
    table: "ca_releases",
    label: "Music",
    singular: "release",
    description: "Albums, EPs, singles, projects and experiments. Stage keeps concepts from being presented as releases.",
    titleColumn: "title",
    publicPath: "/sound/{slug}",
    child: { resource: "tracks", param: "release", label: "Track listing" },
    orderBy: [
      { column: "sort_order", ascending: true },
      { column: "title", ascending: true },
    ],
    list: [
      { name: "title", label: "Title" },
      { name: "kind", label: "Type", format: "label", labels: releaseKindLabels },
      { name: "stage", label: "Stage", format: "label", labels: releaseStageLabels },
      { name: "release_date", label: "Date", format: "date" },
      { name: "status", label: "Status", format: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200, group: "Release" },
      { name: "slug", label: "URL slug", type: "slug", from: "title", group: "Release", help: "Leave blank to generate from the title." },
      { name: "subtitle", label: "Subtitle", type: "text", maxLength: 200, group: "Release" },
      { name: "kind", label: "Type", type: "select", required: true, options: options(releaseKindLabels), group: "Release" },
      { name: "stage", label: "Stage", type: "select", required: true, options: options(releaseStageLabels), group: "Release", help: "Only “Released” is presented as an available record." },
      { name: "status", label: "Visibility", type: "select", required: true, options: publishStatus, group: "Release" },
      { name: "release_date", label: "Release date", type: "date", group: "Release", help: "Only shown for released work." },
      { name: "catalogue_number", label: "Catalogue number", type: "text", maxLength: 40, group: "Release" },
      { name: "genres", label: "Genres", type: "tags", group: "Release", help: "Comma separated, e.g. Broken beat, Nu-jazz" },
      { name: "featured", label: "Feature on the homepage", type: "boolean", group: "Release" },
      { name: "sort_order", label: "Catalogue order", type: "number", group: "Release", help: "Lower numbers appear first." },
      { name: "artwork_id", label: "Artwork", type: "media", mediaKind: "image", group: "Artwork", help: "Only approved media can be shown publicly." },
      { name: "summary", label: "Summary", type: "textarea", maxLength: 400, group: "Words", wide: true },
      { name: "description", label: "Release notes", type: "markdown", group: "Words", wide: true },
      { name: "embed_url", label: "Player link", type: "url", group: "Listening", help: "Spotify, SoundCloud, YouTube, Bandcamp or Apple Music link to embed.", wide: true },
      { name: "spotify_url", label: "Spotify", type: "url", group: "Listening" },
      { name: "apple_music_url", label: "Apple Music", type: "url", group: "Listening" },
      { name: "soundcloud_url", label: "SoundCloud", type: "url", group: "Listening" },
      { name: "bandcamp_url", label: "Bandcamp", type: "url", group: "Listening" },
      { name: "youtube_url", label: "YouTube", type: "url", group: "Listening" },
      { name: "other_url", label: "Other link", type: "url", group: "Listening" },
      ...seoFields,
    ],
  },

  tracks: {
    key: "tracks",
    table: "ca_tracks",
    label: "Tracks",
    singular: "track",
    description: "Track listings and authorised audio previews.",
    titleColumn: "title",
    parent: { param: "release", column: "release_id", resource: "releases" },
    orderBy: [
      { column: "release_id", ascending: true },
      { column: "position", ascending: true },
    ],
    list: [
      { name: "position", label: "No." },
      { name: "title", label: "Title" },
      { name: "duration", label: "Length" },
    ],
    fields: [
      { name: "release_id", label: "Release", type: "relation", table: "ca_releases", labelColumn: "title", required: true },
      { name: "position", label: "Track number", type: "number", required: true },
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
      { name: "duration", label: "Length", type: "text", maxLength: 12, help: "e.g. 6:42" },
      { name: "preview_id", label: "Audio preview", type: "media", mediaKind: "audio", help: "An approved, authorised excerpt." },
      { name: "credits", label: "Credits", type: "textarea", maxLength: 500 },
    ],
  },

  events: {
    key: "events",
    table: "ca_events",
    label: "Live",
    singular: "performance",
    description: "Upcoming appearances and the performance archive. Only confirmed, published dates are listed as upcoming.",
    titleColumn: "title",
    publicPath: "/live#{slug}",
    orderBy: [{ column: "event_date", ascending: false }],
    list: [
      { name: "event_date", label: "Date", format: "date" },
      { name: "title", label: "Title" },
      { name: "format", label: "Format", format: "label", labels: eventFormatLabels },
      { name: "city", label: "City" },
      { name: "confirmed", label: "Confirmed", format: "boolean" },
      { name: "status", label: "Status", format: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
      { name: "slug", label: "URL slug", type: "slug", from: "title" },
      { name: "format", label: "Format", type: "select", required: true, options: options(eventFormatLabels) },
      { name: "status", label: "Visibility", type: "select", required: true, options: publishStatus },
      { name: "confirmed", label: "Confirmed with the promoter", type: "boolean", help: "Unconfirmed dates never appear as upcoming." },
      { name: "event_date", label: "Date", type: "date" },
      { name: "start_time", label: "Time", type: "text", maxLength: 20, help: "e.g. 22:00" },
      { name: "venue", label: "Venue", type: "text", maxLength: 200 },
      { name: "city", label: "City", type: "text", maxLength: 120 },
      { name: "country", label: "Country", type: "text", maxLength: 120 },
      { name: "ticket_url", label: "Tickets link", type: "url" },
      { name: "image_id", label: "Photograph", type: "media", mediaKind: "image" },
      { name: "description", label: "Description", type: "textarea", maxLength: 1200, wide: true },
    ],
  },

  archive: {
    key: "archive",
    table: "ca_archive_items",
    label: "Archive",
    singular: "archive item",
    description: "Artwork, photography, video, live moments, collaborations, studio and historical material.",
    titleColumn: "title",
    publicPath: "/archive?category={category}",
    orderBy: [
      { column: "sort_order", ascending: true },
      { column: "item_date", ascending: false },
    ],
    list: [
      { name: "title", label: "Title" },
      { name: "category", label: "Category", format: "label", labels: archiveCategoryLabels },
      { name: "item_date", label: "Date", format: "date" },
      { name: "status", label: "Status", format: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
      { name: "category", label: "Category", type: "select", required: true, options: options(archiveCategoryLabels) },
      { name: "status", label: "Visibility", type: "select", required: true, options: publishStatus },
      { name: "item_date", label: "Date", type: "date" },
      { name: "media_id", label: "Media", type: "media" },
      { name: "external_url", label: "External link or video", type: "url", help: "A YouTube link is embedded when no media is attached." },
      { name: "release_id", label: "Related release", type: "relation", table: "ca_releases", labelColumn: "title" },
      { name: "sort_order", label: "Order", type: "number" },
      { name: "description", label: "Description", type: "textarea", maxLength: 2000, wide: true },
    ],
  },

  alchemy: {
    key: "alchemy",
    table: "ca_alchemy_entries",
    label: "Alchemy",
    singular: "laboratory entry",
    description: "Experiments, research, production notes and concepts. Nothing here is presented as a release.",
    titleColumn: "title",
    publicPath: "/alchemy",
    orderBy: [{ column: "entry_date", ascending: false }],
    list: [
      { name: "title", label: "Title" },
      { name: "kind", label: "Chamber", format: "label", labels: alchemyKindLabels },
      { name: "entry_date", label: "Date", format: "date" },
      { name: "status", label: "Status", format: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
      { name: "kind", label: "Chamber", type: "select", required: true, options: options(alchemyKindLabels) },
      { name: "status", label: "Visibility", type: "select", required: true, options: publishStatus },
      { name: "entry_date", label: "Date", type: "date" },
      { name: "media_id", label: "Image or audio", type: "media" },
      { name: "summary", label: "Summary", type: "textarea", maxLength: 400, wide: true },
      { name: "body", label: "Notes", type: "markdown", wide: true },
    ],
  },

  journal: {
    key: "journal",
    table: "ca_journal_posts",
    label: "Journal",
    singular: "article",
    description: "Editorial articles. Publish with a future date to schedule.",
    titleColumn: "title",
    publicPath: "/journal/{slug}",
    orderBy: [{ column: "published_at", ascending: false }],
    list: [
      { name: "title", label: "Title" },
      { name: "category", label: "Category", format: "label", labels: journalCategoryLabels },
      { name: "published_at", label: "Publication", format: "datetime" },
      { name: "status", label: "Status", format: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200, group: "Article" },
      { name: "slug", label: "URL slug", type: "slug", from: "title", group: "Article" },
      { name: "category", label: "Category", type: "select", required: true, options: options(journalCategoryLabels), group: "Article" },
      { name: "status", label: "Visibility", type: "select", required: true, options: publishStatus, group: "Article" },
      { name: "published_at", label: "Publication date & time (Johannesburg)", type: "datetime", group: "Article", help: "Blank publishes now. A future time schedules the article." },
      { name: "author", label: "Author", type: "text", maxLength: 120, group: "Article", help: "Defaults to the artist." },
      { name: "cover_id", label: "Cover image", type: "media", mediaKind: "image", group: "Article" },
      { name: "excerpt", label: "Standfirst", type: "textarea", maxLength: 400, group: "Words", wide: true },
      { name: "body", label: "Body", type: "markdown", group: "Words", wide: true },
      ...seoFields,
    ],
  },

  collaborators: {
    key: "collaborators",
    table: "ca_collaborators",
    label: "Collaborators",
    singular: "collaborator",
    description: "The Collaboration Network. Only verified, published collaborators appear publicly.",
    titleColumn: "name",
    publicPath: "/collaborators#{slug}",
    orderBy: [
      { column: "sort_order", ascending: true },
      { column: "name", ascending: true },
    ],
    list: [
      { name: "name", label: "Name" },
      { name: "role", label: "Role" },
      { name: "verified", label: "Verified", format: "boolean" },
      { name: "status", label: "Status", format: "status" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, maxLength: 160 },
      { name: "slug", label: "URL slug", type: "slug", from: "name" },
      { name: "role", label: "Role", type: "text", maxLength: 120, help: "e.g. Vocalist, Saxophone, Producer" },
      { name: "status", label: "Visibility", type: "select", required: true, options: publishStatus },
      { name: "verified", label: "Collaboration verified", type: "boolean", help: "Required before anyone is listed publicly." },
      { name: "image_id", label: "Photograph or artwork", type: "media", mediaKind: "image" },
      { name: "release_ids", label: "Associated projects", type: "relations", table: "ca_releases", labelColumn: "title" },
      { name: "website_url", label: "Website", type: "url" },
      { name: "instagram_url", label: "Instagram", type: "url" },
      { name: "other_url", label: "Other link", type: "url" },
      { name: "sort_order", label: "Order", type: "number" },
      { name: "bio", label: "Short biography", type: "textarea", maxLength: 1200, wide: true },
    ],
  },

  media: {
    key: "media",
    table: "ca_media_assets",
    label: "Media",
    singular: "media asset",
    description: "The provenance registry. Every image, recording and video, with its source, rights and approval status.",
    titleColumn: "title",
    orderBy: [{ column: "created_at", ascending: false }],
    list: [
      { name: "title", label: "Title" },
      { name: "kind", label: "Kind" },
      { name: "permission", label: "Permission", format: "label", labels: mediaPermissionLabels },
      { name: "status", label: "Status", format: "label", labels: mediaStatusLabels },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 200, group: "Asset" },
      { name: "alt_text", label: "Alt text", type: "textarea", maxLength: 300, group: "Asset", help: "Describe the image for people who cannot see it." },
      { name: "external_url", label: "External URL", type: "url", group: "Asset", help: "Only for assets hosted elsewhere." },
      { name: "is_temporary", label: "Temporary (development only)", type: "boolean", group: "Asset", help: "Shown with a ‘Temporary image’ label." },
      { name: "source", label: "Source", type: "text", required: true, maxLength: 300, group: "Provenance", help: "Where this file came from: photographer, session, archive, supplied by…" },
      { name: "credit", label: "Public credit", type: "text", maxLength: 200, group: "Provenance" },
      { name: "rights_holder", label: "Rights holder", type: "text", maxLength: 200, group: "Provenance" },
      { name: "captured_on", label: "Date created", type: "date", group: "Provenance" },
      { name: "permission", label: "Usage permission", type: "select", required: true, options: options(mediaPermissionLabels), group: "Provenance" },
      { name: "permission_notes", label: "Permission notes", type: "textarea", maxLength: 1000, group: "Provenance", help: "Licence terms, who granted permission and when." },
      { name: "status", label: "Publication status", type: "select", required: true, options: options(mediaStatusLabels), group: "Provenance", help: "Only approved assets ever appear on the public site." },
    ],
  },
};

export const resourceOrder = ["releases", "events", "journal", "archive", "alchemy", "collaborators", "media"];

export function getResource(key: string): Resource | undefined {
  return Object.hasOwn(resources, key) ? resources[key] : undefined;
}

// Site settings use the same field renderer.
export const settingsFields: Field[] = [
  { name: "artist_name", label: "Artist name", type: "text", required: true, maxLength: 120, group: "Identity" },
  { name: "legal_name", label: "Full name", type: "text", maxLength: 160, group: "Identity" },
  { name: "base_city", label: "City", type: "text", maxLength: 120, group: "Identity" },
  { name: "roles", label: "Roles", type: "tags", group: "Identity", help: "Comma separated" },
  { name: "influences", label: "Influences", type: "tags", group: "Identity", help: "Comma separated, shown on Home and Artist Story" },

  { name: "hero_statement", label: "Opening statement", type: "textarea", maxLength: 220, group: "Homepage", wide: true },
  { name: "intro_statement", label: "Introduction", type: "textarea", maxLength: 900, group: "Homepage", wide: true },
  { name: "hero_media_id", label: "Hero image", type: "media", mediaKind: "image", group: "Homepage" },
  { name: "featured_release_id", label: "Featured release", type: "relation", table: "ca_releases", labelColumn: "title", group: "Homepage" },

  { name: "portrait_media_id", label: "Portrait", type: "media", mediaKind: "image", group: "Artist story" },
  { name: "bio_intro", label: "Introduction", type: "markdown", group: "Artist story", wide: true },
  { name: "philosophy", label: "Musical philosophy", type: "markdown", group: "Artist story", wide: true },
  { name: "creative_approach", label: "Creative approach", type: "markdown", group: "Artist story", wide: true },
  { name: "johannesburg", label: "Johannesburg connection", type: "markdown", group: "Artist story", wide: true },
  { name: "artistic_direction", label: "Artistic direction", type: "markdown", group: "Artist story", wide: true },

  { name: "live_intro", label: "Live introduction", type: "textarea", maxLength: 500, group: "Live & Alchemy", wide: true },
  { name: "alchemy_intro", label: "Alchemy introduction", type: "textarea", maxLength: 500, group: "Live & Alchemy", wide: true },

  { name: "band_concept", label: "Performance concept", type: "textarea", maxLength: 800, group: "Full Band", wide: true },
  { name: "band_configuration", label: "Band configuration", type: "markdown", group: "Full Band", wide: true, help: "Publish only a confirmed line-up." },
  { name: "band_instrumentation", label: "Instrumentation", type: "markdown", group: "Full Band", wide: true },
  { name: "band_technical", label: "Technical requirements", type: "markdown", group: "Full Band", wide: true },
  { name: "band_video_url", label: "Video link", type: "url", group: "Full Band" },
  { name: "band_media_id", label: "Photograph", type: "media", mediaKind: "image", group: "Full Band" },

  { name: "contact_email", label: "General email", type: "email", group: "Contact & social" },
  { name: "booking_email", label: "Booking email", type: "email", group: "Contact & social" },
  { name: "instagram_url", label: "Instagram", type: "url", group: "Contact & social" },
  { name: "soundcloud_url", label: "SoundCloud", type: "url", group: "Contact & social" },
  { name: "youtube_url", label: "YouTube", type: "url", group: "Contact & social" },
  { name: "spotify_url", label: "Spotify", type: "url", group: "Contact & social" },
  { name: "bandcamp_url", label: "Bandcamp", type: "url", group: "Contact & social" },
  { name: "apple_music_url", label: "Apple Music", type: "url", group: "Contact & social" },
  { name: "facebook_url", label: "Facebook", type: "url", group: "Contact & social" },
  { name: "x_url", label: "X", type: "url", group: "Contact & social" },

  { name: "seo_title", label: "Default SEO title", type: "text", maxLength: 70, group: "SEO defaults" },
  { name: "seo_description", label: "Default SEO description", type: "textarea", maxLength: 180, group: "SEO defaults" },
];
