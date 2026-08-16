/**
 * The stage's data shape — EIGHT PICTURES AND A PALETTE, and nothing else.
 *
 * ===========================================================================
 * WHAT CHANGED, AND WHAT DELIBERATELY DID NOT
 * ===========================================================================
 *
 * This interface used to carry the travel demo's copy fields alongside its
 * image slots: `city`, `subtitle`, `headline`, `paragraph`, three info-card
 * lines, and a nested `overlay` of ten more. The client's review removed every
 * one of them — "remove all text and put pictures … if there's only a text
 * container replace it with a picture that's the same size … remove the view
 * details button". So the text fields are gone and the three text cells are
 * image cells now.
 *
 * THE FIELD NAMES STAY AS THEY ARE, and that is on purpose. `blossom` is the
 * large centre portrait and `cuisineImage` is the small square at the foot of
 * column three — names inherited from the demo the engine was written against.
 * The transition engine reads them DIRECTLY (`transitions/core.ts` does
 * `hero: (s) => s.heroImage`), the stylesheet's cell classes are named after
 * them, and `config.ts`'s direction map is keyed by them. Renaming would touch
 * nine coupled sites and change nothing anybody can see. The mapping from
 * meaning to slot happens once, in `toSlide.ts`, and nowhere else.
 *
 * A SLIDE IS A SUB-CATEGORY NOW. It used to be a project, which was the third
 * level of tabs; the client asked for two levels and for the arrows to "move us
 * through the subtab", so Doors is a slide, Cladding is a slide, and Previous /
 * Next travel between them.
 */

/** Per-slide palette. Consumed as CSS custom properties on the grid wrapper. */
export interface Theme {
  /** page background behind the grid */
  bg: string;
  /** default card fill, seen while a photo is still decoding */
  cardBg: string;
  /** slightly lighter/alternate card fill */
  cardBg2: string;
  /** neutral/dark card fill (PREVIOUS/NEXT buttons) */
  cardDark: string;
  /** accent color — highlights */
  accent: string;
  /** accent gradient end */
  accent2: string;
  /** text color on top of the accent */
  accentText: string;
  /** primary text */
  text: string;
  /** muted/secondary text */
  subtext: string;
  /** overlay panel card fill */
  overlayCard: string;
  /** overlay accent */
  overlayAccent: string;
}

export interface Slide {
  /** The sub-category id — `doors`, `blue`, `mood-boards` … */
  id: string;
  theme: Theme;

  /**
   * The accessible name for every picture in this slide.
   *
   * ONE NAME, NOT EIGHT. "Remove all text" was about the page, not about the
   * accessibility tree — an unnamed image is invisible to a screen reader and
   * to a search engine, which is a different thing from being uncaptioned. The
   * eight cells of one slide are eight views of the same subject, so they share
   * the sub-category's name rather than inventing eight descriptions nobody
   * wrote.
   */
  alt: string;

  /* ---- the eight picture slots, in the stylesheet's own vocabulary ---- */
  /** column 1, top — the large landscape */
  heroImage: string;
  /** column 1, middle-left — was the headline + paragraph card */
  introImage: string;
  /** column 1, middle-right — tall */
  portraitA: string;
  /** column 2, top — was the "Scope" line */
  exploreImage: string;
  /** column 2, middle — the large centre portrait */
  blossom: string;
  /** column 2, foot — was the "Delivery" line */
  stayImage: string;
  /** column 3, top — tall */
  portraitB: string;
  /** column 3, foot — was the "Materials" card's photo */
  cuisineImage: string;
}
