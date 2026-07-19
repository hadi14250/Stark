import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Pill } from "@/components/ui/Pill";
import { Photo } from "@/components/ui/Photo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BladeField } from "@/components/brand/geometry";
import { Reveal } from "@/components/motion/Reveal";
import { landingImages } from "@/components/landing/assets";
import { ScrollCue } from "@/components/landing/ScrollCue";

/**
 * Home hero — centred and symmetric, which is the Home end of the alignment
 * axis. Woodworks deliberately does the opposite.
 *
 * The display line is a WEIGHT PAIR, not two sizes: line 1 in Sora 300, a sand
 * rule, then line 2 in Sora 600. Two weights of one size read as one thought
 * with emphasis; two sizes read as a heading and a subheading, which is not
 * what this copy is.
 *
 * G2 ambient blades sit behind at 12%. Ambient OR structural per page, never
 * both — Home's structural field belongs to Capabilities.
 */
export async function HomeHero() {
  const t = await getTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--color-surface)" }}>
      <BladeField
        weight="ambient"
        color="var(--sand-500)"
        blades={[
          { element: "interiors", width: 380, top: "-40px", start: "-80px", float: 9 },
          { element: "woodworks", width: 440, top: "16%", end: "-90px", float: 11 },
          { element: "furniture", width: 400, bottom: "18%", start: "-100px", float: 10 },
        ]}
      />

      <Container className="relative z-[1]">
        <div
          className="flex flex-col items-center gap-7 pt-[clamp(56px,8vw,96px)] text-center"
          style={{ paddingBottom: "calc(var(--space-section) * var(--density) * 0.55)" }}
        >
          <Reveal y={16}>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
          </Reveal>

          <Reveal y={24} delay={0.08}>
            <h1 className="max-w-[15ch] font-display text-display leading-display tracking-display text-[color:var(--color-ink)]">
              <span className="block font-light">{t("line1")}</span>
            </h1>
          </Reveal>

          <Reveal y={0} delay={0.16}>
            <hr className="h-0.5 w-16 border-0" style={{ background: "var(--color-accent)" }} />
          </Reveal>

          <Reveal y={24} delay={0.2}>
            <p className="max-w-[15ch] font-display text-display font-semibold leading-display tracking-display text-[color:var(--color-ink)]">
              {t("line2")}
            </p>
          </Reveal>

          <Reveal y={20} delay={0.3}>
            <p className="max-w-[56ch] text-lead leading-lead text-[color:var(--color-ink-body)]">
              {t("sub")}
            </p>
          </Reveal>

          <Reveal y={20} delay={0.38}>
            <div className="flex flex-wrap justify-center gap-3.5">
              <Pill variant="tan" href="/#contact">
                {t("cta")}
              </Pill>
              <Pill variant="forest" href="/gallery">
                {t("ctaSecondary")}
              </Pill>
            </div>
          </Reveal>
        </div>
      </Container>

      {/* Full-bleed photo band with a slow Ken Burns, torn-paper masked at the
          seam so the band dissolves into the page rather than stopping at a
          hard edge. The mask is decorative and sits above the photo. */}
      <div className="relative">
        <Photo
          src={landingImages.hero}
          alt={t("alt")}
          height="min(62vh, 680px)"
          kenBurns
          priority
          sizes="100vw"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-[70px] bg-repeat-x"
          style={{
            backgroundImage: `url(${landingImages.tornPaper})`,
            backgroundSize: "auto 100%",
            backgroundPosition: "bottom center",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 flex translate-y-1/2 justify-center">
          <ScrollCue targetId="about" label={t("scrollCue")} />
        </div>
      </div>
    </section>
  );
}
