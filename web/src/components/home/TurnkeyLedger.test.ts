import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "TurnkeyLedger.tsx"), "utf8");

/**
 * Structural guards for the two things about this section that break silently.
 *
 * Both failures look like nothing on the machine of whoever introduces them:
 * one is only visible on a touch device, the other only when a scroll listener
 * fails to run. Neither would be caught by rendering the component and looking
 * at it, which is exactly why they are pinned here instead.
 */

describe("the pointer preview has a touch equivalent", () => {
  it("gates the cursor card on a fine pointer", () => {
    // A card that follows a finger is a card underneath the finger. This must
    // stay a capability check, not a width check — a touchscreen laptop is
    // wide and still coarse.
    expect(src).toMatch(/useMediaQuery\("\(pointer: fine\)"\)/);
  });

  it("still puts the photograph in the row when the card is unavailable", () => {
    /**
     * THE FAILURE THIS CATCHES: someone deletes the in-row thumbnail because
     * "the preview already shows it". The preview does not exist on touch, so
     * every phone silently loses the section's imagery — while every desktop,
     * including the reviewer's, looks completely fine.
     *
     * The `nav:hidden` is the other half: without it both the card and the
     * thumbnail render on desktop, and the row shows the picture twice.
     */
    expect(src, "the mobile in-row thumbnail is gone").toMatch(/nav:hidden/);

    const thumb = src.match(/<div className="relative h-\[[^\]]+\][^"]*nav:hidden">([\s\S]*?)<\/div>/);
    expect(thumb, "the thumbnail block no longer contains an image").not.toBeNull();
    expect(thumb![1]).toMatch(/<Image/);
    // Real alt text, not the empty string the decorative preview card uses:
    // on mobile this IS the content, so it has to be described.
    expect(thumb![1]).toMatch(/alt=\{item\.alt\}/);
  });
});

describe("scrubbed values never bottom out at invisible", () => {
  it("gives the ghost numerals a nonzero floor", () => {
    /**
     * A scrub is bound to scroll POSITION, which means — unlike every reveal
     * on this site — it has no fail-safe and cannot have one. If progress is
     * ever stuck at 0 (an unmeasured element, a scroll listener that never
     * runs) the numeral renders at whatever the low end of the range says,
     * forever.
     *
     * So the low end is a design decision, not a starting point: 0.2 is a
     * deliberately ghosted ordinal. 0 is a missing one. This site has already
     * shipped one section that was present in the DOM and invisible on screen;
     * the rule taken from it is that nothing may depend on an animation
     * actually running in order to be seen.
     */
    const range = src.match(/useTransform\(scrollYProgress, \[0, 1\], \[([\d.]+),/);
    expect(range, "the numeral scrub range moved or was renamed").not.toBeNull();
    expect(Number(range![1])).toBeGreaterThan(0.05);
  });
});
