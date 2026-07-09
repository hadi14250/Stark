"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { animate, useInView } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { useMotionConfig } from "@/components/motion/useMotionConfig";

type StatLabel = { label: string };

/**
 * The four craft stats, in the design's order and exact figures. Last one is
 * rendered in accent.
 *
 * ⚠ These are the handoff template's numbers. Confirm against real Stark figures
 * before public launch — one-line swap per stat.
 * TODO(F-facts): replace value/suffix with the client-confirmed figure.
 */
const STATS: Array<{ value: number; suffix: string; accent?: boolean }> = [
  { value: 10, suffix: "" }, // Years of Craft
  { value: 40, suffix: "+" }, // Wood Species
  { value: 12000, suffix: "+" }, // Pieces Crafted
  { value: 100, suffix: "%", accent: true }, // Sustainably Sourced
];

/**
 * "Craft in Numbers" — eyebrow + a dark panel with four count-up stats. Desktop:
 * 4-across with vertical hairline dividers. Mobile: 2×2 grid with cell
 * hairlines. Numbers count up once on scroll-in (1.7s, easeOutCubic), thousands
 * grouped via `toLocaleString`; under reduced motion the final value renders
 * instantly.
 */
export function ElStats() {
  const t = useTranslations("element.stats");
  const labels = t.raw("items") as StatLabel[];

  return (
    <section className="px-6 pt-[50px] nav:mx-auto nav:mt-16 nav:h-[290px] nav:w-[1200px] nav:px-0 nav:pt-0">
      <p className="mb-5 text-center text-[12px] font-semibold uppercase tracking-[3.5px] text-[color:var(--el-accent)] nav:mb-0 nav:text-[13px] nav:tracking-[4px]">
        <Reveal as="span" y={24}>{t("eyebrow")}</Reveal>
      </p>

      <Reveal
        y={34}
        delay={0.08}
        className="mt-0 grid grid-cols-2 overflow-hidden rounded-[4px] bg-[color:var(--el-surface-panel)] px-5 py-3 shadow-[0_24px_50px_rgba(0,0,0,0.32)] nav:mx-10 nav:mt-[52px] nav:flex nav:h-[200px] nav:items-center nav:rounded-[3px] nav:px-0 nav:py-0 nav:shadow-[0_30px_70px_rgba(0,0,0,0.32)]"
      >
        {STATS.map((stat, i) => (
          <div
            key={i}
            className={`px-1.5 py-6 text-center nav:flex-1 nav:py-0 ${cellBorders(i)}`}
          >
            <Stat value={stat.value} suffix={stat.suffix} accent={stat.accent} small={stat.value >= 1000} />
            <div className="mt-2.5 text-[11px] uppercase tracking-[1.5px] text-[color:var(--el-text-muted)] nav:mt-3.5 nav:text-[13px] nav:tracking-[2px]">
              {labels[i]?.label}
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/** Mobile 2×2 cell hairlines (top row bottom-border; left col right-border). */
function cellBorders(i: number): string {
  const cls: string[] = [];
  if (i < 2) cls.push("border-b border-[rgba(240,244,248,0.1)]");
  if (i % 2 === 0) cls.push("border-r border-[rgba(240,244,248,0.1)]");
  // Desktop: hairline divider before every cell except the first.
  if (i > 0) cls.push("nav:border-l nav:border-[rgba(240,244,248,0.12)]");
  // Reset mobile borders at desktop so only the vertical divider shows.
  cls.push("nav:border-b-0 nav:border-r-0");
  return cls.join(" ");
}

/** A single count-up number. Counts 0 → value on scroll-in; instant if reduced.
 *  `small` renders the mobile size at 38 instead of 44 (the 12,000+ cell). */
function Stat({
  value,
  suffix,
  accent,
  small,
}: {
  value: number;
  suffix: string;
  accent?: boolean;
  small?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const { reduce } = useMotionConfig();
  const [frame, setFrame] = useState<number | null>(null);

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(0, value, {
      duration: 1.7,
      ease: [0.33, 1, 0.68, 1], // easeOutCubic
      onUpdate: (v) => setFrame(Math.round(v)),
    });
    return () => controls.stop();
  }, [reduce, inView, value]);

  const shown = frame === null ? value : frame;
  const text = `${shown.toLocaleString("en-US")}${suffix}`;

  return (
    <div
      ref={ref}
      className={`font-display font-bold leading-none nav:text-[60px] ${
        small ? "text-[38px]" : "text-[44px]"
      } ${accent ? "text-[color:var(--el-accent)]" : "text-[color:var(--el-text-strong)]"}`}
    >
      {text}
    </div>
  );
}
