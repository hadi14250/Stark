/**
 * blue mattress photography — the client's own product shots.
 *
 * REAL PHOTOGRAPHS OF REAL PRODUCTS, unlike everything else on this route
 * before them. The mattress division's own page was running on recoloured
 * furniture-template stock: generic bedrooms that were not blue's, not
 * siesta's, and not STARK's. These are from the client's product folder
 * (`blue mattresse/Products/<model>/`), one folder per model, and they are the
 * first genuine article photography the site has had.
 *
 * SIX SHOT TYPES per model, classified out of the source folders by aspect
 * ratio (the file names are inconsistent — some models number their shots with
 * Arabic-Indic digits, "Blue 1" names one of them `blue.png`, Loft ships the
 * same room twice as PNG and JPG). The classifier and the assertion that every
 * model resolves to exactly one of each live in the generation step; what
 * matters here is that the naming is now uniform:
 *
 *   {model}-banner.webp    very wide product, cut out
 *   {model}-product.webp   angled product, cut out
 *   {model}-cutaway.webp   cross-section through the layers, cut out
 *   {model}-room-a.jpg     bedroom scene, 4:3
 *   {model}-room-b.jpg     bedroom scene, 3:2
 *   {model}-fabric.jpg     macro of the cover fabric
 *
 * THE CUT-OUTS CARRY REAL ALPHA (roughly 60-88% opaque), so they sit directly
 * on the green surfaces with no white plate behind them — verified against
 * magenta, which is the only way to see a light fringe on a light product.
 *
 * ONE SOURCE DEFECT WAS REPAIRED: Sky's product shot carried a stray 73x36px
 * fragment of mask about 0.06% the area of the mattress, floating in empty
 * space to the left of the logo. It is in the client's original file. It was
 * removed by dropping alpha components under 5000px and dilating the survivor
 * so the mattress's own soft edge was not clipped. Nothing else was retouched.
 *
 * ⚠ THESE ARE blue (B2C) PRODUCTS AND ONLY blue PRODUCTS. siesta is the
 * hospitality brand, sold to a different buyer with different warranties, and
 * there is no siesta photography in this set. Using one of these for siesta
 * would attach a consumer product to a contract range — a factual claim about
 * what a hotel would be buying. The siesta panel keeps its placeholder until
 * the client supplies siesta shots.
 */

const base = "/mattresses";

/** The eight models in blue's 2026 range, as folder slugs. */
export const BLUE_MODELS = [
  "blue-1",
  "comfy-zone",
  "loft",
  "luna",
  "pure-latex",
  "retro",
  "skin-care",
  "sky",
] as const;

export type BlueModel = (typeof BLUE_MODELS)[number];

/**
 * How each model is written when a reader sees it.
 *
 * NOT IN THE MESSAGE FILES, and that is the decision worth recording. These
 * are proper nouns: "Comfy Zone" is the same string on the Arabic page as on
 * the English one, exactly as `blue` and `siesta` already are in the copy deck.
 * Putting them in `en.json`/`ar.json` would mean maintaining two identical
 * lists whose ONLY possible divergence is a mistake, and would invite a
 * translator to render "Sky" as "سماء" — turning a product you can ask for by
 * name into a description of one.
 *
 * The alt text around them IS translated: `mattresses.models.alt` is a
 * template with a `{name}` hole, so the sentence is Arabic and the noun is not.
 *
 * The spellings come from the product sheets' own file names ("Comfy zone",
 * "Skin care") title-cased for display, because a sheet's file name is not a
 * typographic decision. "Blue 1" keeps its space and its digit.
 */
export const BLUE_MODEL_NAMES: Record<BlueModel, string> = {
  "blue-1": "Blue 1",
  "comfy-zone": "Comfy Zone",
  loft: "Loft",
  luna: "Luna",
  "pure-latex": "Pure Latex",
  retro: "Retro",
  "skin-care": "Skin Care",
  sky: "Sky",
};

export type ShotType = "banner" | "product" | "cutaway" | "room-a" | "room-b" | "fabric";

/** Cut-outs are webp (alpha); scenes are jpg. */
const EXT: Record<ShotType, string> = {
  banner: "webp",
  product: "webp",
  cutaway: "webp",
  "room-a": "jpg",
  "room-b": "jpg",
  fabric: "jpg",
};

/** Path to one shot of one model. */
export function blueShot(model: BlueModel, shot: ShotType): string {
  return `${base}/${model}-${shot}.${EXT[shot]}`;
}

/** The three shot types that are products cut out of their background. */
const CUTOUT_SHOTS: readonly ShotType[] = ["banner", "product", "cutaway"];

/**
 * Does this path hold a cut-out product rather than a photograph?
 *
 * THE BUG THIS EXISTS FOR: the gallery's cards are `object-fit: cover`, which
 * is right for a photograph — a bedroom can lose its edges and still be a
 * bedroom. It is wrong for a product cut out of its background. `cover` scaled
 * the mattresses up until they bled past the card on every side, so the hero
 * showed a slab with the corners and the `blue` logo sliced off. The subject
 * of the photograph was the first thing cropped.
 *
 * Cut-outs are `contain` instead, so the whole product is visible inside its
 * card. They are transparent, so the card's own colour shows through and the
 * result reads as a product on a surface rather than as a letterboxed photo.
 *
 * Matched on the shot-type suffix, not on the file extension: `.webp` happens
 * to be true of all three today, but it describes an encoding, not whether
 * anything was masked out.
 */
export function isCutout(src: string): boolean {
  return CUTOUT_SHOTS.some((shot) => src.includes(`-${shot}.`));
}

export const mattressImages = {
  /**
   * Full-bleed hero band on the mattresses route.
   *
   * WAS `loft-room-a`, WHICH WAS THE WRONG KIND OF CORRECT. It is a real blue
   * product in a real room, so nothing about it was false — it was just beige
   * on beige, with the mattress the same value as the wall behind it and the
   * floor the same value as both. As a full-viewport opener under an ivory
   * veil, a low-contrast frame has nothing left once the veil takes the bottom
   * third: the client's note was that the page still felt like Home reordered,
   * and an opener you cannot describe afterwards is part of why.
   *
   * `blue-1-room-a` was chosen by laying all sixteen room shots out side by
   * side rather than by picking a plausible-sounding file name. It is the only
   * frame in the set with three distinct depth planes (window and planting,
   * bed, veined headboard wall), it carries the brand mark legibly on the
   * mattress border, and its warmth sits under an ivory veil instead of
   * fighting it. Its one weakness, a strongly saturated parquet floor, is in
   * the bottom third, which is precisely the part the veil washes to ivory.
   */
  hero: blueShot("blue-1", "room-a"),

  /** The blue half of the brand duet. siesta's half is NOT from this set. */
  blueBrand: blueShot("sky", "room-b"),

  /**
   * The eight models, in the range band. Cut-outs, so they sit on the page's
   * ivory with no plate behind them and `isCutout` renders them `contain`.
   */
  rangeShot: (model: BlueModel) => blueShot(model, "product"),

  /** Home's "Mattresses" division card. */
  homeCard: blueShot("luna", "room-a"),
} as const;
