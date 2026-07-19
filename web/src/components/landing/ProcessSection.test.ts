import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import { stepIndexAt, STEP_PARTS, CLOSING_PARTS } from "./ProcessSection";

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

  it("ships a non-pinned branch for small viewports", () => {
    // Hijacking 288vh of scroll is a fair trade on a desktop viewport and a
    // bad one on a phone.
    expect(src).toMatch(/nav:hidden/);
    expect(src).toMatch(/hidden nav:block/);
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
