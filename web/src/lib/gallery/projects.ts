import type { Theme } from "./types";

/**
 * The gallery's data model.
 *
 * The design goal is that ADDING A PROJECT IS A DATA CHANGE: one entry here,
 * its message keys, its photographs. No component edits. That is only true
 * because of `toSlide` (see toSlide.ts) — `Project` is nested and keyed by
 * meaning, while the ported stage reads a FLAT `Slide` whose field names are
 * the travel demo's ("blossom", "cuisineImage"). Without an adapter, adding a
 * project would mean touching the engine.
 *
 * The ten bento cells keep their topology. Renaming `CellId` would mean
 * touching nine coupled sites in the transition engine for zero user-visible
 * gain, so the cells are renamed in MEANING only — the map is in toSlide.ts.
 */

export type CategoryId = "woodworks" | "mattresses";

export interface ProjectCells {
  /** Big hero photograph — the project's establishing shot. */
  hero: string;
  /** Landscape beside the intro copy. */
  intro: string;
  /** Tall portrait, column 1. */
  portraitA: string;
  /** Large centre portrait — usually the signature detail. */
  feature: string;
  /** Tall portrait, column 3. */
  portraitB: string;
  /** Small square at the foot of the third info card. */
  detail: string;
}

export interface Project {
  /** URL slug. Appears in ?p= — changing one breaks shared links. */
  id: string;
  category: CategoryId;
  /** Which of the three sanctioned Stark palettes this project renders in. */
  theme: ThemeName;
  cells: ProjectCells;
  /**
   * i18n keys, not strings. Resolved on the SERVER in gallery/page.tsx, so the
   * client stage never needs a translator and the memo inside PushSlider keeps
   * a stable identity.
   */
  keys: {
    /** Project name — the hero card's large line. */
    title: string;
    /** Client / sector / city line under it. */
    subtitle: string;
    /** The intro card's headline and paragraph. */
    headline: string;
    paragraph: string;
    /** Three short spec lines on the small info cards. */
    scope: string;
    delivery: string;
    materials: string;
    /** Detail overlay. */
    overlayTitle: string;
    overlaySummary: string;
    /** Four label/description pairs in the overlay. */
    overlaySpecs: string;
  };
  /** Full-bleed background for the detail overlay. */
  overlayBg: string;
}

/**
 * THREE sanctioned themes, not one per project.
 *
 * The plan originally gave every project a bespoke 11-colour palette. Six
 * projects would be 66 unreviewed colours on the one route whose job is to
 * look coherent — on a site being rebuilt precisely because it had three
 * palettes. Projects pick a theme; they do not invent one.
 */
export type ThemeName = "forest" | "moss" | "pine";

/**
 * ONE GREEN FAMILY, THREE DEPTHS — not three different worlds.
 *
 * These used to be `forest` (green), `graphite` (#1d1d1b) and `sand`
 * (#2a2620). Two of the three were warm greys, so two projects in every three
 * put a grey stage inside green chrome, on the one route whose entire job is to
 * look coherent. The site was rebuilt precisely because it read as four
 * different products; the gallery was quietly reproducing that in miniature.
 *
 * The three now walk down the brand's own green ramp — forest (--green-900),
 * moss (--green-800), pine (--green-panel) — so a project still gets a distinct
 * stage, but the difference is DEPTH rather than hue. Sand stays the single
 * accent throughout and off-white the type. Nothing on the route is grey.
 *
 * The values are literals rather than `var(--green-900)` because `Theme` is
 * serialised into inline styles on the stage, which is inside a container-query
 * subtree with its own custom-property scope — the tokens are the source, these
 * are the copy, and projects.test.ts pins the copy to the source so the two
 * cannot drift silently.
 */
export const THEMES: Record<ThemeName, Theme> = {
  /** Deepest — the default, for turnkey and mixed-scope work. */
  forest: {
    bg: "#0c1a13",
    cardBg: "#16271e",
    cardBg2: "#11271c",
    cardDark: "#0a150f",
    accent: "#dbcaad",
    accent2: "#e2d4bd",
    accentText: "#1c3d2e",
    text: "#faf5ef",
    subtext: "#bac4bf",
    overlayCard: "rgba(22, 39, 30, 0.62)",
    overlayAccent: "#dbcaad",
  },
  /** A step up the ramp — for joinery and fit-out work. */
  moss: {
    bg: "#11271c",
    cardBg: "#1b3226",
    cardBg2: "#16271e",
    cardDark: "#0c1a13",
    accent: "#dbcaad",
    accent2: "#e2d4bd",
    accentText: "#11271c",
    text: "#faf5ef",
    subtext: "#c2cdc7",
    overlayCard: "rgba(27, 50, 38, 0.62)",
    overlayAccent: "#dbcaad",
  },
  /** Lightest of the three — for mattress and residential work. */
  pine: {
    bg: "#16271e",
    cardBg: "#21382a",
    cardBg2: "#1b3226",
    cardDark: "#11271c",
    accent: "#dbcaad",
    accent2: "#ece4d5",
    accentText: "#16271e",
    text: "#faf5ef",
    subtext: "#cbd6d0",
    overlayCard: "rgba(33, 56, 42, 0.62)",
    overlayAccent: "#ece4d5",
  },
};

