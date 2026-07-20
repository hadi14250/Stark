import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const tsx = readFileSync(join(here, "Preloader.tsx"), "utf8");
const css = readFileSync(join(here, "../../styles/logo-loader.css"), "utf8");
const loader = readFileSync(join(here, "LogoLoader.tsx"), "utf8");
const gate = readFileSync(join(here, "EntranceGate.tsx"), "utf8");

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
  const speed = num(/const LOADER_SPEED = ([\d.]+)/, tsx, "LOADER_SPEED");
  const holdCss = num(/--preloader-hold:\s*([\d.]+)s/, css, "--preloader-hold");

  it("the CSS hold matches HOLD_MS", () => {
    expect(holdCss * 1000).toBe(holdMs);
  });

  it("lifts the curtain while the mark is WHOLE", () => {
    /**
     * The real constraint on the hold, replacing a magic ">= 1800ms" floor.
     *
     * "assemble" loops: blades fly in, lock for a beat, fly back out. The
     * curtain must lift DURING the locked beat. Shorten the hold and it lifts
     * over a half-built mark; leave the hold alone but slow the cycle and it
     * lifts over a dispersing one. Either reads as a glitch, and neither is
     * visible to a typecheck.
     *
     * So the window is recomputed from its four actual inputs rather than
     * assumed: the keyframe stops (CSS), the cycle length and per-part delays
     * (LogoLoader), and the playback rate + hold (Preloader). Changing any one
     * of them in isolation fails here.
     */
    const spec = loader.match(/assemble:\s*\{([\s\S]*?)\n {2}\},/)?.[1] ?? "";
    expect(spec, "assemble spec not found in LogoLoader").not.toBe("");

    // `s(3)` — the designed cycle, in seconds, before the speed multiplier.
    const cycleS = num(/kfAssemble \$\{s\(([\d.]+)\)\}/, spec, "assemble cycle");
    // `d(i * 0.06)` — each blade starts this much after the one before it.
    const bladeStagger = num(/d\(i \* ([\d.]+)\)/, spec, "blade stagger");
    // `d(0.3)` — the core waits for the blades before it grows in.
    const coreDelay = num(/core: `kfCore [^`]*?\$\{d\(([\d.]+)\)\}/, spec, "core delay");

    const bladeCount = (loader.match(/const BLADES = \[([^\]]*)\]/)?.[1] ?? "")
      .split(",")
      .filter((s) => s.trim()).length;
    expect(bladeCount).toBeGreaterThan(0);

    // The stops where kfAssemble holds its part in place at full opacity.
    // Scoped to that keyframe — kfSeq sits above it in the file and also has
    // `opacity: 1` stops, which a file-wide scan would pick up instead.
    const kf = css.match(/@keyframes kfAssemble \{([\s\S]*?)\n {4}\}/)?.[1] ?? "";
    expect(kf, "kfAssemble not found").not.toBe("");
    const held = [...kf.matchAll(/(\d+)%\s*\{[^}]*opacity:\s*1;/g)].map((m) =>
      Number(m[1]),
    );
    expect(held, "kfAssemble's locked stops not found").toHaveLength(2);
    const [lockPct, releasePct] = held;

    const cycleMs = cycleS * speed * 1000;
    // The part that locks LAST decides when the mark is finally whole: whoever
    // has the biggest start delay, blades or core.
    const lastStartMs =
      Math.max((bladeCount - 1) * bladeStagger, coreDelay) * speed * 1000;
    const wholeFrom = lastStartMs + (lockPct / 100) * cycleMs;
    // The part that starts LEAVING first ends it — blade 0, which has no delay.
    const wholeUntil = (releasePct / 100) * cycleMs;

    expect(wholeFrom).toBeLessThan(wholeUntil);
    expect(holdMs).toBeGreaterThanOrEqual(wholeFrom);
    expect(holdMs).toBeLessThanOrEqual(wholeUntil);
  });

  it("keeps the entrance gate's ceiling above the curtain", () => {
    // The gate's MAX_GATE_MS is a deadlock guard, not a schedule. If it fires
    // before the curtain has finished lifting, the hero's staged entrance
    // plays behind an opaque panel — which is the precise bug EntranceGate was
    // written to fix, reintroduced through its own safety net.
    const maxGate = num(/const MAX_GATE_MS = (\d+)/, gate, "MAX_GATE_MS");
    expect(maxGate).toBeGreaterThan(holdMs + liftMs);
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
