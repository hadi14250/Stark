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

  it("only ever hides on .is-armed or inside an @keyframes from-state", () => {
    /**
     * THE RULE MOVED, DELIBERATELY, AND THIS IS THE RECORD OF WHY.
     *
     * It used to read "only ever hides inside an @keyframes from-state" — no
     * hidden pose could exist as a rule at all. That bought a real guarantee
     * and charged a real price: an element that starts visible and later
     * animates from a hidden pose MUST visibly snap backwards first. The
     * client reported it ("why does the picture appear to snap then slide
     * in") and measurement agreed — 48 of 56 reveals on /en/woodworks were
     * visible for 120-360px of scrolling before yanking.
     *
     * The snap and the old guarantee were the same fact. So `.is-armed` now
     * exists, and the safety argument moved from "nothing can ever be hidden"
     * to "nothing can be hidden except by the observer, off screen, with two
     * ways out and a backstop". See useRevealOnce.ts.
     *
     * What this test still forbids is the thing that actually caused the
     * three blank-section incidents: a hidden pose reachable WITHOUT the
     * observer having put it there. So hiding is legal on `.is-armed` and
     * nowhere else.
     *
     * ONE DOCUMENTED EXCEPTION: `.ledger-photo` is the Turnkey row's hover
     * photograph, whose resting state IS "clipped away" because the section's
     * correct resting state is a row with no photograph at all. That is the
     * opposite of the bug this rule exists for. It is enforced separately in
     * TurnkeyLedger.test.ts: the layer sits at z-index -1 behind the copy and
     * the copy is never inside the clipped element.
     */
    const reveals = css
      .replace(/@keyframes[^{]*\{[\s\S]*?\n  \}/g, "")
      .replace(/\.ledger-[\s\S]*$/, "")
      // Drop whole rules whose selector is an armed pose.
      .replace(/[^{}]*\.is-armed[^{}]*\{[^}]*\}/g, "");

    expect(reveals).not.toMatch(/opacity:\s*0\s*;/);
    expect(reveals).not.toMatch(/inset\([^)]*100%/);
    expect(reveals).not.toMatch(/scale[XY]?\(0\)/);
  });

  it("keeps every armed pose identical to the keyframe it hands over to", () => {
    /**
     * If the armed pose and the animation's `from` disagree on so much as a
     * blur radius, the element JUMPS the instant the animation takes over —
     * the same snap the armed pose was introduced to remove, just smaller and
     * harder to spot. They are two hand-written copies of one state, which is
     * exactly the shape of thing that drifts during a later edit.
     */
    const declarations = (body: string) => {
      const out = new Map<string, string>();
      for (const line of body.split(";")) {
        const i = line.indexOf(":");
        if (i === -1) continue;
        out.set(line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/\s+/g, " "));
      }
      return out;
    };

    const ruleBody = (selector: string) => {
      const m = css.match(
        new RegExp(`${selector.replace(/[.[\]*>"()]/g, "\\$&")}\\s*\\{([^}]*)\\}`),
      );
      expect(m, `armed rule missing: ${selector}`).not.toBeNull();
      return declarations(m![1]);
    };

    const keyframeFrom = (name: string) => {
      const m = css.match(new RegExp(`@keyframes ${name}\\s*\\{\\s*from\\s*\\{([^}]*)\\}`));
      expect(m, `keyframe missing a from-state: ${name}`).not.toBeNull();
      return declarations(m![1]);
    };

    const pairs: Array<[string, string, boolean]> = [
      // [armed selector, keyframe, must cover every property in `from`]
      [".reveal-clip.is-armed", "reveal-clip-in", true],
      ['[dir="rtl"] .reveal-clip.is-armed', "reveal-clip-in-rtl", true],
      [".reveal-fade.is-armed", "reveal-fade-in", true],
      // RTL only overrides `transform`; opacity and filter come from the rule
      // above it, so it is checked for agreement rather than for completeness.
      ['[dir="rtl"] .reveal-fade.is-armed', "reveal-fade-in-rtl", false],
      [".reveal-word.is-armed > span", "reveal-word-in", true],
      [".reveal-line-x.is-armed", "reveal-line-x-in", true],
      [".reveal-line-y.is-armed", "reveal-line-y-in", true],
    ];

    for (const [selector, keyframe, complete] of pairs) {
      const armed = ruleBody(selector);
      const from = keyframeFrom(keyframe);

      for (const [prop, value] of armed) {
        if (prop === "transform-origin") continue; // lives on .is-revealed
        expect(from.get(prop), `${selector} { ${prop} } is not in ${keyframe}`).toBe(value);
      }

      if (complete) {
        for (const prop of from.keys()) {
          expect(
            armed.has(prop),
            `${keyframe} animates ${prop} but ${selector} does not set it`,
          ).toBe(true);
        }
      }
    }
  });

  it("lets a reduced-motion reader reach no armed pose at all", () => {
    /**
     * `.is-revealed` sets `animation: none` under reduced motion. If an armed
     * pose applied there too, an armed element would have nothing left to
     * remove it and would stay hidden forever — the blank-section bug, back
     * again, and visible only to readers who asked for less motion, which is
     * the group least likely to be in front of us when we look.
     *
     * Subtraction rather than override: the poses are DEFINED inside
     * `no-preference`, so for that reader the rules do not exist.
     */
    // Comments first: the block above this one discusses `.is-armed` in prose,
    // and a selector scan cannot tell that from a rule.
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");

    const block = rules.match(
      /@media \(prefers-reduced-motion: no-preference\)\s*\{([\s\S]*?)\n  \}/,
    );
    expect(block, "the no-preference block was removed or reshaped").not.toBeNull();

    const armedRules = [...rules.matchAll(/[^{}\n]*\.is-armed[^{}]*\{/g)].map((m) =>
      m[0].trim(),
    );
    expect(armedRules.length, "no armed poses found at all").toBeGreaterThan(0);
    for (const rule of armedRules) {
      expect(
        block![1].includes(rule),
        `${rule} sits outside the no-preference block`,
      ).toBe(true);
    }
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

  it("never ships markup that is already armed", () => {
    /**
     * THE ONE WAY `.is-armed` COULD STILL BLANK A SECTION. Every protection in
     * useRevealOnce.ts rests on arming being downstream of the observer: no
     * observer, no hidden pose. A component that writes `is-armed` into its own
     * className routes around all of it and ships content hidden in the HTML,
     * where only JS can ever bring it back — which is the exact failure this
     * whole file exists to make unreachable.
     *
     * Searched across the entire source tree rather than this directory, since
     * the class name is usable from anywhere.
     */
    const src = join(here, "../..");
    const offenders: string[] = [];

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(p);
        } else if (/\.tsx?$/.test(entry.name) && !entry.name.includes(".test.")) {
          const text = readFileSync(p, "utf8");
          // Adding the class is the hook's job; anything else is markup.
          const uses = text.includes("is-armed");
          const isTheHook = p.endsWith("useRevealOnce.ts");
          if (uses && !isTheHook) offenders.push(entry.name);
        }
      }
    };
    walk(src);

    expect(
      offenders,
      `these arm an element outside the observer: ${offenders}`,
    ).toEqual([]);
  });

  it("keeps the bottom-of-document backstop", () => {
    /**
     * The last line of defence: at the end of the page everything still armed
     * is revealed unconditionally, so "armed forever" has no path to exist.
     * It is load-bearing rather than theoretical — before the reading line was
     * introduced, one reveal on Woodworks (the 06 Hardware card) never fired
     * at all, and under this architecture that would have been a hidden card.
     *
     * Deleting it would look like removing dead code. It is not.
     */
    const hook = readFileSync(join(here, "useRevealOnce.ts"), "utf8");
    expect(hook, "the at-bottom backstop is gone").toMatch(/scrollHeight/);
    expect(hook, "the backstop no longer forces a reveal").toMatch(/atBottom/);
  });
});
