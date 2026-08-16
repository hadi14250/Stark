import {
  BLUE_MODELS,
  SIESTA_MODELS,
  blueShot,
  siestaShot,
} from "@/components/mattresses/assets";

/**
 * THE GALLERY IS A PHOTO MANIFEST NOW, AND THAT IS THE WHOLE MODEL.
 *
 * ===========================================================================
 * WHAT THIS REPLACED
 * ===========================================================================
 *
 * `projects.ts` — a 780-line data model in which every gallery entry carried
 * six named photo cells, ten i18n keys, a palette name and a full-bleed overlay
 * background, feeding a bento stage, a push-transition engine and a detail
 * overlay (~3,000 lines of TSX and CSS between them).
 *
 * The client's review removed the reason for all of it: "remove all text and
 * put pictures … if there's only a text container replace it with a picture …
 * remove the view details button … only make it two levels of tabs not 3". The
 * headline, the paragraph, the three spec lines, the ten-field overlay and the
 * project level itself are gone. What is left is pictures, in two levels of
 * grouping — which is a list of files.
 *
 * Stripping the old stage back to that would have cost more than replacing it
 * and left the machinery of a slide engine behind a picture grid.
 *
 * ===========================================================================
 * WHY `alt` SURVIVED THE "REMOVE ALL TEXT"
 * ===========================================================================
 *
 * Because it is not text on the page. Nothing here renders as a caption, a
 * heading or a label — it is what a screen reader says instead of the picture,
 * and it is what a search engine indexes. Dropping it would make the route
 * invisible to both. "No visible text" and "no accessible name" are different
 * instructions and only the first one was given.
 *
 * ===========================================================================
 * ⚠ THE WOODWORKS AND DESIGN IMAGES ARE PLACEHOLDERS
 * ===========================================================================
 *
 * Every file under `/landing/` is recoloured furniture-template stock: there is
 * no door, no cladding run, no pergola, no retail podium and no drawing in the
 * entire set. The client is supplying a real photo folder, foldered by the
 * product types below; when it lands, this file is the ONLY thing that changes.
 * That is the reason the manifest exists as its own module rather than being
 * inlined into the component.
 *
 * The mattress halves are real: the manufacturer's own product photography,
 * resolved through the same `blueShot` / `siestaShot` helpers the mattresses
 * route uses, so the gallery and the page can never drift apart.
 */

export type DivisionId = "woodworks" | "mattresses" | "design";

/**
 * The sub-categories, and the ONLY place the division relation is written down.
 *
 * Woodworks' eight are the company profile's own product list (p15), in its
 * order. The client asked for the gallery's woodworks tab to carry exactly
 * these, and for the old top-level "Furniture" tab to become one of them —
 * "the furniture … will be the loose furniture as in company profile" — which
 * is also how p8 files it: loose furniture sits INSIDE custom wood works, not
 * beside it.
 */
export const SUB_CATEGORIES = [
  { id: "loose-furniture", division: "woodworks" },
  { id: "doors", division: "woodworks" },
  { id: "built-in-joinery", division: "woodworks" },
  { id: "cladding", division: "woodworks" },
  { id: "kitchens-wardrobes", division: "woodworks" },
  { id: "outdoor-structures", division: "woodworks" },
  { id: "retail-stands", division: "woodworks" },
  { id: "craftsmanship", division: "woodworks" },
  { id: "blue", division: "mattresses" },
  { id: "siesta", division: "mattresses" },
  { id: "renders", division: "design" },
  { id: "mood-boards", division: "design" },
  { id: "material-boards", division: "design" },
] as const satisfies readonly { id: string; division: DivisionId }[];

export type SubCategoryId = (typeof SUB_CATEGORIES)[number]["id"];

/** Reading order of the three tabs. */
export const DIVISIONS: readonly DivisionId[] = ["woodworks", "mattresses", "design"];

export type GalleryImage = {
  src: string;
  /**
   * Deliberately GENERIC for the placeholder sets.
   *
   * A shared alt reading "a fire-rated door" would state, to exactly the
   * readers who cannot check, that the factory's own work is on screen. These
   * describe what is in the frame and nothing more, and they are keyed into the
   * message deck so both locales get them.
   */
  altKey: string;
};

const land = (name: string) => `/landing/${name}`;

/**
 * The placeholder pool, split so no two sub-categories show an identical run.
 *
 * ⚠ THIS IS THE LEAST-BAD ASSIGNMENT, NOT A MAPPING. Every one of these is a
 * domestic interior. Card 05 on the old product strip showed an indoor room
 * under "Outdoor Wooden Structures" and no reordering could fix it, because the
 * set contains nothing outdoor. The same is true here. Treat any woodworks
 * grouping below as "some pictures, pending the real ones".
 */
