"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  useAnimationFrame,
  type MotionValue,
} from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { WordsReveal, LineReveal } from "@/components/motion/WordsReveal";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { LOGO_VIEWBOX } from "@/components/brand/LogoDefs";

type Step = { title: string; body: string };

/**
 * "Our Process" — a pinned, scroll-scrubbed chapter.
 *
 * The section holds the viewport for five screens' worth of scroll while the
 * mark is DRAWN and the highlight walks down a permanently-visible list of the
 * five steps. Every piece of motion is SCRUBBED to scroll position rather than
 * triggered, so it responds continuously to the wheel instead of firing once
 * and going still.
 *
 * ===========================================================================
 * THIS IS A DESIGNED REDESIGN, NOT AN ITERATION
 * ===========================================================================
 *
 * The client liked the mark animation and not the section around it, so the
 * whole chapter came back as a handoff (design_handoff_process_section:
 * README + a desktop and a mobile HTML reference). The values below — sizes,
 * opacities, windows, easings — are the designer's, and the two demos agree on
 * every one of them. Do not "tidy" a number here without checking it against
 * that handoff; several of them look arbitrary and are not.
 *
 * WHAT SURVIVED UNCHANGED, because it is the part the client asked to keep:
 * the section pins for one screen per step, the mark completes as the list
 * does, and the core lands last. `stepIndexAt` is untouched; `STEP_PARTS` now
 * groups its parts by step, because the chain is five steps and the mark is six
 * parts (see STEP_PARTS).
 *
 * WHAT CHANGED:
 *
 *   - THE MARK IS DRAWN, NOT FADED. Each part is pen-traced along its own path
 *     (stroke-dashoffset 100 -> 0) and its ink fill lands while the outline is
 *     still finishing. The previous version faded and scaled each part in,
 *     which reads as a part APPEARING; a trace reads as a part being MADE,
 *     which is the whole point of a section about manufacturing.
 *   - A BLUEPRINT UNDERLAY sits beneath it: a 5% fill ghost plus a dashed
 *     construction outline. The mark now looks like it is being drawn ONTO
 *     something, which is what stops a half-assembled logo reading as a
 *     rendering fault — the old fix for that was a solid 7% ghost, and this is
 *     the same idea done properly.
 *   - THE LIST BECAME A RAIL: a hairline track, a sand fill that grows
 *     CONTINUOUSLY with scroll, and a marker that glides between titles. The
 *     fill is the important one — it is the only element in the section that
 *     reports progress smoothly rather than in five jumps, so it is what tells
 *     you the wheel is still connected to something between steps.
 *   - TITLES INK IN behind a clip-path wipe instead of crossfading, and
 *     inactive ones are solid ink at 26% instead of hollow stroked type. See
 *     INACTIVE_INK below for why that is an improvement in Arabic and a
 *     knowing compromise in English.
 *
 * ONE TREE, NOT TWO. This used to fork into a pinned desktop version and a
 * plain stacked list for phones — which meant the mark, the whole point of the
 * section, simply did not exist on mobile. Both get the same section and the
 * layout reflows: the mark sits above the copy in one column instead of beside
 * it. The height budget above StepIndex is what makes that possible, and it is
 * the thing most likely to break here.
 */

/* ------------------------------------------------------------------ */
/* Scrub geometry                                                       */
/* ------------------------------------------------------------------ */

/**
 * Which parts of the mark each step completes. ONE GROUP PER STEP.
 *
 * FIVE STEPS, SIX PARTS, and the last step closes with two of them. The client
 * removed Value Engineering from the chain (2026-08-16) and said exactly how the
 * mark should absorb it: "the last step will form not only the last step of the
 * logo (the pentagon), it will also form and animate the 5th logo part."
 *
 * ⚠ THE SHAPE IS A LIST OF GROUPS, NOT A SEPARATE `CLOSING_PARTS` ARRAY. The old
 * four-step version had one, fired at a hard-coded scroll position beside the
 * general mapping, and it is the thing the six-step rewrite was pleased to
 * delete. A group expresses the same fact inside the one structure: a step owns
 * the parts it draws, however many that is, and `partWindow` splits its scroll
 * window between them. Add a step back and `#lg-b5` moves into a group of its
 * own — nothing else in this file changes.
 *
 * The brand book (p.8) has five blades closing around a core, and the core — the
 * moment the parts become a whole — still lands last, on Delivery & Installation,
 * which is where the thing actually becomes whole.
 */
export const STEP_PARTS = [
  ["#lg-b1"],
  ["#lg-b2"],
  ["#lg-b3"],
  ["#lg-b4"],
  ["#lg-b5", "#lg-core"],
] as const;

