"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { WordsReveal, LineReveal } from "@/components/motion/WordsReveal";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { LOGO_VIEWBOX } from "@/components/brand/LogoDefs";
import { ease } from "@/styles/tokens";

type Step = { title: string; body: string };

/**
 * "Our Process" — a pinned, scroll-scrubbed chapter.
 *
 * The section holds the viewport for six screens' worth of scroll while the
 * mark assembles and the highlight walks down a permanently-visible list of the
 * six steps. Every
 * piece of motion is SCRUBBED to scroll position rather than triggered, so it
 * responds continuously to the wheel instead of firing once and going still.
 *
 * Two earlier versions are worth knowing about, because both failure modes are
 * easy to walk back into. The first was four numbered circles joined by a
 * hairline with a dashed ring parked in the margin — what a slide template
 * gives you when nobody has made a decision. The second showed one step at a
 * time in a masked slot, with a 210px numeral behind it and a sweep of sand
 * across the title as it landed; that was three devices competing to announce a
 * change that still read as nothing, because a lone title becoming a different
 * title is not evidence of having moved through a sequence. See the note above
 * StepIndex for what replaced it.
 *
 * THE MARK IS THE PROGRESS INDICATOR. The brand book (p.8) has the five blades
 * as parts of one ecosystem closing around a core, so the mark assembles as
 * the process advances: one blade per step, and the core landing last, on
 * Delivery & Installation, when the thing is whole. Brand geometry doing
 * structural work rather than applied as a sticker.
 *
 * ONE TREE, NOT TWO. This used to fork into a pinned desktop version and a
 * plain stacked list for phones — which meant the mark, the whole point of the
 * section, simply did not exist on mobile. Now both get the same section and
 * the layout reflows: the mark sits above the copy in one column instead of
 * beside it. The only thing mobile drops is the intro paragraph, because a
 * pinned stage has a fixed height budget and the steps have to fit inside it;
 * the mark sizes itself off `svh` as well as `vw` so it shrinks on short
 * screens rather than pushing the last step off the bottom. The arithmetic for
 * that budget is written out above StepIndex — redo it if a step is added.
 */

/**
 * How much scroll each step gets while the section is pinned.
 *
 * ⚠ LOWERED FROM 72 WHEN THE PROCESS WENT FROM FOUR STEPS TO SIX. This is a
 * per-step figure, so it multiplies: six steps at 72vh is 432vh of pinned
 * track, against 288vh before. An extra screen and a half of a section that
 * will not let go of the viewport reads as the page having stopped responding.
 * 52 keeps the whole run at 312vh, close to what the four-step version asked
 * of a reader, and each step still gets half a screen of scroll to itself.
 */
const STEP_VH = 52;

/**
 * Which part of the mark each step completes.
 *
 * SIX STEPS, SIX PARTS, ONE-TO-ONE. This is what the new process chain bought.
 * The four-step version needed a separate `CLOSING_PARTS` pair, because four
 * steps could not consume six parts: `#lg-b5` and `#lg-core` had to land
 * together at 0.94, two parts arriving on one step because the arithmetic
 * demanded it rather than because anything happened there.
 *
 * The client's own chain has exactly six stages, and the brand book (p.8) has
 * exactly five blades closing around a core. So every step now completes
 * precisely one part, and the core, the moment the parts become a whole, lands
 * on Delivery & Installation, which is where the thing actually becomes whole.
 * The sequence got MORE correct by growing, not less.
 */
export const STEP_PARTS = [
  "#lg-b1",
  "#lg-b2",
  "#lg-b3",
  "#lg-b4",
  "#lg-b5",
  "#lg-core",
] as const;

/**
 * Which step a scroll progress of `p` (0-1) lands on.
 *
 * Pure and exported because the clamp is the whole thing: `Math.floor(1 * 6)`
 * is 6, and a scroll that reaches the very end of the track therefore indexes
 * one past the last step. Unclamped, `steps[6]` is undefined and the copy
 * column renders blank at exactly the moment the reader finishes the section —
 * a bug that only appears at the bottom of the scrub, which is the hardest
 * place to catch by looking.
 *
 * `count`-generic on purpose, which is why going from four steps to six needed
 * no change here at all.
 */