const img = (name: string) => `/landing/${name}`;

/**
 * THE THREE REAL REFERENCES, replacing six that were invented.
 *
 * ===========================================================================
 * READ THIS BEFORE EDITING ANY COPY BELOW
 * ===========================================================================
 *
 * ALL THREE ARE APPROVALS, NOT COMPLETIONS. The source documents are submittal
 * and prequalification forms with a box ticked "Approved as Noted" -- they
 * prove the factory was reviewed and accepted as a supplier on the project.
 * They prove nothing whatsoever about what was installed, or by whom.
 *
 * So every line of copy says "approved supplier for" or "prequalified", and
 * none says "delivered", "completed" or "built". That is not lawyerly hedging:
 * one of these is the Mataf Extension at the Holy Mosque, and a false
 * completion claim there is about the worst thing this site could say.
 *
 * Ironically the approval is the more persuasive artifact anyway. Anyone can
 * photograph a lobby; being accepted through Dar Al-Handasah's review, or
 * prequalified by Parsons and WSP, is a thing that had to be earned and can be
 * checked.
 *
 * ⚠ THE PHOTOGRAPHY IS STILL PLACEHOLDER, and that is now a HARDER problem
 * than it was, not a softer one. Generic factory imagery under an invented
 * project name was merely filler; the same imagery under "Mataf Extension"
 * reads as a photograph OF the Mataf Extension. `projects.test.ts` holds a
 * deliberately failing gate on this so it cannot be forgotten.
 *
 * ⚠ CLIENT NAMES NEED PERMISSION. These names come from the factory's own
 * profile deck, so they are already used commercially -- but a deck shown to
 * one prospect is not a public website. See SOURCES.md, open question 5.
 */
export const PROJECTS: readonly Project[] = [
  {
    id: "mataf-extension",
    category: "woodworks",
    theme: "moss",
    cells: {
      hero: img("8244b28836385a29.png"),
      intro: img("44e767d2df80b104.png"),
      portraitA: img("42737a5b8707da10.jpg"),
      feature: img("763ba2c7f4c29838.jpg"),
      portraitB: img("bf46cb0e0db7539f.jpg"),
      detail: img("9bc56e8ed0aded95.jpg"),
    },
    keys: {
      title: "mataf.title",
      subtitle: "mataf.subtitle",
      headline: "mataf.headline",
      paragraph: "mataf.paragraph",
      scope: "mataf.scope",
      delivery: "mataf.delivery",
      materials: "mataf.materials",
      overlayTitle: "mataf.overlayTitle",
      overlaySummary: "mataf.overlaySummary",
      overlaySpecs: "mataf.overlaySpecs",
    },
    overlayBg: img("8244b28836385a29.png"),
  },
  {
    id: "king-salman-park",
    category: "woodworks",
    theme: "forest",
    cells: {
      hero: img("815f8b5fd0db3732.png"),
      intro: img("f7965388e07b0b0c.jpg"),
      portraitA: img("08f1f8d97cb5f63f.jpg"),
      feature: img("f26d3ba55447fc47.jpg"),
      portraitB: img("5d5c40ccbb6b257b.jpg"),
      detail: img("f264f5dea2782694.jpg"),
    },
    keys: {
      title: "royalArts.title",
      subtitle: "royalArts.subtitle",
      headline: "royalArts.headline",
      paragraph: "royalArts.paragraph",
      scope: "royalArts.scope",
      delivery: "royalArts.delivery",
      materials: "royalArts.materials",
      overlayTitle: "royalArts.overlayTitle",
      overlaySummary: "royalArts.overlaySummary",
      overlaySpecs: "royalArts.overlaySpecs",
    },
    overlayBg: img("815f8b5fd0db3732.png"),
  },
  {
    id: "ngha-hospitals",
    category: "woodworks",
    theme: "pine",
    cells: {
      hero: img("6ef0b9569b029eeb.png"),
      intro: img("46cb9cc7e202b440.jpg"),
      portraitA: img("5d5c40ccbb6b257b.jpg"),
      feature: img("42737a5b8707da10.jpg"),
      portraitB: img("08f1f8d97cb5f63f.jpg"),
      detail: img("763ba2c7f4c29838.jpg"),
    },
    keys: {
      title: "ngha.title",
      subtitle: "ngha.subtitle",
      headline: "ngha.headline",
      paragraph: "ngha.paragraph",
      scope: "ngha.scope",
      delivery: "ngha.delivery",
      materials: "ngha.materials",
      overlayTitle: "ngha.overlayTitle",
      overlaySummary: "ngha.overlaySummary",
      overlaySpecs: "ngha.overlaySpecs",
    },
    overlayBg: img("6ef0b9569b029eeb.png"),
  },
];

export const CATEGORIES: readonly CategoryId[] = ["woodworks", "mattresses"];

export function byCategory(c: CategoryId): Project[] {
  return PROJECTS.filter((p) => p.category === c);
}

/** Narrowing helpers for `?c=` and `?p=`, which are user-controlled input. */
export function isCategoryId(v: unknown): v is CategoryId {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}

export function findProject(id: unknown): Project | undefined {
  return typeof id === "string" ? PROJECTS.find((p) => p.id === id) : undefined;
}
