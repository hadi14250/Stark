"use client";

import { useRef, useState, type ReactNode } from "react";
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
 * WHAT WAS HERE AND WHY IT WENT: four numbered circles in a row joined by a
 * hairline, plus a dashed ring and a floating dot parked in the margins. That
 * is what a slide template gives you when nobody has made a decision. It is
 * now a section that holds the viewport for four screens while the steps
 * advance in place, one at a time, at display scale — and every piece of
 * motion is SCRUBBED to scroll position rather than triggered, so it responds
 * continuously to the wheel instead of firing once and going still.
 *
 * THE MARK IS THE PROGRESS INDICATOR. The brand book (p.8) has the five blades
 * as parts of one ecosystem closing around a core, so the mark assembles as
 * the process advances: one blade per step, with the fifth blade and the core
 * landing together at handover, when the thing is whole. Brand geometry doing
 * structural work rather than applied as a sticker.
 *
 * ONE TREE, NOT TWO. This used to fork into a pinned desktop version and a
 * plain stacked list for phones — which meant the mark, the whole point of the
 * section, simply did not exist on mobile. Now both get the same section and
 * the layout reflows: the mark sits above the copy in one column instead of
 * beside it. The only thing mobile drops is the intro paragraph, because a
 * pinned stage has a fixed height budget and the steps have to fit inside it;
 * the mark sizes itself off `svh` as well as `vw` so it shrinks on short
 * screens rather than pushing the rail off the bottom.
 */

/** How much scroll each step gets while the section is pinned. */
const STEP_VH = 72;

/**
 * Which part of the mark each step completes.
 *
 * Four steps, six parts: the first four blades map one-to-one, then `#lg-b5`
 * and `#lg-core` fill together at the end. "Deliver" is the point at which the
 * parts become a whole, so the core arriving last is the one moment in the
 * sequence that means something.
 */
export const STEP_PARTS = ["#lg-b1", "#lg-b2", "#lg-b3", "#lg-b4"] as const;
export const CLOSING_PARTS = ["#lg-b5", "#lg-core"] as const;

/**
 * Which step a scroll progress of `p` (0-1) lands on.
 *
 * Pure and exported because the clamp is the whole thing: `Math.floor(1 * 4)`
 * is 4, and a scroll that reaches the very end of the track therefore indexes
 * one past the last step. Unclamped, `steps[4]` is undefined and the copy
 * column renders blank at exactly the moment the reader finishes the section —
 * a bug that only appears at the bottom of the scrub, which is the hardest
 * place to catch by looking.
 */
export function stepIndexAt(p: number, count: number): number {
  return Math.min(count - 1, Math.max(0, Math.floor(p * count)));
}

/**
 * Where a step sits relative to the one being read.
 *
 * THIS IS WHAT MAKES THE TRANSITION READ AS DIRECTIONAL, and it is the whole
 * reason there are three states rather than an `active` boolean. With two
 * states, every inactive step has to park in the same place, so a step that
 * has not been reached yet sits ABOVE the viewport and drops down into
 * position — backwards. With "before" and "after" as separate states, steps
 * already read sit above, steps still to come sit below, and the column
 * travels one way as you scroll down and the other way as you scroll up
 * without anything having to track scroll direction.
 */
export function stepPositionOf(i: number, index: number): "before" | "current" | "after" {
  return i < index ? "before" : i === index ? "current" : "after";
}

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

  const railFill = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" className="relative bg-[color:var(--color-surface)]">
      <div
        ref={trackRef}
        // Under reduced motion the track collapses to its content: there is no
        // scrub to perform, so holding the viewport for 288vh would be four
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
                  {/* Desktop only — see the header comment. The pinned stage
                      has a fixed height budget and the steps come first. */}
                  <LineReveal delay={0.26} className="hidden max-w-[46ch] nav:block">
                    <p className="text-lead leading-lead text-[color:var(--color-ink-body)]">
                      {t("sub")}
                    </p>
                  </LineReveal>
                </div>

                {/* All four steps live in ONE grid cell so the box is sized by
                    the tallest and advancing never reflows the column under
                    the reader — the rail below it must not twitch. */}
                <div className="relative mt-[clamp(20px,4vw,52px)] grid">
                  {steps.map((step, i) => (
                    <StepCopy
                      key={step.title}
                      step={step}
                      i={i}
                      position={stepPositionOf(i, index)}
                    />
                  ))}
                </div>

                <StepRail
                  steps={steps}
                  index={index}
                  fill={railFill}
                  className="mt-[clamp(20px,4vw,48px)]"
                />
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* One step's copy                                                      */
/* ------------------------------------------------------------------ */

