import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Pill } from "@/components/ui/Pill";
import { Reveal } from "@/components/motion/Reveal";
import { landingImages } from "./assets";
import { ScrollCue } from "./ScrollCue";

/**
 * Landing hero — design §3–6. A full-bleed furniture photo band with the serif
 * (Sora display) headline + tan rule + "Start a project" pill centered over it,
 * a torn-paper SVG masking the photo's bottom into the cream page, and a
 * scroll-cue button on the seam.
 *
 * RTL: content is centered (symmetric); the torn-paper edge is mirrored via
 * `[dir=rtl]:-scale-x-100` so the tear reads correctly in Arabic.
 */
export async function Hero() {
  const t = await getTranslations("landing.hero");

  return (
    <section className="relative bg-[color:var(--color-surface)]">
      {/* Image band + overlaid headline. */}
      <div className="relative min-h-[clamp(460px,64vh,644px)] w-full overflow-hidden">
        <Image
          src={landingImages.hero}
          alt={t("alt")}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "50% 82%" }}
        />
        {/* Legibility scrim behind the headline (top-weighted). */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[color:var(--color-surface)]/85 via-[color:var(--color-surface)]/25 to-transparent"
        />

        <Container className="relative flex min-h-[clamp(460px,64vh,644px)] flex-col items-center pt-[clamp(2.5rem,7vh,4.5rem)] text-center">
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
      <div className="relative z-10 -mt-9 flex justify-center">
        <ScrollCue targetId="about" label={t("scrollCue")} />
      </div>
    </section>
  );
}
