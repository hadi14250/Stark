"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import type { gsap as Gsap } from "gsap";
import { useGsap } from "@/components/motion/useGsap";

type Tween = ReturnType<typeof Gsap.to>;

/**
 * Marquee ribbon — a tan full-bleed band of infinitely-scrolling Sora
 * watchwords, matching the animated handoff (index.html §Marquee). Pauses on
 * hover.
 *
 * Motion via `useGsap`: the track holds two identical word sequences and
 * travels `-50%` so the loop is seamless. `dir` from the hook flips the travel
 * direction so it scrolls in reading order (RTL scrolls the other way); under
 * reduced motion `useGsap` never runs the setup, leaving the ribbon static and
 * fully readable. Hover pause/resume is driven from React handlers via a tween
 * ref (kept out of the GSAP setup so it doesn't close over the scope ref).
 */
export function Marquee() {
  const t = useTranslations("landing.marquee");
  const words = t.raw("words") as string[];
  const sequence = words.join(" ✦ ");
  const tweenRef = useRef<Tween | null>(null);

  const scope = useGsap<HTMLElement>(({ dir, gsap }) => {
    // RTL: seed the mirrored start so travel enters from the correct edge.
    if (dir === -1) gsap.set(".marquee-track", { xPercent: -50 });
    tweenRef.current = gsap.to(".marquee-track", {
      xPercent: -50 * dir,
      duration: 30,
      ease: "none",
      repeat: -1,
    });
  });

  return (
    <section
      ref={scope}
      aria-label={t("label")}
      onMouseEnter={() => tweenRef.current?.pause()}
      onMouseLeave={() => tweenRef.current?.play()}
      className="flex h-[104px] w-full items-center overflow-hidden bg-[color:var(--color-accent)] nav:h-[130px]"
    >
      <div className="marquee-track flex flex-none flex-nowrap whitespace-nowrap will-change-transform">
        {/* Two identical copies → -50% travel loops seamlessly. */}
        {[0, 1].map((n) => (
          <span
            key={n}
            aria-hidden={n === 1}
            className="whitespace-nowrap px-8 font-display text-[clamp(1.5rem,3.5vw,2.75rem)] font-medium text-[color:var(--color-ink)]"
          >
            {sequence}
            {" ✦ "}
          </span>
        ))}
      </div>
    </section>
  );
}
