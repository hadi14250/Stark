"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { useMotionConfig } from "@/components/motion/useMotionConfig";

type Quote = { quote: string; author: string };

/**
 * "Kind Words" — a rotating testimonial with a large decorative quote mark, the
 * quote (PT-Serif italic) + author line (accent, uppercase), and three clickable
 * dots. Auto-advances every 4.8s (paused under reduced motion); the active dot
 * is accent, scaled 1.25. Quotes crossfade (opacity + slight translateY).
 */
export function ElTestimonials() {
  const t = useTranslations("element.testimonials");
  const quotes = t.raw("items") as Quote[];
  const { reduce } = useMotionConfig();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % quotes.length);
    }, 4800);
    return () => clearInterval(id);
  }, [reduce, quotes.length]);

  return (
    <section className="relative px-6 pb-10 pt-11 nav:mx-auto nav:h-[360px] nav:w-[1200px] nav:px-0 nav:pb-0 nav:pt-0">
      <p className="text-center text-[12px] font-semibold uppercase tracking-[3.5px] text-[color:var(--el-accent)] nav:absolute nav:inset-x-0 nav:top-0 nav:text-[13px] nav:tracking-[4px]">
        <Reveal as="span">{t("eyebrow")}</Reveal>
      </p>

      {/* Decorative opening quote mark. */}
      <div
        aria-hidden
        className="text-center font-display text-[66px] italic leading-none text-[rgba(195,160,106,0.35)] nav:absolute nav:left-1/2 nav:top-11 nav:-translate-x-1/2 nav:text-[80px]"
      >
        &#8220;
      </div>

      {/* Quote stack. */}
      <Reveal delay={0.12} className="relative mx-auto h-[290px] max-w-[860px] nav:absolute nav:left-[170px] nav:top-[104px] nav:h-[170px] nav:w-[860px]">
        {quotes.map((q, i) => (
          <div
            key={i}
            className="absolute inset-0 flex flex-col items-center transition-[opacity,transform] duration-[800ms] nav:justify-start"
            style={{
              opacity: i === active ? 1 : 0,
              transform: i === active ? "none" : "translateY(15px)",
            }}
            aria-hidden={i !== active}
          >
            <p className="text-center font-display text-[22px] italic leading-[34px] text-[color:var(--el-text-quote)] nav:text-[29px] nav:leading-[44px]">
              {q.quote}
            </p>
            <p className="mt-[22px] text-[12px] font-semibold uppercase tracking-[2px] text-[color:var(--el-accent)] nav:mt-[26px] nav:text-[13px] nav:tracking-[2.5px]">
              {q.author}
            </p>
          </div>
        ))}
      </Reveal>

      {/* Dots. */}
      <div className="mt-1 flex items-center justify-center gap-3 nav:absolute nav:inset-x-0 nav:top-[312px] nav:mt-0">
        {quotes.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`${t("dotLabel")} ${i + 1}`}
            aria-current={i === active ? "true" : undefined}
            className="h-[9px] w-[9px] rounded-full transition-[background,transform] duration-[400ms]"
            style={{
              background: i === active ? "var(--el-accent)" : "rgba(240,244,248,0.25)",
              transform: i === active ? "scale(1.25)" : "none",
            }}
          />
        ))}
      </div>
    </section>
  );
}
