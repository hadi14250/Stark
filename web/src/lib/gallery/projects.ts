import type { Theme } from "./types";
import {
  blueShot,
  siestaShot,
  type BlueModel,
  type SiestaModel,
  type ShotType,
} from "@/components/mattresses/assets";

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

/**
 * THREE LEVELS, AND WHY THE MIDDLE ONE APPEARED.
 *
 * This used to be flat: one `category` scalar, two values, and the two visible
 * strips were (category, project) rather than two levels of category. The
 * client's gallery note asks for three divisions -- `landing.gallery.sub` now
 * reads "WOODWORKS, FURNITURE and MATTRESSES" -- and for each to be browsable
 * by what the factory actually makes. That is a third level, and it is a new
 * dimension at every layer above `toSlide`.
 *
 *   division      woodworks | furniture | mattresses
 *   subCategory   the slide-14 product types, blue and siesta
 *   project       the entries you page through in the stage
 *
 * ⚠ FURNITURE IS A GALLERY TAB, NOT A COMPANY SECTOR. Slide 8's "three main
 * sectors" are Custom Wood Works, Mattresses, and Engineering & Technical
 * Services, and it files "loose furniture" INSIDE custom wood works. So this
 * split is a browsing structure the client asked for on the gallery
 * specifically; it is not the company's own org chart, and nothing here should
 * be copied into the divisions section, which follows slide 8.
 *
 * ⚠ A PROJECT STORES ONLY ITS SUB-CATEGORY. The division is derived through
 * SUB_CATEGORIES (see `divisionOf`). Storing both would let a project claim a
 * division its sub-category does not belong to, and nothing would catch it.
 */
export type DivisionId = "woodworks" | "furniture" | "mattresses";

export type SubCategoryId =
  // Woodworks -- slide 14's product types, less Furniture & Joinery.
  | "doors-panels"
  | "interior-cladding"
  | "kitchens-wardrobes"
  | "outdoor-structures"
  | "retail-stands"
  // Furniture -- slide 14's "Custom furniture, fixed joinery", split in two.
  | "loose-furniture"
  | "fixed-joinery"
  // Mattresses -- the two sub-brands, and only those.
  | "blue"
  | "siesta";

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
  /** The division is DERIVED from this — see `divisionOf`. */
  subCategory: SubCategoryId;
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
const sie = (model: SiestaModel, shot: ShotType) => siestaShot(model, shot);

/**
 * Mattress projects are catalogue MODELS, not case studies, so every one wires
 * its six cells to the six shot-types the same way and takes its copy from the
 * model's own message namespace. These builders keep that uniform: a new model
 * is one line rather than twenty, and no cell can be hand-wired to the wrong
 * shot. blue and siesta differ only in which `*Shot` resolver they close over.
 */
