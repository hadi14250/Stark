"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { ease, duration } from "@/styles/tokens";

type Step = { title: string; body: string };

/**
 * "Our Process" — a four-step timeline (Design → Source → Craft → Deliver) on
 * cream, matching the animated handoff (index.html §Our Process): a horizontal
 * connector line that draws itself (scaleX 0→1), four staggered steps each with
 * a forest number circle, plus a slow-spinning dashed ring + floating dot as
 * ambient accents.
 *
 * RTL: steps mirror via flex order; the connector line's draw origin flips with
 * `dir` so it always draws from the reading-start edge.
 */
export function ProcessSection() {
  const t = useTranslations("landing.process");
  const steps = t.raw("steps") as Step[];
  const { dir, reduce } = useMotionConfig();

  return (
    <section className="relative overflow-hidden bg-[color:var(--color-surface)] py-[56px] nav:py-28">
      {/* Ambient accents — decorative, hidden from AT. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[6vw] top-10 hidden h-[120px] w-[120px] animate-spin-slow rounded-full border-2 border-dashed border-[color:var(--color-accent)]/55 motion-reduce:animate-none nav:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[8vw] top-[38%] hidden h-[70px] w-[70px] animate-floaty rounded-full bg-[color:var(--color-accent)]/35 motion-reduce:animate-none nav:block"
      />

      <Container className="relative">
        <Reveal y={40} className="mx-auto max-w-[62ch] text-center">
          <h2 className="font-display text-[30px] font-bold tracking-[-0.02em] text-[color:var(--color-ink)] nav:text-[clamp(2rem,4vw,2.75rem)]">
            {t("heading")}
          </h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-[15px] leading-[26px] text-[color:var(--color-ink-body)] nav:mt-4 nav:text-base nav:leading-[30px]">
            {t("sub")}
          </p>
        </Reveal>

        <div className="relative mt-12 nav:mt-16">
          {/* Self-drawing connector line — behind the circles, desktop only. */}
          <motion.div
            aria-hidden
            className="absolute left-[12.5%] right-[12.5%] top-[42px] hidden h-0.5 bg-[color:var(--color-line)] nav:block"
            style={{ transformOrigin: dir === -1 ? "right" : "left" }}
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={reduce ? undefined : { scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: duration.wipe + 0.25, ease: [...ease.line], delay: 0.2 }}
          />

          <div className="flex flex-col gap-10 nav:flex-row nav:gap-0">
            {steps.map((step, i) => (
              <Reveal
                key={i}
                y={40}
                delay={i * 0.14}
                className="flex flex-1 flex-col items-center px-2 text-center nav:px-6"
              >
                <div className="grid h-[84px] w-[84px] place-items-center rounded-full bg-[color:var(--color-hero-bg)] shadow-[0_14px_30px_-12px_rgba(28,60,45,0.6)]">
                  <span className="font-display text-[30px] font-light leading-none text-[color:var(--ink-green-strong)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-[color:var(--color-ink)]">
                  {step.title}
                </h3>
                <p className="mt-2.5 max-w-[28ch] text-sm leading-[22px] text-[color:var(--color-ink-body)]">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
