import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import { stepIndexAt, stepPositionOf, STEP_PARTS, CLOSING_PARTS } from "./ProcessSection";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "ProcessSection.tsx"), "utf8");
const divisionIndex = readFileSync(join(here, "../home/DivisionIndex.tsx"), "utf8");
const divisions = readFileSync(join(here, "../home/Divisions.tsx"), "utf8");

describe("the pinned process's scrub-to-step mapping", () => {
  const COUNT = 4;

  it("gives each step an equal, ordered slice", () => {
    expect(stepIndexAt(0, COUNT)).toBe(0);
    expect(stepIndexAt(0.24, COUNT)).toBe(0);
    expect(stepIndexAt(0.25, COUNT)).toBe(1);
    expect(stepIndexAt(0.5, COUNT)).toBe(2);
    expect(stepIndexAt(0.75, COUNT)).toBe(3);
  });

  it("does not run off the end of the array at full scroll", () => {
    // `Math.floor(1 * 4)` is 4. Unclamped this indexes past the last step and
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
    const all = [...STEP_PARTS, ...CLOSING_PARTS];
    expect(new Set(all).size).toBe(all.length);
    expect(new Set(all)).toEqual(
      new Set(["#lg-b1", "#lg-b2", "#lg-b3", "#lg-b4", "#lg-b5", "#lg-core"]),
    );
  });

  it("has one part per step, plus the closing pair", () => {
    expect(STEP_PARTS).toHaveLength(4);
    expect(CLOSING_PARTS).toHaveLength(2);
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
    // point of the section, did not exist on a phone at all. There must be no
    // breakpoint that hides a whole branch.
    expect(src).not.toMatch(/hidden nav:block/);
    expect(src).not.toMatch(/className="nav:hidden"/);
    // Exactly one mark, not one per branch.
    expect(src.match(/<AssemblingMark/g) ?? []).toHaveLength(1);
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

describe("the step transition is directional", () => {
  it("parks read steps above and unread steps below", () => {
    // With a two-state active/inactive boolean, every inactive step has to sit
    // in the same place — so a step not yet reached drops DOWN into view,
    // which is backwards, and scrolling up looks identical to scrolling down.
    expect(stepPositionOf(0, 2)).toBe("before");
    expect(stepPositionOf(1, 2)).toBe("before");
    expect(stepPositionOf(2, 2)).toBe("current");
    expect(stepPositionOf(3, 2)).toBe("after");
  });

  it("has exactly one current step at every index", () => {
    for (let index = 0; index < 4; index++) {
      const positions = [0, 1, 2, 3].map((i) => stepPositionOf(i, index));
      expect(positions.filter((p) => p === "current")).toHaveLength(1);
    }
  });

  it("clips the sliding lines so type is dealt rather than dissolved", () => {
    // A crossfade between two headlines shows two overlapping words and
    // neither is readable. The mask is what gives the swap a hard edge.
    expect(src).toMatch(/overflow-hidden/);
    // …and the descender fix that has to come with any text mask.
    expect(src).toMatch(/paddingBottom: "0\.16em", marginBottom: "-0\.16em"/);
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