export function stepIndexAt(p: number, count: number): number {
  return Math.min(count - 1, Math.max(0, Math.floor(p * count)));
}

/**
 * WHAT REPLACED THE SWAPPING COPY COLUMN, and why.
 *
 * The previous version showed ONE step at a time. Four steps occupied a single
 * grid cell and slid through it in masked slots, with a 210px numeral behind
 * them and a band of sand sweeping across the title as each one landed. Every
 * part of that was work spent making a change noticeable — and it was still not
 * noticeable, because there was nothing on screen to change RELATIVE TO. If the
 * only visible title becomes a different title, the reader has no evidence that
 * they moved through a sequence rather than that the page redrew.
 *
 * All six titles are now permanently on screen and the highlight moves down
 * them. The transition needs no emphasis machinery at all, because you can see
 * where it started and where it ended: the marker slides from Design to
 * Engineering while both are in front of you. Three competing devices (giant numeral, sweep,
 * separate rail) are gone; the list IS the rail.
 *
 * SO SAND DOES EXACTLY TWO THINGS HERE — the moving marker, and the active
 * numeral. That is the whole colour budget for the section. Titles live in the
 * ink ramp, bodies in ink-body. Nothing floods, nothing sweeps.
 *
 * INACTIVE TITLES ARE HOLLOW rather than dimmed. Six greyed-out titles read as
 * disabled; six outlined ones read as "not yet filled in", which is what a
 * process index means. See outline-type.css for the Arabic handling — cursive
 * does not take a stroke, so that locale gets low-opacity solid type instead.
 */

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
        // scrub to perform, so holding the viewport for 312vh would be six
        // screens of a section that never moves.
        style={{ height: reduce ? "auto" : `calc(${steps.length} * ${STEP_VH}vh)` }}
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
            <div className="grid items-center gap-[clamp(16px,4vw,96px)] nav:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
              {/* Mark FIRST in source order so it lands on top on mobile,
                  then swaps to the end column at the breakpoint. */}
              <div className="relative order-1 grid place-items-center nav:order-2">
                <div
                  aria-hidden
                  className="absolute aspect-square w-[min(58vw,25svh,230px)] animate-spin-slow rounded-full border border-dashed motion-reduce:animate-none nav:w-[86%]"
                  style={{ borderColor: "color-mix(in srgb, var(--color-accent) 70%, transparent)" }}
                />
                <AssemblingMark progress={scrollYProgress} stepCount={steps.length} />
              </div>

              <div className="order-2 min-w-0 nav:order-1">
                <div className="flex flex-col items-start gap-2 text-start nav:gap-3">
                  <LineReveal>
                    <Eyebrow>{t("eyebrow")}</Eyebrow>
                  </LineReveal>
                  <WordsReveal
                    text={t("heading")}
                    as="h2"
                    justify="flex-start"
                    delay={0.08}
                    className="font-display text-h2 font-bold leading-h2 tracking-display text-[color:var(--color-ink)]"
                  />
                  {/*
                    Desktop only, AND tall-enough-desktop only. The pinned stage
                    has a fixed height budget and the steps come first.

                    The width half of that rule was always here. The HEIGHT half
                    is new with the sixth step: a 1024x640 or 1280x720 window is
                    "desktop" by width and gets the intro, the two-column layout
                    and full-size titles, on a stage shorter than a phone's. That
                    is the combination that cut the last step off. Dropping three
                    lines of intro on a short window is the same trade already
                    made on mobile, for the same reason.

                    ⚠ STACKED VARIANTS, NOT ONE COMBINED QUERY. The obvious way
                    to write this is a single arbitrary variant joining a
                    min-width and a min-height with the CSS keyword for "both"
                    — and it does not work. Tailwind does not restore the spaces
                    around that keyword inside a media feature list, so the two
                    conditions are emitted run together, which is a PARSE ERROR:
                    the whole of globals.css is rejected and every page on the
                    site renders unstyled. tsc stays clean, the tests stay
                    green, and only loading a page in a browser shows it.

                    ⚠⚠ AND DO NOT PASTE THE BROKEN STRING INTO A COMMENT TO
                    EXPLAIN IT. Tailwind scans raw file text, comments included,
                    so quoting the malformed class here regenerates it and
                    breaks the stylesheet again from inside the note warning you
                    not to. That is why this paragraph describes it in words.

                    Stacking `nav:` with a height variant nests the two queries
                    instead, which is valid and needs no keyword. Ordering is
                    not a concern: it is one class, not two competing ones.
                  */}
                  <LineReveal
                    delay={0.26}
                    className="hidden max-w-[46ch] nav:[@media(min-height:800px)]:block"
                  >
                    <p className="text-lead leading-lead text-[color:var(--color-ink-body)]">
                      {t("sub")}
                    </p>
                  </LineReveal>
                </div>

                <StepIndex steps={steps} index={index} />
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
/* ------------------------------------------------------------------ */
/* The step index — all six steps, always visible                       */
/* ------------------------------------------------------------------ */

