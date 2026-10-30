import type { Metadata } from "next";
import { siteUrl } from "@/lib/env";
import type { SiteSettings } from "@/lib/data/types";

export const SITE_NAME = "The Cool Affair Universe";

export const DEFAULT_DESCRIPTION =
  "Cool Affair is the creative identity of Johannesburg producer, DJ, musician and sound engineer Sibusiso Zephania Ntombela: broken beat, nu-jazz, Afrobeat, deep house and ambient experimentation.";

interface PageMetaInput {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  imageAlt?: string | null;
  type?: "website" | "article" | "music.album" | "profile";
  publishedTime?: string | null;
  noIndex?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  noIndex,
}: PageMetaInput): Metadata {
  const desc = description?.trim() || DEFAULT_DESCRIPTION;
  // When there is no page image, the route's opengraph-image file (or the root
  // one) supplies it, so only set images when we have a real one.
  const images = image ? [{ url: image, alt: imageAlt ?? title }] : undefined;
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: desc,
      url: path,
      siteName: SITE_NAME,
      locale: "en_ZA",
      type: type === "music.album" ? "music.album" : type === "article" ? "article" : "website",
      ...(images ? { images } : {}),
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      ...(image ? { images: [image] } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function socialLinks(settings: SiteSettings) {
  return [
    { label: "Instagram", href: settings.instagram_url },
    { label: "SoundCloud", href: settings.soundcloud_url },
    { label: "YouTube", href: settings.youtube_url },
    { label: "Spotify", href: settings.spotify_url },
    { label: "Bandcamp", href: settings.bandcamp_url },
    { label: "Apple Music", href: settings.apple_music_url },
    { label: "Facebook", href: settings.facebook_url },
    { label: "X", href: settings.x_url },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));
}

/** Person + WebSite structured data, built only from facts held in settings. */
export function siteJsonLd(settings: SiteSettings) {
  const sameAs = socialLinks(settings).map((l) => l.href);
  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": absoluteUrl("/#artist"),
    name: settings.legal_name ?? settings.artist_name,
    alternateName: settings.artist_name,
    url: absoluteUrl("/"),
    ...(settings.roles.length ? { jobTitle: settings.roles } : {}),
    ...(settings.base_city
      ? {
          homeLocation: {
            "@type": "Place",
            name: settings.base_city,
            address: {
              "@type": "PostalAddress",
              addressLocality: settings.base_city,
              addressCountry: "ZA",
            },
          },
        }
      : {}),
    ...(settings.influences.length ? { knowsAbout: settings.influences } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: SITE_NAME,
        url: absoluteUrl("/"),
        inLanguage: "en-ZA",
        about: { "@id": absoluteUrl("/#artist") },
      },
      person,
    ],
  };
}
