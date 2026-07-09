import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Pill } from "@/components/ui/Pill";
import { Reveal } from "@/components/motion/Reveal";
import { landingImages } from "./assets";

/**
 * Desktop (≥nav): per-tile aspect ratios in the design's tile order, laid out
 * by a 3-column CSS masonry. Verified against the desktop handoff.
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
 * Mobile (<nav): the handoff's exact 2-column mosaic. Each entry = index into
 * landingImages.gallery + the pixel height from the mobile design. Column order
 * mirrors automatically in RTL (flex direction follows dir).
 */
const MOBILE_LEFT = [
  { i: 0, h: "h-[160px]" },
  { i: 2, h: "h-[140px]" },
  { i: 4, h: "h-[150px]" },
  { i: 6, h: "h-[232px]" },
  { i: 8, h: "h-[196px]" },
] as const;
const MOBILE_RIGHT = [
  { i: 1, h: "h-[220px]" },
  { i: 3, h: "h-[140px]" },
  { i: 5, h: "h-[250px]" },
  { i: 7, h: "h-[150px]" },
  { i: 9, h: "h-[188px]" },
] as const;

const MOBILE_SIZES = "(max-width: 860px) 45vw, 360px";

/**
 * Our Gallery — a 10-tile photo mosaic teaser + a "View gallery" pill routing
 * to the (Phase-6) gallery page. Responsive: mobile renders the handoff's exact
 * 2-column/exact-height mosaic; desktop keeps the 3-column masonry.
 */
export async function GallerySection() {
  const t = await getTranslations("landing.gallery");
  const tilesAlt = t.raw("tilesAlt") as string[];

  return (
    <section className="bg-[color:var(--color-surface)] py-[52px] nav:py-28">
      <Container>
        <Reveal className="mx-auto max-w-[68ch] text-center">
          <h2 className="font-display text-[30px] font-bold tracking-[-0.02em] text-[color:var(--color-ink)] nav:text-[clamp(2rem,4vw,2.75rem)]">
            {t("heading")}
          </h2>
          <p className="mt-3 text-[15px] leading-6 text-[color:var(--color-ink-body)] nav:mt-4 nav:text-base nav:leading-7">
            {t("sub")}
          </p>
        </Reveal>

        {/* Mobile: exact 2-column mosaic */}
        <div className="mt-8 flex gap-3 nav:hidden">
          {[MOBILE_LEFT, MOBILE_RIGHT].map((col, ci) => (
            <div key={ci} className="flex flex-1 flex-col gap-3">
              {col.map(({ i, h }) => (
                <Reveal key={i} y={16} delay={(i % 3) * 0.05}>
                  <div className={`relative w-full overflow-hidden rounded-[18px] ${h}`}>
                    <Image
                      src={landingImages.gallery[i]}
                      alt={tilesAlt[i]}
                      fill
                      sizes={MOBILE_SIZES}
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          ))}
        </div>

        {/* Desktop: 3-column masonry */}
        <div className="mt-12 hidden gap-5 nav:block nav:columns-3 [&>*]:mb-5">
          {landingImages.gallery.map((src, i) => (
            <Reveal key={i} y={20} delay={(i % 3) * 0.05} className="break-inside-avoid">
              <div className={`relative w-full overflow-hidden rounded-[20px] ${TILE_ASPECT[i]}`}>
                <Image
                  src={src}
                  alt={tilesAlt[i]}
                  fill
                  sizes="360px"
                  className="object-cover"
                />
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 flex justify-center nav:mt-12">
          <Pill variant="forest" href="/gallery" className="px-12">
            {t("viewMore")}
          </Pill>
        </Reveal>
      </Container>
    </section>
  );
}
