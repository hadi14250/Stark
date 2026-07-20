import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
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
