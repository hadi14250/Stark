import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import {
  CATEGORIES,
  type CategoryId,
  PROJECTS,
  byCategory,
  findProject,
  isCategoryId,
  THEMES,
} from "./projects";
import { toSlide, type Translator } from "./toSlide";

/** Resolve a dotted key against a messages object, or throw. */
function makeTranslator(messages: Record<string, unknown>): Translator {
  const get = (key: string): unknown =>
    key.split(".").reduce<unknown>(
      (o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined),
      messages,
    );
  const t = ((key: string) => {
    const v = get(key);
    if (typeof v !== "string") throw new Error(`missing or non-string key: gallery.${key}`);
    return v;
  }) as Translator;
  t.raw = get;
  return t;
}

describe("gallery data model", () => {
  /**
   * Categories that are empty ON PURPOSE, and why.
   *
   * The content audit removed six fabricated case studies and put back the
   * three that are evidenced by an approval document. All three are woodworks,
   * so this list used to hold "mattresses" — the mattress division has no
   * documented PROJECT reference and a product range dressed up as a project
   * is what the audit had just finished deleting.
   *
   * The list is empty now, and the exemption did not lapse quietly: the mirror
   * test below fails the moment a listed category gains entries, which is what
   * forced this edit when blue's three models arrived. The mattresses category
   * shows PRODUCTS, labelled as products in every string.
   */
  const INTENTIONALLY_EMPTY: readonly CategoryId[] = [];

  it("no category is empty by accident", () => {
    // byCategory() feeding an empty array into the stage is a real failure
    // mode: PushSlider's preload does `% count`, which is NaN at zero. The
    // component guards it, but a category emptied by a TYPO in `category`
    // should fail here rather than render an empty-state in prod. So emptiness
    // is allowed only where it has been declared above.
    for (const c of CATEGORIES) {
      if (INTENTIONALLY_EMPTY.includes(c)) continue;
      expect(byCategory(c).length, `category "${c}" has no projects`).toBeGreaterThan(0);
    }
  });

  it("does not keep an empty-category exemption that is no longer needed", () => {
    // The mirror of the above: once mattress references exist, this fails and
    // the exemption gets deleted, instead of quietly masking a future typo.
    const populated = INTENTIONALLY_EMPTY.filter((c) => byCategory(c).length > 0);
    expect(populated, "these categories are no longer empty").toEqual([]);
  });

  it.fails("has real photography for the named projects", () => {
    /**
     * A DELIBERATE FAILURE, and the only honest state this can be in.
     *
     * The gallery now names three real projects: the Mataf Extension, King
     * Salman Park CP04, and the National Guard hospitals. Every photograph
     * under those names is still generic imagery from the landing set.
     *
     * That is a BIGGER problem than the invented projects it replaced, not a
     * smaller one. Filler under a made-up project name was obviously filler.
     * The same filler captioned "Mataf Extension" reads as a photograph OF the
     * Mataf Extension, which is a claim nobody has made and nobody can back.
     *
     * So this fails until real project photography arrives, and the failure is
     * the reminder. Everything else about these three references can ship; the
     * pictures cannot.
     *
     * TO CLOSE IT: put the real photographs in place and change `it.fails` to
     * `it`. The assertion below already checks the right thing.
     *
     * NARROWED, NOT WEAKENED: blue's three models now carry the manufacturer's
     * own product photography, so this no longer covers the whole gallery. It
     * covers exactly what is still filler — the three woodworks references —
     * and the count below is the number of cells still waiting on a real
     * photograph. It goes down as photography arrives; it must never go up.
     */
    const shared = PROJECTS.flatMap((p) => Object.values(p.cells)).filter((src) =>
      src.startsWith("/landing/"),
    );
    expect(shared.length, "more cells on filler imagery than when this was written").toBeLessThanOrEqual(18);
    expect(shared, "still using landing-set imagery for named projects").toEqual([]);
  });

  it("project ids are unique — they are URL slugs", () => {
    const ids = PROJECTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every project names a sanctioned theme", () => {
    // Three themes, not one per project: six bespoke 11-colour palettes would
    // be 66 unreviewed colours on the one route whose job is to look coherent.
    for (const p of PROJECTS) {
      expect(Object.keys(THEMES)).toContain(p.theme);
    }
  });

  it("keeps every stage background inside the brand's green ramp", () => {
    /**
     * THE CLASH THIS CATCHES. Two of the three themes used to be warm greys
     * (#1d1d1b, #2a2620) sitting inside green chrome, so four of six projects
     * put a grey stage on a green route — the exact "reads as several different
     * products" problem the whole rebuild exists to fix.
     *
     * `Theme` is serialised into inline styles inside the stage's container-
     * query subtree, which has its own custom-property scope, so these have to
     * be literals rather than `var(--green-900)`. That makes tokens.css the
     * source and THEMES a hand-copy — and a hand-copy drifts. This is the pin.
     */
    const tokens = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../styles/tokens.css"),
      "utf8",
    );
    const token = (name: string) => {
      const m = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
      expect(m, `--${name} is gone from tokens.css`).not.toBeNull();
      return m![1].toLowerCase();
    };

    expect(THEMES.forest.bg).toBe(token("green-900"));
    expect(THEMES.moss.bg).toBe(token("green-800"));
    expect(THEMES.pine.bg).toBe(token("green-panel"));

    // And nothing anywhere in the set may be a grey — equal-ish RGB channels.
    for (const [name, theme] of Object.entries(THEMES)) {
      for (const [key, value] of Object.entries(theme)) {
        const hex = /^#([0-9a-f]{6})$/i.exec(value);
        if (!hex) continue; // rgba() overlay tints carry their own alpha
        const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16));
        // Sand and off-white are warm by design; only the DARK end must be
        // green, which is where the greys were.
        if (r + g + b > 330) continue;
        expect(
          g,
          `${name}.${key} (${value}) is not a green — greys are what this route just removed`,
        ).toBeGreaterThan(Math.max(r, b));
      }
    }
  });

  it("narrows untrusted ?c= and ?p= input", () => {
    expect(isCategoryId("woodworks")).toBe(true);
    expect(isCategoryId("../../etc/passwd")).toBe(false);
    expect(isCategoryId(undefined)).toBe(false);
    expect(findProject("nope")).toBeUndefined();
    expect(findProject(undefined)).toBeUndefined();
    expect(findProject(PROJECTS[0].id)?.id).toBe(PROJECTS[0].id);
  });
});