/**
 * How long the highlight takes to move. Slow enough to follow with the eye,
 * short enough that a fast scroll does not queue up a backlog of transitions.
 */
const SWAP_S = 0.45;

/**
 * The six steps as a permanent list, with the current one filled in.
 *
 * HEIGHT BUDGET — this sits inside a pinned stage, so it cannot grow past the
 * viewport or the bottom of the list is simply cut off by the stage's
 * `overflow-hidden`, silently, on exactly the short screens nobody tests on.
 *
 * ⚠ THE STAGE IS SMALLER THAN THE OLD ARITHMETIC HERE CLAIMED. It said
 * "100svh - 64px header = 603px" at 390x667. Measured, it is 563px: `svh` is
 * the SMALL viewport height, the one you get with the browser's chrome
 * showing, and it is not the device's CSS pixel height. The four-step version
 * was living inside 40px less than its own comment assumed. It fit anyway,
 * which is precisely why nobody noticed.
 *
 * Measured at 390x667 EN, stage 563px:
 *
 *                        4 steps   6 steps
 *     titles              ~116      ~132    26px floor -> 20px floor
 *     row gaps              24        30    3 x 8px -> 5 x 6px
 *     one open body       ~110       ~95    bodies shortened to suit
 *                        -----     -----
 *     list height          250      ~257
 *     headroom below        42       ~35
 *
 * Two extra steps cost roughly 74px at the OLD type size and gap, against 42px
 * of headroom. They do not fit by simply being added, and the three changes
 * that pay for them have to be made TOGETHER:
 *
 *   1. title floor 26px -> 20px  (the largest single saving, and the only one
 *      that also stops "Delivery & Installation" wrapping to two lines at 390)
 *   2. row gap floor 8px -> 6px
 *   3. shorter bodies in the copy deck
 *
 * None of this touches the desktop end of either clamp: at 1440 the titles are
 * still 46px and the gap ~16px, because there the stage is 784px and the
 * budget was never tight.
 *
 * The intro paragraph is desktop-only for this reason and no other. If a title
 * is ever added, re-do this arithmetic — do not assume it still fits. And
 * MEASURE it rather than trusting the table above: scratchpad `p5.mjs` walks
 * the scrub to every step at four viewports in both locales and reports the
 * deepest painted pixel against the stage's bottom edge.
 */
