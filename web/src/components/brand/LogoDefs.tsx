/**
 * The STARK mark, as reusable SVG geometry.
 *
 * Brand book p.8: the logo is "formed from five abstract 'S' elements, each
 * representing a core part of STARK's ecosystem", orbiting a centre that is
 * "STARK as the core of all operations". That is the whole basis for using the
 * mark's parts as design material — and for DIVISION_ELEMENT below, which
 * fixes which blade means what so nobody on the build ever picks one at random.
 *
 * Render <LogoDefs /> ONCE per page, then reference parts with
 * `<use href="#lg-b1" />`. All ids are global to the document.
 *
 * The Logo Don'ts (no angle, gradient, stretch, 3D, icon-extraction, partial
 * fill, stroke, drop-shadow) govern the logo presenting AS the logo — the
 * lockup in nav, footer and preloader. Derived geometry is a separate layer,
 * explicitly sanctioned by the book's own pattern page (p.26). A derived shape
 * must never appear near a real lockup at similar size and colour.
 *
 * viewBox for every part: "0 0 338 332".
 */

/** Which mark element stands for which part of the business. Single source. */
export const DIVISION_ELEMENT = {
  /** STARK itself — hub, turnkey, company-level and system-level slots. */
  stark: "#lg-core",
  woodworks: "#lg-b1",
  interiors: "#lg-b2",
  furniture: "#lg-b3",
  mattresses: "#lg-b4",
  turnkey: "#lg-b5",
} as const;

export type DivisionKey = keyof typeof DIVISION_ELEMENT;

/** The shared viewBox for every part of the mark. */
export const LOGO_VIEWBOX = "0 0 338 332";

export function LogoDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        {/* pathLength="100" on every blade so a stroke-dashoffset trace runs
            on a 0-100 scale regardless of each path's true length. The
            handoff's "trace" loading animation pairs this with
            stroke-dasharray:100, which is why all five blades draw at the same
            visual rate despite being very different lengths. */}
        <path
          id="lg-b1"
          pathLength="100"
          d="M185.953 23.5362L206.315 38.7234L231.149 56.9517L255.979 75.68L277.336 91.3764L293.225 103.522L296.702 106.054L295.198 106.541L292.193 107.013L275.694 106.862L260.694 106.725L248.976 185.12L241.958 187.056L243.915 82.5698L176.216 49.4481C176.216 49.4481 178.664 41.4704 180.335 36.4853C182.063 31.3278 185.953 23.5362 185.953 23.5362Z"
        />
        <path
          id="lg-b2"
          pathLength="100"
          d="M54.4764 106.648L74.8051 91.417L99.3163 72.7567L124.306 54.2424L145.404 38.2004L161.551 26.3979L164.963 23.7796L165.004 25.3603L164.607 28.3756L159.792 44.1576L155.416 58.505L227.29 91.9306L227.161 99.2096L127.5 67.7626L76.5733 123.321C76.5733 123.321 69.6146 118.715 65.306 115.702C60.8485 112.585 54.4764 106.648 54.4764 106.648Z"
        />
        <path
          id="lg-b3"
          pathLength="100"
          d="M90.2053 255.413L82.4373 231.228L72.792 201.971L63.4406 172.31L55.1574 147.133L49.2666 128.02L47.9045 123.94L49.4119 124.417L52.1329 125.776L65.4816 135.475L77.6169 144.292L132.657 87.2493L139.496 89.7458L77.2633 173.7L113.173 239.963C113.173 239.963 106.55 245.039 102.296 248.129C97.8955 251.326 90.2053 255.413 90.2053 255.413Z"
        />
        <path
          id="lg-b4"
          pathLength="100"
          d="M243.77 266.406L218.368 266.313L187.563 266.436L156.463 266.154L129.959 266.244L109.961 265.934L105.66 265.967L106.58 264.681L108.714 262.514L122.066 252.82L134.204 244.007L96.9827 174.022L101.472 168.291L162.061 253.439L236.181 239.785C236.181 239.785 238.959 247.654 240.582 252.655C242.261 257.829 243.77 266.406 243.77 266.406Z"
        />
        <path
          id="lg-b5"
          pathLength="100"
          d="M301.749 123.35L294.062 147.56L284.965 176.992L275.394 206.584L267.552 231.902L261.275 250.891L260.02 255.005L259.068 253.743L257.638 251.058L252.382 235.418L247.603 221.2L169.689 235.783L165.563 229.785L264.936 197.439L274.077 122.628C274.077 122.628 282.417 122.331 287.674 122.278C293.113 122.223 301.749 123.35 301.749 123.35Z"
        />
        <path
          id="lg-core"
          pathLength="100"
          d="M156.705 96L192.205 107L226.205 118L226.705 156V194L199.205 202.5L177.705 209.5L156.205 216H155.705L155.205 215.5L154.205 214.5L151.705 211.5L146.205 204L132.205 184L111.705 155.5L134.705 124.5L156.705 96Z"
        />

        {/* The whole mark, for watermarks and the derived pattern. */}
        <g id="lg-all">
          <use href="#lg-b1" />
          <use href="#lg-b2" />
          <use href="#lg-b3" />
          <use href="#lg-b4" />
          <use href="#lg-b5" />
          <use href="#lg-core" />
        </g>

        {/* The pentagon silhouette, in objectBoundingBox units so one clipPath
            fits any aspect ratio without rescaling the path. Used for both the
            photo and panel variants of G1 (see PentagonClip). */}
        <clipPath id="stark-pent" clipPathUnits="objectBoundingBox">
          <path d="M0.391 0 L0.7 0.092 L0.996 0.183 L1 0.5 L1 0.817 L0.761 0.888 L0.574 0.946 L0.387 1 L0.383 1 L0.378 0.996 L0.37 0.988 L0.348 0.963 L0.3 0.9 L0.178 0.733 L0 0.496 L0.2 0.238 L0.391 0 Z" />
        </clipPath>

        {/* The sanctioned derived pattern (brand book p.26). userSpaceOnUse so
            the tile stays a fixed size regardless of the element it fills. */}
        <pattern
          id="stark-pat"
          patternUnits="userSpaceOnUse"
          width="300"
          height="300"
          patternTransform="rotate(-8)"
        >
          <use href="#lg-all" transform="translate(20,20) scale(0.55)" fill="currentColor" />
        </pattern>
      </defs>
    </svg>
  );
}
