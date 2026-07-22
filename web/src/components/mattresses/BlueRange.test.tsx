// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BlueRange } from "./BlueRange";
import { BLUE_MODELS, BLUE_MODEL_NAMES } from "./assets";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";

/**
 * ===========================================================================
 * THE ALT-TEXT GUARD
 * ===========================================================================
 *
 * THE BUG THIS WAS WRITTEN FOR, WHICH SHIPPED AND WAS CAUGHT BY LUCK.
 *
 * `models.alt` is a template with a `{name}` hole. next-intl reads `{name}` as
 * an ICU argument, so `t("models.alt")` does not return the template — it
 * fails and falls back to emitting the key. All eight images rendered with
 * `alt="mattresses.models.alt"`.
 *
 * Every signal said the page was fine. It type-checked. It rendered. The
 * pictures looked exactly right. No test failed, because no test looked. Alt
 * text is the one string on a page that nobody sighted ever sees, so the only
 * people affected were the people who could not check it themselves, and the
 * defect was found by curling the HTML and grepping for a dot-separated key.
 *
 * So this asserts the property directly: after rendering, no alt on this band
 * may look like a message key, and every model must be named in its own.
 */
describe("the blue range names its photographs", () => {
  const cases = [
    ["en", en.mattresses.models.alt],
    ["ar", ar.mattresses.models.alt],
  ] as const;

  for (const [locale, template] of cases) {
    it(`${locale}: substitutes every model name into its alt`, () => {
      // Scoped to THIS render's container, not to `screen`. Auto-cleanup is
      // not configured in this project, so a document-wide query picks up the
      // previous locale's eight images too and the count assertion reads 16.
      const { container } = render(<BlueRange alt={template} note="" />);
      const alts = [...container.querySelectorAll("img")].map(
        (el) => el.getAttribute("alt") ?? "",
      );

      expect(alts).toHaveLength(BLUE_MODELS.length);

      // A leaked key. `t()` returns the key path on failure, so this is what a
      // regression looks like from the outside.
      for (const alt of alts) {
        expect(alt, "this alt is a message key, not a description").not.toMatch(
          /^[a-z]+(\.[a-zA-Z]+)+$/,
        );
        expect(alt, "the {name} placeholder was never filled in").not.toContain("{name}");
      }

      // Not just "some text": the RIGHT text, one per model, all distinct.
      for (const model of BLUE_MODELS) {
        const name = BLUE_MODEL_NAMES[model];
        expect(
          alts.filter((a) => a.includes(name)),
          `no alt names the ${name} model`,
        ).toHaveLength(1);
      }
      expect(new Set(alts).size, "two photographs share one description").toBe(alts.length);
    });
  }

  it("keeps the template's placeholder in both locales", () => {
    /**
     * The substitution is a plain `String.replace`, so a translator who drops
     * `{name}` or renders it as `{الاسم}` does not break the build — they
     * silently produce eight identical alts. That is worse than the original
     * bug, because it reads as deliberate description.
     */
    for (const [locale, template] of cases) {
      expect(template, `${locale}.json lost its {name} placeholder`).toContain("{name}");
    }
  });
});
