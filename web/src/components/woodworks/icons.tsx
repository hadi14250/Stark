import type { SVGProps } from "react";

/**
 * Element brand icons — the concentric-ring emblem and the three social glyphs,
 * lifted verbatim from the handoff so they stay pixel-faithful. Icons inherit
 * `currentColor`, so the parent sets the tone.
 *
 * ⚠ Social hrefs are placeholders ("#") until the client confirms real accounts.
 */

/** Concentric-ring emblem: r=12 + r=6.7 strokes (2.1) and a filled r=1.9 dot. */
export function ElementMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 27 27" aria-hidden {...props}>
      <circle cx="13.5" cy="13.5" r="12" fill="none" stroke="currentColor" strokeWidth="2.1" />
      <circle cx="13.5" cy="13.5" r="6.7" fill="none" stroke="currentColor" strokeWidth="2.1" />
      <circle cx="13.5" cy="13.5" r="1.9" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M15.12 8.44h1.63V5.9c-.28-.04-1.25-.12-2.37-.12-2.35 0-3.96 1.44-3.96 4.08v2.02H8v2.83h2.42V22h2.97v-7.29h2.4l.37-2.83h-2.77V10.1c0-.82.22-1.66 1.75-1.66z" />
    </svg>
  );
}

export function PinterestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.36 9.3-.09-.79-.17-2 .03-2.87.18-.75 1.18-4.78 1.18-4.78s-.3-.6-.3-1.5c0-1.4.82-2.45 1.83-2.45.86 0 1.28.65 1.28 1.42 0 .87-.55 2.17-.84 3.37-.24 1.01.5 1.83 1.5 1.83 1.8 0 3.18-1.9 3.18-4.64 0-2.42-1.74-4.12-4.23-4.12-2.88 0-4.57 2.16-4.57 4.4 0 .87.33 1.8.75 2.31.08.1.09.19.07.29-.08.32-.25 1.01-.28 1.15-.04.19-.15.23-.34.14-1.28-.6-2.08-2.46-2.08-3.96 0-3.23 2.34-6.19 6.76-6.19 3.55 0 6.31 2.53 6.31 5.91 0 3.53-2.22 6.37-5.31 6.37-1.04 0-2.01-.54-2.35-1.18l-.64 2.43c-.23.89-.85 2.01-1.27 2.69.96.3 1.97.45 3.03.45 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

export function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M23 4.9c-.8.35-1.66.59-2.56.7a4.48 4.48 0 0 0 1.96-2.47c-.86.51-1.82.88-2.83 1.08a4.46 4.46 0 0 0-7.6 4.07A12.66 12.66 0 0 1 2.75 3.6a4.46 4.46 0 0 0 1.38 5.95c-.72-.02-1.4-.22-2-.55v.06a4.46 4.46 0 0 0 3.58 4.37c-.35.1-.72.15-1.1.15-.27 0-.53-.03-.79-.08a4.47 4.47 0 0 0 4.17 3.1A8.94 8.94 0 0 1 2 20.29a12.6 12.6 0 0 0 6.84 2c8.2 0 12.69-6.8 12.69-12.69l-.01-.58A9.05 9.05 0 0 0 23 4.9z" />
    </svg>
  );
}
