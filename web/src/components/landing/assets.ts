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

  /** Category cards — Woodworks / Mattresses / Turnkey. */
  categories: [
    `${base}/d1c0e28eb1c679aa.png`,
    `${base}/847c93f88825cbef.png`,
    `${base}/9147afdc9d8c4223.png`,
  ] as const,

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
    /** Material cards — small, cropped, in a scrolling strip. */
    materials: [
      `${base}/763ba2c7f4c29838.jpg`,
      `${base}/bf46cb0e0db7539f.jpg`,
      `${base}/08f1f8d97cb5f63f.jpg`,
      `${base}/5d5c40ccbb6b257b.jpg`,
      `${base}/9bc56e8ed0aded95.jpg`,
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