/**
 * Which step a scroll progress of `p` (0-1) lands on.
 *
 * Pure and exported because the clamp is the whole thing: `Math.floor(1 * 5)`
 * is 5, and a scroll that reaches the very end of the track therefore indexes
 * one past the last step. Unclamped, `steps[5]` is undefined and the copy
 * column renders blank at exactly the moment the reader finishes the section —
 * a bug that only appears at the bottom of the scrub, which is the hardest
 * place to catch by looking.
 *
 * `count`-generic on purpose, which is why four steps, then six, then five have
 * all needed no change here at all.
 */
export function stepIndexAt(p: number, count: number): number {
  return Math.min(count - 1, Math.max(0, Math.floor(p * count)));
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * The scroll window in which part `i` is drawn, as a fraction of the whole
 * track. Straight from the handoff, and the two constants are what give the
 * drawing its handwriting:
 *
 *   +0.008  a beat of lead-in, so a part does not begin the instant its step
 *           becomes current — it starts a hair after, the way a pen touches
 *           down after the hand arrives.
 *   0.88    a part FINISHES at 88% of its own step rather than at 100%, so the
 *           mark is briefly complete-so-far while you are still reading the
 *           step that completed it. At 1.0 every part would land exactly as
 *           the next step took over and none of them would ever be seen
 *           finished.
 *
 * The last part therefore completes at p = 0.98 — whole just before the
 * section releases the page, rather than exactly as it does.
 */
function windowFor(i: number, count: number) {
  return { w0: i / count + 0.008, w1: (i + 0.88) / count };
}

/**
 * The window for part `k` of the `n` parts step `i` draws.
 *
 * AT n = 1 THIS IS `windowFor` EXACTLY — stride is span/1.5 and the single part
 * runs 1.5 strides, so it spans w0 to w1 unchanged. Steps 01-04 therefore scrub
 * byte-for-byte as they did when every step owned one part, and the only step
 * whose timing is new is the one that gained a second part.
 *
 * At n = 2 the fifth blade traces over the first 60% of the last step and the
 * core starts at 40% and lands on w1. They OVERLAP BY A FIFTH on purpose: the
 * core closing strictly after the blade lifted reads as two separate events,
 * and the point of putting them on one step is that they are one gesture. The
 * mark still completes at p = 0.976 — whole just before the section releases the
 * page, which is the property `windowFor`'s 0.88 exists to protect.
 */
function partWindow(i: number, count: number, k: number, n: number) {
  const { w0, w1 } = windowFor(i, count);
  const stride = (w1 - w0) / (n + 0.5);
  return { w0: w0 + k * stride, w1: w0 + k * stride + stride * 1.5 };
}

/**
 * Ink at a given opacity, as a colour rather than an `opacity` on the element.
 *
 * It has to be the colour: `opacity` on a title would take its clip-path
 * overlay down with it, and `opacity` on the rail track would fade the marker
 * riding on top. Every value here is a percentage of the THEMED ink token, so
 * a Tier-3 theme re-points all of them at once.
 */
const ink = (pct: number) => `color-mix(in srgb, var(--color-ink) ${pct}%, transparent)`;

/**
 * INACTIVE TITLES ARE SOLID INK AT 26%, and this replaces the hollow
 * `-webkit-text-stroke` treatment that used to live here.
 *
 * The hollow version existed to say "not yet filled in" rather than
 * "disabled", which is the right idea — but it never worked in Arabic. Cursive
 * does not take a stroke: the joins and hairline entry strokes get traced
 * individually and the result reads as a rendering fault, so `outline-type.css`
 * gave Arabic low-opacity SOLID type instead. Which means the two locales have
 * been running two different treatments this whole time, and the design has now
 * standardised on the one that was already working.
 *
 * ⚠ KNOWN AND ACCEPTED: 26% ink on the off-white surface is about 1.9:1, under
 * the 3:1 WCAG floor for large text. This was put to the client's side
 * explicitly and chosen. Three things make it defensible rather than sloppy:
 * the treatment it replaces was no better (Arabic sat at 35%, the Latin stroke
 * lower still); every title is at FULL ink under reduced motion, where the
 * scrub cannot run; and the text is in the accessibility tree at full strength
 * regardless of what it is painted at. Do not raise this to "fix" the contrast
 * without saying so — 48% is where it passes, and at 48% a filled step and an
 * unfilled one stop being distinguishable, which is the entire job of an index.
 */
const INACTIVE_INK = ink(26);

/* ------------------------------------------------------------------ */
/* The section                                                          */
/* ------------------------------------------------------------------ */

export function ProcessSection() {
  const t = useTranslations("landing.process");
  const steps = t.raw("steps") as Step[];
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const { reduce } = useMotionConfig();

  // "start start" → "end end" measures the pinned run: 0 when the sticky child
  // locks, 1 when it releases. Measuring the child's own rect would be
  // self-referential, since it is displaced by the sticky positioning it is
  // trying to measure.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = stepIndexAt(p, steps.length);
    setIndex((cur) => (cur === next ? cur : next));
  });

  return (
    <section id="process" className="relative bg-[color:var(--color-surface)]">
      <div
        ref={trackRef}
        // Under reduced motion the track collapses to its content: there is no
        // scrub to perform, so holding the viewport for five screens would be
        // five screens of a section that never moves.
        //
        // `--process-step` is a token because it differs by breakpoint AND by
        // unit — 52svh on a phone, 58vh on a desktop. See tokens.css.
        style={{
          height: reduce ? "auto" : `calc(${steps.length} * var(--process-step))`,
        }}
      >
        <div
          className="sticky flex items-center overflow-hidden"
          style={{
            top: "var(--header-h)",
            height: reduce ? "auto" : "calc(100svh - var(--header-h))",
            paddingBlock: reduce ? "calc(var(--space-section) * var(--density))" : undefined,
          }}
        >
          <Container>
            <div className="grid items-center gap-[clamp(10px,2svh,20px)] nav:grid-cols-[1.04fr_0.96fr] nav:gap-[clamp(40px,5vw,90px)]">
              {/* Mark FIRST in source order so it lands on top on mobile,
                  then swaps to the end column at the breakpoint. */}
              <div className="order-1 grid content-center justify-items-center gap-[9px] nav:order-2 nav:gap-5">
                <AssemblingMark
                  progress={scrollYProgress}
                  stepCount={steps.length}
                  reduce={reduce}
                />
                <Readout index={index} count={steps.length} steps={steps} />
              </div>

              <div className="order-2 min-w-0 nav:order-1">
                <LineReveal>
                  <Eyebrow>{t("eyebrow")}</Eyebrow>
                </LineReveal>

                <WordsReveal
                  text={t("heading")}
                  as="h2"
                  justify="flex-start"
                  delay={0.08}
                  className="mt-[10px] font-display text-[clamp(28px,4.6svh,34px)] font-bold leading-[1.08] tracking-display text-[color:var(--color-ink)] nav:mt-[14px] nav:text-h2"
                />

                {/*
                  THE INTRO IS CONDITIONAL ON HEIGHT, and the thresholds are
                  NOT the ones in the handoff — they are the handoff's, plus
                  the site header.

                  The demos hide this below a 660px (mobile) / 740px (desktop)
                  WINDOW. Neither demo has a site header, so in them the stage
                  IS the window. Here the stage is `100svh - var(--header-h)`,
                  which is 104px smaller on a phone and 116px smaller on a
                  desktop. Taking 660 across verbatim ships a clipped step 06:
                  measured, 390x667 wants ~615px of content in a 563px stage.
                  So the thresholds are the demos' stage heights expressed as
                  viewport heights, then verified in a browser.

                  ⚠ STACKED VARIANTS, NOT ONE COMBINED QUERY. The obvious way
                  to write a width-and-height rule is a single arbitrary
                  variant joining a min-width and a min-height with the CSS
                  keyword for "both" — and it does not work. Tailwind does not
                  restore the spaces around that keyword inside a media feature
                  list, so the two conditions are emitted run together, which is
                  a PARSE ERROR: the whole of globals.css is rejected and every
                  page on the site renders unstyled. tsc stays clean, the tests
                  stay green, and only loading a page in a browser shows it.

                  ⚠⚠ AND DO NOT PASTE THE BROKEN STRING INTO A COMMENT TO
                  EXPLAIN IT. Tailwind scans raw file text, comments included,
                  so quoting the malformed class here regenerates it and breaks
                  the stylesheet again from inside the note warning you not to.
                  That is why this paragraph describes it in words.

                  Stacking a width variant with a height variant nests the two
                  queries instead, which is valid and needs no keyword.
                */}
                <LineReveal
                  delay={0.26}
                  className="hidden max-nav:[@media(min-height:764px)]:block nav:[@media(min-height:856px)]:block"
                >
                  <p className="mt-[10px] max-w-[40ch] text-[14px] leading-[1.6] text-[color:var(--color-ink-body)] nav:mt-[18px] nav:max-w-[44ch] nav:text-[clamp(16px,1.3vw,18px)] nav:leading-[1.7]">
                    {t("sub")}
                  </p>
                </LineReveal>

                <StepIndex steps={steps} index={index} progress={scrollYProgress} />
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The readout                                                          */
/* ------------------------------------------------------------------ */

/**
 * `02 / 05` and the current step's name, under the mark.
 *
 * ARIA-HIDDEN, DELIBERATELY. Every one of these five titles is already in the
 * list beside it, in a real `<ol>`, announced once. A live region repeating
 * whichever one is current would read the same five strings a second time, in an
 * order driven by scroll position — which is noise to a screen reader and
 * useless to anyone who cannot perceive the scrub in the first place.
 *
 * `dir="ltr"` ON THE NUMERALS AND NOWHERE ELSE. Latin digits either side of a
 * spaced slash sit in a bidi run whose direction is decided by the surrounding
 * paragraph, and in Arabic that can put `06` before `01`. Forcing the numeral
 * group alone keeps the counter reading forwards while the step name outside it
 * still follows the locale — which it must, because it is Arabic text.
 */
function Readout({
  index,
  count,
  steps,
}: {
  index: number;
  count: number;
  steps: Step[];
}) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      aria-hidden
      className="flex items-baseline justify-center gap-[0.45em] font-mono nav:grid nav:justify-items-center nav:gap-1.5"
    >
      <span
        dir="ltr"
        className="text-[10.5px] tabular-nums text-[color:var(--color-ink)] nav:text-[15px]"
      >
        {pad(index + 1)}
        {/* The separator carries the desktop spacing; mobile closes it up to
            `01/06`, which is the only difference between the two demos here. */}
        <span className="mx-0 nav:mx-[0.28em]" style={{ color: ink(40) }}>
          /
        </span>
        <span style={{ color: ink(40) }}>{pad(count)}</span>
      </span>

      {/* Mobile joins the two halves on one line and needs a separator for it;
          desktop stacks them and does not. */}
      <span className="nav:hidden" style={{ color: ink(30) }}>
        ·
      </span>

      <span
        className="text-[10.5px] uppercase tracking-readout text-[color:var(--color-ink-body)] nav:text-[11px]"
        style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
      >
        {steps[index]?.title}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The step index — all five steps, always visible                      */
/* ------------------------------------------------------------------ */

/**
 * The five steps as a permanent list, with the current one inked in.
 *
 * WHY THE WHOLE LIST IS ON SCREEN. An earlier version showed ONE step at a
 * time, sliding through a masked slot with a 210px numeral behind it and a
 * sweep of sand across the title as it landed. Every part of that was work
 * spent making a change noticeable — and it was still not noticeable, because
 * there was nothing on screen to change RELATIVE TO. If the only visible title
 * becomes a different title, the reader has no evidence they moved through a
 * sequence rather than that the page redrew. The list IS the rail.
 *
 * ===========================================================================
 * HEIGHT BUDGET — the thing that silently breaks this section
 * ===========================================================================
 *
 * This sits inside a pinned stage with `overflow: hidden`. Too much content
 * does not error and does not scroll: it cuts step 06 off the bottom, on
 * exactly the short screens nobody opens.
 *
 * ⚠ `svh` IS NOT THE DEVICE'S PIXEL HEIGHT. The arithmetic that used to live
 * here claimed "100svh - 64px header = 603px" at 390x667. Measured, the stage
 * is 563px — `svh` is the SMALL viewport height, the one you get with the
 * browser chrome showing. Every number below is measured, not derived.
 *
 * ⚠ AND IT BIT ON LAPTOPS, NOT PHONES. Going to six steps clipped 1366x768,
 * 1280x720 and 1024x640 while every phone was fine, because a wide short window
 * gets the two-column layout and the intro paragraph and sizes its type off
 * `vw` alone. That is why the title clamp below carries an `svh` term as well
 * as a `vw` one: shrink on whichever axis is actually scarce. Do not remove it.
 *
 * The redesign's own additions to the budget, and how they are paid for:
 *
 *     mark stage box   210px on mobile (was a 180px mark) ....... +30
 *     readout          two lines desktop / one mobile ........... +23
 *     rail             no height of its own, it is absolute ....... 0
 *                                                                -----
 *     paid for by      tighter row gaps + a smaller title clamp   -55
 *
 * If a step is ever added, or the intro's thresholds move, re-do this by
 * MEASURING: scratchpad `p7.mjs` walks the scrub to every step at eight
 * viewports in both locales and reports the deepest painted pixel against the
 * stage's bottom edge.
 */
function StepIndex({
  steps,
  index,
  progress,
}: {
  steps: Step[];
  index: number;
  progress: MotionValue<number>;
}) {
  const { reduce, dir } = useMotionConfig();
  const listRef = useRef<HTMLOListElement>(null);

  /**
   * The rail fill: the ONE element in the section that moves continuously.
   *
   * Everything else advances in five jumps, so between steps there is nothing to
   * confirm the wheel is still attached to anything. This is what fills that
   * gap, and it is why it is scrubbed off raw progress rather than off `index`.
   */
  const railHeight = useTransform(progress, (p) => `${clamp01(p) * 100}%`);

  /**
   * THE MARKER, CHASED PER FRAME RATHER THAN ANIMATED TO A TARGET.
   *
   * The obvious implementation is a shared `layoutId`, which is what this
   * section used to do — and it is subtly wrong here. The body accordion
   * reflows the rows over 0.55s WHILE the marker is travelling: when step 3
   * becomes current, step 2's body is still collapsing underneath it, so the
   * row the marker is heading for is moving. Framer measures its target once,
   * from the layout committed before the CSS transition has run, and lands the
   * marker where the row USED to be — then the rows settle out from under it.
   *
   * A lerp re-reads the target every frame, so it arrives with the row instead
   * of at a stale copy of it. It also carries the marker's HEIGHT, which a
   * layout animation could not follow at all: the bar has to match the title it
   * is beside, and those titles differ in height between locales and across the
   * clamp.
   *
   * 0.16 per frame is the handoff's value — roughly a quarter-second to settle,
   * fast enough to feel attached to the step change and slow enough to read as
   * travel rather than as a jump.
   */
  const markerY = useMotionValue(0);
  const markerH = useMotionValue(0);
  const primed = useRef(false);

  /**
   * `index` is a real dependency rather than a ref read during render, which
   * costs nothing here: `useAnimationFrame` re-registers whenever the callback
   * identity changes, and the callback changes five times in a section — once
   * per step — not once per frame. A ref would have been a lint error and a
   * frame of staleness in exchange for nothing.
   */
  const chase = useCallback(() => {
    if (reduce) return;
    const list = listRef.current;
    if (!list) return;
    const rows = list.querySelectorAll<HTMLLIElement>("[data-step-row]");
    const row = rows[index];
    const title = row?.querySelector("h3");
    if (!row || !title) return;

    // `offsetTop` is relative to the nearest positioned ancestor: the row for
    // the title, the list for the row. Both are `relative`, which is what makes
    // this two additions rather than a pair of getBoundingClientRect calls
    // against a stage that is itself being displaced by sticky positioning.
    const target = row.offsetTop + title.offsetTop + 2;
    const height = Math.max(18, title.offsetHeight - 4);

    if (!primed.current) {
      // First frame: snap. Lerping from 0 would slide the marker down the whole
      // rail on load, which reads as the section replaying an animation the
      // reader has not scrolled to yet.
      primed.current = true;
      markerY.set(target);
      markerH.set(height);
      return;
    }

    markerY.set(markerY.get() + (target - markerY.get()) * 0.16);
    markerH.set(markerH.get() + (height - markerH.get()) * 0.16);
  }, [reduce, index, markerY, markerH]);

  useAnimationFrame(chase);

  return (
    <ol
      ref={listRef}
      className="relative mt-[clamp(10px,2svh,20px)] flex flex-col gap-[clamp(10px,1.7svh,16px)] ps-5 nav:mt-[clamp(26px,4.5svh,44px)] nav:gap-[clamp(12px,2svh,20px)] nav:ps-[26px]"
    >
      {/* The track. Inset from the ends so it reads as a measured rule rather
          than as a border on the column. */}
      <span
        aria-hidden
        className="absolute inset-y-[3px] start-0 w-[2px] rounded-[2px] nav:inset-y-[4px] nav:start-[1px]"
        style={{ background: ink(10) }}
      />

      {/* The fill. Full under reduced motion — the section is complete, not
          stuck at step one. */}
      <motion.span
        aria-hidden
        className="absolute top-[3px] start-0 w-[2px] rounded-[2px] nav:top-[4px] nav:start-[1px]"
        style={{
          background: "var(--color-accent)",
          height: reduce ? "100%" : railHeight,
        }}
      />

      {/*
        The marker is MOTION, and under reduced motion there is nothing for it
        to point at: the scrub never advances, so `index` stays 0 forever, and a
        bar parked on step one would state something false about where the
        reader is. Withheld entirely — every title is at full ink in that mode,
        which says "all five, all readable" rather than "you are here".
      */}
      {!reduce && (
        <motion.span
          aria-hidden
          className="absolute top-0 start-[-1px] w-[4px] rounded-[3px] nav:start-0"
          style={{ background: "var(--color-ink)", y: markerY, height: markerH }}
        />
      )}

      {steps.map((step, i) => (
        <StepRow
          key={step.title}
          step={step}
          i={i}
          active={i === index}
          reduce={reduce}
          dir={dir}
        />
      ))}
    </ol>
  );
}

function StepRow({
  step,
  i,
  active,
  reduce,
  dir,
}: {
  step: Step;
  i: number;
  active: boolean;
  reduce: boolean;
  dir: 1 | -1;
}) {
  const numeral = String(i + 1).padStart(2, "0");

  /**
   * Under reduced motion every body is open.
   *
   * Not a nicety — an earlier version rendered the non-current steps at
   * `opacity: 0`, and under reduced motion the scrub never advances, so the
   * index stayed at 0 forever and most of the section's copy was
   * permanently invisible. A preference for less motion is not a request for
   * less content. With no scrub to perform this degrades to what it should
   * always have been: a plain, complete, five-item list.
   */
  const open = reduce || active;

  /**
   * THE TITLE WIPE. `clip-path` rather than opacity, and the difference is what
   * the word "ink" is doing in the design: a crossfade makes a title get
   * darker, a wipe makes it get WRITTEN, left to right, at the same moment the
   * pen is tracing a blade of the mark beside it. The two gestures rhyme, which
   * is the entire reason the section reads as one thing rather than as a list
   * next to a logo.
   *
   * The insets are logical, not decorative:
   *   -8% top/bottom  bleed for descenders and, more to the point, for Arabic
   *                   diacritic stacks, which sit outside the line box and
   *                   would otherwise be sliced flat by the clip.
   *   -4% trailing    bleed at the edge the wipe FINISHES on, so the last
   *                   glyph's overhang is not shaved as it lands.
   *
   * RTL flips which side is which — the wipe has to run start-to-end, the same
   * direction the reader is reading, or the title appears to be erased.
   */
  const closed = dir === -1 ? "inset(-8% 0 -8% 100%)" : "inset(-8% 100% -8% 0)";
  const opened = dir === -1 ? "inset(-8% 0 -8% -4%)" : "inset(-8% -4% -8% 0)";

  /*
      ⚠⚠ THESE ROWS GET NO SCROLL REVEAL, AND THEY NEVER CAN. READ THIS BEFORE
      ADDING ONE — the design asks for a staggered row entrance here and it was
      implemented, shipped, and had to be torn out again within the hour.

      `useRevealOnce` arms an element (opacity 0) while it is below the fold and
      reveals it when its TOP CROSSES 60% OF THE VIEWPORT. That contract assumes
      the element eventually travels up the screen. Inside a pinned stage it
      does not: the stage sticks at `top: var(--header-h)` and then STOPS, so
      every row is frozen at whatever height it happened to land on.

      At 1440x900 the rows settle between roughly 40% and 80% of the viewport.
      The reveal line is at 60%. So steps 01-03 crossed it and appeared, and
      steps 04, 05 and 06 sat at 67-80% for the entire 348vh of the section,
      armed and invisible, with a full-size rect and their text in the DOM. The
      document-bottom backstop does eventually fire them — two sections later,
      where nobody is looking.

      A pinned stage is a REVEAL DEAD ZONE. Anything inside one that depends on
      crossing the reading line is content you have hidden permanently. The
      eyebrow, heading and intro above are safe only because they sit at the top
      of the stage; they are not a precedent for putting a reveal down here.

      So the rows render plainly and are visible always. That is the one part of
      the design's choreography this stage cannot support, and a missing
      entrance is a fair price for five titles that are actually on screen.
  */
  return (
    <li data-step-row className="relative">
      <div className="grid grid-cols-[30px_1fr] items-baseline gap-x-1.5 nav:grid-cols-[44px_1fr]">
        {/*
          The numeral, and the one place `--sand-deep` is used.

          A plain CSS colour transition, which works here where a Framer one
          would not: CSS resolves both `var()` values to computed colours and
          interpolates those, while Framer parses the string and cannot, so a
          token-to-token tween silently snaps.
        */}
        <span
          aria-hidden
          className="font-mono text-[11px] font-light tabular-nums transition-colors duration-500 motion-reduce:transition-none nav:text-[13px]"
          style={{ color: active ? "var(--sand-deep)" : ink(38) }}
        >
          {numeral}
        </span>

        {/*
          TWO LAYERS, one carrying the real text and one `aria-hidden`.

          The hollow layer underneath is the one screen readers see; the inked
          overlay on top is decoration. If both were announced every step would
          be read out twice.

          THE ACTIVE TITLE ALSO GROWS, which the client asked for directly:
          "make the text get bigger when we're on that specific scroll
          animation". IT IS A TRANSFORM, NOT A FONT-SIZE, and that is not a
          stylistic preference — `font-size` reflows, so growing a title would
          push the list taller and the last step would be cut off by the stage's
          `overflow-hidden`. A transform paints outside the box without moving
          anything. `transform-origin` is direction-aware like every other
          transform on this site: the title grows away from the marker on the
          start edge rather than pushing back through it.
        */}
        <h3
          className="relative min-w-0 font-display text-[clamp(19px,3svh,23px)] font-bold leading-[1.18] tracking-display transition-transform duration-500 will-change-transform [--step-scale:1.05] motion-reduce:transition-none nav:text-[clamp(21px,min(2.6vw,4.6svh),36px)] nav:leading-[1.14] nav:[--step-scale:1.07]"
          style={{
            transform: active && !reduce ? "scale(var(--step-scale))" : "scale(1)",
            transformOrigin: `${dir === -1 ? "right" : "left"} center`,
            transitionTimingFunction: "var(--ease-zoom)",
          }}
        >
          <span className="block" style={{ color: INACTIVE_INK }}>
            {step.title}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 block transition-[clip-path] duration-[550ms] motion-reduce:transition-none nav:duration-[600ms]"
            style={{
              color: "var(--color-ink)",
              clipPath: open ? opened : closed,
              transitionTimingFunction: "var(--ease-line)",
            }}
          >
            {step.title}
          </span>
        </h3>
      </div>

      {/*
        THE BODY ACCORDION. `grid-template-rows: 0fr -> 1fr` with an
        overflow-hidden child is the one technique that animates a box from
        nothing to its natural height without measuring it in JS — no fixed
        max-height to guess wrong, and it is correct for whatever the Arabic
        copy wraps to.

        DELIBERATELY LEFT IN THE ACCESSIBILITY TREE when collapsed. A screen
        reader user cannot perceive a scroll scrub at all, so gating four fifths
        of the copy behind one would make the section unreadable to them;
        leaving it exposed means they get the whole process in one pass. There
        is nothing focusable inside, so no keyboard trap comes with that.
      */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-500 motion-reduce:transition-none nav:duration-[550ms]"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transitionTimingFunction: "var(--ease-standard)",
        }}
      >
        <div className="overflow-hidden">
          <p className="mt-[5px] ps-9 text-[13px] leading-[1.55] text-[color:var(--color-ink-body)] nav:mt-2 nav:max-w-[52ch] nav:ps-[50px] nav:text-[15px] nav:leading-[1.65]">
            {step.body}
          </p>
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* The mark                                                             */
/* ------------------------------------------------------------------ */

/**
 * The mark, drawn against scroll position, on a drafting underlay.
 *
 * FOUR LAYERS, and each one is answering a different failure of the version
 * before it:
 *
 *   1. soft ghost   the whole mark at 5% fill. Without it the stage is empty
 *                   before the first step and the section opens on nothing.
 *   2. dashed ghost the whole mark as a construction outline. This is the one
 *                   that fixes the real problem: a partially-drawn logo looks
 *                   BROKEN unless something on screen says the rest is coming.
 *                   A dashed underlay says exactly that, in the visual language
 *                   of a drawing that has not been inked yet — which is also
 *                   what step 01 of this process literally is.
 *   3. trace        the pen. `pathLength="100"` is set on every path in
 *                   LogoDefs precisely for this, so all six parts draw at the
 *                   same visual rate despite being wildly different lengths.
 *   4. fill         the ink, landing while the outline is still finishing.
 *
 * ⚠ THE BRAND'S LOGO DON'TS FORBID STROKING AND PARTIALLY FILLING THE MARK, and
 * that rule is not being ignored — it governs the logo presenting AS the logo,
 * which on this site means the lockup in the nav, the footer and the preloader.
 * Derived geometry is a separate layer the brand book sanctions on p.26, and
 * `LogoLoader`'s `trace` variant already strokes the same paths from the same
 * defs. What the rule actually protects against is a derived shape appearing
 * near a real lockup at similar size and colour; this one is 500px, off-white,
 * and two full screens from any lockup.
 *
 * SIZED OFF `svh` AS WELL AS `vw`. On a phone the mark shares a fixed-height
 * pinned stage with the heading, the readout and five steps, so a purely
 * width-derived size pushes the last step off the bottom of a short screen.
 * Taking the min of a viewport-width, a viewport-height and an absolute ceiling
 * means it shrinks on whichever axis is actually scarce.
 */
function AssemblingMark({
  progress,
  stepCount,
  reduce,
}: {
  progress: MotionValue<number>;
  stepCount: number;
  reduce: boolean;
}) {
  /** The ring closes as the section is read: dashoffset 100 → 0 against `p`. */
  const ringOffset = useTransform(progress, (p) => 100 - clamp01(p) * 100);

  return (
    <div className="relative grid aspect-square w-[min(50vw,24svh,210px)] place-items-center nav:w-[min(36vw,58svh,500px)]">
      {/*
        Registration ticks — the corner marks on a drawing sheet. Physical
        top/left rather than logical start/end on purpose: a frame is symmetric,
        so there is nothing here for RTL to mirror.
      */}
      {(
        [
          "top-0 left-0 border-t border-l",
          "top-0 right-0 border-t border-r",
          "bottom-0 left-0 border-b border-l",
          "bottom-0 right-0 border-b border-r",
        ] as const
      ).map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`absolute h-[9px] w-[9px] nav:h-[13px] nav:w-[13px] ${pos}`}
          style={{ borderColor: ink(30) }}
        />
      ))}

      {/* The guide track the progress ring runs on. Kept from the previous
          version at the client's evident liking of it, but slowed right down —
          see --animate-spin-slower for why it cannot stay at 26s. */}
      <span
        aria-hidden
        className="absolute inset-[3%] animate-spin-slower rounded-full border border-dashed motion-reduce:animate-none nav:inset-[3.5%]"
        style={{ borderColor: `color-mix(in srgb, var(--color-accent) 95%, transparent)` }}
      />

      {/* The progress ring. One `r` for both breakpoints: at 49.4 the thicker
          mobile stroke still lands inside the 100-unit box. */}
      <svg
        viewBox="0 0 100 100"
        aria-hidden
        focusable="false"
        className="absolute inset-[3%] overflow-visible nav:inset-[3.5%]"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="49.4"
          pathLength="100"
          transform="rotate(-90 50 50)"
          className="[stroke-width:0.7] nav:[stroke-width:0.55]"
          style={{
            fill: "none",
            stroke: "var(--color-accent)",
            strokeLinecap: "round",
            strokeDasharray: 100,
            strokeDashoffset: reduce ? 0 : ringOffset,
          }}
        />
      </svg>

      <svg
        viewBox={LOGO_VIEWBOX}
        className="relative w-[64%] overflow-visible nav:w-[62%]"
        aria-hidden
        focusable="false"
      >
        <use href="#lg-all" style={{ fill: "var(--color-ink)", opacity: 0.05 }} />
        <use
          href="#lg-all"
          className="[stroke-width:0.9] nav:[stroke-width:0.8]"
          style={{
            fill: "none",
            stroke: "var(--color-ink)",
            opacity: 0.3,
            // In pathLength units, so the dash rhythm is identical on every
            // part regardless of how long that part's outline really is.
            strokeDasharray: "1.4 2",
          }}
        />
        {STEP_PARTS.map((group, i) =>
          group.map((href, k) => (
            <MarkPart
              key={href}
              href={href}
              progress={progress}
              window={partWindow(i, stepCount, k, group.length)}
              reduce={reduce}
            />
          )),
        )}
      </svg>
    </div>
  );
}

