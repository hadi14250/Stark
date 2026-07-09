import type { SVGProps } from "react";

/**
 * Shared brand icons + social row. The four social glyphs and the envelope are
 * lifted verbatim from the design handoff so they stay pixel-faithful. One
 * source for the nav utility bar and the footer.
 *
 * ⚠ Social hrefs are placeholders ("#") until the client confirms real
 * accounts — do NOT invent live URLs.
 */

export function EnvelopeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" fill="none" aria-hidden {...props}>
      <rect
        x="1.6"
        y="3.6"
        width="14.8"
        height="10.8"
        rx="2.6"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M2.6 5.4 L9 9.6 L15.4 5.4"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 19.879" fill="currentColor" aria-hidden {...props}>
      <path d="M 10 0 C 4.477 0 0 4.477 0 10 C 0 14.991 3.657 19.128 8.438 19.879 L 8.438 12.89 L 5.898 12.89 L 5.898 10 L 8.438 10 L 8.438 7.797 C 8.438 5.291 9.93 3.907 12.215 3.907 C 13.309 3.907 14.453 4.102 14.453 4.102 L 14.453 6.562 L 13.193 6.562 C 11.95 6.562 11.563 7.333 11.563 8.124 L 11.563 10 L 14.336 10 L 13.893 12.89 L 11.563 12.89 L 11.563 19.879 C 16.343 19.129 20 14.99 20 10 C 20 4.477 15.523 0 10 0 Z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path d="M 10 0 C 12.717 0 13.056 0.01 14.122 0.06 C 15.187 0.11 15.912 0.277 16.55 0.525 C 17.21 0.779 17.766 1.123 18.322 1.678 C 18.83 2.178 19.224 2.783 19.475 3.45 C 19.722 4.087 19.89 4.813 19.94 5.878 C 19.987 6.944 20 7.283 20 10 C 20 12.717 19.99 13.056 19.94 14.122 C 19.89 15.187 19.722 15.912 19.475 16.55 C 19.225 17.218 18.831 17.823 18.322 18.322 C 17.822 18.83 17.217 19.224 16.55 19.475 C 15.913 19.722 15.187 19.89 14.122 19.94 C 13.056 19.987 12.717 20 10 20 C 7.283 20 6.944 19.99 5.878 19.94 C 4.813 19.89 4.088 19.722 3.45 19.475 C 2.782 19.224 2.178 18.831 1.678 18.322 C 1.169 17.822 0.776 17.217 0.525 16.55 C 0.277 15.913 0.11 15.187 0.06 14.122 C 0.013 13.056 0 12.717 0 10 C 0 7.283 0.01 6.944 0.06 5.878 C 0.11 4.812 0.277 4.088 0.525 3.45 C 0.775 2.782 1.169 2.177 1.678 1.678 C 2.178 1.169 2.782 0.776 3.45 0.525 C 4.088 0.277 4.812 0.11 5.878 0.06 C 6.944 0.013 7.283 0 10 0 Z M 10 5 C 8.674 5 7.402 5.527 6.464 6.464 C 5.527 7.402 5 8.674 5 10 C 5 11.326 5.527 12.598 6.464 13.536 C 7.402 14.473 8.674 15 10 15 C 11.326 15 12.598 14.473 13.536 13.536 C 14.473 12.598 15 11.326 15 10 C 15 8.674 14.473 7.402 13.536 6.464 C 12.598 5.527 11.326 5 10 5 Z M 16.5 4.75 C 16.5 4.418 16.368 4.101 16.134 3.866 C 15.899 3.632 15.582 3.5 15.25 3.5 C 14.918 3.5 14.601 3.632 14.366 3.866 C 14.132 4.101 14 4.418 14 4.75 C 14 5.082 14.132 5.399 14.366 5.634 C 14.601 5.868 14.918 6 15.25 6 C 15.582 6 15.899 5.868 16.134 5.634 C 16.368 5.399 16.5 5.082 16.5 4.75 Z M 10 7 C 10.796 7 11.559 7.316 12.121 7.879 C 12.684 8.441 13 9.204 13 10 C 13 10.796 12.684 11.559 12.121 12.121 C 11.559 12.684 10.796 13 10 13 C 9.204 13 8.441 12.684 7.879 12.121 C 7.316 11.559 7 10.796 7 10 C 7 9.204 7.316 8.441 7.879 7.879 C 8.441 7.316 9.204 7 10 7 Z" />
    </svg>
  );
}

