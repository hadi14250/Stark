import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "..", "..");

/**
 * THE BUG THIS FILE EXISTS FOR, AND WHY IT SURVIVED SO LONG.
 *
 * `useMotionConfig` called Framer's `useReducedMotion()`. That hook answers
 * from `matchMedia` on the client's first render, while the server has no way
 * to know the answer — so every component branching on `reduce` rendered a
 * different tree on the server than on the client, and React reported
 * "Hydration failed because the server rendered HTML didn't match" on /,
 * /woodworks, /mattresses and /gallery. React then discarded the tree and
 * rebuilt it, and Framer followed with "target ref is defined but not
 * hydrated" because the elements its scroll listeners had measured were gone.
 *
 * It survived because it only happened for visitors who had asked for reduced
 * motion. Nobody developing the site had the OS setting on, every page looked
 * perfect, and the entire test suite passed — the failure was invisible to
 * exactly the people who could have found it, and guaranteed for a group who
 * are already telling the browser they are sensitive to motion.
 *
 * The fix is `useSyncExternalStore` with an explicit server snapshot, which
 * makes server and hydrating render agree by construction rather than by luck.
 * These guards keep any future component from reintroducing the pattern.
 */

/** Every .ts/.tsx file under src/, excluding tests. */
function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== "node_modules") sourceFiles(full, out);
    } else if (/\.tsx?$/.test(entry) && !entry.includes(".test.")) {
      out.push(full);
    }
  }
  return out;
}

describe("reduced motion is read through one SSR-safe source", () => {
  const files = sourceFiles(src);

  it("nothing calls Framer's useReducedMotion directly", () => {
    const offenders = files.filter((f) => {
      const code = readFileSync(f, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");
      return /\buseReducedMotion\s*\(/.test(code);
    });
    expect(
      offenders.map((f) => f.replace(src, "src")),
      "these will mismatch on hydration for reduced-motion visitors — use useMotionConfig()",
    ).toEqual([]);
  });

  it("useMotionConfig resolves the query through useMediaQuery", () => {
    const code = readFileSync(join(here, "useMotionConfig.ts"), "utf8");
    expect(code).toMatch(/useMediaQuery\(\s*"\(prefers-reduced-motion: reduce\)"\s*\)/);
  });

  it("useMediaQuery declares an explicit server snapshot", () => {
    /**
     * The third argument to useSyncExternalStore IS the fix. Without it React
     * throws during SSR; with a wrong one, hydration mismatches return in a
     * form that is harder to spot than the original.
     */
    const code = readFileSync(join(here, "useMediaQuery.ts"), "utf8");
    const call = code.match(/useSyncExternalStore\(([\s\S]*?)\n {2}\);/);
    expect(call, "useSyncExternalStore was replaced").not.toBeNull();
    const args = call![1].split(",");
    expect(args.length, "no server snapshot argument").toBeGreaterThanOrEqual(3);
    expect(args[2]).toMatch(/=>\s*false/);
  });

  it("keeps a CSS backstop so nothing moves while the flag catches up", () => {
    /**
     * The server snapshot says `reduce: false`, so a reduced-motion visitor is
     * briefly described as motion-on before the real value arrives. That is
     * only acceptable because CSS has already stopped the motion — this is the
     * rule that makes the one-frame window harmless, so it is pinned here
     * rather than left as a comment in a stylesheet.
     */
    const globals = readFileSync(join(src, "app/globals.css"), "utf8");
    const block = globals.match(
      /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/,
    );
    expect(block, "the global reduced-motion backstop is gone").not.toBeNull();
    expect(block![1]).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(block![1]).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
  });
});
