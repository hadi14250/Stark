/**
 * STARK — token mirror for JS/TS consumers (Framer transitions, GSAP, canvas).
 *
 * This is the READ-ONLY mirror of the CSS primitives in `tokens.css`.
 * CSS is the runtime source of truth (drives utilities + runtime theming);
 * this file exists because Framer needs easing as a number[] tuple and GSAP
 * sometimes wants raw values. Keep the two in sync — `tokens.test.ts` asserts
 * parity so they cannot drift.
 */

export const color = {
  greenForest: "#1c3c2d",
  greenLogo: "#1c3d2e",
  greenDeep1: "#142c21",
  greenDeep2: "#11271c",
  greenDeep3: "#0c1a13",
  cream: "#f3efe6",
  creamCard: "#ece7da",
  tan1: "#c2a878",
  tan2: "#dbc9ac",
  tan3: "#b79a6a",
  tan4: "#9a7b45",
  inkCreamStrong: "#1c3c2d",
  inkCreamBody: "#4e5c51",
  inkCreamMuted: "#496357",
  inkGreenStrong: "#f3efe6",
  inkGreenBody: "#c2cfc4",
  inkGreenMuted: "#9fb0a2",
  brandBlue: "#0e5c8d",
  brandSiesta: "#5c2482",
  brandSiestaAccent: "#db8132",
} as const;

/** Cubic-bezier easings as [x1,y1,x2,y2] tuples (Framer Motion `ease` form). */
export const ease = {
  standard: [0.2, 0.8, 0.2, 1],
  wood: [0.16, 1, 0.3, 1],
  wipe: [0.76, 0, 0.24, 1],
  line: [0.7, 0, 0.2, 1],
  cushion: [0.34, 1.3, 0.64, 1],
} as const;

/** Same easings as CSS strings (GSAP / inline style). */
export const easeCss = {
  standard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  wood: "cubic-bezier(0.16, 1, 0.3, 1)",
  wipe: "cubic-bezier(0.76, 0, 0.24, 1)",
  line: "cubic-bezier(0.7, 0, 0.2, 1)",
  cushion: "cubic-bezier(0.34, 1.3, 0.64, 1)",
} as const;

export const duration = {
  fast: 0.2,
  reveal: 0.9,
  wipe: 1.15,
} as const;

export type EaseName = keyof typeof ease;
