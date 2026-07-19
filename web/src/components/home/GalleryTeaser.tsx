import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/motion/Reveal";
import { landingImages } from "@/components/landing/assets";

/**
 * A five-tile teaser, not the ten-tile mosaic the prototype ran here.
 *
 * The full masonry now belongs to /gallery, which is a whole page built for
 * exactly this. A ten-tile grid on the home page competes with the destination
 * it is supposed to send people to, and answers the question instead of raising
 * it. Five tiles and a link earn the click.
 *
 * Ratios come from Photo's closed set: one tall portrait anchoring the group,
 * four squares. Nothing here invents an aspect ratio.
 */
export async function GalleryTeaser() {
  const t = await getTranslations("landing.gallery");
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
              the first of a two-column run. */}
          <Reveal className="col-span-2 nav:col-span-2 nav:row-span-2">
            <div
              className="h-full overflow-hidden rounded-[var(--radius-card)]"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <Photo
                src={landingImages.gallery[0]}
                alt={alts[0]}
                ratio="portrait"
                className="h-full"
              />
            </div>
          </Reveal>

          {landingImages.gallery.slice(1, 5).map((src, i) => (
            <Reveal key={src} delay={0.06 * (i + 1)}>
              <div className="overflow-hidden rounded-[var(--radius-image)]">
                <Photo src={src} alt={alts[i + 1]} ratio="square" />
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex" style={{ justifyContent: "var(--align-axis)" }}>
          <Pill variant="forest" href="/gallery">
            {t("viewMore")}
          </Pill>
        </div>
      </Container>
    </Section>
  );
}
