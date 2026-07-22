import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import { stepIndexAt, STEP_PARTS } from "./ProcessSection";
import en from "../../messages/en.json";
import ar from "../../messages/ar.json";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "ProcessSection.tsx"), "utf8");
const divisionIndex = readFileSync(join(here, "../home/DivisionIndex.tsx"), "utf8");
const divisions = readFileSync(join(here, "../home/Divisions.tsx"), "utf8");

describe("the pinned process's scrub-to-step mapping", () => {
  const COUNT = 6;

  it("gives each step an equal, ordered slice", () => {
    expect(stepIndexAt(0, COUNT)).toBe(0);
    expect(stepIndexAt(0.16, COUNT)).toBe(0);
    expect(stepIndexAt(0.17, COUNT)).toBe(1);
    expect(stepIndexAt(0.5, COUNT)).toBe(3);
    expect(stepIndexAt(0.84, COUNT)).toBe(5);
  });

  it("does not run off the end of the array at full scroll", () => {
    // `Math.floor(1 * 6)` is 6. Unclamped this indexes past the last step and
    // the copy column goes blank exactly as the reader finishes the section.
    expect(stepIndexAt(1, COUNT)).toBe(COUNT - 1);
  });

  it("survives the overshoot browsers actually produce", () => {
    // Rubber-band scrolling and sub-pixel rounding both push the reported
    // progress slightly outside 0-1.
    expect(stepIndexAt(1.04, COUNT)).toBe(COUNT - 1);
    expect(stepIndexAt(-0.03, COUNT)).toBe(0);
  });
});

describe("the mark assembles completely and without repeats", () => {
  it("uses every part of the mark exactly once", () => {
    // The idea only lands if the logo is WHOLE at the end. A missing part
    // reads as a rendering fault rather than as completion, and a repeated
    // one wastes a step.
    expect(new Set(STEP_PARTS).size).toBe(STEP_PARTS.length);
    expect(new Set(STEP_PARTS)).toEqual(
      new Set(["#lg-b1", "#lg-b2", "#lg-b3", "#lg-b4", "#lg-b5", "#lg-core"]),
    );
  });

  it("lands the core LAST, because that is the step that means something", () => {
    // Five blades closing around a core (brand book p.8). The core is the
    // moment the parts become a whole, so it belongs on Delivery &
    // Installation and nowhere else. Reordering the array would still pass
    // the completeness check above while destroying the only bit of the
    // sequence that carries meaning.
    expect(STEP_PARTS[STEP_PARTS.length - 1]).toBe("#lg-core");
  });

  it("gives every step exactly one part, in both locales", () => {
    /**
     * THE INVARIANT THE SIX-STEP VERSION BOUGHT, and the one most likely to be
     * broken by someone editing copy rather than code.
     *
     * The four-step version could not hold this: four steps against six parts
     * meant `#lg-b5` and `#lg-core` had to be fired together on the last step,
     * via a separate `CLOSING_PARTS` array, purely to use up the leftovers.
     * Now the counts match exactly.
     *
     * Adding a seventh step in the copy deck is therefore a SILENT failure:
     * `AssemblingMark` maps over STEP_PARTS, so the extra step scrubs with no
     * part of its own and the mark finishes assembling before the list does.
     * TypeScript cannot see it, because the steps come out of a JSON file.
     */
    for (const [locale, msgs] of [["en", en], ["ar", ar]] as const) {
      const steps = msgs.landing.process.steps;
      expect(steps.length, `${locale}: step count drifted from the mark`).toBe(
        STEP_PARTS.length,
      );
    }
  });

  it("keeps the two locales telling the same story", () => {
    expect(en.landing.process.steps).toHaveLength(ar.landing.process.steps.length);
    for (const s of [...en.landing.process.steps, ...ar.landing.process.steps]) {
      expect(s.title.trim().length).toBeGreaterThan(0);
      expect(s.body.trim().length).toBeGreaterThan(0);
    }
  });

  it("does not let the intro count a different number of steps than it shows", () => {
    /**
     * A REAL DEFECT THIS ROUND, caught by reading rather than by any test: the
     * intro said "the same four steps, inside one company" and the list below
     * it had six. The number is spelled out in words in both locales, so no
     * digit-level check (facts.test.ts) can see it, and both files stayed
     * perfectly parallel while both were wrong together.
     */
    const banned: Record<string, RegExp> = {
      en: /\b(three|four|five|seven|eight)\b/i,
      ar: /الأربع|الثلاث|الخمس|السبع/,
    };
    for (const [locale, msgs] of [["en", en], ["ar", ar]] as const) {
      expect(
        msgs.landing.process.sub,
        `${locale}: the intro counts a number of steps the list does not have`,
      ).not.toMatch(banned[locale]);
    }
  });
});

