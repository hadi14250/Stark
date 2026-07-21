import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * ===========================================================================
 * NO ENGLISH BAKED INTO THE GALLERY COMPONENTS
 * ===========================================================================
 *
 * WHAT SHIPPED. `DetailOverlay` captioned its two info panels with hardcoded
 * `Best time to visit` and `Must-do activities` — the travel demo's headings,
 * carried into Stark unchanged and never once read. They rendered on every
 * project overlay, in BOTH locales, so an Arabic reader looking at a mattress
 * was told, in English, the best time to visit it. Its prev/next/close buttons
 * carried hardcoded English aria-labels too, which is the same bug where only
 * a screen-reader user can see it.
 *
 * WHY NOTHING CAUGHT IT. The content audit checked `en.json` and `ar.json`
 * exhaustively and enforced key parity between them — but this text was never
 * in either file. The audit's own summary claimed "a sweep of the components
 * found no hardcoded user-visible strings", and that claim was simply wrong.
 * Message-file coverage says nothing about strings that never reached the
 * message files, and this route is a port, so it is exactly where they hide.
 *
 * The route's fields were named `bestTime` and `activities` until this was
 * fixed, which is how the captions looked natural enough to survive review.
 */
describe("the gallery route has no hardcoded copy", () => {
  const files = readdirSync(here)
    .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"))
    .map((f) => [f, readFileSync(join(here, f), "utf8")] as const);

  it("reads every component (the scan is not silently empty)", () => {
    // A scan over zero files passes every assertion below it. This is the
    // guard on the guard.
    expect(files.length).toBeGreaterThan(5);
  });

  /** Strip comments and imports so prose in either can't trip the scan. */
  function code(src: string): string {
    return src
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/^import[\s\S]*?;$/gm, "");
  }

  it("renders no literal sentence as JSX text", () => {
    const offenders: string[] = [];
    for (const [name, src] of files) {
      // JSX text nodes: two or more consecutive words of letters between tags.
      // Single tokens (×, ‹, ›, {expr}) are not copy and are left alone.
      for (const m of code(src).matchAll(/>\s*([A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z][A-Za-z'-]*)+)\s*</g)) {
        offenders.push(`${name}: "${m[1]}"`);
      }
    }
    expect(
      offenders,
      "Hardcoded user-visible text. It must come from src/messages/*.json, or it ships in English to every locale.",
    ).toEqual([]);
  });

  it("hardcodes no accessible name", () => {
    const offenders: string[] = [];
    for (const [name, src] of files) {
      // aria-label="literal" / alt="literal" — but not aria-label={expr}.
      for (const m of code(src).matchAll(/(aria-label|alt|title|placeholder)=("([^"]*)")/g)) {
        if (m[3].trim() === "") continue; // alt="" is the correct decorative marker
        offenders.push(`${name}: ${m[1]}=${m[2]}`);
      }
    }
    expect(
      offenders,
      "Hardcoded accessible names. These are user-visible to exactly the people least able to work around them.",
    ).toEqual([]);
  });
});
