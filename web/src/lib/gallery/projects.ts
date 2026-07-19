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
export type ThemeName = "forest" | "graphite" | "sand";

export const THEMES: Record<ThemeName, Theme> = {
  /** Stark green — the default, for turnkey and mixed-scope work. */
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
  /** The Woodworks ramp — graphite, for joinery and fit-out work. */
  graphite: {
    bg: "#1d1d1b",
    cardBg: "#2a2a28",
    cardBg2: "#232321",
    cardDark: "#161615",
    accent: "#dbcaad",
    accent2: "#e2d4bd",
    accentText: "#1d1d1b",
    text: "#faf5ef",
    subtext: "#bababa",
    overlayCard: "rgba(42, 42, 40, 0.62)",
    overlayAccent: "#dbcaad",
  },
  /** Warm and light — for mattress and residential work. */
  sand: {
    bg: "#2a2620",
    cardBg: "#3a352c",
    cardBg2: "#332e26",
    cardDark: "#211e19",
    accent: "#dbcaad",
    accent2: "#ece4d5",
    accentText: "#2a2620",
    text: "#faf5ef",
    subtext: "#d7dad4",
    overlayCard: "rgba(58, 53, 44, 0.62)",
    overlayAccent: "#ece4d5",
  },
};

const img = (name: string) => `/landing/${name}`;

/**
 * TODO(F-content): six SEEDED projects.
 *
 * Both the photography and the specifics are placeholders drawn from existing
 * site imagery. Every one of these needs a real project, real photographs and
 * client sign-off before any demo — the copy is written to be plausible for
 * STARK's actual business rather than invented detail (no client names, no
 * dates, no figures), so nothing here asserts something untrue, but nothing
 * here is a real reference either.
 */
export const PROJECTS: readonly Project[] = [
  {
    id: "hospitality-fit-out",
    category: "woodworks",
    theme: "graphite",
    cells: {
      hero: img("8244b28836385a29.png"),
      intro: img("44e767d2df80b104.png"),
      portraitA: img("42737a5b8707da10.jpg"),
      feature: img("763ba2c7f4c29838.jpg"),
      portraitB: img("bf46cb0e0db7539f.jpg"),
      detail: img("9bc56e8ed0aded95.jpg"),
    },
    keys: {
      title: "hospitalityFitOut.title",
      subtitle: "hospitalityFitOut.subtitle",
      headline: "hospitalityFitOut.headline",
      paragraph: "hospitalityFitOut.paragraph",
      scope: "hospitalityFitOut.scope",
      delivery: "hospitalityFitOut.delivery",
      materials: "hospitalityFitOut.materials",
      overlayTitle: "hospitalityFitOut.overlayTitle",
      overlaySummary: "hospitalityFitOut.overlaySummary",
      overlaySpecs: "hospitalityFitOut.overlaySpecs",
    },
    overlayBg: img("8244b28836385a29.png"),
  },
  {
    id: "joinery-package",
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
      title: "joineryPackage.title",
      subtitle: "joineryPackage.subtitle",
      headline: "joineryPackage.headline",
      paragraph: "joineryPackage.paragraph",
      scope: "joineryPackage.scope",
      delivery: "joineryPackage.delivery",
      materials: "joineryPackage.materials",
      overlayTitle: "joineryPackage.overlayTitle",
      overlaySummary: "joineryPackage.overlaySummary",
      overlaySpecs: "joineryPackage.overlaySpecs",
    },
    overlayBg: img("815f8b5fd0db3732.png"),
  },
  {
    id: "fitted-furniture",
    category: "woodworks",
    theme: "sand",
    cells: {
      hero: img("d1c0e28eb1c679aa.png"),
      intro: img("46cb9cc7e202b440.jpg"),
      portraitA: img("6ef0b9569b029eeb.png"),
      feature: img("e84ce9bd89e1844a.png"),
      portraitB: img("d41cceabf062f878.png"),
      detail: img("9147afdc9d8c4223.png"),
    },
    keys: {
      title: "fittedFurniture.title",
      subtitle: "fittedFurniture.subtitle",
      headline: "fittedFurniture.headline",
      paragraph: "fittedFurniture.paragraph",
      scope: "fittedFurniture.scope",
      delivery: "fittedFurniture.delivery",
      materials: "fittedFurniture.materials",
      overlayTitle: "fittedFurniture.overlayTitle",
      overlaySummary: "fittedFurniture.overlaySummary",
      overlaySpecs: "fittedFurniture.overlaySpecs",
    },
    overlayBg: img("d1c0e28eb1c679aa.png"),
  },
  {
    id: "hotel-bedding",
    category: "mattresses",
    theme: "forest",
    cells: {
      hero: img("847c93f88825cbef.png"),
      intro: img("9bc56e8ed0aded95.jpg"),
      portraitA: img("bf46cb0e0db7539f.jpg"),
      feature: img("42737a5b8707da10.jpg"),
      portraitB: img("763ba2c7f4c29838.jpg"),
      detail: img("f7965388e07b0b0c.jpg"),
    },
    keys: {
      title: "hotelBedding.title",
      subtitle: "hotelBedding.subtitle",
      headline: "hotelBedding.headline",
      paragraph: "hotelBedding.paragraph",
      scope: "hotelBedding.scope",
      delivery: "hotelBedding.delivery",
      materials: "hotelBedding.materials",
      overlayTitle: "hotelBedding.overlayTitle",
      overlaySummary: "hotelBedding.overlaySummary",
      overlaySpecs: "hotelBedding.overlaySpecs",
    },
    overlayBg: img("847c93f88825cbef.png"),
  },
  {
    id: "serviced-residences",
    category: "mattresses",
    theme: "sand",
    cells: {
      hero: img("9147afdc9d8c4223.png"),
      intro: img("f264f5dea2782694.jpg"),
      portraitA: img("5d5c40ccbb6b257b.jpg"),
      feature: img("f26d3ba55447fc47.jpg"),
      portraitB: img("08f1f8d97cb5f63f.jpg"),
      detail: img("46cb9cc7e202b440.jpg"),
    },
    keys: {
      title: "servicedResidences.title",
      subtitle: "servicedResidences.subtitle",
      headline: "servicedResidences.headline",
      paragraph: "servicedResidences.paragraph",
      scope: "servicedResidences.scope",
      delivery: "servicedResidences.delivery",
      materials: "servicedResidences.materials",
      overlayTitle: "servicedResidences.overlayTitle",
      overlaySummary: "servicedResidences.overlaySummary",
      overlaySpecs: "servicedResidences.overlaySpecs",
    },
    overlayBg: img("9147afdc9d8c4223.png"),
  },
  {
    id: "retail-programme",
    category: "mattresses",
    theme: "graphite",
    cells: {
      hero: img("6ef0b9569b029eeb.png"),
      intro: img("d41cceabf062f878.png"),
      portraitA: img("e84ce9bd89e1844a.png"),
      feature: img("d1c0e28eb1c679aa.png"),
      portraitB: img("44e767d2df80b104.png"),
      detail: img("815f8b5fd0db3732.png"),
    },
    keys: {
      title: "retailProgramme.title",
      subtitle: "retailProgramme.subtitle",
      headline: "retailProgramme.headline",
      paragraph: "retailProgramme.paragraph",
      scope: "retailProgramme.scope",
      delivery: "retailProgramme.delivery",
      materials: "retailProgramme.materials",
      overlayTitle: "retailProgramme.overlayTitle",
      overlaySummary: "retailProgramme.overlaySummary",
      overlaySpecs: "retailProgramme.overlaySpecs",
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