const mattressCells = (shot: (s: ShotType) => string): ProjectCells => ({
  hero: shot("product"),
  intro: shot("banner"),
  portraitA: shot("room-b"),
  feature: shot("cutaway"),
  portraitB: shot("room-a"),
  detail: shot("fabric"),
});
const mattressKeys = (k: string): Project["keys"] => ({
  title: `${k}.title`,
  subtitle: `${k}.subtitle`,
  headline: `${k}.headline`,
  paragraph: `${k}.paragraph`,
  scope: `${k}.scope`,
  delivery: `${k}.delivery`,
  materials: `${k}.materials`,
  overlayTitle: `${k}.overlayTitle`,
  overlaySummary: `${k}.overlaySummary`,
  overlaySpecs: `${k}.overlaySpecs`,
});
const blueModelProject = (id: string, model: BlueModel, k: string): Project => ({
  id,
  subCategory: "blue",
  theme: "linen",
  cells: mattressCells((s) => mat(model, s)),
  keys: mattressKeys(k),
  overlayBg: mat(model, "room-a"),
});
const siestaModelProject = (id: string, model: SiestaModel, k: string): Project => ({
  id,
  subCategory: "siesta",
  theme: "linen",
  cells: mattressCells((s) => sie(model, s)),
  keys: mattressKeys(k),
  overlayBg: sie(model, "room-a"),
});

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
    subCategory: "doors-panels",
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
    subCategory: "fixed-joinery",
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
    subCategory: "fixed-joinery",
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
   * ── product ranges, not projects ─────────────────────────────────────────
   *
   * THE DISTINCTION THAT KEEPS THIS FILE HONEST, and the reason these entries
   * read differently from the three above.
   *
   * The three above are APPROVALS: a named development, a named engineer, a
   * dated submittal returned "approved as noted". The seven below are
   * CAPABILITIES — what the factory manufactures, taken from slide 14's product
   * types and slide 8's sector copy. They exist because the client asked for
   * the gallery to be browsable by product type, and five of those product
   * types have no documented project reference at all.
   *
   * So not one of them names a client, a site, a date or a completion. The
   * subtitle says "Product range" in as many words, and each overlay summary
   * says outright that the entry describes a capability rather than a delivered
   * job. That framing is doing real work: it is what stops a stock photograph
   * under "Interior Cladding" from reading as a photograph of cladding STARK
   * installed somewhere.
   *
   * ⚠ THE PHOTOGRAPHY IS STILL THE LAUNCH BLOCKER. Every cell below is
   * recoloured landing-set filler, which is why the gate in projects.test.ts
   * had its ceiling raised rather than deleted — see the note there, which
   * records the number and the reason it moved.
   */
  {
    id: "specialized-doors",
    subCategory: "doors-panels",
    theme: "forest",
    cells: {
      hero: img("847c93f88825cbef.png"),
      intro: img("44e767d2df80b104.png"),
      portraitA: img("42737a5b8707da10.jpg"),
      feature: img("763ba2c7f4c29838.jpg"),
      portraitB: img("bf46cb0e0db7539f.jpg"),
      detail: img("9bc56e8ed0aded95.jpg"),
    },
    keys: {
      title: "specializedDoors.title",
      subtitle: "specializedDoors.subtitle",
      headline: "specializedDoors.headline",
      paragraph: "specializedDoors.paragraph",
      scope: "specializedDoors.scope",
      delivery: "specializedDoors.delivery",
      materials: "specializedDoors.materials",
      overlayTitle: "specializedDoors.overlayTitle",
      overlaySummary: "specializedDoors.overlaySummary",
      overlaySpecs: "specializedDoors.overlaySpecs",
    },
    overlayBg: img("847c93f88825cbef.png"),
  },
  {
    id: "interior-cladding",
    subCategory: "interior-cladding",
    theme: "moss",
    cells: {
      hero: img("9147afdc9d8c4223.png"),
      intro: img("f7965388e07b0b0c.jpg"),
      portraitA: img("08f1f8d97cb5f63f.jpg"),
      feature: img("42737a5b8707da10.jpg"),
      portraitB: img("5d5c40ccbb6b257b.jpg"),
      detail: img("f264f5dea2782694.jpg"),
    },
    keys: {
      title: "interiorCladding.title",
      subtitle: "interiorCladding.subtitle",
      headline: "interiorCladding.headline",
      paragraph: "interiorCladding.paragraph",
      scope: "interiorCladding.scope",
      delivery: "interiorCladding.delivery",
      materials: "interiorCladding.materials",
      overlayTitle: "interiorCladding.overlayTitle",
      overlaySummary: "interiorCladding.overlaySummary",
      overlaySpecs: "interiorCladding.overlaySpecs",
    },
    overlayBg: img("9147afdc9d8c4223.png"),
  },
  {
    id: "kitchens-wardrobes",
    subCategory: "kitchens-wardrobes",
    theme: "pine",
    cells: {
      hero: img("d1c0e28eb1c679aa.png"),
      intro: img("46cb9cc7e202b440.jpg"),
      portraitA: img("5d5c40ccbb6b257b.jpg"),
      feature: img("763ba2c7f4c29838.jpg"),
      portraitB: img("08f1f8d97cb5f63f.jpg"),
      detail: img("9bc56e8ed0aded95.jpg"),
    },
    keys: {
      title: "kitchensWardrobes.title",
      subtitle: "kitchensWardrobes.subtitle",
      headline: "kitchensWardrobes.headline",
      paragraph: "kitchensWardrobes.paragraph",
      scope: "kitchensWardrobes.scope",
      delivery: "kitchensWardrobes.delivery",
      materials: "kitchensWardrobes.materials",
      overlayTitle: "kitchensWardrobes.overlayTitle",
      overlaySummary: "kitchensWardrobes.overlaySummary",
      overlaySpecs: "kitchensWardrobes.overlaySpecs",
    },
    overlayBg: img("d1c0e28eb1c679aa.png"),
  },
  {
    id: "outdoor-structures",
    subCategory: "outdoor-structures",
    theme: "forest",
    cells: {
      hero: img("d41cceabf062f878.png"),
      intro: img("f26d3ba55447fc47.jpg"),
      portraitA: img("bf46cb0e0db7539f.jpg"),
      feature: img("f264f5dea2782694.jpg"),
      portraitB: img("42737a5b8707da10.jpg"),
      detail: img("763ba2c7f4c29838.jpg"),
    },
    keys: {
      title: "outdoorStructures.title",
      subtitle: "outdoorStructures.subtitle",
      headline: "outdoorStructures.headline",
      paragraph: "outdoorStructures.paragraph",
      scope: "outdoorStructures.scope",
      delivery: "outdoorStructures.delivery",
      materials: "outdoorStructures.materials",
      overlayTitle: "outdoorStructures.overlayTitle",
      overlaySummary: "outdoorStructures.overlaySummary",
      overlaySpecs: "outdoorStructures.overlaySpecs",
    },
    overlayBg: img("d41cceabf062f878.png"),
  },
  {
    id: "retail-stands",
    subCategory: "retail-stands",
    theme: "moss",
    cells: {
      hero: img("e84ce9bd89e1844a.png"),
      intro: img("44e767d2df80b104.png"),
      portraitA: img("08f1f8d97cb5f63f.jpg"),
      feature: img("bf46cb0e0db7539f.jpg"),
      portraitB: img("5d5c40ccbb6b257b.jpg"),
      detail: img("f264f5dea2782694.jpg"),
    },
    keys: {
      title: "retailStands.title",
      subtitle: "retailStands.subtitle",
      headline: "retailStands.headline",
      paragraph: "retailStands.paragraph",
      scope: "retailStands.scope",
      delivery: "retailStands.delivery",
      materials: "retailStands.materials",
      overlayTitle: "retailStands.overlayTitle",
      overlaySummary: "retailStands.overlaySummary",
      overlaySpecs: "retailStands.overlaySpecs",
    },
    overlayBg: img("e84ce9bd89e1844a.png"),
  },
  {
    id: "loose-furniture",
    subCategory: "loose-furniture",
    theme: "pine",
    cells: {
      hero: img("301336c2a6f33570.jpg"),
      intro: img("f7965388e07b0b0c.jpg"),
      portraitA: img("42737a5b8707da10.jpg"),
      feature: img("5d5c40ccbb6b257b.jpg"),
      portraitB: img("08f1f8d97cb5f63f.jpg"),
      detail: img("9bc56e8ed0aded95.jpg"),
    },
    keys: {
      title: "looseFurniture.title",
      subtitle: "looseFurniture.subtitle",
      headline: "looseFurniture.headline",
      paragraph: "looseFurniture.paragraph",
      scope: "looseFurniture.scope",
      delivery: "looseFurniture.delivery",
      materials: "looseFurniture.materials",
      overlayTitle: "looseFurniture.overlayTitle",
      overlaySummary: "looseFurniture.overlaySummary",
      overlaySpecs: "looseFurniture.overlaySpecs",
    },
    overlayBg: img("301336c2a6f33570.jpg"),
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
    subCategory: "blue",
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
    subCategory: "blue",
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
    subCategory: "blue",
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

  /**
   * The rest of blue's nine, added when the client sent the full photo folder.
   * The first three above were hand-authored; these six use the builder because
   * they follow the identical shape. Blue 2 arrived as photography with no spec
   * sheet, so its copy leads on that fact rather than inventing a construction.
   */
  blueModelProject("blue-1", "blue-1", "blue1"),
  blueModelProject("blue-2", "blue-2", "blue2"),
  blueModelProject("blue-loft", "loft", "blueLoft"),
  blueModelProject("blue-luna", "luna", "blueLuna"),
  blueModelProject("blue-retro", "retro", "blueRetro"),
  blueModelProject("blue-skin-care", "skin-care", "blueSkinCare"),

  /**
   * ── siesta ───────────────────────────────────────────────────────────────
   *
   * SIXTEEN MODELS, AND NO LONGER A PLACEHOLDER RANGE.
   *
   * This was ONE entry that described the range and showed rooms, because siesta
   * had no product photography, and its own note said: "the moment real siesta
   * photography arrives, this entry should become models." It has arrived. The
   * client sent a full product folder, one sub-folder per model, so the range is
   * now its sixteen models in the catalogue's order: five Luxury, eight Eco
   * Range, three Hospitality (profile 2026 p26).
   *
   * PRODUCTS, NOT PROJECTS — the overlays say so, exactly as blue's do. siesta
   * has no documented project reference; each entry names a model and a
   * construction and claims no client, no site and no completion. Blue product
   * shots are never routed here: `sie()` resolves siesta's own photography, so a
   * hospitality buyer never sees a consumer mattress under a siesta name.
   */
  siestaModelProject("siesta-sensice", "sensice", "siestaSensice"),
  siestaModelProject("siesta-florist", "florist", "siestaFlorist"),
  siestaModelProject("siesta-crown", "crown", "siestaCrown"),
  siestaModelProject("siesta-gloria", "gloria", "siestaGloria"),
  siestaModelProject("siesta-visco-point", "visco-point", "siestaViscoPoint"),
  siestaModelProject("siesta-perfection", "perfection", "siestaPerfection"),
  siestaModelProject("siesta-planor", "planor", "siestaPlanor"),
  siestaModelProject("siesta-prestige", "prestige", "siestaPrestige"),
  siestaModelProject("siesta-night", "night", "siestaNight"),
  siestaModelProject("siesta-moon", "moon", "siestaMoon"),
  siestaModelProject("siesta-orthopedic", "orthopedic", "siestaOrthopedic"),
  siestaModelProject("siesta-softness", "softness", "siestaSoftness"),
  siestaModelProject("siesta-medical-soft", "medical-soft", "siestaMedicalSoft"),
  siestaModelProject("siesta-comfort", "comfort", "siestaComfort"),
  siestaModelProject("siesta-standard", "standard", "siestaStandard"),
  siestaModelProject("siesta-sleep", "sleep", "siestaSleep"),
];

