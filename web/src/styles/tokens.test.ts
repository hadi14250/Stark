import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import { color, ease } from "./tokens";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "tokens.css"), "utf8");

/** Pull a `--name: value;` declaration out of the CSS text. */
function cssVar(name: string): string {
  const m = css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  if (!m) throw new Error(`CSS var ${name} not found in tokens.css`);
  return m[1].trim().toLowerCase();
}

describe("token parity: tokens.ts mirrors tokens.css", () => {
  // Map each TS color key to its CSS primitive var name.
  const colorMap: Record<keyof typeof color, string> = {
    greenForest: "--green-forest",
    greenLogo: "--green-logo",
    greenDeep1: "--green-deep-1",
    greenDeep2: "--green-deep-2",
    greenDeep3: "--green-deep-3",
    cream: "--cream",
    creamCard: "--cream-card",
    tan1: "--tan-1",
    tan2: "--tan-2",
    tan3: "--tan-3",
    tan4: "--tan-4",
    inkCreamStrong: "--ink-cream-strong",
    inkCreamBody: "--ink-cream-body",
    inkCreamMuted: "--ink-cream-muted",
    inkGreenStrong: "--ink-green-strong",
    inkGreenBody: "--ink-green-body",
    inkGreenMuted: "--ink-green-muted",
    brandBlue: "--brand-blue",
    brandSiesta: "--brand-siesta",
    brandSiestaAccent: "--brand-siesta-accent",
  };

  for (const [key, cssName] of Object.entries(colorMap)) {
    it(`color.${key} === ${cssName}`, () => {
      expect(color[key as keyof typeof color].toLowerCase()).toBe(
        cssVar(cssName),
      );
    });
  }

  const easeMap: Record<keyof typeof ease, string> = {
    standard: "--ease-standard",
    wood: "--ease-wood",
    wipe: "--ease-wipe",
    line: "--ease-line",
    cushion: "--ease-cushion",
  };

  for (const [key, cssName] of Object.entries(easeMap)) {
    it(`ease.${key} === ${cssName}`, () => {
      const nums = cssVar(cssName)
        .replace(/cubic-bezier\(|\)/g, "")
        .split(",")
        .map((n) => Number(n.trim()));
      expect(nums).toEqual([...ease[key as keyof typeof ease]]);
    });
  }
});
