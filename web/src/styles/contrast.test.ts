import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Text colors clear WCAG AA (4.5:1) against the surface they sit on.
 *
 * This exists because draft 1 of the redesign plan assigned
 * `--color-ink-muted: #8D9D96` on `--color-surface: #FAF5EF` — about 2.4:1,
 * which fails AA at every size. It was caught by reading, not by tooling, and
 * the only reason it never shipped is that someone happened to check. Muted
 * ink is exactly the role where this recurs: it is *supposed* to be low
 * contrast, so "looks about right" is not a signal.
 *
 * The pairs below are declared per theme because Tier-3 overrides change both
 * sides — a ratio that passes on the green theme can fail on the graphite one.
 */

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "tokens.css"), "utf8");

/* ---------- color math ---------- */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** WCAG 2.1 relative luminance. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/* ---------- resolve a token to a literal hex ---------- */

/**
 * Follow `--a: var(--b)` chains inside a given block until a hex literal
 * falls out. `scope` is the selector whose block to read first (a Tier-3
 * theme), falling back to the global declarations.
 */
function resolve(name: string, scope?: string): string {
  const blocks: string[] = [];
  if (scope) {
    const m = css.match(
      new RegExp(`${scope.replace(/[[\]"=]/g, "\\$&")}\\s*\\{([^}]*)\\}`),
    );
    if (m) blocks.push(m[1]);
  }
  blocks.push(css);

  let current = name;
  for (let hop = 0; hop < 10; hop++) {
    let value: string | undefined;
    for (const block of blocks) {
      const m = block.match(new RegExp(`${current}\\s*:\\s*([^;]+);`));
      if (m) {
        value = m[1].trim();
        break;
      }
    }
    if (!value) throw new Error(`could not resolve ${current} (from ${name})`);
    if (value.startsWith("#")) return value;
    const ref = value.match(/var\(\s*(--[\w-]+)/);
    if (!ref) throw new Error(`${current} resolved to a non-hex value: ${value}`);
    current = ref[1];
  }
  throw new Error(`var() chain too deep for ${name}`);
}

/* ---------- the pairs that must hold ---------- */

const AA_TEXT = 4.5;

type Pair = { ink: string; on: string; scope?: string; label: string };

/** The three ink roles against both surfaces, for one theme. */
function inkPairs(scope: string | undefined, name: string): Pair[] {
  const out: Pair[] = [];
  for (const surface of ["--color-surface", "--color-surface-2"]) {
    for (const ink of ["--color-ink", "--color-ink-body", "--color-ink-muted"]) {
      out.push({
        label: `${name}: ${ink.replace("--color-", "")} on ${surface.replace("--color-", "")}`,
        ink,
        on: surface,
        scope,
      });
    }
  }
  return out;
}

const PAIRS: Pair[] = [
  ...inkPairs(undefined, "default"),
  ...inkPairs('[data-theme="home"]', "home"),
  ...inkPairs('[data-theme="woodworks"]', "woodworks"),
  ...inkPairs('[data-theme="mattresses"]', "mattresses"),
  ...inkPairs('[data-surface="dark"]', "dark"),
  /**
   * The light card that sits on the dark Woodworks page. Without this reset
   * the contact form renders off-white ink on an off-white card: present,
   * correct in the DOM, and invisible. This suite is what proves the reset
   * actually resets — a partial one (surface but not ink, say) would look
   * deliberate in the diff and be unreadable on screen.
   */
  ...inkPairs('[data-surface="light"]', "light island"),

  // Accent surfaces carrying text — the pill, the footer, the panel.
  {
    label: "ink on accent fill (pills)",
    ink: "--color-ink",
    on: "--color-accent",
  },
  {
    label: "dark: interactive (sage) on surface-2",
    ink: "--color-interactive",
    on: "--color-surface-2",
    scope: '[data-surface="dark"]',
  },
  {
    label: "home: interactive on surface",
    ink: "--color-interactive",
    on: "--color-surface",
    scope: '[data-theme="home"]',
  },
  {
    label: "woodworks: interactive on surface-2",
    ink: "--color-interactive",
    on: "--color-surface-2",
    scope: '[data-theme="woodworks"]',
  },
];

describe("WCAG AA contrast on text roles", () => {
  for (const p of PAIRS) {
    it(`${p.label}${p.scope ? ` [${p.scope}]` : ""} >= ${AA_TEXT}:1`, () => {
      const ink = resolve(p.ink, p.scope);
      const on = resolve(p.on, p.scope);
      const ratio = contrastRatio(ink, on);
      expect(
        Number(ratio.toFixed(2)),
        `${p.ink} (${ink}) on ${p.on} (${on}) = ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(AA_TEXT);
    });
  }

  it("the math agrees with known reference values", () => {
    // Guards the guard: a broken luminance function would pass everything.
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    // The exact failure this file exists to prevent.
    expect(contrastRatio("#8D9D96", "#FAF5EF")).toBeLessThan(AA_TEXT);
  });

  it("documents why sage is not the interactive colour on light surfaces", () => {
    const sage = resolve("--sage-500");
    const offWhite = resolve("--white-500");
    // 2.94:1 — fails AA text (4.5) AND the non-text UI floor (3.0), so sage can
    // be neither a link, nor a border, nor a focus ring on a light surface.
    expect(contrastRatio(sage, offWhite)).toBeLessThan(3.0);
    // It works on dark, which is where Tier 3 assigns it.
    expect(contrastRatio(sage, resolve("--green-800"))).toBeGreaterThanOrEqual(AA_TEXT);
    // And as a light FILL with ink on top, at the 300 step.
    expect(contrastRatio(resolve("--green-500"), resolve("--sage-300"))).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });
});