/**
 * Order is the client's, from `landing.gallery.sub`: "WOODWORKS, FURNITURE and
 * MATTRESSES". The teaser tiles on the landing page deep-link into these, so
 * the two orders being the same is what makes the tiles predictable.
 */
export const DIVISIONS: readonly DivisionId[] = ["woodworks", "furniture", "mattresses"];

/**
 * The middle level, and the ONLY place the division/sub-category relation is
 * written down. Everything else derives from this table.
 *
 * Sub-category ids are globally unique rather than unique-within-a-division,
 * which is what lets `?s=` be a single flat parameter and `slidesBySub` be a
 * flat record. Two divisions each owning a "general" would have forced a
 * composite key through every layer for no gain.
 */
export const SUB_CATEGORIES: readonly { id: SubCategoryId; division: DivisionId }[] = [
  { id: "doors-panels", division: "woodworks" },
  { id: "interior-cladding", division: "woodworks" },
  { id: "kitchens-wardrobes", division: "woodworks" },
  { id: "outdoor-structures", division: "woodworks" },
  { id: "retail-stands", division: "woodworks" },
  { id: "loose-furniture", division: "furniture" },
  { id: "fixed-joinery", division: "furniture" },
  { id: "blue", division: "mattresses" },
  { id: "siesta", division: "mattresses" },
];

