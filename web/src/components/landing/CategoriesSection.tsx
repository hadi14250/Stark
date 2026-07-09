"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Reveal } from "@/components/motion/Reveal";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { Link } from "@/i18n/navigation";
import { landingImages } from "./assets";

type CategoryItem = { title: string; body: string; cta: string; alt: string };

// Card destinations (kept in code, not messages — they are routes, not copy).
const HREFS = ["/woodworks", "/mattresses", "/#contact"] as const;

/**
 * Categories — design §9. Heading + 3 cream cards (Woodworks / Mattresses /
 * Turnkey) in a scroll-snap track paged by tan arrow buttons, plus a "View
 * gallery" pill. Client because of the carousel controls.
 *
 * RTL: the track is `dir`-aware, and the arrow glyphs + their scroll direction
 * flip so "previous"/"next" follow reading order.
 */
export function CategoriesSection() {
  const t = useTranslations("landing.categories");
  const { dir } = useMotionConfig();
  const items = t.raw("items") as CategoryItem[];
  const trackRef = useRef<HTMLDivElement>(null);

  function page(forward: boolean) {
    const track = trackRef.current;
    if (!track) return;
    // Advance by one card + gap (measured from the first tile so it's exact on
    // mobile's fixed-width cards and desktop's fractional widths alike). `dir`
    // (-1 in RTL) flips the sign so arrows move in the reading direction.
    const first = track.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    const step = first ? first.offsetWidth + gap : track.clientWidth * 0.34;
    track.scrollBy({ left: step * dir * (forward ? 1 : -1), behavior: "smooth" });
  }

  return (
    <section className="bg-[color:var(--color-surface)] py-[52px] nav:py-28">
      <Container>
        <Reveal className="mx-auto max-w-[62ch] text-center">
          <h2 className="font-display text-[30px] font-bold tracking-[-0.02em] text-[color:var(--color-ink)] nav:text-[clamp(2rem,4vw,2.75rem)]">
            {t("heading")}
          </h2>
          <p className="mt-3 text-[15px] leading-6 text-[color:var(--color-ink-body)] nav:mt-4 nav:text-base nav:leading-7">
            {t("sub")}
          </p>
        </Reveal>

        <div className="relative mt-[26px] nav:mt-12">
          {/* Track */}
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 nav:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, i) => (
              <div
                key={i}
                className="w-[292px] shrink-0 snap-center nav:w-[calc((100%-3rem)/3)]"
              >
                <Reveal y={24} delay={i * 0.06} className="h-full">
                  <Card image={landingImages.categories[i]} alt={item.alt} title={item.title} body={item.body}>
                    <Link
                      href={HREFS[i]}
                      className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-accent-2)] transition-colors hover:text-[color:var(--color-ink)]"
                    >
                      {item.cta} →
                    </Link>
                  </Card>
                </Reveal>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <div className="mt-[22px] flex items-center justify-center gap-4 nav:mt-8">
            <Arrow label={t("prev")} onClick={() => page(false)} pointsForward={false} />
            <Arrow label={t("next")} onClick={() => page(true)} pointsForward />
          </div>
        </div>

        <Reveal className="mt-[26px] flex justify-center nav:mt-10">
          <Pill variant="forest" href="/gallery" className="px-12">
            {t("viewMore")}
          </Pill>
        </Reveal>
      </Container>
    </section>
  );
}

/**
 * Tan rounded-square arrow. The base glyph points to the start (left in LTR);
 * the "forward" arrow mirrors it. RTL flips both via the parent `-scale-x-100`
 * on the row is avoided — instead each glyph mirrors by `pointsForward` XOR rtl
 * so semantics stay correct.
 */
function Arrow({
  label,
  onClick,
  pointsForward,
}: {
  label: string;
  onClick: () => void;
  pointsForward: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-[46px] w-[46px] place-items-center rounded-[16px] bg-[color:var(--color-accent)] text-[color:var(--green-forest)] transition-colors hover:bg-[color:var(--color-accent-2)] nav:h-[68px] nav:w-[68px] nav:rounded-[22px]"
    >
      {/* Base glyph is a start-pointing arrow; forward mirrors it. In RTL the
          whole meaning flips, handled by the extra rtl:-scale-x-100. */}
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="currentColor"
        aria-hidden
        className={`${pointsForward ? "-scale-x-100" : ""} rtl:-scale-x-100`}
      >
        <path d="M 8 9 L 8 16 L 0 8 L 8 0 L 8 7 L 16 7 L 16 9 L 8 9 Z" />
      </svg>
    </button>
  );
}
