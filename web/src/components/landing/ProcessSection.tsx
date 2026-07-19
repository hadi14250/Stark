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
import { Reveal } from "@/components/motion/Reveal";
import { WordsReveal, LineReveal } from "@/components/motion/WordsReveal";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { LOGO_VIEWBOX } from "@/components/brand/LogoDefs";
import { ease } from "@/styles/tokens";

type Step = { title: string; body: string };

/**
 * "Our Process" — rebuilt.
 *
 * WHAT WAS HERE AND WHY IT WENT: four numbered circles in a row, joined by a
 * hairline, each with a title and a paragraph under it, plus a dashed ring and
 * a floating dot parked in the margins. It is the single most generic section
 * layout on the web — four equal circles in a row is what a slide template
 * gives you when nobody has made a decision — and the two ambient shapes read
 * as clip-art rather than as brand. The client's word for it was "basic", and
 * that was accurate: there was no idea in it, only an arrangement.
 *
 * WHAT IT IS NOW: a pinned chapter. The section holds the viewport for four
 * screens of scroll while the four steps advance in place — one step at a time,
 * at display scale, with room to actually read it. Every piece of motion here
 * is SCRUBBED (tied to scroll position) rather than triggered, so the section
 * responds continuously to the wheel instead of firing once and going still.
 * Scrubbed motion is what separates a site that feels built from one that
 * feels animated-at.
 *
 * THE MARK IS THE PROGRESS INDICATOR. Not a decorative logo parked beside the
 * copy — the brand book (p.8) has the five blades as the parts of one
 * ecosystem closing around a core, so the mark assembles as the process
 * advances: one blade per step, and the fifth blade plus the core land together
 * at handover, when the thing is whole. That is the brand geometry doing
 * structural work rather than being applied as a sticker, which is the whole
 * premise of §2.8.
 *
 * MOBILE DOES NOT PIN. Pinning costs four screens of scroll, which is a fair
 * trade on a desktop viewport and a terrible one on a phone. Below the `nav:`
 * breakpoint this renders as a plain vertical list with a rail that draws
 * itself — same content, same tokens, no hijacked scroll. The two trees are
 * exclusive via `display: none`, so the hidden one is out of the
 * accessibility tree and nothing is announced twice.
 */

/** How much scroll each step gets while the section is pinned. */
const STEP_VH = 72;

/**
 * Which part of the mark each step completes.
 *
 * Four steps, six parts: the first four blades map one-to-one, then `#lg-b5`
 * and `#lg-core` fill together at the end. That is deliberate rather than
 * arbitrary — "Deliver" is the point at which the parts become a whole, so the
 * core arriving last is the one moment in the sequence that means something.
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

export function ProcessSection() {
  const t = useTranslations("landing.process");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="process" className="relative bg-[color:var(--color-surface)]">
      <PinnedProcess
        steps={steps}
        heading={t("heading")}
        sub={t("sub")}
        eyebrow={t("eyebrow")}
      />
      <StackedProcess
        steps={steps}
        heading={t("heading")}
        sub={t("sub")}
        eyebrow={t("eyebrow")}
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop — pinned, scroll-scrubbed                                    */
/* ------------------------------------------------------------------ */

