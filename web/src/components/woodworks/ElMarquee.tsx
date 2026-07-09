"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import type { gsap as Gsap } from "gsap";
import { useGsap } from "@/components/motion/useGsap";

type Tween = ReturnType<typeof Gsap.to>;

/**
 * Element marquee ribbon — an infinite horizontal scroll of PT-Serif watchwords
 * on the dark `surface-marquee` band, hairline top/bottom borders. Odd words are
 * upright light text; even words are accent italic. Separators are tan diamonds
 * (squares rotated 45°). Pauses on hover.
 *
 * Motion via `useGsap` (matches the landing Marquee): two duplicated word
 * sequences travel `-50%` for a seamless loop; `dir` flips travel for RTL; under
 * reduced motion the setup never runs, leaving the ribbon static and readable.
 * (The CSS `animate-el-marquee` keyframe is the reduced-motion/no-JS fallback,
 * applied only when JS/GSAP is inactive — here GSAP drives it when motion is on.)
 */
export function ElMarquee() {
  const t = useTranslations("element.marquee");
  const words = t.raw("words") as string[];
  const tweenRef = useRef<Tween | null>(null);

  const scope = useGsap<HTMLElement>(({ dir, gsap }) => {
    if (dir === -1) gsap.set(".el-marquee-track", { xPercent: -50 });
    tweenRef.current = gsap.to(".el-marquee-track", {
      xPercent: -50 * dir,
      duration: 34,
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
      className="mx-auto flex h-[90px] w-full items-center overflow-hidden border-y border-[rgba(240,244,248,0.08)] bg-[color:var(--el-surface-marquee)] nav:mt-[26px] nav:h-[150px]"
    >
      <div className="el-marquee-track flex w-max flex-none flex-nowrap items-center will-change-transform">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex flex-none items-center">
            {words.map((word, i) => (
              <span key={`${copy}-${i}`} className="flex flex-none items-center">
                <span
                  className={`whitespace-nowrap font-display uppercase tracking-[2.5px] nav:tracking-[3px] ${
                    i % 2 === 0
                      ? "text-[color:var(--el-text-body)]"
                      : "italic text-[color:var(--el-accent)]"
                  } text-[20px] nav:text-[27px]`}
                >
                  {word}
                </span>
                <span
                  aria-hidden
                  className="mx-6 inline-block h-[6px] w-[6px] rotate-45 bg-[color:var(--el-accent)] nav:mx-9 nav:h-[7px] nav:w-[7px]"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
