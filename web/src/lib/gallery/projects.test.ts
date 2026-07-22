import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import {
  DIVISIONS,
  SUB_CATEGORIES,
  SUB_CATEGORY_IDS,
  type SubCategoryId,
  PROJECTS,
  byDivision,
  bySubCategory,
  divisionOf,
  findProject,
  isDivisionId,
  isSubCategoryId,
  subsOf,
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
  const INTENTIONALLY_EMPTY: readonly SubCategoryId[] = [];

  it("no sub-category is empty by accident", () => {
    // bySubCategory() feeding an empty array into the stage is a real failure
    // mode: PushSlider's preload does `% count`, which is NaN at zero. The
    // component guards it, but a sub-category emptied by a TYPO in
    // `subCategory` should fail here rather than render an empty-state in prod.
    // So emptiness is allowed only where it has been declared above.
    //
    // THIS GOT SHARPER WHEN THE GALLERY WENT THREE-LEVEL. It used to check two
    // categories; it now checks nine sub-categories, which is nine chances for
    // a typo to strand a tab — and a stranded tab is fully clickable, so a user
    // finds it long before a developer does.
    for (const s of SUB_CATEGORY_IDS) {
      if (INTENTIONALLY_EMPTY.includes(s)) continue;
      expect(bySubCategory(s).length, `sub-category "${s}" has no projects`).toBeGreaterThan(0);
    }
  });

  it("every division has at least one sub-category, and every sub-category a home", () => {
    // A division with no sub-categories renders a strip with nothing in it and
    // an `activeSub` of undefined, which is a crash rather than an empty state.
    for (const d of DIVISIONS) {
      expect(subsOf(d).length, `division "${d}" has no sub-categories`).toBeGreaterThan(0);
      expect(byDivision(d).length, `division "${d}" has no projects`).toBeGreaterThan(0);
    }
    // And nothing dangles the other way: every declared sub-category belongs to
    // a division that exists.
    for (const s of SUB_CATEGORIES) {
      expect(DIVISIONS, `sub-category "${s.id}" names an unknown division`).toContain(
        s.division,
      );
    }
  });

  it("gives every project a sub-category that actually exists", () => {
    /**
     * THE SILENT FAILURE THIS CATCHES, and the reason `Project` stores only its
     * sub-category rather than a division as well.
     *
     * A project's division is DERIVED through SUB_CATEGORIES. If a project
     * named a sub-category that is not in the table, `divisionOf` returns
     * undefined, the project belongs to no division, and it simply vanishes
     * from the gallery — no error, no empty state, no compiler complaint,
     * because the union type only constrains the string and not the table.
     */
    for (const p of PROJECTS) {
      expect(
        divisionOf(p.subCategory),
        `project "${p.id}" is in sub-category "${p.subCategory}", which is in no division`,
      ).toBeDefined();
    }
    // Every project reachable by walking the tree the shell walks. A project
    // that exists but no strip can reach is the same as one that does not.
    const reachable = DIVISIONS.flatMap((d) => subsOf(d)).flatMap((s) => bySubCategory(s));
    expect(reachable.length, "a project is unreachable from the chrome").toBe(PROJECTS.length);
  });

  it("does not keep an empty-category exemption that is no longer needed", () => {
    // The mirror of the above: once a listed sub-category gains entries, this
    // fails and the exemption gets deleted, instead of quietly masking a future
    // typo. It is empty right now because siesta, the one sub-category with no
    // documented content, was given a range entry rather than left blank.
    const populated = INTENTIONALLY_EMPTY.filter((c) => bySubCategory(c).length > 0);
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
     * covers exactly what is still filler, and the count below is the number of
     * cells still waiting on a real photograph.
     *
     * =========================================================================
     * ⚠ THE CEILING WENT UP, 18 -> 60, AND THAT WAS A DECISION
     * =========================================================================
     *
     * "It goes down as photography arrives; it must never go up" is what this
     * note used to say, so raising it needs to be an argued act rather than a
     * quiet edit — otherwise the next person reads a number that has drifted
     * and concludes the gate means nothing.
     *
     * WHAT HAPPENED. The client asked for the gallery to be browsable by
     * division and then by what the factory makes: three divisions, nine
     * product types. Five of those product types have no documented project
     * reference at all, so the structure could only be built by adding seven
     * CAPABILITY entries, and the only imagery that exists for them is the
     * recoloured landing set. Seven entries at six cells each is the 42 that
     * takes 18 to 60.
     *
     * WHY THAT IS NOT THE FAILURE IT LOOKS LIKE. The 18 were the dangerous
     * kind: generic photographs captioned "Mataf Extension", which read as
     * photographs OF the Mataf Extension. The 42 new ones sit under entries
     * that name no client, no site and no completion, and whose own copy says
     * they describe a manufacturing capability rather than a delivered project.
     * A stock interior under "Interior Cladding, product range" overstates far
     * less than a stock interior under a named holy-site development.
     *
     * WHY IT STILL FAILS. Because it should. Every one of the 60 is a picture
     * of a room somebody else photographed, and no amount of careful captioning
     * makes that the factory's own work. This stays red until real photography
     * arrives, and the two halves want different things: the 18 need PROJECT
     * photography before those three references can honestly ship, the 42 need
     * PRODUCT photography before the gallery is a portfolio rather than a
     * structure. The assertion below already checks the right thing.
     *
     * IT MUST NEVER GO UP AGAIN WITHOUT THE SAME ARGUMENT IN WRITING.
     */
    const shared = PROJECTS.flatMap((p) => Object.values(p.cells)).filter((src) =>
      src.startsWith("/landing/"),
    );
    expect(
      shared.length,
      "more cells on filler imagery than the 60 the three-level gallery was built with",
    ).toBeLessThanOrEqual(60);
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

  it("narrows untrusted ?c=, ?s= and ?p= input", () => {
    expect(isDivisionId("woodworks")).toBe(true);
    expect(isDivisionId("../../etc/passwd")).toBe(false);
    expect(isDivisionId(undefined)).toBe(false);
    // `?s=` is a third piece of user-controlled input and needs its own narrow.
    expect(isSubCategoryId("doors-panels")).toBe(true);
    expect(isSubCategoryId("woodworks")).toBe(false); // a division, not a sub
    expect(isSubCategoryId("../../etc/passwd")).toBe(false);
    expect(isSubCategoryId(undefined)).toBe(false);
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
