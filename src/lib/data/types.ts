// Row shapes for the ca_ tables (see supabase/migrations). Kept hand-written so
// the app builds without generated types; regenerate with `supabase gen types`
// if the schema grows.

export type MediaKind = "image" | "audio" | "video";
export type MediaPermission =
  | "owned"
  | "licensed"
  | "permission_granted"
  | "pending"
  | "unknown";
export type MediaStatus = "pending_review" | "approved" | "rejected" | "archived";

export interface MediaAsset {
  id: string;
  kind: MediaKind;
  title: string;
  storage_path: string | null;
  external_url: string | null;
  alt_text: string | null;
  credit: string | null;
  source: string;
  rights_holder: string | null;
  permission: MediaPermission;
  permission_notes: string | null;
  status: MediaStatus;
  is_temporary: boolean;
  width: number | null;
  height: number | null;
  captured_on: string | null;
  created_at: string;
}

/** A media asset resolved for display: always approved, always has a URL. */
export interface ResolvedMedia {
  id: string;
  kind: MediaKind;
  url: string;
  alt: string;
  credit: string | null;
  width: number | null;
  height: number | null;
  isTemporary: boolean;
}

export type PublishStatus = "draft" | "published";

export interface SiteSettings {
  artist_name: string;
  legal_name: string | null;
  base_city: string | null;
  roles: string[];
  influences: string[];
  hero_statement: string | null;
  intro_statement: string | null;
  bio_intro: string | null;
  philosophy: string | null;
  creative_approach: string | null;
  johannesburg: string | null;
  artistic_direction: string | null;
  alchemy_intro: string | null;
  live_intro: string | null;
  band_concept: string | null;
  band_configuration: string | null;
  band_instrumentation: string | null;
  band_technical: string | null;
  band_video_url: string | null;
  band_media_id: string | null;
  hero_media_id: string | null;
  portrait_media_id: string | null;
  featured_release_id: string | null;
  contact_email: string | null;
  booking_email: string | null;
  instagram_url: string | null;
  soundcloud_url: string | null;
  youtube_url: string | null;
  spotify_url: string | null;
  bandcamp_url: string | null;
  apple_music_url: string | null;
  facebook_url: string | null;
  x_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export type ReleaseKind = "album" | "ep" | "single" | "mix" | "project" | "experiment";
export type ReleaseStage = "released" | "forthcoming" | "in_development" | "concept";

export interface Release {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  kind: ReleaseKind;
  stage: ReleaseStage;
  status: PublishStatus;
  release_date: string | null;
  catalogue_number: string | null;
  summary: string | null;
  description: string | null;
  genres: string[];
  artwork_id: string | null;
  embed_url: string | null;
  spotify_url: string | null;
  apple_music_url: string | null;
  soundcloud_url: string | null;
  youtube_url: string | null;
  bandcamp_url: string | null;
  other_url: string | null;
  featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
}

export interface Track {
  id: string;
  release_id: string;
  position: number;
  title: string;
  duration: string | null;
  preview_id: string | null;
  credits: string | null;
}

export type EventFormat = "dj_set" | "live_electronic" | "collaboration" | "full_band";

export interface LiveEvent {
  id: string;
  slug: string;
  title: string;
  format: EventFormat;
  status: PublishStatus;
  confirmed: boolean;
  event_date: string | null;
  start_time: string | null;
  venue: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  ticket_url: string | null;
  image_id: string | null;
}

export type ArchiveCategory =
  | "release"
  | "artwork"
  | "photography"
  | "video"
  | "live"
  | "collaboration"
  | "studio"
  | "historical"
  | "project";

export interface ArchiveItem {
  id: string;
  title: string;
  category: ArchiveCategory;
  status: PublishStatus;
  item_date: string | null;
  description: string | null;
  media_id: string | null;
  external_url: string | null;
  release_id: string | null;
  sort_order: number;
}

export type AlchemyKind =
  | "experiment"
  | "research"
  | "production_note"
  | "philosophy"
  | "concept"
  | "collaboration";

export interface AlchemyEntry {
  id: string;
  title: string;
  kind: AlchemyKind;
  status: PublishStatus;
  entry_date: string | null;
  summary: string | null;
  body: string | null;
  media_id: string | null;
}

export type JournalCategory =
  | "reflection"
  | "commentary"
  | "production"
  | "philosophy"
  | "studio"
  | "culture"
  | "announcement"
  | "behind_the_scenes";

export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  category: JournalCategory;
  status: PublishStatus;
  published_at: string | null;
  excerpt: string | null;
  body: string | null;
  cover_id: string | null;
  author: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface Collaborator {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  bio: string | null;
  image_id: string | null;
  website_url: string | null;
  instagram_url: string | null;
  other_url: string | null;
  release_ids: string[];
  verified: boolean;
  status: PublishStatus;
  sort_order: number;
}

export type EnquiryType =
  | "dj_booking"
  | "live_performance"
  | "full_band"
  | "production"
  | "sound_engineering"
  | "collaboration"
  | "label_industry"
  | "general";

export type EnquiryStatus =
  | "new"
  | "in_review"
  | "responded"
  | "confirmed"
  | "declined"
  | "archived";

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  organisation: string | null;
  enquiry_type: EnquiryType;
  event_date: string | null;
  location: string | null;
  budget_range: string | null;
  message: string;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface EnquiryNote {
  id: string;
  enquiry_id: string;
  author_email: string | null;
  body: string;
  created_at: string;
}