describe("the process section stays usable when motion is off", () => {
  it("does not hold the viewport for four screens under reduced motion", () => {
    // Pinning buys four screens of scroll to spend on a scrub. With no scrub
    // to perform, that is four screens of a section that never changes.
    expect(src).toMatch(/height:\s*reduce\s*\?\s*["']auto["']/);
  });

  it("renders ONE tree, so mobile gets the mark too", () => {
    // The section used to fork into a pinned desktop version and a plain
    // stacked list below `nav:` — which meant the assembling mark, the whole
    // point of the section, did not exist on a phone at all.
    //
    // Guarded by structure rather than by class strings: individual decorative
    // elements ARE allowed to be desktop-only (the giant numeral is), so the
    // rule is that the section renders one of everything, not that no element
    // ever carries a breakpoint.
    expect(src).not.toMatch(/function StackedProcess/);
    expect(src.match(/<AssemblingMark/g) ?? []).toHaveLength(1);
    expect(src.match(/<StepIndex/g) ?? []).toHaveLength(1);
  });

  it("sizes the mark off viewport HEIGHT as well as width", () => {
    // On a phone the mark shares a fixed-height pinned stage with a heading, a
    // step and the rail. Sized off `vw` alone it is ~180px tall on any phone,
    // which pushes the rail off the bottom of a short screen. Taking the min
    // with an `svh` term makes it shrink on whichever axis is actually scarce.
    const markClass = src.match(/className="relative w-\[([^"]+)"/)?.[1] ?? "";
    expect(markClass).toContain("svh");
    expect(markClass).toContain("vw");
  });
});

describe("the step change is legible because the whole list is on screen", () => {
  it("renders every step title, not just the current one", () => {
    /**
     * THE REGRESSION THIS EXISTS FOR is the design it replaced. Four steps
     * shared one grid cell and slid through it, so exactly one title was ever
     * visible. That is why the transition was not noticeable no matter how much
     * emphasis machinery was piled on top of it — a lone title becoming a
     * different title gives the reader no evidence they moved through a
     * sequence. The list must map over the steps and render each one.
     */
    expect(src).toMatch(/steps\.map\(\(step, i\) => \(\s*<StepRow/);
    // The single-cell stack, by its signature: everything landing in one place.
    expect(src).not.toMatch(/col-start-1 row-start-1/);
  });

  it("has deleted the three devices that competed with each other", () => {
    // A 210px numeral, a sand sweep across the title, and a separate rail below
    // the column were all doing the same job at once. The list IS the rail now.
    expect(src, "the giant absolute numeral is back").not.toMatch(/text-\[clamp\(120px/);
    expect(src, "the sand sweep is back").not.toMatch(/scaleX: \[0, 1, 1\]/);
    expect(src, "StepRail is back").not.toMatch(/function StepRail/);
    expect(src, "SlotLine is back").not.toMatch(/function SlotLine/);
  });

  it("moves ONE marker rather than crossfading two", () => {
    // A shared layoutId is what makes the bar travel from the previous row to
    // this one. Without it Framer fades one out and another in, and the
    // movement — the only thing that says "you advanced" — disappears.
    expect(src).toMatch(/layoutId="process-step-marker"/);
  });

  it("crossfades two title layers instead of tweening a stroke", () => {
    // `-webkit-text-stroke` does not interpolate, and fading a fill in under a
    // stroke that stays put gives a heavy outlined-AND-filled title mid-swap.
    // Hollow layer underneath, solid on top, opacity between them.
    expect(src).toMatch(/outline-type block/);
    expect(src).toMatch(/opacity: active \? 1 : 0/);
  });

  it("announces each title once", () => {
    // Both layers carry the same string. The solid overlay must be hidden from
    // assistive tech or every step is read out twice.
    const solid = src.match(/<span\s+aria-hidden\s+className="absolute inset-0 block transition-opacity/);
    expect(solid, "the solid title layer lost its aria-hidden").not.toBeNull();
  });

  it("never tries to tween between two token colours in Framer", () => {
    // Framer cannot interpolate `var()` values — a token-to-token colour tween
    // does not animate, it snaps, which looks like nothing happening. CSS
    // transitions CAN do it (they interpolate the computed colours), which is
    // why the numeral uses `transition-colors` and not a Framer animation.
    expect(src).not.toMatch(/(?:color|background(?:Color)?):\s*\[/);
    expect(src).toMatch(/transition-colors/);
  });
});

describe("reduced motion gets the whole section, not a quarter of it", () => {
  it("opens every body when the scrub cannot run", () => {
    /**
     * A REAL BUG THAT SHIPPED IN THE PREVIOUS VERSION. Non-current steps
     * rendered at `opacity: 0`, and under reduced motion the track collapses so
     * the scrub never advances — the index stayed at 0 forever and three of the
     * four steps were permanently invisible. Wanting less motion is not asking
     * for less content.
     */
    expect(src).toMatch(/const open = reduce \|\| active/);
  });

  it("still shows which step is current without sliding a marker", () => {
    // The layoutId marker is motion, so it is correctly withheld — but the
    // section still has to answer "which one". A static bar on the active row.
    expect(src).toMatch(/active && reduce/);
  });
});

describe("the divisions row does not reintroduce the bugs it replaced", () => {
  it("never renders a division's own title as its eyebrow", () => {
    // The shipped version had <Eyebrow>{item.title}</Eyebrow> directly above
    // <h3>{item.title}</h3>, so every panel said "TURNKEY PROJECTS" and then
    // "Turnkey Projects". The section eyebrow is a separate string.
    expect(divisionIndex).not.toMatch(/<Eyebrow[^>]*>\s*\{\s*item\.title/);
    expect(divisions).toMatch(/eyebrowLabel/);
  });

  it("keeps every panel's copy present rather than gating it on hover", () => {
    // A panel that hides its body until hovered is unreachable content for a
    // touch user, who may never produce a hover or a focus at all. Expansion
    // adds emphasis; it must not add information.
    //
    // Two separate ways that could regress, so two assertions: conditional
    // RENDERING (`open && …`), and conditional VISIBILITY on the copy itself.
    // The open state is legitimately allowed to drive the rule and the image —
    // hence scoping the second check to the markup around the body copy rather
    // than matching `open` anywhere in the file.
    expect(divisionIndex).not.toMatch(/open\s*&&/);

    const bodyAt = divisionIndex.indexOf("{item.body}");
    const tagAt = divisionIndex.lastIndexOf("<p", bodyAt);
    expect(tagAt).toBeGreaterThan(-1);
    // Exactly the paragraph's own opening tag — reaching further back lands in
    // the rule above it, which IS allowed to read `open`.
    expect(divisionIndex.slice(tagAt, bodyAt)).not.toContain("open");
  });

  it("guarantees copy contrast with a fixed scrim, not a themed one", () => {
    // The scrim exists to make off-white text legible over an unknown
    // photograph. A semantic role would re-point under a theme and could
    // silently go light.
    expect(divisionIndex).toMatch(/linear-gradient\(to top, rgb\(12 26 19/);
  });
});
