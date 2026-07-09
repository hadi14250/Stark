import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Pill } from "@/components/ui/Pill";
import { Reveal } from "@/components/motion/Reveal";
import { landingImages } from "./assets";

/**
 * Per-tile aspect ratios, in the design's tile order, reproducing the mosaic's
 * tall/short rhythm. The CSS grid (3-col desktop / 2-col tablet / 1-col mobile)
 * lays them out row-by-row; aspect ratios keep it CLS-safe and mirror cleanly
 * in RTL (symmetric grid).
 */
const TILE_ASPECT = [
  "aspect-[360/280]",
  "aspect-[360/391]",
  "aspect-[360/280]",
  "aspect-[360/300]",
  "aspect-[360/300]",
  "aspect-[360/440]",
  "aspect-[360/300]",
  "aspect-[360/320]",
  "aspect-[360/300]",
  "aspect-[360/300]",
] as const;

/**
 * Our Gallery — design §10. A 10-tile photo mosaic teaser + a "View gallery"
 * pill routing to the (Phase-6) gallery page. Server component; static.
 */
export async function GallerySection() {
  const t = await getTranslations("landing.gallery");
  const tilesAlt = t.raw("tilesAlt") as string[];

  return (
    <section className="bg-[color:var(--color-surface)] py-20 nav:py-28">
      <Container>
        <Reveal className="mx-auto max-w-[68ch] text-center">
          <h2 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-[-0.02em] text-[color:var(--color-ink)]">
            {t("heading")}
          </h2>
          <p className="mt-4 text-base leading-7 text-[color:var(--color-ink-body)]">
            {t("sub")}
          </p>
        </Reveal>

        <div className="mt-12 columns-1 gap-5 sm:columns-2 nav:columns-3 [&>*]:mb-5">
          {landingImages.gallery.map((src, i) => (
            <Reveal key={i} y={20} delay={(i % 3) * 0.05} className="break-inside-avoid">
              <div className={`relative w-full overflow-hidden rounded-[20px] ${TILE_ASPECT[i]}`}>
                <Image
                  src={src}
                  alt={tilesAlt[i]}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 860px) 45vw, 360px"
                  className="object-cover"
                />
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <Pill variant="forest" href="/gallery" className="px-12">
            {t("viewMore")}
          </Pill>
        </Reveal>
      </Container>
    </section>
  );
}