export const SUB_CATEGORY_IDS: readonly SubCategoryId[] = SUB_CATEGORIES.map((s) => s.id);

export function subsOf(d: DivisionId): SubCategoryId[] {
  return SUB_CATEGORIES.filter((s) => s.division === d).map((s) => s.id);
}

/** The derivation that keeps a project from claiming a division it is not in. */
export function divisionOf(s: SubCategoryId): DivisionId | undefined {
  return SUB_CATEGORIES.find((x) => x.id === s)?.division;
}

export function bySubCategory(s: SubCategoryId): Project[] {
  return PROJECTS.filter((p) => p.subCategory === s);
}

/** Every project in a division, across all of its sub-categories. */
export function byDivision(d: DivisionId): Project[] {
  return PROJECTS.filter((p) => divisionOf(p.subCategory) === d);
}

/** Narrowing helpers for `?c=`, `?s=` and `?p=` — all user-controlled input. */
export function isDivisionId(v: unknown): v is DivisionId {
  return typeof v === "string" && (DIVISIONS as readonly string[]).includes(v);
}

export function isSubCategoryId(v: unknown): v is SubCategoryId {
  return typeof v === "string" && (SUB_CATEGORY_IDS as readonly string[]).includes(v);
}

export function findProject(id: unknown): Project | undefined {
  return typeof id === "string" ? PROJECTS.find((p) => p.id === id) : undefined;
}
