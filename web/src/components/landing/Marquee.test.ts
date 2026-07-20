import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "Marquee.tsx"), "utf8");
const outlineCss = readFileSync(join(here, "../../styles/outline-type.css"), "utf8");
const en = JSON.parse(readFileSync(join(here, "../../messages/en.json"), "utf8"));
const ar = JSON.parse(readFileSync(join(here, "../../messages/ar.json"), "utf8"));

describe("the band's solid/hollow rhythm survives the seam", () => {
  it("has an even number of watchwords in every locale", () => {
    /**
     * The alternation is `i % 2`, and the track is two copies of the phrase
     * list end to end. With an ODD count the last phrase of one copy and the
     * first of the next both land on the same parity, so two identically
     * treated phrases sit side by side exactly at the seam — which is the one
     * place a reader's eye is already looking for the join.
     *
     * A locale can legitimately have a different number of words from
     * another; what it cannot have is an odd one.
     */
    for (const [locale, messages] of [
      ["en", en],
      ["ar", ar],
    ] as const) {
      const words = messages.landing.marquee.words as string[];
      expect(words.length, `${locale} has an odd number of watchwords`).toBeGreaterThan(0);
      expect(words.length % 2, `${locale} has an odd number of watchwords`).toBe(0);
    }
  });

  it("alternates by absolute index rather than per copy", () => {
    // `words.map((word, i) => … i % 2 …)` inside the per-copy renderer is what
    // makes the parity continuous across copies. Resetting a counter per copy
    // would reintroduce the doubled phrase at the seam.
    expect(src).toMatch(/words\.map\(\(word, i\)/);
    expect(src).toMatch(/i % 2 === 1 \? "outline-type"/);
  });
});

describe("hollow type degrades to something readable", () => {
  it("never leaves text transparent without a stroke to draw it", () => {
    // `color: transparent` is only survivable while the stroke renders. Each
    // place that turns the fill off must be paired with a rule that turns it
    // back on where the stroke will not apply — Arabic, unsupporting engines,
    // forced colours. Transparent text with no stroke is invisible text.
    expect(outlineCss).toMatch(/\[lang="ar"\] \.outline-type[\s\S]*?color:/);
    expect(outlineCss).toMatch(/@supports not \(-webkit-text-stroke[\s\S]*?color:/);
    expect(outlineCss).toMatch(/forced-colors: active[\s\S]*?color:/);
  });

  it("does not stroke Arabic", () => {
    // Cursive with hairline joins traced at display size reads as a rendering
    // fault. The locale gets low-opacity solid type instead.
    const arabic = outlineCss.match(/\[lang="ar"\] \.outline-type \{([\s\S]*?)\}/)?.[1] ?? "";
    expect(arabic).toMatch(/-webkit-text-stroke:\s*0/);
    expect(arabic).toMatch(/opacity:/);
  });
});

describe("the ticker still loops seamlessly", () => {
  it("sizes the track to its content", () => {
    // The loop translates -50%, which is half the track. Wrapping the track in
    // ScrollDrift put it inside a block parent, where it would otherwise size
    // to the VIEWPORT — and half a viewport is not half the phrase list, so
    // the seam would land mid-word.
    expect(src).toMatch(/className="flex w-max flex-none flex-nowrap[^"]*animate-marquee/);
  });

  it("renders exactly two copies, one of them hidden from assistive tech", () => {
    expect(src).toMatch(/\[0, 1\]\.map\(pass\)/);
    expect(src).toMatch(/aria-hidden=\{copy === 1\}/);
  });
});
