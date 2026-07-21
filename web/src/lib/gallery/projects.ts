import type { Theme } from "./types";
import { blueShot, type BlueModel, type ShotType } from "@/components/mattresses/assets";

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
export type ThemeName = "forest" | "moss" | "pine" | "linen";

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
  /**
   * THE ONE LIGHT STAGE — for mattresses.
   *
   * The three greens above were chosen for woodworks, where the subject is
   * dark timber and a deep stage reads as the material. Mattresses are the
   * opposite subject: every one of them is cream, ivory or pale grey, and on
   * a near-black green they looked like cut-outs pasted onto a hole. The photo
   * and the stage were fighting for the same job.
   *
   * So this inverts. Cream surfaces, green type, sand for the accent — the
   * same ivory register the /mattresses route already runs in, which means the
   * gallery now agrees with the page it links to instead of contradicting it.
   *
   * It is still the brand's palette: every colour here is a --white/--sand
   * step or a --green step, and the anti-grey rule in projects.test.ts still
   * applies to it (every DARK colour in the set must be a green, and all four
   * of these are). A light stage is not a loose stage.
   */
  linen: {
    bg: "#faf5ef",
    cardBg: "#f4eee6",
    cardBg2: "#ece4d5",
    cardDark: "#dbcaad",
    accent: "#1c3d2e",
    accent2: "#496357",
    accentText: "#faf5ef",
    text: "#1c3d2e",
    subtext: "#496357",
    overlayCard: "rgba(250, 245, 239, 0.82)",
    overlayAccent: "#1c3d2e",
  },
  /** Lightest of the three greens — for residential and mixed work. */
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
 * The one honest image helper in this file.
 *
 * `img()` above points at the recoloured furniture-template set — filler, and
 * the reason the photography gate in projects.test.ts is a deliberate failure.
 * `mat()` points at the client's own blue product photography, so anything
 * routed through it is a real picture of the thing it is captioned as.
 */
const mat = (model: BlueModel, shot: ShotType) => blueShot(model, shot);

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

  /**
   * ── blue mattress ────────────────────────────────────────────────────────
   *
   * PRODUCTS, NOT PROJECTS, and the copy says so. The woodworks entries above
   * are approved submittals for named developments; these three are models in
   * a catalogue. The mattress division has no documented project reference at
   * all, and dressing a product range up as a delivered project is precisely
   * what the content audit stripped out of this file. Every string in the
   * `blue*` message keys names a model and describes a construction; none of
   * them claims a client, a site or a completion.
   *
   * Why these three of the eight. They are the models whose story is carried
   * by construction and certification rather than by a health claim: Sky is
   * memory foam, Pure latex is organic latex with certificates that can be
   * looked up, Comfy zone adjusts its firmness per side. The other five lead
   * on PUROTEX+ allergen percentages, INTENSE(TM)/cortisol or SKIN+(TM)
   * carotenoid, and the standing decision is that none of that ships.
   *
   * Cell shapes were measured on the rendered stage, not read off the CSS:
   * hero is 2.59, intro and portraitA are 1.31, feature and portraitB are
   * near-square, detail is 1.13. The "portrait" names are inherited from the
   * travel demo and describe nothing. Shots are assigned to the cell whose
   * real aspect ratio they already fit, so nothing is cropped to a sliver.
   */
  {
    id: "blue-sky",
    category: "mattresses",
    theme: "linen",
    cells: {
      hero: mat("sky", "product"),
      intro: mat("sky", "banner"),
      portraitA: mat("sky", "room-b"),
      feature: mat("sky", "cutaway"),
      portraitB: mat("sky", "room-a"),
      detail: mat("sky", "fabric"),
    },
    keys: {
      title: "blueSky.title",
      subtitle: "blueSky.subtitle",
      headline: "blueSky.headline",
      paragraph: "blueSky.paragraph",
      scope: "blueSky.scope",
      delivery: "blueSky.delivery",
      materials: "blueSky.materials",
      overlayTitle: "blueSky.overlayTitle",
      overlaySummary: "blueSky.overlaySummary",
      overlaySpecs: "blueSky.overlaySpecs",
    },
    overlayBg: mat("sky", "room-a"),
  },
  {
    id: "blue-pure-latex",
    category: "mattresses",
    theme: "linen",
    cells: {
      hero: mat("pure-latex", "product"),
      intro: mat("pure-latex", "banner"),
      portraitA: mat("pure-latex", "room-b"),
      feature: mat("pure-latex", "cutaway"),
      portraitB: mat("pure-latex", "room-a"),
      detail: mat("pure-latex", "fabric"),
    },
    keys: {
      title: "bluePureLatex.title",
      subtitle: "bluePureLatex.subtitle",
      headline: "bluePureLatex.headline",
      paragraph: "bluePureLatex.paragraph",
      scope: "bluePureLatex.scope",
      delivery: "bluePureLatex.delivery",
      materials: "bluePureLatex.materials",
      overlayTitle: "bluePureLatex.overlayTitle",
      overlaySummary: "bluePureLatex.overlaySummary",
      overlaySpecs: "bluePureLatex.overlaySpecs",
    },
    overlayBg: mat("pure-latex", "room-a"),
  },
  {
    id: "blue-comfy-zone",
    category: "mattresses",
    theme: "linen",
    cells: {
      hero: mat("comfy-zone", "product"),
      intro: mat("comfy-zone", "banner"),
      portraitA: mat("comfy-zone", "room-b"),
      feature: mat("comfy-zone", "cutaway"),
      portraitB: mat("comfy-zone", "room-a"),
      detail: mat("comfy-zone", "fabric"),
    },
    keys: {
      title: "blueComfyZone.title",
      subtitle: "blueComfyZone.subtitle",
      headline: "blueComfyZone.headline",
      paragraph: "blueComfyZone.paragraph",
      scope: "blueComfyZone.scope",
      delivery: "blueComfyZone.delivery",
      materials: "blueComfyZone.materials",
      overlayTitle: "blueComfyZone.overlayTitle",
      overlaySummary: "blueComfyZone.overlaySummary",
      overlaySpecs: "blueComfyZone.overlaySpecs",
    },
    overlayBg: mat("comfy-zone", "room-a"),
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
