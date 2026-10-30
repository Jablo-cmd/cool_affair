import { toEmbed } from "@/lib/embed";

const PLATFORM: Record<string, string> = {
  spotify: "Spotify",
  soundcloud: "SoundCloud",
  youtube: "YouTube",
  bandcamp: "Bandcamp",
  apple: "Apple Music",
};

// Renders an allow-listed player (Spotify, SoundCloud, YouTube, Bandcamp,
// Apple Music). Unknown URLs render nothing; callers show a link instead.
export function Embed({ url, title }: { url: string | null | undefined; title: string }) {
  const embed = toEmbed(url);
  if (!embed) return null;
  const label = `${title} on ${PLATFORM[embed.kind]}`;

  if (embed.kind === "youtube") {
    return (
      <div className="relative aspect-video w-full overflow-hidden border border-line bg-charcoal">
        <iframe
          src={embed.src}
          title={label}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <iframe
      src={embed.src}
      title={label}
      loading="lazy"
      height={embed.height}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      className="w-full border-0 bg-charcoal"
      style={{ colorScheme: "normal" }}
    />
  );
}