describe.each([
  ["en", en],
  ["ar", ar],
])("toSlide resolves every key (%s)", (_locale, messages) => {
  const t = makeTranslator((messages as Record<string, unknown>).gallery as Record<string, unknown>);

  it("produces a complete Slide for every project", () => {
    // The adapter is what makes "adding a project is a data change" true. If a
    // new project is added with a key that has no message, this fails here
    // rather than rendering the literal key string on the page.
    for (const p of PROJECTS) {
      const s = toSlide(p, t);
      for (const field of [
        "city",
        "subtitle",
        "heroImage",
        "headline",
        "paragraph",
        "ctaLabel",
        "introImage",
        "portraitA",
        "blossom",
        "portraitB",
        "exploreLine",
        "stayLine",
        "cuisineLine",
        "cuisineImage",
      ] as const) {
        expect(s[field], `${p.id}.${field}`).toBeTruthy();
      }
      expect(s.overlay.title).toBeTruthy();
      expect(s.overlay.specs.length).toBeGreaterThan(0);
      expect(s.overlay.specs.every((a) => a.title && a.desc)).toBe(true);
    }
  });

  it("degrades rather than throwing on a malformed spec list", () => {
    // A missing overlaySpecs key must not take the whole SSR render down.
    const broken: Translator = Object.assign((k: string) => t(k), { raw: () => undefined });
    expect(() => toSlide(PROJECTS[0], broken)).not.toThrow();
    expect(toSlide(PROJECTS[0], broken).overlay.specs).toEqual([]);
  });
});
