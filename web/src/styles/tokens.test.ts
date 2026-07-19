import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import { color, ease, easeCss, duration } from "./tokens";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "tokens.css"), "utf8");

/** Pull a `--name: value;` declaration out of the CSS text. */
function cssVar(name: string): string {
  const m = css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  if (!m) throw new Error(`CSS var ${name} not found in tokens.css`);
  return m[1].trim().toLowerCase();
}

/** camelCase key → --kebab-case CSS name. `green500` → `--green-500`. */
function toCssName(key: string): string {
  return (
    "--" +
    key
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/([a-zA-Z])(\d)/g, "$1-$2")
      .toLowerCase()
  );
}

describe("token parity: tokens.ts mirrors tokens.css", () => {
  for (const key of Object.keys(color) as (keyof typeof color)[]) {
    const cssName = toCssName(key);
    it(`color.${key} === ${cssName}`, () => {
      expect(color[key].toLowerCase()).toBe(cssVar(cssName));
    });
  }

  for (const key of Object.keys(ease) as (keyof typeof ease)[]) {
    const cssName = `--ease-${key}`;
    it(`ease.${key} === ${cssName}`, () => {
      const nums = cssVar(cssName)
        .replace(/cubic-bezier\(|\)/g, "")
        .split(",")
        .map((n) => Number(n.trim()));
      expect(nums).toEqual([...ease[key]]);
    });

    it(`easeCss.${key} matches ease.${key}`, () => {
      const nums = easeCss[key]
        .replace(/cubic-bezier\(|\)/g, "")
        .split(",")
        .map((n) => Number(n.trim()));
      expect(nums).toEqual([...ease[key]]);
    });
  }

  for (const key of Object.keys(duration) as (keyof typeof duration)[]) {
    const cssName = `--dur-${key}`;
    it(`duration.${key} === ${cssName}`, () => {
      // CSS is authored in seconds ("0.45s"); the TS mirror is unitless seconds
      // because that is what Framer's `duration` expects.
      expect(`${duration[key]}s`).toBe(cssVar(cssName));
    });
  }
});

describe("primitives are literals, not var() chains", () => {
  /**
   * The TS mirror can only be correct if the CSS side is a hex literal. A
   * primitive that becomes `var(--something-else)` — as every legacy alias did
   * during the palette migration — would make the parity assertions above
   * compare a hex to the string "var(...)" and fail confusingly. This asserts
   * the precondition directly so the failure names the real cause.
   */
  for (const key of Object.keys(color) as (keyof typeof color)[]) {
    const cssName = toCssName(key);
    it(`${cssName} is a hex literal`, () => {
      expect(cssVar(cssName)).toMatch(/^#[0-9a-f]{3,8}$/);
    });
  }
});
