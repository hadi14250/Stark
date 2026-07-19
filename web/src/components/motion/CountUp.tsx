"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionConfig } from "./useMotionConfig";

/**
 * Counts from 0 to `to` when scrolled into view, once.
 *
 * Two things it does that a naive version does not:
 *
 * 1. FAIL-SAFE. If the IntersectionObserver never fires — an ancestor with
 *    `content-visibility`, a display:none parent at mount, a browser quirk —
 *    the number would sit at 0 forever, silently showing the WRONG figure
 *    rather than no figure. A 1500ms timeout snaps it to its final value.
 *    Content must never be missing because an observer misbehaved.
 * 2. LOCALE-CORRECT DIGITS. Arabic pages render Eastern Arabic numerals, so
 *    the value goes through Intl.NumberFormat rather than String().
 */
export function CountUp({
  to,
  duration = 1.6,
  locale,
  suffix,
  grouping = true,
  className,
}: {
  to: number;
  duration?: number;
  /** BCP-47 tag. Drives digit shaping — "ar" gives ٠١٢٣. */
  locale?: string;
  suffix?: string;
  /**
   * Thousands separators. Off for years — "2,019" is a quantity, "2019" is a
   * date, and the separator is what makes a founding year read as a headcount.
   */
  grouping?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const { reduce } = useMotionConfig();

  useEffect(() => {
    if (reduce) {
      setValue(to);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / (duration * 1000));
        // easeOutCubic — fast start, settles rather than stopping dead
        setValue(Math.round(to * (1 - (1 - p) ** 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && run(),
      { threshold: 0.4 },
    );
    io.observe(el);
    const failSafe = window.setTimeout(run, 1500);

    return () => {
      io.disconnect();
      window.clearTimeout(failSafe);
      cancelAnimationFrame(raf);
    };
  }, [to, duration, reduce]);

  const formatted = new Intl.NumberFormat(locale, { useGrouping: grouping }).format(value);

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}
