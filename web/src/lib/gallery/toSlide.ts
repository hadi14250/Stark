import type { Slide, Theme } from "./types";
import { IMAGES, divisionOf, type DivisionId, type SubCategoryId } from "./images";

/**
 * The boundary between the photo manifest and the ported bento stage.
 *
 * ===========================================================================
 * ONE SUB-CATEGORY IN, ONE SLIDE OUT
 * ===========================================================================
 *
 * This used to adapt a `Project` — a nested record of six named photo cells and
 * ten i18n keys — into the flat `Slide` the engine reads. The project level is
 * gone (the client asked for two levels of tabs, not three), so the input is now
 * a sub-category id and the output is that sub-category's first eight pictures
 * laid into the eight bento slots.
 *
 * The three cells that used to hold copy — `intro`, `explore`, `stay` — are
 * pictures now, which is exactly the instruction: "if there's only a text
 * container replace it with a picture that's the same size". They keep their
 * slot names because the stylesheet, the direction map and the transition
 * engine are all keyed by them; see the note in types.ts.
 *
 * ===========================================================================
 * THE BENTO IS A COVER, THE LIGHTBOX IS THE SET
 * ===========================================================================
 *
 * Eight slots is what the layout holds, and some sub-categories hold far more
 * than eight pictures — blue alone resolves to seventy-five. Truncating them
 * would quietly hide most of the catalogue, so the grid shows the first eight
 * and clicking any tile opens the lightbox over the sub-category's FULL list.
 * Nothing is unreachable; the bento is the way in.
 *
 * `pick` wraps rather than padding with a blank, so a sub-category with three
 * pictures fills all eight slots by repeating instead of showing five holes.
 */

/**
 * The stage palettes.
 *
 * Every dark colour here is a green step and every light one is a white/sand
 * step — the stage is not allowed to introduce a neutral grey, which is the
 * rule the old `projects.test.ts` enforced and the reason these are copied
 * across verbatim rather than re-picked.
 */
const THEMES = {
  /** Deepest — the default. */
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
  /** A step up the ramp. */
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
  /** Lightest of the three greens. */
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
  /**
   * THE ONE LIGHT STAGE — for mattresses.
   *
   * The greens were chosen for woodworks, where the subject is dark timber and
   * a deep stage reads as the material. Mattresses are the opposite subject:
   * every one is cream, ivory or pale grey, and on a near-black green they read
   * as cut-outs pasted onto a hole. This inverts to the same ivory register the
   * /mattresses route runs in, so the gallery agrees with the page it links to.
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
} satisfies Record<string, Theme>;

/**
 * Which palette a slide runs in.
 *
 * Woodworks rotates through the three greens so that stepping Next never lands
 * on the identical stage twice running — the push transition reads as movement
 * partly BECAUSE the ground shifts under it. Mattresses is the light stage, and
 * Design takes the deepest green so renders and boards sit on the quietest
 * possible ground.
 */
const WOODWORKS_RAMP = [THEMES.forest, THEMES.moss, THEMES.pine] as const;

function themeFor(division: DivisionId, indexWithinDivision: number): Theme {
  if (division === "mattresses") return THEMES.linen;
  if (division === "design") return THEMES.forest;
  return WOODWORKS_RAMP[indexWithinDivision % WOODWORKS_RAMP.length];
}

/**
 * Build one slide.
 *
 * `alt` arrives already resolved — the server holds the translator, so the
 * client stage never sees a message key and `useMemo` in PushSlider keeps a
 * stable identity across renders.
 */
export function toSlide(
  sub: SubCategoryId,
  alt: string,
  indexWithinDivision: number,
): Slide {
  const pool = IMAGES[sub] ?? [];
  const pick = (i: number) => pool[i % pool.length]?.src ?? "";
  const division = divisionOf(sub) ?? "woodworks";

  return {
    id: sub,
    theme: themeFor(division, indexWithinDivision),
    alt,

    // The slot rename happens here, and only here.
    heroImage: pick(0),
    introImage: pick(1),
    portraitA: pick(2),
    exploreImage: pick(3),
    blossom: pick(4),
    stayImage: pick(5),
    portraitB: pick(6),
    cuisineImage: pick(7),
  };
}

/**
 * Every slide for one division, in the manifest's order.
 *
 * `alts` is keyed by sub-category id and resolved on the server.
 */
export function slidesForSubs(
  subs: readonly SubCategoryId[],
  alts: Record<string, string>,
): Slide[] {
  return subs.map((s, i) => toSlide(s, alts[s] ?? "", i));
}
