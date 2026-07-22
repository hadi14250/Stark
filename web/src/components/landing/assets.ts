/**
 * Landing image manifest — semantic keys → public paths.
 *
 * The files keep their source hash names on disk (`web/public/landing/`); this
 * module is the ONE place that maps them to meaning, so call-sites read clearly
 * and swapping in real Stark photography later (Phase 9 shot-list) is a
 * single-file edit. Alt text lives in the `landing` messages namespace, not here.
 *
 * These are the recolored furniture-template photos, kept as-is per the current
 * task ("keep images the same for now"). Do not tint them.
 */

const base = "/landing";

export const landingImages = {
  /** Hero furniture scene (full-bleed band, framed 50% 91%). */
  hero: `${base}/301336c2a6f33570.jpg`,

  /** Torn-paper divider SVG (fill already cream). Decorative. */
  tornPaper: `${base}/torn-paper.svg`,

  /** About collage — [tall-left, top-right, bottom]. */
  collage: [
    `${base}/6ef0b9569b029eeb.png`,
    `${base}/e84ce9bd89e1844a.png`,
    `${base}/d41cceabf062f878.png`,
  ] as const,

  /** Feature-band images — [band1, band2, band3] (capabilities). */
  bands: [
    `${base}/8244b28836385a29.png`,
    `${base}/44e767d2df80b104.png`,
    `${base}/815f8b5fd0db3732.png`,
  ] as const,

  /**
   * Category cards — Woodworks / Mattresses / Turnkey.
   *
   * ⚠ INDEX 1 IS NOT RENDERED HERE ANY MORE. `DivisionIndex.tsx:176` swaps it
   * for `mattressImages.homeCard` (a real blue product) and `Turnkey.tsx` skips
   * it. The slot is kept rather than removed because this array is the design's
   * tile order and indexes 0 and 2 are read from it positionally.
   */
  categories: [
    `${base}/d1c0e28eb1c679aa.png`,
    `${base}/847c93f88825cbef.png`,
    `${base}/9147afdc9d8c4223.png`,
  ] as const,

  /**
   * A hotel bedroom, for siesta's panel on the mattresses route.
   *
   * ⚠ THE SAME FILE AS `categories[1]`, DELIBERATELY, AND IT IS FREE. That slot
   * stopped rendering when Home's mattress card became a real blue product, so
   * this is a re-use of a file, not a second appearance of an image: it renders
   * in exactly one place on the site.
   *
   * WHAT IT REPLACED WAS THE ACTUAL PROBLEM. siesta's panel was pointed at
   * `gallery[6]`, which is byte-identical to the WOODWORKS HERO: one photograph
   * doing two unrelated jobs on two different routes, and on siesta's side it
   * was a grey wall with framed prints and a black sofa. A hospitality mattress
   * brand was being illustrated by a living room with no bed in it.
   *
   * This frame is a made-up hotel bedroom: headboard, bedside lamps, a bench at
   * the foot. It claims nothing — no mattress brand is legible in it, which is
   * the whole reason it is safe. A blue product shot would have been sharper
   * and would have told a hotel buyer it was looking at the contract range.
   *
   * TODO(F-content): still a placeholder. Real siesta photography is a client
   * dependency and is on the open-questions list.
   */
  hospitalityRoom: `${base}/847c93f88825cbef.png`,

  /**
   * TODO(F-content): Woodworks' own set.
   *
   * The page previously rendered `bands[0..2]` — byte-for-byte the same three
   * files as Home's Capabilities section, in the same order, one of them three
   * times on the page. The client's review called that out, and correctly: it
   * is the single strongest signal that a page is a recolour rather than a
   * page.
   *
   * These are the least Home-associated files left in the set (Home's teaser
   * anchors on gallery 0/5/8 and its side tiles on 1–4), reassigned here and
   * graded dark by the theme's `--image-filter`. That is a mitigation, not a
   * fix: the real fix is photographs of the actual Jeddah factory, which is a
   * client dependency. Nothing here claims to BE the factory — every alt string
   * describes the material or the operation, never a specific facility.
   */
  woodworks: {
    hero: `${base}/f26d3ba55447fc47.jpg`,
    /** One per chapter, in chapter order. */
    chapters: [
      `${base}/46cb9cc7e202b440.jpg`,
      `${base}/d41cceabf062f878.png`,
      `${base}/f264f5dea2782694.jpg`,
    ] as const,
    /**
     * Product cards — small, cropped, in a scrolling strip.
     *
     * ⚠ ORDER IS A MAPPING, NOT AN INVENTORY. Each entry sits under one of the
     * six product types in `woodworks.products.items`, by index, so reordering
     * this array re-captions every photograph. It was reordered once already,
     * when the strip stopped being substrates and became products: a close
     * crop of a room is a fair illustration of "MDF", and a flatly wrong one
     * of "Retail Stands & Podiums".
     *
     * TODO(F-content): AND IT IS STILL WRONG, because no reordering can fix
     * it. All six files are recoloured domestic-interior stock. There is no
     * photograph in the entire `/landing/` set showing a door, wall cladding,
     * an outdoor structure or a retail podium — so the order below is only the
     * least-bad assignment available:
     *
     *   01 Doors & Panels        the stair joinery and panelled kitchen run
     *   02 Interior Cladding     wall and ceiling surfaces, fitted units
     *   03 Furniture & Joinery   a sofa; the one card whose subject is real
     *   04 Kitchens/Wardrobes    a carcass unit with doors and drawers
     *   05 Outdoor Structures    ⚠ AN INDOOR ROOM. Nothing outdoor exists.
     *   06 Retail Stands         a styled vignette on stone — closest to a
     *                            display setup, which is not saying much
     *
     * Row 05 is a visible contradiction and should be treated as a launch
     * blocker, not a nice-to-have. Six real product photographs is the fix and
     * it is a client dependency.
     */
    products: [
      `${base}/08f1f8d97cb5f63f.jpg`,
      `${base}/9bc56e8ed0aded95.jpg`,
      `${base}/bf46cb0e0db7539f.jpg`,
      `${base}/763ba2c7f4c29838.jpg`,
      `${base}/5d5c40ccbb6b257b.jpg`,
      `${base}/42737a5b8707da10.jpg`,
    ] as const,
    projects: `${base}/f7965388e07b0b0c.jpg`,
  },

  /** Gallery mosaic — 10 tiles, in the design's tile order. */
  gallery: [
    `${base}/42737a5b8707da10.jpg`,
    `${base}/763ba2c7f4c29838.jpg`,
    `${base}/bf46cb0e0db7539f.jpg`,
    `${base}/9bc56e8ed0aded95.jpg`,
    `${base}/f7965388e07b0b0c.jpg`,
    `${base}/08f1f8d97cb5f63f.jpg`,
    `${base}/f26d3ba55447fc47.jpg`,
    `${base}/5d5c40ccbb6b257b.jpg`,
    `${base}/f264f5dea2782694.jpg`,
    `${base}/46cb9cc7e202b440.jpg`,
  ] as const,
} as const;
