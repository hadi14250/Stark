/**
 * STARK — self-hosted fonts via next/font/google.
 *
 * Each font exposes a CSS variable that the token layer (@theme in tokens.css)
 * maps to a semantic --font-* alias. Arabic (IBM Plex Sans Arabic) replaces
 * DIN Next (which is a paid commercial license). Sora has no Arabic coverage,
 * so [lang="ar"] re-points --font-display/-body to Plex Arabic in tokens.css.
 */
import {
  Sora,
  Roboto,
  Roboto_Mono,
  IBM_Plex_Sans_Arabic,
  PT_Serif,
  Mulish,
  Poppins,
} from "next/font/google";

export const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

/**
 * Woodworks ("Element") page fonts — PT Serif (display/headings, incl. italics
 * for quotes + marquee) and Mulish (body/nav/labels). These are consumed ONLY
 * under `[data-theme="element"]` (see tokens.css), which re-points
 * --font-display/--font-body to them; the rest of the site keeps Sora/Roboto.
 */
export const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-pt-serif",
  display: "swap",
});

export const mulish = Mulish({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mulish",
  display: "swap",
});

/**
 * Mattresses ("Dreamzy") page font — Poppins (all weights + italics), the
 * handoff's single family for headings, body, nav and labels. Consumed ONLY
 * under `[data-theme="dreamzy"]` (see tokens.css), which re-points
 * --font-display/--font-body to it; the rest of the site keeps Sora/Roboto.
 */
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
  display: "swap",
});

/** Space-joined className to apply all font variables on <html>. */
export const fontVariables = [
  sora.variable,
  roboto.variable,
  robotoMono.variable,
  plexArabic.variable,
  ptSerif.variable,
  mulish.variable,
  poppins.variable,
].join(" ");
