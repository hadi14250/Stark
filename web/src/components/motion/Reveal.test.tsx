// @vitest-environment jsdom
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithIntl as render, screen, cleanup } from "@/test/render";
import { Reveal } from "./Reveal";
import { ClipReveal } from "./reveals";
import { WordsReveal, LineReveal } from "./WordsReveal";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * THE ONE RULE, AND WHY IT IS THE ONLY THING THIS FILE CHECKS.
 *
 * This site shipped invisible content three times, for three unrelated reasons:
 * a reveal with no fail-safe for an observer that never fired; clip-path frames
 * that were invalid CSS so the browser discarded all of them; and a play signal
 * withheld behind an entrance gate. Every individual fix was correct and the
 * sections were still blank, because the architecture made "something went
 * wrong" and "hide this content forever" the same outcome.
 *
 * The tests that used to live here asserted the OPPOSITE of this rule — they
 * pinned `opacity: 0` on an unrevealed element as correct behaviour. They
 * passed the whole time. That is the shape of the mistake: the suite was
 * carefully protecting the mechanism that was hiding the content.
 *
 * So the rule now is: a reveal renders VISIBLE, always, and entering the
 * viewport only ever turns an animation on. Everything below checks that, from
 * both directions — rendered output, and the source of every reveal component.
 */

beforeEach(() => {
  // The failure being reproduced: an observer that exists and never fires.
  // Under the old architecture this was fatal. It must now be a no-op.
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
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Inline styles that would make an element invisible to a reader. */
function hidingStyle(el: HTMLElement): string | null {
  const s = el.style;
  if (s.opacity !== "" && Number(s.opacity) === 0) return `opacity: ${s.opacity}`;
  if (s.visibility === "hidden") return "visibility: hidden";
  if (s.display === "none") return "display: none";
  // A clip-path whose inset consumes 100% of an axis hides the element too.
  if (s.clipPath && /\b100%/.test(s.clipPath)) return `clip-path: ${s.clipPath}`;
  return null;
}

describe("a reveal never renders hidden content", () => {
  it("shows a block reveal when the observer never fires", () => {
    render(<Reveal>block content</Reveal>);
    const el = screen.getByText("block content");
    expect(hidingStyle(el), "Reveal hid its children").toBeNull();
  });

  it("shows a clip reveal when the observer never fires", () => {
    // The specific failure: a grid of photographs clipped to zero width,
    // present and correct in the DOM, invisible on screen. It read as broken
    // images rather than as a stalled animation, twice.
    const { container } = render(
      <ClipReveal>
        <span>photo</span>
      </ClipReveal>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(hidingStyle(wrapper), "ClipReveal hid its children").toBeNull();
    expect(screen.getByText("photo")).toBeDefined();
  });

  it("shows a heading when the observer never fires", () => {
    // This one renders the h1/h2 of thirteen sections across four pages. When
    // it holds, the site has no headings anywhere.
    const { container } = render(<WordsReveal text="Built to global standard" />);
    const heading = container.querySelector("h2") as HTMLElement;
    expect(hidingStyle(heading), "WordsReveal hid the heading").toBeNull();
    for (const word of Array.from(heading.querySelectorAll("span"))) {
      expect(hidingStyle(word as HTMLElement), "a word was hidden").toBeNull();
    }
    expect(heading.textContent).toContain("global");
  });

  it("shows a line reveal when the observer never fires", () => {
    render(<LineReveal>intro copy</LineReveal>);
    expect(hidingStyle(screen.getByText("intro copy"))).toBeNull();
  });

  it("survives having no IntersectionObserver at all", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Reveal>no observer</Reveal>);
    expect(hidingStyle(screen.getByText("no observer"))).toBeNull();
  });
});

describe("the hidden pose lives only in a keyframe", () => {
  const css = readFileSync(join(here, "../../styles/reveal.css"), "utf8");

  it("gives every reveal base class an empty rule", () => {
    /**
     * The guarantee is the EMPTINESS of the base classes. If someone adds
     * `opacity: 0` to `.reveal-fade` to "fix a flash", every one of the
     * guarantees above evaporates silently — the rendered tests still pass in
     * jsdom, because jsdom does not apply stylesheets.
     */
    const base = css.match(
      /\.reveal-clip,\s*\.reveal-fade,\s*\.reveal-line-x,\s*\.reveal-line-y,\s*\.reveal-word\s*\{([\s\S]*?)\}/,
    );
    expect(base, "the grouped base rule was renamed or removed").not.toBeNull();
    expect(base![1].trim(), "a base reveal class grew a hidden state").toBe("");
  });

  it("only ever hides inside an @keyframes from-state", () => {
    // Strip every keyframes block; nothing hiding may remain in what is left.
    const withoutKeyframes = css.replace(/@keyframes[^{]*\{[\s\S]*?\n  \}/g, "");
    expect(withoutKeyframes).not.toMatch(/opacity:\s*0\s*;/);
    expect(withoutKeyframes).not.toMatch(/inset\([^)]*100%/);
    expect(withoutKeyframes).not.toMatch(/scale[XY]?\(0\)/);
  });

  it("keeps every inset component explicitly united", () => {
    // The second blank-section bug: `inset(0 100% 0 0)` animated toward
    // `inset(0 0 0 0)` produced frames like `inset(0 47 0 0)` — a bare number
    // where CSS needs a length — so the browser discarded every frame. In CSS
    // keyframes the browser interpolates, not a string rebuilder, but a
    // unitless value is still a different type and will not interpolate.
    const insets = [...css.matchAll(/inset\(([^)]*)\)/g)].map((m) => m[1].trim());
    expect(insets.length).toBeGreaterThan(0);
    const bad = insets.filter((v) =>
      v.split(/\s+/).some((p) => !/^-?\d+(?:\.\d+)?%$/.test(p)),
    );
    expect(bad, `unitless inset components: ${JSON.stringify(bad)}`).toEqual([]);
  });
});

describe("no reveal component grows its own hiding mechanism", () => {
  /**
   * A structural guard, because each of the three incidents was a MISSING
   * safeguard rather than a wrong line — and each arrived in a different file.
   * Any component in this directory that reveals on scroll takes its class from
   * `useRevealOnce` and hides nothing itself.
   */
  const files = readdirSync(here).filter(
    (f) => f.endsWith(".tsx") && !f.includes(".test."),
  );

  it("has no reveal holding an initial hidden state in JS", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(join(here, file), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");
      // `initial={{ opacity: 0 }}` / `initial={{ clipPath: ... }}` is the
      // pattern that caused all three incidents.
      if (/initial=\{\{[^}]*(opacity:\s*0|clipPath)/.test(src)) {
        offenders.push(file);
      }
    }
    expect(
      offenders,
      `these hold a hidden state that only JS can undo: ${offenders}`,
    ).toEqual([]);
  });
});