function MarkPart({
  href,
  progress,
  window: { w0, w1 },
  reduce,
}: {
  href: string;
  progress: MotionValue<number>;
  /** Resolved by `partWindow` — this part's own slice of the scrub. */
  window: { w0: number; w1: number };
  reduce: boolean;
}) {
  // The outline LEADS and the ink follows into it: the trace completes at 62%
  // of the part's window, the fill starts at 52% and finishes with it. They
  // overlap by ten points on purpose — the ink arriving strictly after the pen
  // lifted reads as two separate events, and the whole gesture is meant to read
  // as one.
  const dashoffset = useTransform(progress, (p) => {
    const u = clamp01((p - w0) / (w1 - w0));
    return 100 - Math.min(1, u / 0.62) * 100;
  });
  const opacity = useTransform(progress, (p) => {
    const u = clamp01((p - w0) / (w1 - w0));
    return clamp01((u - 0.52) / 0.48);
  });

  return (
    <>
      <motion.use
        href={href}
        className="[stroke-width:1.8] nav:[stroke-width:1.5]"
        style={{
          fill: "none",
          stroke: "var(--color-ink)",
          strokeLinecap: "round",
          strokeDasharray: 100,
          // Reduced motion gets the finished mark, drawn and inked. There is no
          // scrub to run, and a permanently half-drawn logo is the exact
          // "rendering fault" reading the underlay exists to prevent.
          strokeDashoffset: reduce ? 0 : dashoffset,
        }}
      />
      <motion.use
        href={href}
        style={{ fill: "var(--color-ink)", opacity: reduce ? 1 : opacity }}
      />
    </>
  );
}
