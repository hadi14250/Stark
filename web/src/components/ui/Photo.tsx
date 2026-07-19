import Image, { type ImageProps } from "next/image";

/**
 * Every photograph on the site goes through here.
 *
 * The site is mostly photography, and a consistent grade does more for
 * cross-page coherence than the entire per-theme colour table — it is also the
 * only thing that will paper over inevitably mixed-source client photos. Doing
 * it in one wrapper means the treatment is applied by CONSTRUCTION rather than
 * by everyone remembering the same filter string.
 *
 * The grade comes from `--image-filter`, which each theme sets (Tier 3):
 *   home        saturate(.96) brightness(1.01)     mixed, poster
 *   woodworks   contrast(1.12) saturate(.92) …     close-crop, material, grain
 *   mattresses  saturate(.94) brightness(1.04)     wide, high-key
 *
 * `ratio` is a closed set on purpose. Nothing outside it ships:
 *   16/9 bands · 4/5 portraits · 1/1 grid tiles · 115/121 pentagon
 */
const RATIO = {
  band: "16 / 9",
  portrait: "4 / 5",
  square: "1 / 1",
  pentagon: "115 / 121",
} as const;

export type PhotoRatio = keyof typeof RATIO;

type PhotoProps = Omit<ImageProps, "alt" | "width" | "height"> & {
  /**
   * Required, and required to be meaningful. Decorative photography passes
   * `alt=""` explicitly — an omitted alt is a bug, an empty one is a decision.
   */
  alt: string;
  ratio?: PhotoRatio;
  /** Slow zoom on the image, for hero bands. Paused under reduced motion. */
  kenBurns?: boolean;
  className?: string;
};

export function Photo({
  alt,
  ratio = "band",
  kenBurns = false,
  className,
  ...rest
}: PhotoProps) {
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{ aspectRatio: RATIO[ratio] }}
    >
      <Image
        alt={alt}
        fill
        sizes="(max-width: 860px) 100vw, 50vw"
        className={`object-cover ${kenBurns ? "animate-ken-burns motion-reduce:animate-none" : ""}`}
        style={{ filter: "var(--image-filter)" }}
        {...rest}
      />
    </div>
  );
}
