/**
 * Landing image manifest — semantic keys → public paths.
 *
 * This module is the ONE place that maps files to meaning, so call-sites read
 * clearly and a re-shoot is a single-file edit. Alt text lives in the `landing`
 * and `woodworks` message namespaces, not here.
 *
 * ===========================================================================
 * THESE ARE STARK'S OWN PHOTOGRAPHS NOW
 * ===========================================================================
 *
 * Every path below points into `/public/work/site/`, written from the client's
 * `Website Gallery` delivery. The recoloured furniture-template stock that used
 * to live in `/public/landing/` is deleted: not repointed, not kept "just in
 * case", deleted, because a placeholder that stays on disk is a placeholder
 * that comes back.
 *
 * ⚠ THE FILE NAMES ARE THE ASSIGNMENT. `home-band-1.jpg` is the picture chosen
 * for the FIRST capability band, whose copy is "Automated machinery" and whose
 * alt is "Precision woodworking machinery on the production floor". Swapping
 * two files re-captions two photographs. Every one below was picked against the
 * string it sits under, which is why the shot list reads oddly out of context:
 * `home-band-2` is a wide, half-built workshop because the copy it illustrates
 * is "Large-scale capacity", not because it is the prettiest frame in the set.
 *
 * `torn-paper.svg` stays where it was. It is a drawn divider, not a photograph.
 */

const base = "/work/site";

export const landingImages = {
  /** Hero band, full-bleed, framed 50% 91%. A finished hospitality lounge. */
  hero: `${base}/home-hero.jpg`,

  /** Torn-paper divider SVG (fill already cream). Decorative. */
  tornPaper: "/landing/torn-paper.svg",

  /**
   * About collage — [tall-left pentagon, top-right card, bottom].
   *
   * Keyed to `landing.about.collageAlt`, in order: a crafted wood interior
   * detail, finished furniture in a styled interior, a sculptural wood piece.
   * Index 2 is not rendered by `About` itself; it is kept because the array is
   * the collage's own order and because the alt deck has three entries.
   */
  collage: [
    `${base}/home-collage-1.jpg`,
    `${base}/home-collage-2.jpg`,
    `${base}/home-collage-3.jpg`,
  ] as const,

  /**
   * Capability bands — [Automated machinery, Large-scale capacity, Quality
   * control], matching `landing.features.items` by index.
   *
   * The first two are the factory floor and the third is a finished interior,
   * because that is what the third card's own alt says: quality control is
   * shown by the result, not by a clipboard.
   */
  bands: [
    `${base}/home-band-1.jpg`,
    `${base}/home-band-2.jpg`,
    `${base}/home-band-3.jpg`,
  ] as const,

  /**
   * Category cards — Woodworks / Mattresses / Engineering & Technical Services.
   *
   * ⚠ INDEX 1 IS NOT RENDERED HERE. `DivisionIndex.tsx:176` swaps it for
   * `mattressImages.homeCard` (a real blue product) and `Turnkey.tsx` skips it.
   * The slot keeps a real bedroom frame rather than a hole, because indexes 0
   * and 2 are read from this array positionally and a shorter array would
   * silently re-point them.
   */
  categories: [
    `${base}/home-category-woodworks.jpg`,
    `${base}/home-category-mattresses.jpg`,
    `${base}/home-category-turnkey.jpg`,
  ] as const,

  /**
   * A hotel bedroom, for siesta's panel on the mattresses route.
   *
   * ⚠ NOTHING RENDERS THIS ANY MORE. siesta's half of the brand duet is
   * `siestaImages.brand` — the contract brand's own room photography — since
   * the client supplied it. The key is kept so that the history stays readable:
   * this slot is what a made-up hotel bedroom was doing on a mattress brand's
   * panel, and it should not come back.
   */
  hospitalityRoom: `${base}/home-category-mattresses.jpg`,

  /**
   * Woodworks' own set. Its own photographs, not Home's.
   *
   * The page used to render `bands[0..2]`, byte-for-byte the same three files
   * as Home's Capabilities section, in the same order, one of them three times
   * on the page. The client's review called that out and it was correct: it is
   * the single strongest signal that a page is a recolour rather than a page.
   * Nothing on this route now appears on Home.
   */
  woodworks: {
    /** `woodworks.hero.alt`: machined timber on the production line. */
    hero: `${base}/woodworks-hero.jpg`,

    /**
     * One per chapter, in `woodworks.capabilities.items` order:
     *   1  Automated production lines   the factory floor mid-run
     *   2  Conditioned before it is cut raw timber stacked before machining
     *   3  Finishing in-house           a finished wood surface, close
     */
    chapters: [
      `${base}/woodworks-chapter-1.jpg`,
      `${base}/woodworks-chapter-2.jpg`,
      `${base}/woodworks-chapter-3.jpg`,
    ] as const,

    /**
     * Product cards — small, cropped, in a scrolling strip.
     *
     * ⚠ ORDER IS A MAPPING, NOT AN INVENTORY. Each entry sits under one of the
     * eight product types in `woodworks.products.items`, BY INDEX
     * (`ProductStrip` reads `images[i % images.length]`), so reordering this
     * array re-captions every photograph:
     *
     *   1  Loose Furniture & Upholstery   an upholstered sofa
     *   2  Doors                          a panelled double door
     *   3  Built-in Furniture & Joinery   a lit display unit
     *   4  Interior & Exterior Cladding   a wood-clad corridor
     *   5  Kitchens, Wardrobes & Vanities a fitted kitchen run
     *   6  Outdoor Wooden Structures      a timber pavilion
     *   7  Retail Stands & Display        an exhibition stand
     *   8  Craftsmanship & Artistic       carved brackets, close
     *
     * IT WAS SIX FILES AGAINST EIGHT LABELS and wrapped, so cards 7 and 8 wore
     * cards 1 and 2's photographs. It is eight now, and card 6 is an actual
     * outdoor structure rather than the indoor room that used to sit there.
     */
    products: [
      `${base}/woodworks-product-1.jpg`,
      `${base}/woodworks-product-2.jpg`,
      `${base}/woodworks-product-3.jpg`,
      `${base}/woodworks-product-4.jpg`,
      `${base}/woodworks-product-5.jpg`,
      `${base}/woodworks-product-6.jpg`,
      `${base}/woodworks-product-7.jpg`,
      `${base}/woodworks-product-8.jpg`,
    ] as const,

    /** Unrendered today; kept as the route's spare frame. */
    projects: `${base}/woodworks-projects.jpg`,
  },

  /**
   * Home's gallery mosaic — 10 tiles, in the design's tile order.
   *
   * ⚠ KEYED TO `landing.gallery.tilesAlt` BY INDEX, and the alt deck is
   * specific ("Furniture detail against a coloured wall", "Warm interior with
   * wood and textile finishes"). `GalleryTeaser` anchors on 0, 5 and 8 and runs
   * 1 through 4 down the side, so those seven carry the section; 6, 7 and 9 are
   * held for the layout's own reasons. Reordering re-captions.
   */
  gallery: [
    `${base}/home-tile-1.jpg`,
    `${base}/home-tile-2.jpg`,
    `${base}/home-tile-3.jpg`,
    `${base}/home-tile-4.jpg`,
    `${base}/home-tile-5.jpg`,
    `${base}/home-tile-6.jpg`,
    `${base}/home-tile-7.jpg`,
    `${base}/home-tile-8.jpg`,
    `${base}/home-tile-9.jpg`,
    `${base}/home-tile-10.jpg`,
  ] as const,
} as const;