function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 16" fill="currentColor" aria-hidden {...props}>
      <path d="M 19.543 2.498 C 20 4.28 20 8 20 8 C 20 8 20 11.72 19.543 13.502 C 19.289 14.487 18.546 15.262 17.605 15.524 C 15.896 16 10 16 10 16 C 10 16 4.107 16 2.395 15.524 C 1.45 15.258 0.708 14.484 0.457 13.502 C 0 11.72 0 8 0 8 C 0 8 0 4.28 0.457 2.498 C 0.711 1.513 1.454 0.738 2.395 0.476 C 4.107 0 10 0 10 0 C 10 0 15.896 0 17.605 0.476 C 18.55 0.742 19.292 1.516 19.543 2.498 Z M 8 11.5 L 14 8 L 8 4.5 L 8 11.5 Z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20.384 16.573" fill="currentColor" aria-hidden {...props}>
      <path d="M 20.383 1.967 C 19.62 2.305 18.81 2.527 17.981 2.625 C 18.855 2.103 19.509 1.28 19.821 0.311 C 19.001 0.799 18.102 1.141 17.165 1.326 C 16.536 0.653 15.701 0.206 14.792 0.056 C 13.883 -0.094 12.949 0.06 12.136 0.495 C 11.324 0.93 10.677 1.621 10.298 2.461 C 9.919 3.301 9.828 4.243 10.039 5.14 C 8.376 5.057 6.749 4.625 5.264 3.872 C 3.779 3.119 2.469 2.062 1.419 0.77 C 1.047 1.409 0.852 2.135 0.853 2.873 C 0.853 4.323 1.591 5.604 2.713 6.354 C 2.049 6.334 1.4 6.154 0.819 5.831 L 0.819 5.883 C 0.819 6.849 1.153 7.785 1.765 8.533 C 2.376 9.28 3.227 9.793 4.174 9.984 C 3.558 10.151 2.911 10.176 2.284 10.056 C 2.551 10.888 3.071 11.615 3.772 12.136 C 4.472 12.656 5.318 12.945 6.191 12.961 C 5.323 13.643 4.33 14.146 3.268 14.444 C 2.206 14.741 1.095 14.826 0 14.693 C 1.912 15.923 4.137 16.576 6.41 16.573 C 14.103 16.573 18.31 10.2 18.31 4.673 C 18.31 4.493 18.305 4.311 18.297 4.133 C 19.116 3.542 19.823 2.808 20.384 1.968 L 20.383 1.967 Z" />
    </svg>
  );
}

const SOCIALS = [
  { key: "facebook", Icon: FacebookIcon },
  { key: "instagram", Icon: InstagramIcon },
  { key: "youtube", Icon: YouTubeIcon },
  { key: "x", Icon: XIcon },
] as const;

export type SocialKey = (typeof SOCIALS)[number]["key"];

/**
 * The four brand social icons as a row of links. `labels` maps each key to its
 * localized aria-label (from the `landing.social` namespace). Icons inherit
 * `currentColor`, so the parent sets the tone (tan on green chrome).
 */
export function SocialLinks({
  labels,
  size = 15,
  className = "",
  linkClassName = "",
}: {
  labels: Record<SocialKey, string>;
  size?: number;
  className?: string;
  linkClassName?: string;
}) {
  return (
    <ul className={`flex items-center gap-4 ${className}`}>
      {SOCIALS.map(({ key, Icon }) => (
        <li key={key}>
          <a
            href="#"
            aria-label={labels[key]}
            className={`inline-flex text-[color:var(--color-accent)] transition-colors hover:text-[color:var(--color-accent-2)] ${linkClassName}`}
          >
            <Icon width={size} height={size} />
          </a>
        </li>
      ))}
    </ul>
  );
}
