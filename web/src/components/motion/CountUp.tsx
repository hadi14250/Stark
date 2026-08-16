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
 *
 * ===========================================================================
 * AND THE POLL WAS STILL OUT-RACING THE OBSERVER
 * ===========================================================================
 *
 * The client reported the numbers still "not showing the animation properly"
 * after all of the above, and they were right a second time. The two mechanisms
 * were asking DIFFERENT questions: the observer waits for `threshold: 0.4` —
 * forty percent of the figure on screen — while the poll fired on
 * `top < innerHeight && bottom > 0`, which is true the instant one pixel of it
 * clips the bottom edge.
 *
 * The poll therefore won almost every time, on a band that sits low in a tall
 * section. The count ran while the figure was a sliver at the bottom of the
 * screen and was finished by the time it was somewhere you would read it — so
 * the number appeared to be simply printed, which is precisely the report.
 *
 * `isCounted` asks the observer's own question, so the fail-safe now rescues a
 * dead observer instead of replacing a live one. That is the same distinction
 * the paragraph above draws for off-screen elements, applied one level in.
 */

/** Matches the IntersectionObserver's threshold. See the note above. */
const VISIBLE_RATIO = 0.4;

/**
 * Is enough of this box on screen for the observer to have fired?
 *
 * Exported and pure so the rule can be asserted directly — a fail-safe that
 * triggers earlier than the mechanism it backs up is not a fail-safe, it is a
 * replacement, and this file has now shipped that bug twice in two forms.
 */
export function isCounted(
  rect: { top: number; bottom: number; height: number },
  viewportH: number,
): boolean {
  if (rect.height <= 0) return false;
  const visible = Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0);
  return visible / rect.height >= VISIBLE_RATIO;
}

export function CountUp({
  to,
  /**
   * Seconds. Was 1.6, which the client read as too quick to register as a
   * count at all — by the time the eye lands on the figure it has stopped
   * moving. Three seconds is long enough to be seen as counting and short
   * enough not to hold up a reader who has already moved on.
   */
  duration = 3,
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
  const [counted, setCounted] = useState(0);
  const { reduce } = useMotionConfig();

  /**
   * Reduced motion is resolved DURING RENDER, not by writing state in an
   * effect.
   *
   * It used to be `useEffect(() => { if (reduce) setValue(to) })`, which is a
   * cascading render — the component paints 0, then immediately repaints the
   * final figure — and `react-hooks/set-state-in-effect` flags it. It is also
   * simply more machinery than the case needs: "no animation" is not a state
   * to reach, it is the value.
   */
  const value = reduce ? to : counted;

  useEffect(() => {
    if (reduce) return;
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
        setCounted(Math.round(to * (1 - (1 - p) ** 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && run(),
      { threshold: VISIBLE_RATIO },
    );
    io.observe(el);

    // The fail-safe, gated on actually being on screen. `isIntersecting` is
    // the observer's own judgement and we cannot ask it directly, so this
    // asks the layout the SAME question the observer was given — is at least
    // VISIBLE_RATIO of the box showing — rather than the much looser "does it
    // overlap at all". Asking the looser question is what let the poll fire
    // first and count the number off-screen; see the docblock.
    poll = window.setInterval(() => {
      if (isCounted(el.getBoundingClientRect(), window.innerHeight)) run();
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
