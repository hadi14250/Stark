import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Every `var(--x)` in the codebase resolves to a declared `--x`.
 *
 * This exists because the redesign deletes two whole token families
 * (`--el-*` for the Element page, `--dz-*` for Dreamzy) while other files
 * still consume them, and a dangling `var()` fails SILENTLY: the property is
 * dropped, the element renders unstyled, and nothing in the build, the
 * typechecker or the previous 44 tests notices. The plan's Phase A1 originally
 * scheduled those deletions two phases before their consumers were removed,
 * which would have left two routes visibly broken with a green suite.
 *
 * Deliberately a text scan, not a browser assertion — it costs nothing and
 * catches the deletion at the moment it happens rather than at whatever
 * checkpoint someone next looks at that route.
 */

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..");

/** Names that are legitimately declared outside our CSS. */
const EXTERNAL = new Set([
  // next/font injects these at runtime (see src/styles/fonts.ts)
  "--font-sora",
  "--font-roboto",
  "--font-roboto-mono",
  "--font-plex-arabic",
  "--font-pt-serif",
  "--font-mulish",
  "--font-poppins",
]);

/**
 * Prefixes owned by a subtree that declares them on its own elements rather
 * than in a stylesheet. The gallery stage stamps its palette inline from
 * `themeVars()` and its structural vars from PushSlider's `stageStyle`.
 */
const RUNTIME_PREFIXES = ["--ed-", "--fs-", "--mx", "--my", "--mon"];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(p) && !/\.test\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

/**
 * Comments must be stripped before scanning. A comment explaining why a token
 * was removed necessarily names it — `/* was var(--font-dancing-script) *\/` —
 * and would otherwise be reported as a live consumer forever.
 */
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "");

const files = walk(SRC);
const all = files.map((f) => ({
  file: f,
  text: stripComments(readFileSync(f, "utf8")),
}));

/** Everything declared anywhere: `--name:` in CSS, or `"--name"` set inline in TSX. */
const declared = new Set<string>();
for (const { text } of all) {
  for (const m of text.matchAll(/(--[\w-]+)\s*:/g)) declared.add(m[1]);
  for (const m of text.matchAll(/\[?["'](--[\w-]+)["']/g)) declared.add(m[1]);
}

/** Everything consumed: `var(--name)`. */
const consumed = new Map<string, string[]>();
for (const { file, text } of all) {
  for (const m of text.matchAll(/var\(\s*(--[\w-]+)/g)) {
    const list = consumed.get(m[1]) ?? [];
    list.push(relative(SRC, file));
    consumed.set(m[1], list);
  }
}

describe("token consumers", () => {
  it("declares every custom property that is consumed via var()", () => {
    const dangling: string[] = [];
    for (const [name, where] of consumed) {
      if (declared.has(name)) continue;
      if (EXTERNAL.has(name)) continue;
      if (RUNTIME_PREFIXES.some((p) => name.startsWith(p))) continue;
      dangling.push(`${name}  ←  ${[...new Set(where)].join(", ")}`);
    }
    expect(dangling, `Undeclared custom properties:\n${dangling.join("\n")}`).toEqual([]);
  });

  it("scans a non-trivial slice of the codebase", () => {
    // Guards the guard: a bad glob would make the test above vacuously pass.
    expect(files.length).toBeGreaterThan(20);
    expect(consumed.size).toBeGreaterThan(30);
  });
});

/**
 * LETTER-SPACING IS A TOKEN, NEVER A LITERAL.
 *
 * The eyebrow tracking came down twice in one review round — 0.3em to 0.16em,
 * then 0.16em to 0.09em — because the client kept finding micro-labels whose
 * letters had drifted apart. The second pass only reached everything because
 * `--tracking-eyebrow` is a single dial.
 *
 * Except it was not, quite: four files had `tracking-[0.24em]`, one had
 * `tracking-[0.14em]` and the locale switcher had `tracking-[0.2em]`, all
 * written as Tailwind arbitrary values. Those did not move when the token
 * moved, which is exactly why the client was still reading over-spaced labels
 * in the footer and the gallery teaser after the first fix had "gone in".
 *
 * The switcher's was worse than inconsistent. Its label is always in the OTHER
 * language, so on the English page it applied 0.2em to Arabic — and tracking
 * does not merely widen cursive, it BREAKS THE JOINS between letters. That is
 * the same defect `[lang="ar"] { --tracking-eyebrow: 0 }` exists to prevent,
 * reintroduced by hardcoding past it.
 *
 * So: no arbitrary tracking values in components. Use `tracking-eyebrow` or
 * `tracking-display` and change the token.
 */
describe("letter-spacing comes from tokens, not from arbitrary values", () => {
  const offenders = files
    .filter((f) => /\.tsx?$/.test(f) && !f.includes(".test."))
    .flatMap((f) => {
      const src = readFileSync(f, "utf8");
      const hits = src.match(/tracking-\[[^\]]+\]/g) ?? [];
      return hits.map((h) => `${relative(SRC, f)}: ${h}`);
    });

  it("no component hardcodes a tracking value", () => {
    expect(offenders).toEqual([]);
  });

  it("the eyebrow tracking token is still declared, and still zeroed for Arabic", () => {
    const tokens = readFileSync(join(SRC, "styles/tokens.css"), "utf8");
    expect(tokens).toMatch(/--tracking-eyebrow:\s*[\d.]+em;/);
    // Cursive scripts must not be tracked at all — the joins break.
    const arabic = tokens.match(/\[lang="ar"\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    expect(arabic).toMatch(/--tracking-eyebrow:\s*0;/);
  });
});
