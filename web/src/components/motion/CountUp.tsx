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
 *    rather than no figure. Content must never be missing because an observer
 *    misbehaved. See below for why this is a POLL and not a timeout.
 * 2. LOCALE-CORRECT DIGITS. Arabic pages render Eastern Arabic numerals, so
 *    the value goes through Intl.NumberFormat rather than String().
 *
 * ===========================================================================
 * THE BUG THE FAIL-SAFE USED TO CAUSE
 * ===========================================================================
 *
 * The fail-safe was `setTimeout(run, 1500)` — unconditional. It fired whether
 * or not the element had ever been near the viewport, so any stat below the
 * fold finished counting 1.5 seconds after page load and was sitting at its
 * final value long before the reader scrolled down to it.
 *
 * The effect: on a page where the stat band is several screens down, the
 * count-up was invisible to every human being who used the site. The client
 * reported it as "the numbers don't animate" and they were right — the
 * feature was built, tested, and shipped, and it had never once run where
 * anybody could see it. Nothing failed; a guard against one failure mode had
 * quietly disabled the whole feature.
 *
 * It is a poll now rather than a timeout: same protection against a dead
 * observer, but it only fires the count once the element is genuinely within
 * the viewport, and otherwise waits. The cost is one `getBoundingClientRect`
 * per element per interval, and only until that element has counted.
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
    let poll = 0;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      window.clearInterval(poll);
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

    // The fail-safe, gated on actually being on screen. `isIntersecting` is
    // the observer's own judgement and we cannot ask it directly, so this
    // asks the layout the same question: does the element's box overlap the
    // viewport vertically? If it does and the observer still has not fired,
    // the observer is broken and we count. If it does not, we wait — which is
    // the whole point, and what the old unconditional timeout got wrong.
    poll = window.setInterval(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) run();
    }, 1500);

    return () => {
      io.disconnect();
      window.clearInterval(poll);
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