/**
 * A line that slides inside its own clipped box, so type appears to be dealt
 * rather than to fade in.
 *
 * The clip is what makes the transition legible. A crossfade between two
 * headlines is a dissolve — at any moment you are looking at two overlapping
 * words and neither is readable. A masked slide has a hard edge: the old word
 * leaves through the top of a box and the new one arrives through the bottom,
 * so there is always exactly one thing to read and the direction of travel
 * tells you which way you are moving through the process.
 *
 * `paddingBottom` with an equal negative `marginBottom` is the descender fix:
 * an overflow-hidden box crops the tails of g, y and p flat against the
 * baseline, and Arabic diacritics sit lower still. The padding gives them room
 * inside the clip; the negative margin gives the space back to the layout.
 */
function SlotLine({
  children,
  className,
  distance = "112%",
  as = "span",
}: {
  children: ReactNode;
  className?: string;
  /** How far outside the box the line parks. Must exceed the box height. */
  distance?: string;
  /** The sliding element's tag. `h3` keeps the step title a real heading —
   *  a heading nested inside a <span> would be invalid markup. */
  as?: "span" | "h3";
}) {
  const Outer = as === "h3" ? "div" : "span";
  const Inner = as === "h3" ? motion.h3 : motion.span;

  return (
    <Outer
      className="block overflow-hidden"
      style={{ paddingBottom: "0.16em", marginBottom: "-0.16em" }}
    >
      <Inner
        className={`block ${className ?? ""}`}
        variants={{
          before: { y: `-${distance}`, opacity: 0 },
          current: { y: "0%", opacity: 1 },
          after: { y: distance, opacity: 0 },
        }}
      >
        {children}
      </Inner>
    </Outer>
  );
}

/**
 * The transition duration. Deliberately slow for a swap of four words: the
 * complaint this is answering is that the change was not obvious, and a fast
 * transition is a less obvious one. At this length the eye has time to follow
 * a word out and the next one in rather than just noticing that something
 * flickered.
 */
const SWAP_S = 0.78;

function StepCopy({
  step,
  i,
  position,
}: {
  step: Step;
  i: number;
  position: "before" | "current" | "after";
}) {
  const { reduce } = useMotionConfig();
  const current = position === "current";

  if (reduce) {
    // No slide, no sweep, no stagger — just the one step that is current.
    return (
      <div className="col-start-1 row-start-1" style={{ opacity: current ? 1 : 0 }}>
        <StepBody step={step} i={i} />
      </div>
    );
  }

  return (
    <motion.div
      className="col-start-1 row-start-1"
      style={{ pointerEvents: current ? "auto" : "none" }}
      aria-hidden={!current}
      initial={false}
      animate={position}
      // The cascade is the point: ghost numeral, rule, numeral, title, body,
      // ~90ms apart. Arriving all at once is a slide; arriving in sequence is a
      // section changing chapter.
      variants={{
        before: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
        current: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
        after: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
      }}
      transition={{ duration: SWAP_S, ease: [...ease.zoom] }}
    >
      <StepBody step={step} i={i} animated />
    </motion.div>
  );
}

