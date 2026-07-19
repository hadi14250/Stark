export type SlideId = "reykjavik" | "kyoto" | "santorini";

/** Per-slide palette. Consumed as CSS custom properties on the grid wrapper. */
export interface Theme {
  /** page background behind the grid */
  bg: string;
  /** default colored card fill (text cards) */
  cardBg: string;
  /** slightly lighter/alternate card fill */
  cardBg2: string;
  /** neutral/dark card fill (PREVIOUS/NEXT buttons, Stay) */
  cardDark: string;
  /** accent color — CTA fill, highlights */
  accent: string;
  /** accent gradient end (CTA has a subtle vertical gradient) */
  accent2: string;
  /** text color on top of the accent CTA */
  accentText: string;
  /** primary text */
  text: string;
  /** muted/secondary text */
  subtext: string;
  /** overlay panel card fill (semi-transparent over the photo) */
  overlayCard: string;
  /** overlay accent CTA */
  overlayAccent: string;
}

export interface Activity {
  title: string;
  desc: string;
}

export interface Overlay {
  /** cursive eyebrow, e.g. "Visit Japan" */
  eyebrow: string;
  /** big title, e.g. "The Zen Experience" */
  title: string;
  /** whether the eyebrow uses the warm/orange or plain white cursive treatment */
  bestTime: string;
  activities: Activity[];
  ctaLabel: string;
  /** full-bleed background image */
  bg: string;
}

/**
 * The editable copy for one slide — a flat, JSON-safe projection of every text
 * field the Text tab exposes. The grid fields (city … cuisineLine) are baked
 * into the standalone export; the overlay* fields drive the detail panel only
 * (live), which the export omits. Held in GalleryConfig.texts (persisted, in
 * the share link) — see makeDefaultConfig / applySlideText in lib/editor/config.
 */
export interface SlideText {
  /* hero card */
  city: string;
  subtitle: string;
  /* intro card + CTA button */
  headline: string;
  paragraph: string;
  ctaLabel: string;
  /* small info-card lines (the "Explore/Stay/Cuisine" labels stay fixed) */
  exploreLine: string;
  stayLine: string;
  cuisineLine: string;
  /* detail overlay (live only — not part of the export) */
  overlayEyebrow: string;
  overlayTitle: string;
  overlayBestTime: string;
  overlayCtaLabel: string;
  overlayActivities: Activity[];
}

export interface Slide {
  id: SlideId;
  theme: Theme;

  /** hero card */
  city: string;
  subtitle: string;
  heroImage: string;

  /** intro text card */
  headline: string;
  paragraph: string;
  ctaLabel: string;

  /** image slots */
  introImage: string; // small landscape next to the paragraph (mobile) / not shown desktop
  portraitA: string; // tall image beside intro (desktop col1)
  blossom: string; // large center portrait (desktop col2 middle)
  portraitB: string; // top-right tall image (desktop col3 top)

  /** small info cards. Stark added the *Label fields: the handoff hardcoded
      "Explore"/"Stay"/"Cuisine" in the markup, which is travel-demo
      vocabulary that has no business on a manufacturer's project page. */
  exploreLabel: string;
  stayLabel: string;
  cuisineLabel: string;
  exploreLine: string;
  stayLine: string;
  cuisineLine: string;
  cuisineImage: string; // food image at bottom of Cuisine card

  overlay: Overlay;
}