function PinnedProcess({
  steps,
  heading,
  sub,
  eyebrow,
}: {
  steps: Step[];
  heading: string;
  sub: string;
  eyebrow: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const { reduce } = useMotionConfig();

  // "start start" → "end end" measures the pinned run exactly: 0 when the
  // sticky child locks, 1 when it releases. Measuring the element's own rect
  // instead would be self-referential, since the child is transformed by the
  // sticky positioning it is trying to measure.
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
    <div
      ref={trackRef}
      className="hidden nav:block"
      // Four screens of scroll for four steps. Under reduced motion the track
      // collapses to one screen: there is no scrub to perform, so holding the
      // viewport for 288vh would be four screens of a section that never moves.
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
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] items-center gap-[clamp(40px,6vw,96px)]">
            {/* ---- copy column ---- */}
            <div className="min-w-0">
              <div className="flex flex-col items-start gap-3 text-start">
                <LineReveal>
                  <Eyebrow>{eyebrow}</Eyebrow>
                </LineReveal>
                <WordsReveal
                  text={heading}
                  as="h2"
                  justify="flex-start"
                  delay={0.08}
                  className="font-display text-h2 font-bold leading-h2 tracking-display text-[color:var(--color-ink)]"
                />
                <LineReveal delay={0.26} className="max-w-[46ch]">
                  <p className="text-lead leading-lead text-[color:var(--color-ink-body)]">{sub}</p>
                </LineReveal>
              </div>

              {/* The steps themselves, stacked in one box: exactly one is
                  visible, and the box is sized by the tallest so advancing a
                  step never reflows the column under the reader. */}
              <div className="relative mt-[clamp(28px,4vw,52px)] grid">
                {steps.map((step, i) => (
                  <StepCopy key={step.title} step={step} i={i} active={i === index} />
                ))}
              </div>

              <StepRail
                steps={steps}
                index={index}
                fill={railFill}
                className="mt-[clamp(28px,4vw,48px)]"
              />
            </div>

            {/* ---- mark column ---- */}
            <div className="relative grid place-items-center">
              <div
                aria-hidden
                className="absolute aspect-square w-[86%] animate-spin-slow rounded-full border border-dashed motion-reduce:animate-none"
                style={{ borderColor: "color-mix(in srgb, var(--color-accent) 70%, transparent)" }}
              />
              <AssemblingMark progress={scrollYProgress} stepCount={steps.length} />
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

/**
 * One step's copy. All four are rendered into the same grid cell so they
 * overlap; opacity and a short lift decide which one is present.
 *
 * `pointerEvents: none` on the inactive ones matters because they are still
 * laid out on top of each other — without it the topmost invisible step would
 * swallow text selection from the visible one.
 */
function StepCopy({ step, i, active }: { step: Step; i: number; active: boolean }) {
  const { reduce } = useMotionConfig();

  return (
    <motion.div
      className="col-start-1 row-start-1"
      style={{ pointerEvents: active ? "auto" : "none" }}
      aria-hidden={!active}
      initial={false}
      animate={
        reduce
          ? { opacity: active ? 1 : 0 }
          : { opacity: active ? 1 : 0, y: active ? 0 : 26, filter: active ? "blur(0px)" : "blur(6px)" }
      }
      transition={{ duration: 0.55, ease: [...ease.zoom] }}
    >
      <div className="flex items-baseline gap-4">
        <span
          aria-hidden
          className="font-mono text-[clamp(14px,1.2vw,17px)] tracking-eyebrow"
          style={{ color: "var(--color-accent)" }}
        >
          {String(i + 1).padStart(2, "0")}
        </span>
        <span
          aria-hidden
          className="h-px flex-1"
          style={{ background: "var(--color-line)" }}
        />
      </div>

      <h3 className="mt-3 font-display text-[clamp(34px,4.4vw,60px)] font-bold leading-[1.05] tracking-display text-[color:var(--color-ink)]">
        {step.title}
      </h3>
      <p className="mt-4 max-w-[42ch] text-lead leading-lead text-[color:var(--color-ink-body)]">
        {step.body}
      </p>
    </motion.div>
  );
}

/**
 * The four step names as a rail, with a continuously scrubbed fill.
 *
 * This is what stops the pinned section from feeling like a black box: the
 * reader can see all four steps at once, which one they are in, and how far
 * through the section they are. A pinned section without a position indicator
 * reads as broken scrolling.
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
  const { dir } = useMotionConfig();

  return (
    <div className={className}>
      <div className="relative h-px w-full" style={{ background: "var(--color-line)" }}>
        <motion.div
          aria-hidden
          className="absolute inset-y-0 start-0 w-full"
          style={{
            background: "var(--color-ink)",
            scaleX: fill,
            // Grows from the reading-start edge in both directions. There is no
            // logical equivalent of transform-origin, so it comes from `dir`.
            transformOrigin: dir === -1 ? "right center" : "left center",
          }}
        />
      </div>
      <ol className="mt-4 flex justify-between gap-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            aria-current={i === index ? "step" : undefined}
            className="font-mono text-[11px] tracking-eyebrow transition-[color,opacity] duration-500"
            style={{
              textTransform: "var(--eyebrow-transform)" as "uppercase",
              color: i === index ? "var(--color-ink)" : "var(--color-ink-muted)",
              opacity: i === index ? 1 : 0.55,
            }}
          >
            {step.title}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * The mark, assembling itself against scroll position.
 *
 * Two layers rather than one animated fill: a permanent ghost of the whole
 * mark, and the filled parts fading in on top. The alternative — animating
 * each part's colour from faint to solid — leaves the mark reading as a
 * half-broken logo mid-scroll, because a partially-coloured shape looks like a
 * rendering fault. A complete ghost with solid parts landing on it reads as
 * assembly, which is the idea.
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
      className="relative w-[min(34vw,420px)]"
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

/* ------------------------------------------------------------------ */
/* Mobile — no pinning, no scrub                                        */
/* ------------------------------------------------------------------ */

function StackedProcess({
  steps,
  heading,
  sub,
  eyebrow,
}: {
  steps: Step[];
  heading: string;
  sub: string;
  eyebrow: string;
}) {
  // Not a <Section>: the pinned branch owns the outer <section>, so this one
  // reproduces Section's density-scaled rhythm directly.
  return (
    <Container className="nav:hidden">
      <div
        style={{ paddingBlock: "calc(var(--space-section) * var(--density))" }}
        className="flex flex-col"
      >
        <div className="flex flex-col items-start gap-3 text-start">
          <LineReveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </LineReveal>
          <WordsReveal
            text={heading}
            as="h2"
            justify="flex-start"
            delay={0.08}
            className="font-display text-h2 font-bold leading-h2 tracking-display text-[color:var(--color-ink)]"
          />
          <LineReveal delay={0.26}>
            <p className="text-lead leading-lead text-[color:var(--color-ink-body)]">{sub}</p>
          </LineReveal>
        </div>

        <ol className="relative mt-10 flex flex-col gap-9">
          {/* The rail runs behind the markers rather than between them, so it
              cannot end up misaligned when a step's body wraps to a different
              number of lines. */}
          <span
            aria-hidden
            className="absolute bottom-6 start-[15px] top-3 w-px"
            style={{ background: "var(--color-line)" }}
          />
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.08} y={28} className="relative ps-12">
              <span
                aria-hidden
                className="absolute start-0 top-1 grid h-8 w-8 place-items-center rounded-full font-mono text-[11px]"
                style={{
                  background: "var(--color-ink)",
                  color: "var(--color-surface)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-h4 font-bold leading-h3 text-[color:var(--color-ink)]">
                {step.title}
              </h3>
              <p className="mt-2 text-body leading-body text-[color:var(--color-ink-body)]">
                {step.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </Container>
  );
}