function StepIndex({ steps, index }: { steps: Step[]; index: number }) {
  const { reduce, dir } = useMotionConfig();

  // Spacing is trimmed at the DESKTOP end as well as the mobile one, and
  // deliberately before the type is: 44px of margin plus five 16px gaps is
  // 123px of pure air, and giving some of it back costs a reader nothing,
  // where shrinking six titles is immediately visible.
  return (
    <ol className="mt-[clamp(18px,3vw,32px)] flex flex-col gap-[clamp(6px,0.9vw,14px)]">
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
   * Not a nicety — the previous version rendered the three non-current steps at
   * `opacity: 0`, and under reduced motion the scrub never advances, so the
   * index stayed at 0 forever and five sixths of the section's copy was
   * permanently invisible. A preference for less motion is not a request for
   * less content. With no scrub to perform, this degrades to what it should
   * always have been: a plain, complete, six-item list.
   */
  const open = reduce || active;

  /**
   * ⚠ EVERY TERM IN THIS CLAMP IS LOAD-BEARING. See the height budget above
   * StepIndex.
   *
   * `20px` floor — at the old 26px floor, six titles do not fit the pinned
   * stage on a short phone, and "Delivery & Installation" wraps to two lines
   * at 390, costing another title's worth of height on top.
   *
   * `5.2svh` — the term that is easy to leave out and expensive to omit. Going
   * to six steps clipped the last step on LAPTOPS, not phones: 1366x768,
   * 1280x720 and 1024x640 all cut the bottom of the list, because desktop also
   * renders the intro paragraph and sizes these titles off `vw` alone. A wide,
   * short window has plenty of the axis the type was measured against and none
   * of the axis it actually needs. This is the same fix the mark already uses
   * (`min(vw, svh, px)`) applied to the type: shrink on whichever axis is
   * scarce. It does not bite at all on a tall screen.
   */
  const titleClass =
    "font-display text-[clamp(20px,min(3.2vw,4.6svh),46px)] font-bold leading-[1.1] tracking-display";

  return (
    <li>
      <div className="relative flex items-baseline gap-3 ps-[clamp(14px,1.6vw,24px)] nav:gap-4">
        {/*
          THE MARKER. One element with a shared `layoutId`, so Framer moves the
          SAME bar from the previous row to this one rather than fading one out
          and another in. That movement is the entire transition: it is what
          proves you advanced through a list instead of the page redrawing.
          Vertical, on the start edge, so it reads down the column.
        */}
        {active && !reduce && (
          <motion.span
            aria-hidden
            layoutId="process-step-marker"
            className="absolute inset-y-[0.08em] start-0 w-[3px] rounded-full"
            style={{ background: "var(--color-accent)" }}
            transition={{ duration: SWAP_S, ease: [...ease.zoom] }}
          />
        )}
        {/* Reduced motion still needs to show WHICH step, it just cannot slide
            there. Same bar, drawn in place on the active row. */}
        {active && reduce && (
          <span
            aria-hidden
            className="absolute inset-y-[0.08em] start-0 w-[3px] rounded-full"
            style={{ background: "var(--color-accent)" }}
          />
        )}

        {/*
          Sand's second and last job. A plain CSS colour transition, which works
          here where a Framer one would not: CSS resolves both `var()` values to
          computed colours and interpolates those, while Framer parses the
          string and cannot, so a token-to-token tween silently snaps.
        */}
        <span
          aria-hidden
          className="font-mono text-[clamp(12px,1.1vw,15px)] font-light tabular-nums transition-colors duration-500 motion-reduce:transition-none"
          style={{ color: active ? "var(--color-accent)" : "var(--color-ink-muted)" }}
        >
          {numeral}
        </span>

        {/*
          TWO LAYERS, because the thing being animated cannot be tweened.
          `-webkit-text-stroke` does not interpolate, and fading a fill in
          underneath a stroke that stays put gives a heavy outlined-and-filled
          title mid-transition. So: hollow underneath, solid on top, and the
          crossfade is plain opacity.

          The hollow layer carries the real text and the solid one is
          `aria-hidden` — otherwise every title is announced twice.
        */}
        {/*
          THE ACTIVE TITLE GROWS. The client asked for it directly: "make the
          text get bigger when we're on that specific scroll animation — Design
          gets bigger, and when we scroll down Source gets bigger."

          IT IS A TRANSFORM, NOT A FONT-SIZE, and that is not a stylistic
          preference. This list lives inside a pinned stage with a fixed height
          budget (the arithmetic is above StepIndex); `font-size` reflows, so
          growing a title would push the list taller and the last step would be
          cut off by the stage's `overflow-hidden` — silently, on exactly the
          short screens nobody tests on. A transform paints outside the box
          without moving anything, so the budget only has to absorb the visual
          overflow, which the `<ol>` gap now does.

          `transform-origin` is direction-aware like every other transform on
          this site: the title grows away from the marker on the start edge
          rather than pushing back through it.
        */}
        <h3
          className={`relative min-w-0 transition-transform duration-[450ms] will-change-transform motion-reduce:transition-none ${titleClass}`}
          style={{
            transform: active && !reduce ? "scale(1.12)" : "scale(1)",
            transformOrigin: `${dir === -1 ? "right" : "left"} center`,
          }}
        >
          <span className="outline-type block" style={{ "--outline-w": "1.5px" } as React.CSSProperties}>
            {step.title}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 block transition-opacity duration-[450ms] motion-reduce:transition-none"
            style={{
              color: "var(--color-ink)",
              opacity: active ? 1 : 0,
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
        reader user cannot perceive a scroll scrub at all, so gating five
        sixths of the copy behind one would make the section unreadable to
        them; leaving it exposed means they get the whole process in one pass,
        which is strictly the better reading of it. There is nothing focusable
        inside, so no keyboard trap comes with that.
      */}
      <div
        className="grid ps-[clamp(14px,1.6vw,24px)] transition-[grid-template-rows,opacity] duration-500 motion-reduce:transition-none"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <p className="mt-2 max-w-[46ch] text-body-sm leading-body text-[color:var(--color-ink-body)] nav:mt-3 nav:text-body">
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
 * The mark, assembling itself against scroll position.
 *
 * Two layers rather than one animated fill: a permanent ghost of the whole
 * mark, and the filled parts fading in on top. Animating each part's colour
 * from faint to solid would leave the mark reading as a half-broken logo
 * mid-scroll, because a partially-coloured shape looks like a rendering fault.
 * A complete ghost with solid parts landing on it reads as assembly.
 *
 * SIZED OFF `svh` AS WELL AS `vw`. On a phone the mark shares a fixed-height
 * pinned stage with the heading, a step and the rail, so a purely
 * width-derived size pushes the rail off the bottom of a short screen. Taking
 * the min of a viewport-width, a viewport-height and an absolute ceiling means
 * it shrinks on whichever axis is actually scarce.
 */
function AssemblingMark({
  progress,
  stepCount,
}: {
  progress: MotionValue<number>;
  stepCount: number;
}) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      className="relative w-[min(46vw,20svh,180px)] nav:w-[min(34vw,52svh,420px)]"
      aria-hidden
      focusable="false"
    >
      {/* Ghost: the finished mark, always present, barely there. */}
      <use href="#lg-all" fill="var(--color-ink)" opacity={0.07} />

      {/* One part per step, evenly spaced down the scrub. The last lands at
          0.925, so the mark completes just before the section releases rather
          than exactly as it does. */}
      {STEP_PARTS.map((href, i) => (
        <MarkPart key={href} href={href} progress={progress} at={(i + 0.55) / stepCount} />
      ))}
    </svg>
  );
}

function MarkPart({
  href,
  progress,
  at,
}: {
  href: string;
  progress: MotionValue<number>;
  at: number;
}) {
  // A window rather than a step: the part fades and scales in over a slice of
  // scroll, so nudging the wheel moves it rather than snapping it.
  const opacity = useTransform(progress, [at - 0.07, at], [0, 1]);
  const scale = useTransform(progress, [at - 0.07, at], [0.82, 1]);

  return (
    <motion.use
      href={href}
      fill="var(--color-ink)"
      style={{ opacity, scale, transformBox: "fill-box", transformOrigin: "50% 50%" }}
    />
  );
}
