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
  const COUNT = 5;

  it("gives each step an equal, ordered slice", () => {
    expect(stepIndexAt(0, COUNT)).toBe(0);
    expect(stepIndexAt(0.19, COUNT)).toBe(0);
    expect(stepIndexAt(0.21, COUNT)).toBe(1);
    expect(stepIndexAt(0.5, COUNT)).toBe(2);
    expect(stepIndexAt(0.84, COUNT)).toBe(4);
  });

  it("does not run off the end of the array at full scroll", () => {
    // `Math.floor(1 * 5)` is 5. Unclamped this indexes past the last step and
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
  const FLAT = STEP_PARTS.flat();

  it("uses every part of the mark exactly once", () => {
    // The idea only lands if the logo is WHOLE at the end. A missing part
    // reads as a rendering fault rather than as completion, and a repeated
    // one wastes a step.
    expect(new Set(FLAT).size).toBe(FLAT.length);
    expect(new Set(FLAT)).toEqual(
      new Set(["#lg-b1", "#lg-b2", "#lg-b3", "#lg-b4", "#lg-b5", "#lg-core"]),
    );
  });

  it("lands the core LAST, because that is the step that means something", () => {
    // Five blades closing around a core (brand book p.8). The core is the
    // moment the parts become a whole, so it belongs on Delivery &
    // Installation and nowhere else. Reordering would still pass the
    // completeness check above while destroying the only bit of the sequence
    // that carries meaning — so this pins the LAST part of the LAST group.
    expect(FLAT[FLAT.length - 1]).toBe("#lg-core");
  });

  it("gives every step at least one part, and no empty groups", () => {
    /**
     * FIVE STEPS AGAINST SIX PARTS. The client removed Value Engineering from
     * the chain, so the one-to-one mapping the six-step version bought is gone
     * and the last step closes with `#lg-b5` AND `#lg-core` — which is how the
     * four-step version behaved, and what the client asked for by name.
     *
     * The shape is a list of GROUPS rather than a flat list plus a separate
     * `CLOSING_PARTS` array, so the arithmetic stays inside one structure and
     * `partWindow` splits a step's window between whatever it owns. An empty
     * group would be a step that draws nothing — the scrub would stall on it.
     */
    for (const group of STEP_PARTS) {
      expect(group.length).toBeGreaterThan(0);
    }
  });

  it("keeps the step count matching the copy deck, in both locales", () => {
    /**
     * The invariant most likely to be broken by someone editing copy rather
     * than code, and it is a SILENT failure: `AssemblingMark` maps over
     * STEP_PARTS, so a sixth step added to the JSON would scrub with no part of
     * its own and the mark would finish assembling before the list did.
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
     * A REAL DEFECT ONCE, caught by reading rather than by any test: the intro
     * said "the same four steps, inside one company" and the list below it had
     * six. The number is spelled out in words in both locales, so no digit-level
     * check (facts.test.ts) can see it, and both files stayed perfectly parallel
     * while both were wrong together.
     *
     * ⚠ THE BANNED LIST IS "EVERY COUNT EXCEPT THE REAL ONE", so it has to be
     * edited whenever the chain changes length. It banned `five` while the list
     * had six steps; the client's removal of Value Engineering made five the
     * right answer and `six` the wrong one.
     */
    const banned: Record<string, RegExp> = {
      en: /\b(three|four|six|seven|eight)\b/i,
      ar: /الأربع|الثلاث|الست|السبع/,
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
    //
    // AIMED AT THE STAGE BOX, not the mark's own <svg>. The redesign wraps the
    // mark in a square stage that also carries the ring, the guide circle and
    // the registration ticks, and the svg is now sized as a PERCENTAGE of that
    // box. So the box is what has to be viewport-clamped — a check on the svg
    // would read `w-[64%]` and pass while the thing actually consuming the
    // stage's height went unconstrained.
    const stageClass = src.match(/aspect-square w-\[([^\]]+)\]/)?.[1] ?? "";
    expect(stageClass, "the mark stage box lost its viewport clamp").toContain("svh");
    expect(stageClass).toContain("vw");
    // And the svg inside it is measured against the box, not the viewport.
    expect(src).toMatch(/className="relative w-\[64%\]/);
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
    /**
     * The requirement is unchanged and it is the whole point of the marker: ONE
     * bar travels from the previous row to this one. Two bars crossfading would
     * delete the movement, which is the only thing on screen that says "you
     * advanced" rather than "the page redrew".
     *
     * WHAT CHANGED IS HOW. This used to be a shared `layoutId`, and that is
     * subtly wrong here: the body accordion reflows the rows over 0.55s while
     * the marker is travelling, so Framer measures a target that has already
     * stopped being true and lands the bar where the row used to be. The
     * redesign chases the live offset every frame instead.
     *
     * So: exactly one marker element, and it is TRANSLATED rather than
     * re-rendered per row. A regression to two elements would show up as a
     * second `y: markerY` — or as the marker moving back inside StepRow, which
     * is what the row-count assertion catches.
     */
    expect(src, "the marker is no longer driven by a motion value").toMatch(
      /y: markerY/,
    );
    expect(src.match(/y: markerY/g) ?? [], "more than one marker element").toHaveLength(1);
    // It lives on the list, not inside a row — one bar for six rows.
    expect(src).toMatch(/markerY\.set\(/);
    expect(src, "the marker is back inside StepRow").not.toMatch(
      /function StepRow[\s\S]*?markerY/,
    );
  });

  it("inks the title in behind a wipe instead of tweening a stroke", () => {
    /**
     * TWO LAYERS, AND THE REASON IS UNCHANGED: `-webkit-text-stroke` does not
     * interpolate, so anything that animates a hollow title into a solid one by
     * touching the stroke gives a heavy outlined-AND-filled title mid-swap.
     *
     * The redesign drops the stroke entirely — inactive titles are now solid
     * ink at 26%, which is what Arabic was already getting, so both locales
     * finally share one treatment — and reveals the active one with a clip-path
     * wipe rather than an opacity crossfade. The wipe is not decoration: it
     * rhymes with the pen tracing a blade of the mark beside it, at the same
     * moment, which is what makes the two halves of the section read as one.
     */
    // Scoped to class strings: the component still REFERENCES that stylesheet
    // by name in a comment explaining why it stopped using it, and that
    // explanation is the thing most worth keeping.
    expect(src, "the hollow stroke treatment is back").not.toMatch(
      /className="[^"]*outline-type/,
    );
    expect(src).toMatch(/clipPath: open \? opened : closed/);
    expect(src).toMatch(/transition-\[clip-path\]/);
    // The wipe must run start-to-end in BOTH scripts, or in Arabic the title
    // appears to be erased rather than written.
    expect(src, "the wipe does not flip for RTL").toMatch(
      /const closed = dir === -1 \?/,
    );
    expect(src).toMatch(/const opened = dir === -1 \?/);
  });

  it("draws the mark rather than fading it, and scrubs it off progress", () => {
    /**
     * The one genuinely new mechanic. Each part is pen-traced along its own
     * path — `pathLength="100"` is set on every path in LogoDefs precisely so
     * all six draw at the same visual rate despite being very different
     * lengths — and its ink fill lands while the outline is still finishing.
     *
     * Both values are SCRUBBED off scroll progress, never derived from the step
     * index. Driving them off `index` would make the mark advance in six jumps,
     * which is the fade-in it replaces wearing a different name: between steps
     * nothing would move, and the section would stop reporting that the wheel
     * is connected to anything.
     */
    expect(src).toMatch(/strokeDasharray: 100/);
    expect(src).toMatch(/strokeDashoffset: reduce \? 0 : dashoffset/);
    // Both derived from the progress MotionValue, inside MarkPart.
    // `\n}\n` is the top-level close. Stopping at the first `\n}` would land in
    // the destructured parameter list and slice the body off entirely, which
    // makes every assertion below vacuously fail rather than vacuously pass.
    const part = src.match(/function MarkPart\([\s\S]*?\n\}\n/)?.[0] ?? "";
    expect(part, "MarkPart no longer reads scroll progress").toMatch(
      /useTransform\(progress/,
    );
    expect(part, "the trace is driven by the step index, not the scrub").not.toMatch(
      /\bindex\b/,
    );
  });

  it("announces each title once", () => {
    // Both layers carry the same string. The inked overlay must be hidden from
    // assistive tech or every step is read out twice.
    const solid = src.match(
      /<span\s+aria-hidden\s+className="absolute inset-0 block transition-\[clip-path\]/,
    );
    expect(solid, "the inked title layer lost its aria-hidden").not.toBeNull();
  });

  it("does not read the six step titles out a second time as a readout", () => {
    /**
     * The redesign adds a live `02 / 06 · ENGINEERING` under the mark. It
     * duplicates a string that is already in the list beside it, so without
     * aria-hidden a screen reader gets all six titles twice, the second time in
     * an order driven by scroll position — noise to someone who cannot perceive
     * the scrub, which is exactly the person it would be read to.
     */
    const readout = src.match(/function Readout\([\s\S]*?\n\}\n/)?.[0] ?? "";
    expect(readout, "the Readout component vanished").not.toBe("");
    expect(readout, "the readout is announced as well as the list").toMatch(
      /aria-hidden/,
    );
    // Latin digits either side of a spaced slash can be reordered by bidi in an
    // Arabic run — `06 / 01`. The numeral group carries its own direction.
    expect(readout, "the counter can be reordered in Arabic").toMatch(/dir="ltr"/);
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

describe("a pinned stage is a scroll-reveal dead zone", () => {
  it("never puts a scroll reveal on the step rows", () => {
    /**
     * A REAL BUG THAT REACHED THE CLIENT'S BROWSER, and it took under an hour
     * to write, ship and have reported.
     *
     * The design asks for a staggered row entrance, so the rows were given the
     * site's shared `reveal-fade`. That system arms an element at opacity 0
     * while it is below the fold and reveals it when its TOP CROSSES 60% OF THE
     * VIEWPORT — a contract that assumes the element travels up the screen.
     *
     * Inside a pinned stage it does not travel. The stage sticks at
     * `top: var(--header-h)` and stops, freezing every row at whatever height
     * it landed on. At 1440x900 the rows settle between about 40% and 80% of
     * the viewport, so steps 01-03 crossed the line and appeared and steps
     * 04, 05 and 06 sat there armed and invisible for the entire section. The
     * text was in the DOM, the rects were full size, and the document-bottom
     * backstop released them two sections later where nobody was looking.
     *
     * WHY NO EXISTING CHECK CAUGHT IT: an armed element has a full-size
     * bounding rect. The height-budget harness measures rects, so it reported
     * no clipping on a section with half its copy invisible — the same class of
     * mistake as proving content exists with `curl | grep`. Presence is not
     * visibility.
     *
     * The eyebrow, heading and intro above are safe ONLY because they sit high
     * enough in the stage to cross the line. That is luck of layout, not a
     * guarantee, and it is not a licence to add a reveal further down.
     */
    // Scoped to CODE, not prose. StepRow carries a long comment naming both the
    // class and the hook to explain why neither may be used, and a bare
    // substring match flags that explanation as the offence it warns about.
    const row = src.match(/function StepRow\([\s\S]*?\n\}\n/)?.[0] ?? "";
    expect(row, "StepRow vanished").not.toBe("");
    expect(row, "a scroll reveal is back on the step rows").not.toMatch(
      /className="[^"]*reveal-(fade|clip|word|line)/,
    );
    // The hook CALLED, not the hook mentioned.
    expect(row, "useRevealOnce is back on the step rows").not.toMatch(
      /useRevealOnce\s*[<(]/,
    );
    // The import too, so the next person cannot reach for it without noticing.
    expect(src, "ProcessSection re-imported the reveal hook").not.toMatch(
      /^import .*useRevealOnce/m,
    );
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

  it("presents the section as COMPLETE rather than as stuck on step one", () => {
    /**
     * This assertion changed shape with the redesign, and the reasoning is
     * worth keeping because the naive version is actively wrong.
     *
     * It used to require a static bar drawn on the active row — "the marker is
     * motion, so withhold it, but still answer which one". Under reduced motion
     * the scrub never advances, so `index` is 0 forever, and that bar therefore
     * pointed at step one permanently. It was not answering "which one", it was
     * asserting something false about where the reader had got to.
     *
     * The redesign withholds the marker entirely and instead presents the whole
     * chapter finished: rail full, mark drawn and inked, every body open, every
     * title at full ink. That is honest — with no scroll to report, the section
     * is a complete six-item list rather than a stalled animation.
     */
    expect(src, "the marker is drawn under reduced motion").toMatch(/\{!reduce && \(/);
    expect(src, "the rail still reports partial progress").toMatch(
      /height: reduce \? "100%"/,
    );
    expect(src, "the ring still reports partial progress").toMatch(
      /strokeDashoffset: reduce \? 0/,
    );
    expect(src, "the mark stays half-drawn").toMatch(/opacity: reduce \? 1/);
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
