import { describe, it, expect } from "vitest";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import {
  CATEGORIES,
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
  it("every category has at least one project", () => {
    // byCategory() feeding an empty array into the stage is a real failure
    // mode: PushSlider's preload does `% count`, which is NaN at zero. The
    // component guards it, but a category that is empty by ACCIDENT (a typo in
    // `category`) should fail here rather than render an empty-state in prod.
    for (const c of CATEGORIES) {
      expect(byCategory(c).length, `category "${c}" has no projects`).toBeGreaterThan(0);
    }
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
      expect(s.overlay.activities.length).toBeGreaterThan(0);
      expect(s.overlay.activities.every((a) => a.title && a.desc)).toBe(true);
    }
  });

  it("degrades rather than throwing on a malformed spec list", () => {
    // A missing overlaySpecs key must not take the whole SSR render down.
    const broken: Translator = Object.assign((k: string) => t(k), { raw: () => undefined });
    expect(() => toSlide(PROJECTS[0], broken)).not.toThrow();
    expect(toSlide(PROJECTS[0], broken).overlay.activities).toEqual([]);
  });
});
