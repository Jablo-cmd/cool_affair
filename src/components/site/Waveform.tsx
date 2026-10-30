import { seededRandom } from "@/lib/hash";

interface WaveformProps {
  seed: string;
  bars?: number;
  className?: string;
  animated?: boolean;
  /** Fraction 0–1 drawn in the accent colour (e.g. playback progress). */
  progress?: number;
}

// Decorative waveform, generated from a seed so each title has its own shape.
// It is a visual signature, not a rendering of real audio.
export function Waveform({ seed, bars = 48, className = "", animated = false, progress }: WaveformProps) {
  const rand = seededRandom(seed);
  const heights = Array.from({ length: bars }, (_, i) => {
    const envelope = Math.sin((i / (bars - 1)) * Math.PI) * 0.55 + 0.45;
    return Math.max(0.08, envelope * (0.35 + rand() * 0.65));
  });
  const width = bars * 4;
  const played = progress === undefined ? -1 : Math.round(progress * bars);

  const svg = (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} 40`}
      preserveAspectRatio="none"
      className={animated ? "h-full w-full" : className}
      fill="currentColor"
    >
      {heights.map((h, i) => {
        const barHeight = h * 38;
        return (
          <rect
            key={i}
            x={i * 4 + 1}
            y={20 - barHeight / 2}
            width={2}
            height={barHeight}
            fill={i < played ? "var(--color-copper)" : undefined}
          />
        );
      })}
    </svg>
  );

  if (!animated) return svg;
  return (
    <div aria-hidden className={`relative overflow-hidden ${className}`}>
      {svg}
      <span className="wave-sweep" />
    </div>
  );
}
