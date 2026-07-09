"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { animate, useInView } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { ease } from "@/styles/tokens";

type StatLabel = { label: string };

/**
 * The four stats, in the design's order. `value`/`suffix` are the count-up
 * targets.
 *
 * ⚠ PLACEHOLDER FIGURES — NOT CLIENT-CONFIRMED. These are plausible stand-ins
 * (the template's numbers) so the band reads as complete; Stark's real figures
 * (years, pieces, on-time %, artisan count) are still pending F-facts sign-off
 * and MUST be corrected before real launch. Set a `value` to null to fall back
 * to a "—" dash placeholder for any stat we can't stand behind.
 *
 * TODO(F-facts): replace each { value, suffix } with the confirmed figure.
 */
const STATS: Array<{ value: number | null; suffix: string }> = [
  { value: 25, suffix: "+" }, // Years of Craft — PLACEHOLDER
  { value: 12, suffix: "k+" }, // Pieces Delivered — PLACEHOLDER
  { value: 98, suffix: "%" }, // On-time Delivery — PLACEHOLDER
  { value: 40, suffix: "+" }, // Skilled Artisans — PLACEHOLDER
];

/**
 * "By the Numbers" — a deep-green full-bleed band with a pulsing tan glow and
 * four count-up stats. Matches the animated handoff (index.html §By the Numbers)
 * in shape/motion; figures are placeholder dashes until facts are confirmed.
 */
export function StatsBand() {
  const t = useTranslations("landing.stats");
  const labels = t.raw("items") as StatLabel[];

  return (
    <section className="relative overflow-hidden bg-[color:var(--green-deep-2)] py-[64px] nav:py-[104px]">
      {/* Pulsing radial tan glow behind the numbers. Decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 animate-glow-pulse bg-[radial-gradient(circle,rgba(194,168,120,0.30),rgba(194,168,120,0)_62%)] motion-reduce:animate-none"
      />

      <Container className="relative">
        <Reveal y={24} as="div" className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[color:var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h2 className="mx-auto mt-3 max-w-[18ch] font-display text-[clamp(1.75rem,4vw,2.5rem)] font-light leading-[1.2] text-[color:var(--ink-green-strong)]">
            {t("heading")}
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 nav:mt-14 nav:grid-cols-4 nav:gap-8">
          {STATS.map((stat, i) => (
            <Reveal key={i} y={34} delay={i * 0.12} className="text-center">
              <Stat value={stat.value} suffix={stat.suffix} />
              <p className="mt-3.5 text-sm tracking-[0.02em] text-[color:var(--ink-green-body)]">
                {labels[i]?.label}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/**
 * A single count-up number. When `value` is null (current state) it renders a
 * static "—" placeholder. When a real number is supplied, it counts 0 → value
 * once it scrolls into view (cubic ease-out, ~1.8s), or renders the final value
 * instantly under reduced motion.
 */
function Stat({ value, suffix }: { value: number | null; suffix: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const { reduce } = useMotionConfig();
  // `frame` holds the in-flight count-up value; while null we show the resting
  // display (a "—" placeholder, or the final figure when animation is off).
  const [frame, setFrame] = useState<number | null>(null);
  const willAnimate = value !== null && !reduce;

  useEffect(() => {
    if (!willAnimate || !inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [...ease.wood],
      onUpdate: (v) => setFrame(Math.round(v)),
    });
    return () => controls.stop();
  }, [willAnimate, inView, value]);

  const resting = value === null ? "—" : `${value}${suffix}`;
  const display = frame === null ? resting : `${frame}${suffix}`;

  return (
    <div
      ref={ref}
      className="font-display text-[clamp(3rem,7vw,4.125rem)] font-light leading-none text-[color:var(--ink-green-strong)]"
    >
      {display}
    </div>
  );
}
