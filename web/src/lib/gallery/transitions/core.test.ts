import { describe, it, expect } from "vitest";
import { mirrorDir, opposite, type PushDir } from "./core";
import { DEFAULT_CONFIG } from "../config";

describe("mirrorDir — RTL", () => {
  it("flips the horizontal pair only", () => {
    expect(mirrorDir("left", true)).toBe("right");
    expect(mirrorDir("right", true)).toBe("left");
    // Writing mode has no bearing on the vertical axis. Flipping up/down here
    // would make cards fall upwards in Arabic.
    expect(mirrorDir("up", true)).toBe("up");
    expect(mirrorDir("down", true)).toBe("down");
  });

  it("is the identity in LTR", () => {
    for (const d of ["up", "down", "left", "right"] as PushDir[]) {
      expect(mirrorDir(d, false)).toBe(d);
    }
  });

  it("is its own inverse", () => {
    for (const d of ["up", "down", "left", "right"] as PushDir[]) {
      expect(mirrorDir(mirrorDir(d, true), true)).toBe(d);
    }
  });

  it("mirrors the whole shipped direction map without collapsing it", () => {
    // Regression guard for the real bug: before this, PushDir was physical and
    // gridDir was hardcoded "left"/"right", so cards pushed the same absolute
    // direction in both languages and disagreed with the mirrored flexbox
    // layout — "Next" pushed content the way an Arabic reader reads backwards.
    const map = DEFAULT_CONFIG.push.directionMap;
    const mirrored = Object.fromEntries(
      Object.entries(map).map(([k, v]) => [k, mirrorDir(v, true)]),
    );
    // every horizontal entry moved…
    const horiz = Object.entries(map).filter(([, v]) => v === "left" || v === "right");
    expect(horiz.length).toBeGreaterThan(0);
    for (const [k, v] of horiz) expect(mirrored[k]).toBe(opposite(v as PushDir));
    // …and every vertical entry did not.
    for (const [k, v] of Object.entries(map)) {
      if (v === "up" || v === "down") expect(mirrored[k]).toBe(v);
    }
  });
});
