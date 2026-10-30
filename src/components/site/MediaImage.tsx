import Image from "next/image";
import { supabaseUrl } from "@/lib/env";
import type { ResolvedMedia } from "@/lib/data/types";

interface MediaImageProps {
  media: ResolvedMedia;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Fill the positioned parent; otherwise use the asset's own dimensions. */
  fill?: boolean;
}

// Supabase Storage images go through next/image optimisation (the host is
// allow-listed in next.config.ts). Other approved external URLs render
// unoptimised rather than failing.
export function MediaImage({ media, sizes, className = "", priority, fill = true }: MediaImageProps) {
  const optimisable = Boolean(supabaseUrl?.startsWith("https://") && media.url.startsWith(supabaseUrl));
  const alt = media.alt || "";
  const common = {
    src: media.url,
    sizes,
    priority,
    unoptimized: !optimisable,
    className,
  };
  return (
    <>
      {fill || !media.width || !media.height ? (
        <Image {...common} alt={alt} fill />
      ) : (
        <Image {...common} alt={alt} width={media.width} height={media.height} />
      )}
      {media.isTemporary && (
        <span className="eyebrow absolute left-3 top-3 z-10 bg-ink/80 px-2 py-1 text-[0.6rem] text-copper">
          Temporary image
        </span>
      )}
    </>
  );
}
