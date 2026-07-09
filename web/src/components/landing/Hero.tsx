import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Pill } from "@/components/ui/Pill";
import { Reveal } from "@/components/motion/Reveal";
import { landingImages } from "./assets";
import { ScrollCue } from "./ScrollCue";

/**
 * Landing hero. Responsive per the two design handoffs:
 * - Mobile (<nav): a cream block with the serif (Sora) headline + tan rule +
 *   "Start a project" pill ABOVE a full-bleed photo band (h330) whose bottom is
 *   masked by the torn-paper SVG, with the scroll-cue straddling the seam.
 * - Desktop (≥nav): the headline overlays the taller photo (with a legibility
 *   scrim), matching the desktop handoff.
 *
 * RTL: content is centered (symmetric); the torn-paper edge mirrors via
 * `rtl:-scale-x-100`.
 */
export async function Hero() {
  const t = await getTranslations("landing.hero");

  return (
    <section className="relative bg-[color:var(--color-surface)]">
      {/* Mobile cream header block (hidden on desktop). */}
      <Container className="flex flex-col items-center gap-6 px-6 pt-10 pb-8 text-center nav:hidden">
        <Reveal y={20}>
          <h1 className="max-w-[18ch] font-display text-[33px] font-light leading-[1.18] tracking-[-0.02em] text-[color:var(--color-ink)]">
            {t("line1")}
            <span className="mx-auto my-3 block h-px w-14 bg-[color:var(--color-accent)]" />
            <span className="font-semibold">{t("line2")}</span>
          </h1>
        </Reveal>
        <Reveal y={16} delay={0.1}>
          <Pill variant="forest" href="/#contact">
            {t("cta")}
          </Pill>
        </Reveal>
      </Container>

      {/* Photo band: h330 on mobile, tall overlay band on desktop. */}
      <div className="relative h-[330px] w-full overflow-hidden nav:min-h-[clamp(460px,64vh,644px)]">
        <Image
          src={landingImages.hero}
          alt={t("alt")}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "50% 72%" }}
        />

        {/* Desktop-only legibility scrim + overlaid headline. */}
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-b from-[color:var(--color-surface)]/85 via-[color:var(--color-surface)]/25 to-transparent nav:block"
        />
        <Container className="relative hidden min-h-[clamp(460px,64vh,644px)] flex-col items-center pt-[clamp(2.5rem,7vh,4.5rem)] text-center nav:flex">
          <Reveal y={20}>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[color:var(--color-accent-2)]">
              {t("eyebrow")}
            </p>
          </Reveal>
          <Reveal y={28} delay={0.08}>
            <h1 className="mt-5 max-w-[18ch] font-display text-[clamp(2rem,5vw,3.25rem)] font-light leading-[1.08] tracking-[-0.02em] text-[color:var(--color-ink)]">
              {t("line1")}
              <span className="mx-auto my-4 block h-px w-16 bg-[color:var(--color-accent)]" />
              <span className="font-semibold">{t("line2")}</span>
            </h1>
          </Reveal>
          <Reveal y={20} delay={0.16}>
            <p className="mt-6 max-w-[52ch] text-sm leading-6 text-[color:var(--color-ink-body)]">
              {t("sub")}
            </p>
          </Reveal>
          <Reveal y={16} delay={0.24}>
            <Pill variant="forest" href="/#contact" className="mt-8">
              {t("cta")}
            </Pill>
          </Reveal>
        </Container>

        {/* Torn-paper divider — pinned to the band bottom, masks photo → cream.
            A decorative full-bleed SVG (not a photo); next/image would fight the
            stretch-to-width, so a plain <img> is correct here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={landingImages.tornPaper}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full select-none rtl:-scale-x-100"
        />
      </div>

      {/* Scroll cue straddling the seam. */}
      <div className="relative z-10 -mt-7 flex justify-center nav:-mt-9">
        <ScrollCue targetId="about" label={t("scrollCue")} />
      </div>
    </section>
  );
}
