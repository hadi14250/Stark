/**
 * STARK — token mirror for JS/TS consumers (Framer transitions, GSAP, canvas).
 *
 * This is the READ-ONLY mirror of the CSS primitives in `tokens.css`.
 * CSS is the runtime source of truth (drives utilities + runtime theming);
 * this file exists because Framer needs easing as a number[] tuple and GSAP
 * sometimes wants raw values. Keep the two in sync — `tokens.test.ts` asserts
 * parity so they cannot drift.
 *
 * Only PRIMITIVES are mirrored, never semantic roles: a semantic role's value
 * depends on which [data-theme] an element sits under, which a build-time
 * constant cannot know. JS that needs a themed colour must read the computed
 * custom property, not import from here.
 */

/**
 * The official brand palette — a 6-column x 4-step grid, sampled from
 * STARK-Brand-Guidelines.pdf p.22 (the text extraction dropped every colour
 * page). HIGHER NUMBER = DARKER in every column.
 */
export const color = {
  // Brand Green
  green500: "#1c3d2e",
  green400: "#496357",
  green300: "#8d9d96",
  green200: "#bac4bf",
  // Neutral (graphite) — Woodworks' ramp
  neutral500: "#1d1d1b",
  neutral400: "#4a4a48",
  neutral300: "#8d8d8c",
  neutral200: "#bababa",
  // Sage — interactive, but see tokens.css: it fails contrast on light surfaces
  sage500: "#679b83",
  sage400: "#85af9b",
  sage300: "#b2ccc0",
  sage200: "#d1e0d9",
  // Warm Gray — Woodworks' surfaces
  warm500: "#b0b6aa",
  warm400: "#bfc4bb",
  warm300: "#d7dad4",
  warm200: "#e7e8e5",
  // Off-White — the page
  white500: "#faf5ef",
  white400: "#fbf7f2",
  white300: "#fcf9f6",
  white200: "#fdfbfa",
  // Sand — the accent
  sand500: "#dbcaad",
  sand400: "#e2d4bd",
  sand300: "#ece4d5",
  sand200: "#f4eee6",

  // Documented extensions — OURS, not official brand values.
  green700: "#142c21",
  green800: "#11271c",
  green900: "#0c1a13",
  greenPanel: "#16271e",

  // Sub-brands (mattress division), contained to their own subtrees.
  brandBlue: "#0e5c8d",
  brandSiesta: "#5c2482",
  brandSiestaAccent: "#db8132",
} as const;

/** Cubic-bezier easings as [x1,y1,x2,y2] tuples (Framer Motion `ease` form). */
export const ease = {
  standard: [0.2, 0.8, 0.2, 1],
  zoom: [0.16, 1, 0.3, 1],
  curtain: [0.76, 0, 0.24, 1],
  line: [0.7, 0, 0.2, 1],
  cushion: [0.34, 1.3, 0.64, 1],
} as const;

/** Same easings as CSS strings (GSAP / inline style). */
export const easeCss = {
  standard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  zoom: "cubic-bezier(0.16, 1, 0.3, 1)",
  curtain: "cubic-bezier(0.76, 0, 0.24, 1)",
  line: "cubic-bezier(0.7, 0, 0.2, 1)",
  cushion: "cubic-bezier(0.34, 1.3, 0.64, 1)",
} as const;

export const duration = {
  instant: 0.15,
  fast: 0.25,
  base: 0.45,
  reveal: 0.85,
  curtain: 0.6,
} as const;

/** Stagger steps, in seconds (Framer wants seconds, the CSS tokens are ms). */
export const stagger = {
  card: 0.07,
  process: 0.11,
  hero: 0.12,
} as const;

export type EaseName = keyof typeof ease;
