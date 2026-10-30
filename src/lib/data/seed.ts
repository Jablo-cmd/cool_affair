import type { Release, SiteSettings } from "./types";

// Fallback content used when Supabase is not configured, and the source for
// supabase/seed.sql. It contains only facts supplied by the artist's brief:
// name, roles, city, influences and the known project titles. Everything else
// is null so the site shows a labelled placeholder rather than invented copy.

export const seedSettings: SiteSettings = {
  artist_name: "Cool Affair",
  legal_name: "Sibusiso Zephania Ntombela",
  base_city: "Johannesburg",
  roles: ["Producer", "DJ", "Musician", "Sound engineer", "Label owner"],
  influences: [
    "Broken beat",
    "Nu-jazz",
    "Afrobeat",
    "Soulful house",
    "Deep house",
    "Jazz",
    "Electronic experimentation",
    "Ambient",
    "Afro-futurism",
  ],
  hero_statement:
    "Where African musical expression, jazz sensibility and electronic experimentation meet.",
  intro_statement:
    "Cool Affair is the creative identity of Sibusiso Zephania Ntombela: producer, DJ, musician, sound engineer and label owner, working from Johannesburg. It is less a brand than a universe, built from broken beat and nu-jazz, Afrobeat and deep house, ambient space and the city's underground.",
  bio_intro: null,
  philosophy: null,
  creative_approach: null,
  johannesburg: null,
  artistic_direction: null,
  alchemy_intro:
    "Alchemy is the laboratory: the experiments, research and production notes behind the music. Nothing filed here is a finished release unless it says so.",
  live_intro:
    "DJ sets, live electronic performance, collaborations and an expanded Full Band Experience: the sound of Cool Affair, in the room.",
  band_concept:
    "The Full Band Experience is conceived as an expanded format, bringing musicians and electronic production together in one live performance.",
  band_configuration: null,
  band_instrumentation: null,
  band_technical: null,
  band_video_url: null,
  band_media_id: null,
  hero_media_id: null,
  portrait_media_id: null,
  featured_release_id: null,
  contact_email: null,
  booking_email: null,
  instagram_url: null,
  soundcloud_url: null,
  youtube_url: null,
  spotify_url: null,
  bandcamp_url: null,
  apple_music_url: null,
  facebook_url: null,
  x_url: null,
  seo_title: null,
  seo_description: null,
};

const concept = (
  id: string,
  slug: string,
  title: string,
  sort_order: number,
): Release => ({
  id,
  slug,
  title,
  subtitle: null,
  kind: "project",
  stage: "concept",
  status: "published",
  release_date: null,
  catalogue_number: null,
  summary: null,
  description: null,
  genres: [],
  artwork_id: null,
  embed_url: null,
  spotify_url: null,
  apple_music_url: null,
  soundcloud_url: null,
  youtube_url: null,
  bandcamp_url: null,
  other_url: null,
  featured: sort_order <= 3,
  sort_order,
  seo_title: null,
  seo_description: null,
});

// The eight known project identities. Stage "concept": no dates, tracks,
// audio or artwork are implied.
export const seedReleases: Release[] = [
  concept("00000000-0000-4000-8000-000000000001", "the-cool-affair-manifesto", "The Cool Affair Manifesto", 1),
  concept("00000000-0000-4000-8000-000000000002", "scamto-mzansi-argot", "Scamto (Mzansi Argot)", 2),
  concept("00000000-0000-4000-8000-000000000003", "stone-circles", "Stone Circles", 3),
  concept("00000000-0000-4000-8000-000000000004", "broken-beat-music", "Broken Beat Music", 4),
  concept("00000000-0000-4000-8000-000000000005", "afro-futuristic", "Afro Futuristic", 5),
  concept("00000000-0000-4000-8000-000000000006", "ambient", "Ambient", 6),
  concept("00000000-0000-4000-8000-000000000007", "cool-goes-deep", "Cool Goes Deep", 7),
  concept("00000000-0000-4000-8000-000000000008", "full-band-experience", "Full Band Experience", 8),
];
