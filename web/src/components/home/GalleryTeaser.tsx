import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { Photo } from "@/components/ui/Photo";
import { ClipReveal } from "@/components/motion/reveals";
import { Parallax } from "@/components/motion/Parallax";
import { landingImages } from "@/components/landing/assets";
import { GalleryAnchor } from "./GalleryAnchor";

/**
 * A five-tile teaser, not the ten-tile mosaic the prototype ran here.
 *
 * The full masonry belongs to /gallery, which is a whole page built for
 * exactly this. A ten-tile grid on the home page competes with the destination
 * it is supposed to send people to, and answers the question instead of raising
 * it. Five tiles and a link earn the click.
 *
 * THE TILES ARE LINKS NOW, and that was a real bug rather than a polish item:
 * a grid of photographs under the heading "Selected work", sitting directly
 * above a "View gallery" button, is going to get clicked. Every one of those
 * clicks previously did nothing. Each small tile goes to its own category so
 * the click lands somewhere more specific than the front of the gallery, and
 * the anchor goes to the gallery itself.
 *
 * Hover/focus raises a scrim and slides in the destination — the tile says
 * where it goes before you commit to it. Focus-visible gets the identical
 * treatment, so the keyboard path is not a second-class one.
 *
 * Ratios come from Photo's closed set: one tall portrait anchoring the group,
 * four squares. Nothing here invents an aspect ratio.
 */

/**
 * Which division each small tile leads to.
 *
 * Alternating rather than 2+2 blocked: the four tiles read as a single group,
 * and grouping them by destination would imply the left pair and right pair
 * are different KINDS of work, which the photographs do not support.
 *
 * ⚠ FOUR TILES, THREE DIVISIONS, so one repeats. It repeats at the END rather
 * than in the middle, which keeps the first three tiles a clean sweep of the
 * gallery's three divisions in the order the section's own intro names them
 * ("WOODWORKS, FURNITURE and MATTRESSES"). The alternative — dropping to three
 * tiles — would break the 2x2 mosaic the anchor tile is composed against.
 *
 * These deep-link with `?c=`, which still resolves: the gallery seats a bare
 * division on its first product type. See the resolution order in gallery/page.
 */
const TILE_CATEGORY = ["woodworks", "furniture", "mattresses", "woodworks"] as const;

/**
 * Which of the ten gallery images the anchor tile cycles through.
 *
 * Spread across the set rather than taken consecutively — 0, 5, 8 are three
 * visibly different rooms, where 0, 1, 2 are three angles that read as one.
 * Indices 1–4 belong to the small tiles, so nothing appears twice on screen.
 */
const ANCHOR_TILES = [0, 5, 8] as const;

export async function GalleryTeaser() {
  const t = await getTranslations("landing.gallery");
  const tc = await getTranslations("gallery.categories");
  const alts = t.raw("tilesAlt") as string[];

  return (
    <Section surface="surface-2" id="gallery-teaser">
      <Container>
        <SectionHeader
          eyebrow={<Eyebrow>{t("eyebrowLabel")}</Eyebrow>}
          heading={t("heading")}
          intro={t("sub")}
        />

        <div className="mt-[clamp(36px,5vw,64px)] grid grid-cols-2 gap-3.5 nav:grid-cols-4 nav:grid-rows-2">
          {/* The anchor tile spans both rows on desktop; on mobile it is simply
              the first of a two-column run. It drifts SLOWER than the small
              tiles below, which is what shears the mosaic as the section
              passes rather than sliding it as one block. */}
          <ClipReveal className="col-span-2 nav:col-span-2 nav:row-span-2">
            <Parallax amount={4} className="h-full">
              <Tile
                href="/gallery"
                label={t("viewMore")}
                className="h-full rounded-[var(--radius-card)]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Capped: a 4/5 portrait at this column width is ~737px tall,
                    which is taller than the viewport under the header. */}
                <GalleryAnchor
                  images={ANCHOR_TILES.map((n) => landingImages.gallery[n])}
                  alts={ANCHOR_TILES.map((n) => alts[n])}
                  height="clamp(280px, 46vh, 460px)"
                />
              </Tile>
            </Parallax>
          </ClipReveal>

          {TILE_CATEGORY.map((category, i) => (
            <ClipReveal key={category + i} delay={0.08 * (i + 1)}>
              {/* Alternating signs: adjacent tiles pull apart as they travel,
                  so the grid breathes instead of translating rigidly. */}
              <Parallax amount={i % 2 === 0 ? 9 : -9}>
                <Tile
                  href={{ pathname: "/gallery", query: { c: category } }}
                  label={tc(category)}
                  className="rounded-[var(--radius-image)]"
                >
                  <Photo
                    src={landingImages.gallery[i + 1]}
                    alt={alts[i + 1]}
                    height="clamp(130px, 22vh, 220px)"
                  />
                </Tile>
              </Parallax>
            </ClipReveal>
          ))}
        </div>

        <div className="mt-10 flex" style={{ justifyContent: "var(--align-axis)" }}>
          <Pill variant="forest" href="/gallery" className="group/pill">
            {t("viewMore")}
            <span
              aria-hidden
              className="ms-2 inline-block transition-transform duration-300 group-hover/pill:translate-x-1 rtl:group-hover/pill:-translate-x-1 motion-reduce:transition-none"
            >
              →
            </span>
          </Pill>
        </div>
      </Container>
    </Section>
  );
}

/**
 * One tile: a photograph that is also a link, with its destination on hover.
 *
 * The scrim is a fixed dark green rather than a themed role. Its job is to
 * make off-white type legible over an UNKNOWN photograph; a semantic token
 * would re-point under a theme and could quietly go light, at which point the
 * caption disappears into whatever is behind it.
 */
function Tile({
  href,
  label,
  children,
  className,
  style,
}: {
  href: React.ComponentProps<typeof Link>["href"];
  label: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Link
      href={href}
      className={`group/tile relative block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent)] ${className ?? ""}`}
      style={style}
    >
      {/* The image scales rather than the tile, so neighbours do not shift. */}
      <div className="h-full transition-transform duration-700 ease-out group-hover/tile:scale-[1.06] group-focus-visible/tile:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100">
        {children}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100 motion-reduce:transition-none"
        style={{
          background:
            "linear-gradient(to top, rgb(12 26 19 / 0.78), rgb(12 26 19 / 0.15) 55%, transparent)",
        }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-center gap-2 p-4 font-mono text-[11px] uppercase tracking-eyebrow text-[color:var(--white-500)] opacity-0 transition-[opacity,transform] duration-500 group-hover/tile:translate-y-0 group-hover/tile:opacity-100 group-focus-visible/tile:translate-y-0 group-focus-visible/tile:opacity-100 motion-reduce:transition-none"
      >
        {label}
        <span className="rtl:rotate-180">→</span>
      </span>
    </Link>
  );
}