function StepBody({ step, i, animated = false }: { step: Step; i: number; animated?: boolean }) {
  const numeral = String(i + 1).padStart(2, "0");
  const { dir } = useMotionConfig();
  const startEdge = dir === -1 ? "right center" : "left center";

  const numeralClass =
    "font-mono font-light leading-none tabular-nums text-[clamp(30px,3.4vw,46px)]";
  const titleClass =
    "font-display text-[clamp(34px,4.4vw,60px)] font-bold leading-[1.05] tracking-display text-[color:var(--color-ink)]";
  const bodyClass =
    "mt-3 max-w-[42ch] text-body-sm leading-body text-[color:var(--color-ink-body)] nav:mt-4 nav:text-lead nav:leading-lead";

  if (!animated) {
    return (
      <>
        <div className="flex items-baseline gap-4">
          <span aria-hidden className={numeralClass} style={{ color: "var(--color-accent)" }}>
            {numeral}
          </span>
          <span aria-hidden className="h-px flex-1" style={{ background: "var(--color-line)" }} />
        </div>
        <h3 className={`mt-3 ${titleClass}`}>{step.title}</h3>
        <p className={bodyClass}>{step.body}</p>
      </>
    );
  }

  return (
    <>
      {/*
        THE GIANT NUMERAL. The single biggest thing on the copy side, and it
        exists purely so the step change is impossible to miss: four words
        swapping at 60px is a detail you can scroll past, a 200px numeral
        rolling over is an event. Sand on off-white is quiet enough to sit
        behind the column without competing with the headline for the eye.

        1180px, NOT the 860px `nav:` breakpoint, and the number is a contrast
        requirement rather than a taste call. The numeral is pinned to the
        column's end edge and the body runs to 42ch from the start edge; those
        two only clear each other once the column is wide enough. Measured, the
        crossover is around 1100px — at 900px the numeral laps ~56px of running
        text, and body ink on sand is 4.19:1, under the 4.5:1 floor. So it
        appears only where it cannot land behind a paragraph.
      */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute hidden select-none font-display text-[clamp(120px,13vw,210px)] font-light leading-none tabular-nums min-[1180px]:block"
        style={{
          color: "var(--color-accent)",
          insetInlineEnd: 0,
          top: "50%",
          marginTop: "-0.5em",
        }}
        variants={{
          before: { y: -70, opacity: 0, scale: 0.9 },
          current: { y: 0, opacity: 1, scale: 1 },
          after: { y: 70, opacity: 0, scale: 0.9 },
        }}
      >
        {numeral}
      </motion.span>

      <div className="relative flex items-baseline gap-4">
        <SlotLine className={numeralClass} distance="130%">
          <span aria-hidden style={{ color: "var(--color-accent)" }}>
            {numeral}
          </span>
        </SlotLine>
        {/* The rule wipes in from the reading edge — first to move, so the eye
            is already on the row when the numeral lands. */}
        <motion.span
          aria-hidden
          className="h-px flex-1"
          style={{ background: "var(--color-line)", transformOrigin: startEdge }}
          variants={{
            before: { scaleX: 0, opacity: 0 },
            current: { scaleX: 1, opacity: 1 },
            after: { scaleX: 0, opacity: 0 },
          }}
        />
      </div>

      {/*
        THE SWEEP. A band of sand wipes across the title's own width as the new
        word lands, then clears. It is the colour cue — a flash tied to the
        moment of change rather than a permanent tint, so the section does not
        end up with a highlighted headline sitting there afterwards.

        It is keyframed on scaleX/opacity of a solid background rather than
        animated as a colour, because Framer cannot interpolate between two
        `var()` values — a token-to-token colour tween silently snaps instead
        of animating, which is precisely the "nothing seems to happen" failure
        being fixed here.

        `w-fit` on the wrapper is what makes the band the width of the WORD
        rather than the column. A sweep spanning the full measure reads as a
        loading bar; one that fits "Deliver" reads as emphasis.
      */}
      <div className="relative mt-3 w-fit">
        <motion.span
          aria-hidden
          className="absolute -inset-x-3 inset-y-0 -z-10 rounded-[4px]"
          style={{ background: "var(--color-accent)", transformOrigin: startEdge }}
          variants={{
            before: { scaleX: 0, opacity: 0 },
            after: { scaleX: 0, opacity: 0 },
            current: {
              scaleX: [0, 1, 1],
              opacity: [0.85, 0.85, 0],
              transition: { duration: SWAP_S * 1.5, times: [0, 0.42, 1], ease: [...ease.zoom] },
            },
          }}
        />
        <SlotLine as="h3" className={titleClass}>
          {step.title}
        </SlotLine>
      </div>

      {/* Not clipped: the body wraps to two or three lines and a mask sized for
          one would crop it. It gets the softer treatment — a lift plus a blur,
          which reads as depth behind the headline rather than competing. */}
      <motion.p
        className={bodyClass}
        variants={{
          before: { y: -30, opacity: 0, filter: "blur(8px)" },
          current: { y: 0, opacity: 1, filter: "blur(0px)" },
          after: { y: 30, opacity: 0, filter: "blur(8px)" },
        }}
      >
        {step.body}
      </motion.p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* The rail                                                             */
/* ------------------------------------------------------------------ */

/**
 * The four step names, with a continuously scrubbed fill and a marker that
 * slides between them.
 *
 * This is what stops a pinned section from feeling like a black box: the
 * reader can see all four steps at once, which one they are in, and how far
 * through they are. The marker uses a shared `layoutId`, so Framer animates it
 * from the old label to the new one rather than cross-fading two markers —
 * the movement itself says "you advanced", which a colour change alone does
 * not.
 */
function StepRail({
  steps,
  index,
  fill,
  className,
}: {
  steps: Step[];
  index: number;
  fill: MotionValue<number>;
  className?: string;
}) {
  const { dir, reduce } = useMotionConfig();

  return (
    <div className={className}>
      <div className="relative h-px w-full" style={{ background: "var(--color-line)" }}>
        <motion.div
          aria-hidden
          className="absolute inset-y-0 start-0 w-full"
          style={{
            background: "var(--color-ink)",
            scaleX: fill,
            // No logical form of transform-origin exists, so the growth edge
            // comes from `dir`.
            transformOrigin: dir === -1 ? "right center" : "left center",
          }}
        />
      </div>
      <ol className="mt-3 flex justify-between gap-2 nav:mt-4 nav:gap-3">
        {steps.map((step, i) => {
          const active = i === index;
          const done = i < index;
          return (
            <li key={step.title} className="relative">
              {/*
                Three states, not two. A step you have PASSED reads differently
                from one you have not reached — done steps stay in the ink ramp
                at low opacity, upcoming ones sit in muted grey. Without that,
                the rail says "here" but not "how far", and the section loses
                the one thing a pinned chapter has to communicate.
              */}
              <span
                aria-current={active ? "step" : undefined}
                className="block font-mono text-[10px] tracking-eyebrow transition-[color,opacity,font-weight] duration-500 nav:text-[11px]"
                style={{
                  textTransform: "var(--eyebrow-transform)" as "uppercase",
                  color: active || done ? "var(--color-ink)" : "var(--color-ink-muted)",
                  opacity: active ? 1 : done ? 0.55 : 0.4,
                  fontWeight: active ? 700 : 400,
                }}
              >
                {step.title}
              </span>
              {active && !reduce && (
                <motion.span
                  aria-hidden
                  layoutId="process-rail-marker"
                  className="absolute -bottom-2 start-0 h-[2px] w-full"
                  style={{ background: "var(--color-accent)" }}
                  transition={{ duration: 0.5, ease: [...ease.zoom] }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
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

      {STEP_PARTS.map((href, i) => (
        <MarkPart key={href} href={href} progress={progress} at={(i + 0.55) / stepCount} />
      ))}
      {CLOSING_PARTS.map((href) => (
        <MarkPart key={href} href={href} progress={progress} at={0.94} />
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
