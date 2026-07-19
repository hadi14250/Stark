/**
 * STARK — self-hosted fonts via next/font/google.
 *
 * Each font exposes a CSS variable that the token layer (@theme in tokens.css)
 * maps to a semantic --font-* alias. Arabic (IBM Plex Sans Arabic) replaces
 * DIN Next, which the brand book specifies but which is a paid commercial
 * licence. Sora has no Arabic coverage, so [lang="ar"] re-points
 * --font-display/-body to Plex Arabic in tokens.css.
 *
 * FOUR families, down from seven. PT Serif, Mulish and Poppins were loaded for
 * the Element and Dreamzy page themes, which Phases C and D deleted — three
 * unused webfont families on every page load, for themes that no longer exist.
 * Adding a family here costs every visitor on every route, so the bar is that
 * the brand book names it.
 */
import { Sora, Roboto, Roboto_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";

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

/** Space-joined className to apply all font variables on <html>. */
export const fontVariables = [
  sora.variable,
  roboto.variable,
  robotoMono.variable,
  plexArabic.variable,
].join(" ");
