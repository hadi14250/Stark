// @vitest-environment jsdom
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { useEffect } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithIntl as render, act } from "@/test/render";
import { useRevealPlay } from "./useRevealPlay";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * THE REGRESSION THIS FILE EXISTS FOR.
 *
 * `ClipReveal`, `DrawLine` and `DrawLineY` shipped with a bare `whileInView`
 * and no fail-safe, while `Reveal` — the one that was actually in use — had
 * one, with a docblock explaining that a viewport observer which never fires
 * is a real condition here rather than a hypothetical.
 *
 * Nothing caught the difference because all three were UNUSED. The first time
 * `ClipReveal` was put on a page it did what an unrescued `whileInView` does
 * when the observer stays silent: kept its initial state forever. That initial
 * state is `clip-path: inset(0 100% 0 0)`, so a grid of photographs rendered
 * at zero width — present and correct in the DOM, invisible on screen. It read
 * as broken images, not as a stalled animation, which is why it survived a
 * green test suite, a clean typecheck and an SSR spot-check that confirmed the
 * markup and the images were all there.
 */

beforeEach(() => {
  vi.useFakeTimers();
  // The failure being reproduced: an observer that exists (Framer requires
  // one) and never fires.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds = [];
    },
  );
  Object.defineProperty(window, "innerHeight", { value: 800, writable: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const SHOWN = { clipPath: "inset(0 0 0 0)" };

/**
 * Probe the hook directly rather than asserting a rendered clip-path.
 *
 * Framer drives the final style through its own frame loop, which does not
 * advance meaningfully under fake timers — so a rendered-style assertion here
 * would fail whether or not the rescue works, and would be measuring framer
 * rather than the thing that was actually missing. What was missing is the
 * DECISION: "the observer has not fired, this element is on screen, animate it
 * anyway." That decision is this hook's whole job, so it is what gets pinned.
 */
function Probe({ top, bottom }: { top: number; bottom: number }) {
  const { ref, play } = useRevealPlay(SHOWN);
  // Recorded in an effect rather than during render: assigning to an outer
  // variable while rendering is a side effect, and it is the exact class of
  // impurity the rest of this codebase is being cleaned of.
  useEffect(() => {
    seen = play;
  });
  return (
    <div
      ref={(el) => {
        if (el) {
          ref.current = el;
          vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
            top,
            bottom,
            left: 0,
            right: 100,
            width: 100,
            height: bottom - top,
            x: 0,
            y: top,
            toJSON: () => ({}),
          } as DOMRect);
        }
      }}
    />
  );
}

let seen: Record<string, unknown> = {};

describe("a reveal never gets stuck in its initial state", () => {
  it("animates an on-screen element when the observer never fires", async () => {
    render(<Probe top={100} bottom={300} />);

    // Before the rescue it is waiting on the viewport, which is correct — the
    // fail-safe is a rescue, not the primary path.
    expect(seen).toHaveProperty("whileInView");
    expect(seen).not.toHaveProperty("animate");

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    // THIS is the assertion that matters. Without it the element keeps its
    // initial state forever: opacity 0 for a fade, and for ClipReveal
    // `inset(0 100% 0 0)` — a grid of photographs clipped to zero width, which
    // reads as broken images rather than as a stalled animation.
    expect(seen).toHaveProperty("animate", SHOWN);
  });

  it("does NOT rescue an element below the fold", async () => {
    // The other half of the rule. A fail-safe that fires for off-screen
    // elements does not rescue a broken observer, it replaces a working one —
    // and pre-reveals the whole document, so scrolling animates nothing.
    render(<Probe top={3000} bottom={3200} />);
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });
    expect(seen).not.toHaveProperty("animate");
  });
});

describe("clip-path values can actually be interpolated", () => {
  /**
   * THE SECOND TIME THIS SECTION SHIPPED BLANK, and the reason the first fix
   * did not catch it: the fail-safe above is about WHETHER the animation is
   * told to run. This is about whether the frames it paints are valid CSS.
   *
   * `inset(0 100% 0 0)` -> `inset(0 0 0 0)` looks obviously correct and is
   * completely broken. Framer animates a string property by extracting its
   * numbers and rebuilding the string from a template taken from the TARGET —
   * and that target has no `%` anywhere, so the frames come out as
   * `inset(0 47 0 0)`. A bare number is not a valid length, the browser drops
   * the whole declaration and keeps the last valid one, which is the fully
   * clipped initial state. The animation runs at full speed and the element
   * never changes.
   *
   * The rule that prevents it: every component of every inset() here carries a
   * unit, so the target's template has one for each slot. Checked on the source
   * because the failure is invisible to a rendered assertion in jsdom — framer's
   * frame loop does not advance, which is exactly how it slipped through.
   */
  // Comments are stripped first: the docblock in reveals.tsx quotes the broken
  // pair verbatim to explain it, and a guard that fails on its own
  // documentation trains people to delete the documentation.
  const src = readFileSync(join(here, "reveals.tsx"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  const insets = [...src.matchAll(/inset\(([^)]*)\)/g)].map((m) => m[1].trim());

  it("has clip-path values to check", () => {
    // Guards the guard: a regex that silently matches nothing passes forever.
    expect(insets.length).toBeGreaterThan(0);
  });

  it("gives every inset component an explicit unit", () => {
    const bad = insets.filter((v) =>
      v.split(/\s+/).some((part) => !/^-?\d+(?:\.\d+)?(?:%|px|r?em)$/.test(part)),
    );
    expect(
      bad,
      `these mix unitless numbers with units, so Framer's rebuilt frames are invalid CSS: ${JSON.stringify(bad)}`,
    ).toEqual([]);
  });

  it("uses the same unit across a whole inset", () => {
    // Mixing px and % between slots produces frames that are valid but wrong.
    const mixed = insets.filter((v) => {
      const units = new Set(v.split(/\s+/).map((p) => p.replace(/^-?\d+(?:\.\d+)?/, "")));
      return units.size > 1;
    });
    expect(mixed).toEqual([]);
  });
});

describe("every holding reveal shares one play signal", () => {
  /**
   * A structural guard, because the bug was not a wrong line — it was a
   * MISSING one, in a file nobody was looking at. Any component that holds an
   * `initial` state and waits for the viewport has to take its cue from
   * `useRevealPlay`; growing a private `whileInView` is how these drifted
   * apart the first time.
   */
  const files = readdirSync(here).filter(
    (f) => (f.endsWith(".tsx") || f.endsWith(".ts")) && !f.includes(".test."),
  );

  it("has no reveal component with a hand-rolled whileInView", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(join(here, file), "utf8");
      // The hook is the sanctioned home for the literal, so skip it.
      if (file === "useRevealPlay.ts") continue;
      if (/whileInView[=:]/.test(src) && !/useRevealPlay/.test(src)) {
        offenders.push(file);
      }
    }
    expect(offenders, `these hold an initial state with no fail-safe: ${offenders}`).toEqual(
      [],
    );
  });
});