const POOL = [
  "08f1f8d97cb5f63f.jpg",
  "301336c2a6f33570.jpg",
  "42737a5b8707da10.jpg",
  "44e767d2df80b104.png",
  "46cb9cc7e202b440.jpg",
  "5d5c40ccbb6b257b.jpg",
  "6ef0b9569b029eeb.png",
  "763ba2c7f4c29838.jpg",
  "815f8b5fd0db3732.png",
  "8244b28836385a29.png",
  "847c93f88825cbef.png",
  "9147afdc9d8c4223.png",
  "9bc56e8ed0aded95.jpg",
  "bf46cb0e0db7539f.jpg",
  "d1c0e28eb1c679aa.png",
  "d41cceabf062f878.png",
  "e84ce9bd89e1844a.png",
  "f264f5dea2782694.jpg",
  "f26d3ba55447fc47.jpg",
  "f7965388e07b0b0c.jpg",
] as const;

/**
 * Eight from the pool, starting at `offset`, wrapping.
 *
 * EIGHT BECAUSE THE BENTO HAS EIGHT SLOTS. The grid fills every cell from this
 * list, so a sub-category with fewer than eight would repeat pictures inside a
 * single view — visible, and the kind of thing a client reads as a bug rather
 * than as missing assets. Twenty in the pool and a rotating offset means no two
 * sub-categories open on the same picture.
 */
function placeholders(offset: number, count = 8): GalleryImage[] {
  return Array.from({ length: count }, (_, i) => ({
    src: land(POOL[(offset + i) % POOL.length]),
    altKey: "placeholder",
  }));
}

/**
 * Three shots per model, not six.
 *
 * The product cut-out, then the two room scenes. The cutaway, banner and fabric
 * macro are left out on purpose: a grid whose job is "what does this look like"
 * is weakened by three near-identical cross-sections in a row, and at 25 models
 * the six-shot version would have put 150 images behind one tab.
 */
const blueImages: GalleryImage[] = BLUE_MODELS.flatMap((m) => [
  { src: blueShot(m, "product"), altKey: "blueProduct" },
  { src: blueShot(m, "room-a"), altKey: "blueRoom" },
  { src: blueShot(m, "room-b"), altKey: "blueRoom" },
]);

const siestaImagesList: GalleryImage[] = SIESTA_MODELS.flatMap((m) => [
  { src: siestaShot(m, "product"), altKey: "siestaProduct" },
  { src: siestaShot(m, "room-a"), altKey: "siestaRoom" },
  { src: siestaShot(m, "room-b"), altKey: "siestaRoom" },
]);

/**
 * ⚠ DESIGN HAS NO PICTURES OF ITS OWN AND IS SHOWN WITH PLACEHOLDERS.
 *
 * The client chose renders, mood boards and material boards for this tab and is
 * supplying them. There is no render, board or drawing anywhere in the
 * repository — the interiors below are the same furniture stock as everything
 * else, which under "Shop drawings" would be a straightforwardly false
 * illustration. If the folder is late, hiding the Design tab is better than
 * shipping this: `DIVISIONS` is the one line to edit.
 */
export const IMAGES: Record<SubCategoryId, GalleryImage[]> = {
  "loose-furniture": placeholders(0),
  doors: placeholders(3),
  "built-in-joinery": placeholders(6),
  cladding: placeholders(9),
  "kitchens-wardrobes": placeholders(12),
  "outdoor-structures": placeholders(15),
  "retail-stands": placeholders(18),
  craftsmanship: placeholders(1),
  blue: blueImages,
  siesta: siestaImagesList,
  renders: placeholders(4),
  "mood-boards": placeholders(8),
  "material-boards": placeholders(11),
};

export function subsOf(d: DivisionId): SubCategoryId[] {
  return SUB_CATEGORIES.filter((s) => s.division === d).map((s) => s.id);
}

/** The derivation that keeps a sub-category from claiming a division it is not in. */
export function divisionOf(s: SubCategoryId): DivisionId | undefined {
  return SUB_CATEGORIES.find((x) => x.id === s)?.division;
}

export const SUB_CATEGORY_IDS: readonly SubCategoryId[] = SUB_CATEGORIES.map((s) => s.id);

/** Narrowing helpers for `?c=` and `?s=` — both user-controlled input. */
export function isDivisionId(v: unknown): v is DivisionId {
  return typeof v === "string" && (DIVISIONS as readonly string[]).includes(v);
}

export function isSubCategoryId(v: unknown): v is SubCategoryId {
  return typeof v === "string" && (SUB_CATEGORY_IDS as readonly string[]).includes(v);
}
