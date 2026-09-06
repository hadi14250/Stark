import {
  BLUE_MODELS,
  SIESTA_MODELS,
  blueShot,
  siestaShot,
} from "@/components/mattresses/assets";

/**
 * THE GALLERY IS A PHOTO MANIFEST, AND THAT IS THE WHOLE MODEL.
 *
 * ===========================================================================
 * THE CLIENT'S PHOTO FOLDER LANDED, AND THIS IS WHERE IT LANDED
 * ===========================================================================
 *
 * Every woodworks picture below is now STARK's own work, out of the client's
 * `Website Gallery` folder, which arrives foldered by exactly the product types
 * in `SUB_CATEGORIES`. The recoloured furniture-template stock that used to
 * fill this file is gone from the repository, and so is the rotating-offset
 * `POOL` that shared eight pictures between neighbouring tabs.
 *
 * The files are written under `/public/work/<sub-category>/NN.jpg`, numbered in
 * display order: the first eight of each list are what the bento shows, and the
 * rest are reachable through the lightbox. Re-ordering a list re-orders the
 * grid and nothing else, which is the reason this stayed a plain manifest.
 *
 * WHERE A CATEGORY FOLDER WAS THIN, the shortfall was made up from the client's
 * `Extra Pictures` project folders (Al Badiya Palace, Waad Academy, the Golf
 * Club, Sendalla Island, the Private Camp, Al Haram, Mogaider Mosque, the
 * profile set), classified by what is actually in the frame. `Int./Ext.
 * Cladding` shipped three files, `Retail Stands` four and `Craftsmanship` four,
 * none of which fills a bento on its own.
 *
 * ===========================================================================
 * WHY `alt` SURVIVED THE "REMOVE ALL TEXT"
 * ===========================================================================
 *
 * Because it is not text on the page. Nothing here renders as a caption, a
 * heading or a label, it is what a screen reader says instead of the picture,
 * and it is what a search engine indexes. Dropping it would make the route
 * invisible to both. "No visible text" and "no accessible name" are different
 * instructions and only the first one was given.
 *
 * The alt keys are per sub-category now rather than one shared "placeholder".
 * They can describe the subject honestly because the subject is real: a door
 * folder holds doors. They stay generic WITHIN a category, because no per-photo
 * captions were supplied and inventing a project name for a photograph is the
 * one thing worse than a general description.
 *
 * ===========================================================================
 * ⚠ DESIGN IS THE ONE TAB STILL SHORT OF ITS OWN MATERIAL
 * ===========================================================================
 *
 * The client chose renders, mood boards and material boards for this tab. The
 * folder contains no drawing sets and no boards as such, so:
 *
 *   renders          the visualisations that ARE in the set: the yacht club
 *                    interiors, the wardrobe studies and the studio-rendered
 *                    furniture. Every one of these is a render, not a photo.
 *   material-boards  finish and pattern samples photographed flat: the veneer
 *                    sample board, the CNC pattern lay-ups, the oak decappe
 *                    finish. These are what a material board is made of.
 *   mood-boards      ⚠ THE WEAKEST OF THE THREE. Concept imagery and pattern
 *                    studies, standing in for boards nobody has supplied. If a
 *                    real set never arrives, hiding the sub-category is better
 *                    than dressing this up: it is one entry in SUB_CATEGORIES.
 *
 * The mattress halves are the manufacturer's own product photography, resolved
 * through the same `blueShot` / `siestaShot` helpers the mattresses route uses,
 * so the gallery and the page can never drift apart.
 */

export type DivisionId = "woodworks" | "mattresses" | "design";

/**
 * The sub-categories, and the ONLY place the division relation is written down.
 *
 * Woodworks' eight are the company profile's own product list (p15), in its
 * order, and they are also the folder names in the client's photo delivery.
 * The client asked for the gallery's woodworks tab to carry exactly these, and
 * for the old top-level "Furniture" tab to become one of them, "the furniture
 * … will be the loose furniture as in company profile", which is also how p8
 * files it: loose furniture sits INSIDE custom wood works, not beside it.
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
   * Describes what is in the frame, at the level the client's own foldering
   * describes it. No photograph here is captioned with a project, a client or a
   * specification, because none was supplied with the files.
   */
  altKey: string;
};

/**
 * `n` numbered files from one sub-category's folder, in display order.
 *
 * The files are written by the import step as `01.jpg`, `02.jpg` … under
 * `/public/work/<sub>/`, so the manifest is a count rather than a list of
 * names. Adding photographs to a category means dropping them in the folder,
 * renumbering, and raising the count here.
 */
function work(sub: SubCategoryId, n: number, altKey: string): GalleryImage[] {
  return Array.from({ length: n }, (_, i) => ({
    src: `/work/${sub}/${String(i + 1).padStart(2, "0")}.jpg`,
    altKey,
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

export const IMAGES: Record<SubCategoryId, GalleryImage[]> = {
  "loose-furniture": work("loose-furniture", 25, "looseFurniture"),
  doors: work("doors", 19, "doors"),
  "built-in-joinery": work("built-in-joinery", 24, "builtInJoinery"),
  cladding: work("cladding", 16, "cladding"),
  "kitchens-wardrobes": work("kitchens-wardrobes", 15, "kitchensWardrobes"),
  "outdoor-structures": work("outdoor-structures", 19, "outdoorStructures"),
  "retail-stands": work("retail-stands", 8, "retailStands"),
  craftsmanship: work("craftsmanship", 18, "craftsmanship"),
  blue: blueImages,
  siesta: siestaImagesList,
  renders: work("renders", 8, "renders"),
  "mood-boards": work("mood-boards", 8, "moodBoards"),
  "material-boards": work("material-boards", 8, "materialBoards"),
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
