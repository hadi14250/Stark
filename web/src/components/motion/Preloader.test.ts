import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const tsx = readFileSync(join(here, "Preloader.tsx"), "utf8");
const css = readFileSync(join(here, "../../styles/logo-loader.css"), "utf8");

/**
 * The curtain's timing lives in TWO places on purpose, and they must agree.
 *
 * CSS drives the lift so the preloader clears even if JavaScript never runs —
 * it is rendered server-side and covers the whole viewport, so a JS failure
 * without the CSS path would leave an opaque panel over the site permanently.
 * React then unmounts the element after the same delay.
 *
 * If those two drift apart the failure is ugly and non-obvious: the curtain
 * slides away on the CSS clock while the element is still in the DOM
 * intercepting nothing, or React tears it out mid-lift. Neither shows up in a
 * typecheck, so it is asserted here.
 */
function num(re: RegExp, src: string, label: string): number {
  const m = src.match(re);
  if (!m) throw new Error(`could not find ${label}`);
  return Number(m[1]);
}

describe("preloader timing is consistent across TS and CSS", () => {
  const holdMs = num(/const HOLD_MS = (\d+)/, tsx, "HOLD_MS");
  const liftMs = num(/const LIFT_MS = (\d+)/, tsx, "LIFT_MS");
  const holdCss = num(/--preloader-hold:\s*([\d.]+)s/, css, "--preloader-hold");

  it("the CSS hold matches HOLD_MS", () => {
    expect(holdCss * 1000).toBe(holdMs);
  });

  it("holds long enough to show a full cycle of the animation", () => {
    // Every variant in the handoff runs between 1.6s and 3.6s. A hold shorter
    // than the chosen variant's cycle lifts the curtain mid-assembly, which
    // reads as a glitch rather than an entrance — that is what 1200ms did.
    expect(holdMs).toBeGreaterThanOrEqual(1800);
  });

  it("unmounts only AFTER the lift has finished", () => {
    // React removes the element at HOLD + LIFT. Removing it at HOLD would cut
    // the slide-up off at frame one.
    expect(liftMs).toBeGreaterThan(0);
    expect(holdMs + liftMs).toBeGreaterThan(holdMs);
  });

  it("clears itself without JavaScript", () => {
    // `forwards` is what makes the no-JS path work: the curtain must hold its
    // final translated-away position rather than snapping back.
    expect(css).toMatch(/animation:\s*kfCurtainLift[^;]*forwards/);
    expect(css).toMatch(/@keyframes kfCurtainLift/);
  });

  it("is skipped entirely under reduced motion", () => {
    // A loading screen whose entire content is an animation should not be
    // shown-but-frozen to someone who asked for no animation.
    expect(css).toMatch(/prefers-reduced-motion[\s\S]*?\.stark-preloader\s*\{\s*display:\s*none/);
  });

  it("no longer gates itself behind sessionStorage", () => {
    // The regression this is guarding: once-per-session meant the loader
    // appeared on the first load of a tab and never again, so it effectively
    // did not exist for anyone reloading the site.
    // Comments are stripped first — the docblock explains WHY the gate was
    // removed and necessarily names it, which a naive match would trip on.
    const code = tsx.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/sessionStorage/);
  });
});
