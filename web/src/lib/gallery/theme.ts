import type { CSSProperties } from "react";
import type { Theme } from "./types";

/** Turn a slide Theme into a CSS custom-property style object for the grid wrapper. */
export function themeVars(t: Theme): CSSProperties {
  return {
    ["--bg" as string]: t.bg,
    ["--card-bg" as string]: t.cardBg,
    ["--card-bg2" as string]: t.cardBg2,
    ["--card-dark" as string]: t.cardDark,
    ["--accent" as string]: t.accent,
    ["--accent2" as string]: t.accent2,
    ["--accent-text" as string]: t.accentText,
    ["--text" as string]: t.text,
    ["--subtext" as string]: t.subtext,
    ["--overlay-card" as string]: t.overlayCard,
    ["--overlay-accent" as string]: t.overlayAccent,
  } as CSSProperties;
}
