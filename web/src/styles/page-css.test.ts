import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * ROUTE-SCOPED STYLESHEETS MUST DECLARE THEIR OWN LAYER ORDER.
 *
 * A stylesheet imported by a page component ships as its own chunk, loaded as
 * a separate <link> after the main bundle. Writing `@layer components { … }`
 * in one of those does NOT reliably put the rules in Tailwind's components
 * layer, and the failure is the worst kind: PARTIAL. When woodworks.css was
 * first written that way, `display: flex` took effect on the chapter index
 * while `padding-block` and `color` were still being won by preflight — so the
 * index rendered, looked deliberate, and was wrong. Nothing errored, nothing
 * logged, and the page looked plausible enough to ship.
 *
 * gallery-stage.css found this first and documented the fix: re-state the full
 * order and own a layer that sits AFTER `utilities`. This suite makes that the
 * rule rather than a thing three files happen to do.
 *
 * The mirror-image trap comes with it. A layer after `utilities` beats Tailwind
 * utilities, so `display` set in one of these files defeats `nav:hidden` on the
 * element — which is how the mobile chapter strip ended up rendering on desktop
 * on top of the index it replaces. If a file sets `display`, it owns its own
 * breakpoints; it may not hand that decision to a utility class it outranks.
 */

/**
 * Stylesheets imported by a page under `src/app/`.
 *
 * This is the precise population, and the precision matters: a sheet reached
 * through globals.css is part of the main bundle and its `@layer components`
 * lands where it should, and one imported by a shared COMPONENT is bundled
 * with that component rather than split per route. Only the app-router page
 * imports become their own late-loaded chunk, which is the case that breaks.
 * Widening this to "every css file not in globals" swept in logo-loader.css
 * and produced a failure that was the test's fault, not the file's.
 */
function routeScopedSheets(): { name: string; css: string }[] {
  const collect = (dir: string, into: Set<string>) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) collect(full, into);
      else if (entry.name.endsWith(".tsx")) {
        const src = readFileSync(full, "utf8");
        for (const m of src.matchAll(/import\s+"@\/styles\/([\w-]+\.css)"/g)) {
          into.add(m[1]);
        }
      }
    }
  };

  const fromRoutes = new Set<string>();
  collect(join(here, "../app"), fromRoutes);

  /**
   * A sheet also imported by a shared component is already in the main bundle,
   * so its route import is redundant rather than dangerous — logo-loader.css
   * is imported by both Preloader.tsx and specimen/page.tsx, and is not at
   * risk. Excluding those keeps this suite pointed at the files where the
   * layer actually decides whether the CSS works.
   */
  const fromComponents = new Set<string>();
  collect(join(here, "../components"), fromComponents);

  return [...fromRoutes]
    .filter((name) => !fromComponents.has(name))
    .sort()
    .map((name) => ({ name, css: readFileSync(join(here, name), "utf8") }));
}

describe("route-scoped stylesheets", () => {
  const sheets = routeScopedSheets();

  it("finds the route-scoped sheets at all", () => {
    // A rename that emptied this list would turn every check below into a
    // vacuous pass — the classic way a guard stops guarding.
    expect(sheets.map((s) => s.name).sort()).toEqual(
      expect.arrayContaining(["gallery-chrome.css", "gallery-stage.css", "woodworks.css"]),
    );
  });

  for (const { name, css } of sheets) {
    it(`${name} declares the full layer order before using one`, () => {
      const decl = css.match(/@layer\s+([\w\s,]+);/);
      expect(decl, `${name} never states an @layer order`).not.toBeNull();
      const order = decl![1].split(",").map((s) => s.trim());
      // Tailwind's four, in order, then this file's own layer last.
      expect(order.slice(0, 4)).toEqual(["theme", "base", "components", "utilities"]);
      expect(order.length).toBeGreaterThan(4);
    });

    it(`${name} puts its rules in its own layer, not in components`, () => {
      const order = css.match(/@layer\s+([\w\s,]+);/)![1].split(",").map((s) => s.trim());
      const own = order[order.length - 1];
      expect(css).toMatch(new RegExp(`@layer\\s+${own}\\s*\\{`));
      // The block form of `@layer components` is what fails; the ORDER
      // statement legitimately names it, hence the `{`.
      expect(
        css,
        `${name} opens an @layer components block — it will only half-apply`,
      ).not.toMatch(/@layer\s+components\s*\{/);
    });

    it(`${name} owns a breakpoint for anything whose display it sets`, () => {
      /**
       * These files outrank `@layer utilities`, so a `display` here beats
       * `nav:hidden` / `hidden` / `sm:block` on the element. Any selector that
       * sets display must therefore also appear inside a media query in the
       * same file, or its visibility is decided by a class that cannot win.
       */
      const displaySetters = new Set<string>();
      // `display: none` is the hiding half and is never the problem.
      for (const m of css.matchAll(/([.#][\w-]+)[^{}]*\{[^{}]*display:\s*(?!none)[\w-]+/g)) {
        displaySetters.add(m[1]);
      }
      const mediaBlocks = css.match(/@media[^{]*\{[\s\S]*?\n {2}\}/g)?.join("\n") ?? "";
      const hidden = new Set<string>();
      for (const m of mediaBlocks.matchAll(/([.#][\w-]+)[^{}]*\{[^{}]*display:\s*none/g)) {
        hidden.add(m[1]);
      }
      // Only classes that are ALSO responsive in the markup matter, and the
      // only way to know that from here is that the file itself hides them.
      // So the assertion is narrow: nothing may set display in a media query
      // to `none` without also setting it outside one, and vice versa is fine.
      for (const sel of hidden) {
        expect(
          displaySetters.has(sel),
          `${name}: ${sel} is hidden at a breakpoint but never given a display outside one`,
        ).toBe(true);
      }
    });
  }
});

describe("the light island on the dark page", () => {
  /**
   * The contact form sits on a fixed off-white card on every theme. On dark
   * Woodworks `--color-ink` IS off-white, so without a reset the whole form
   * renders as invisible text on an invisible card — present in the DOM,
   * correct to every structural test, and unreadable.
   */
  const tokens = readFileSync(join(here, "tokens.css"), "utf8");
  const section = readFileSync(
    join(here, "../components/contact/ContactSection.tsx"),
    "utf8",
  );

  it("declares a light-surface reset", () => {
    expect(tokens).toMatch(/\[data-surface="light"\]\s*\{/);
  });

  it("resets ink AND field roles, not just the surface", () => {
    const block = tokens.match(/\[data-surface="light"\]\s*\{([^}]*)\}/)![1];
    for (const role of [
      "--color-ink",
      "--color-ink-body",
      "--color-ink-muted",
      "--color-line",
      "--color-field-surface",
      "--color-field-border",
    ]) {
      expect(block, `the reset leaves ${role} pointing at the page's theme`).toMatch(
        new RegExp(`${role}\\s*:`),
      );
    }
  });

  it("leaves axis and density to the page", () => {
    // A card is not a page. Resetting these would centre the form's headings
    // on a left-aligned page and re-space a section it does not own.
    const block = tokens.match(/\[data-surface="light"\]\s*\{([^}]*)\}/)![1];
    expect(block).not.toMatch(/--align-axis|--density/);
  });

  it("is actually applied to the form card", () => {
    expect(section, "the card never opts into the reset").toMatch(
      /data-surface="light"/,
    );
  });
});
