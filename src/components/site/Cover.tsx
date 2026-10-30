import { hashString } from "@/lib/hash";
import type { ResolvedMedia } from "@/lib/data/types";
import { MediaImage } from "./MediaImage";

interface CoverProps {
  title: string;
  index?: number;
  artwork?: ResolvedMedia | null;
  sizes?: string;
  priority?: boolean;
  className?: string;
  label?: string;
}

const MOTIFS = ["rings", "lines", "arc", "grid", "split"] as const;

// Release artwork, or a typographic stand-in when no approved artwork exists.
// The stand-in is labelled so it can never be mistaken for official artwork.
export function Cover({
  title,
  index,
  artwork,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority,
  className = "",
  label = "Artwork pending",
}: CoverProps) {
  if (artwork) {
    return (
      <div className={`relative aspect-square overflow-hidden bg-charcoal ${className}`}>
        <MediaImage
          media={{ ...artwork, alt: artwork.alt || `Artwork for ${title}` }}
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.035]"
        />
      </div>
    );
  }

  const h = hashString(title);
  const motif = MOTIFS[h % MOTIFS.length];
  const rotate = (h >> 3) % 360;

  return (
    <div
      className={`relative flex aspect-square flex-col justify-between overflow-hidden border border-line bg-charcoal p-4 sm:p-5 ${className}`}
      role="img"
      aria-label={`${title}: typographic placeholder, official artwork not yet published`}
    >
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full text-smoke transition-colors duration-700 group-hover:text-copper-deep"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.3"
      >
        {motif === "rings" &&
          [10, 18, 26, 34, 42].map((r) => <circle key={r} cx="62" cy="58" r={r} />)}
        {motif === "lines" &&
          Array.from({ length: 22 }, (_, i) => (
            <line key={i} x1={i * 5} y1="0" x2={i * 5 - 30} y2="100" />
          ))}
        {motif === "arc" && (
          <g transform={`rotate(${rotate} 50 50)`}>
            {[20, 30, 40, 50].map((r) => (
              <path key={r} d={`M ${50 - r} 50 A ${r} ${r} 0 0 1 ${50 + r} 50`} />
            ))}
          </g>
        )}
        {motif === "grid" &&
          Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <line x1={i * 12.5} y1="0" x2={i * 12.5} y2="100" />
              <line x1="0" y1={i * 12.5} x2="100" y2={i * 12.5} />
            </g>
          ))}
        {motif === "split" && (
          <>
            <circle cx="50" cy="50" r="30" />
            <line x1="0" y1="50" x2="100" y2="50" />
            <circle cx="50" cy="50" r="2" fill="currentColor" />
          </>
        )}
      </svg>

      <span className="relative font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist">
        {index !== undefined ? `CA—${String(index).padStart(3, "0")}` : "Cool Affair"}
      </span>
      <span className="relative font-display text-[clamp(1.5rem,3.2vw,2.6rem)] leading-[0.95] text-bone text-balance">
        {title}
      </span>
      <span className="relative font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mist">
        {label}
      </span>
    </div>
  );
}
