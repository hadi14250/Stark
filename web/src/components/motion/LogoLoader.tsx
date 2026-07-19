import { LOGO_VIEWBOX } from "@/components/brand/LogoDefs";

/**
 * The logo loading animation, from the handoff's "Loading Animations" file.
 *
 * That file ships twelve designed variants and it was in the handoff from the
 * start. It should have been implemented in Phase B; instead the preloader got
 * a hand-rolled Framer approximation of one of them, which was both worse and
 * not the design. This is the real thing — the keyframes, timings, easings and
 * per-blade offsets in logo-loader.css are the designer's, unaltered.
 *
 * All twelve are here rather than just the default, because picking one is a
 * taste call and swapping between them should be changing a single prop rather
 * than rewriting a component.
 *
 * Requires <LogoDefs /> in the tree (SiteChrome renders it).
 */

export type LoaderVariant =
  | "assemble"
  | "sequence"
  | "pulse"
  | "cascade"
  | "pinwheel"
  | "shutter"
  | "wave"
  | "bloom"
  | "trace"
  | "unfold"
  | "swing"
  | "vortex";

/** The five blades in the order the handoff animates them, then the core. */
const BLADES = ["#lg-b1", "#lg-b5", "#lg-b4", "#lg-b3", "#lg-b2"] as const;

/**
 * Per-blade travel vectors, straight from the handoff markup. These are what
 * make "assemble" land as a mark rather than a shuffle — each blade flies in
 * from the direction it actually sits in.
 */
const ASSEMBLE_OFFSET = [
  { tx: "52px", ty: "-47px" },
  { tx: "66px", ty: "23px" },
  { tx: "1px", ty: "70px" },
  { tx: "-70px", ty: "6px" },
  { tx: "-49px", ty: "-52px" },
] as const;

const BLOOM_OFFSET = [
  { rx: "19px", ry: "-17px" },
  { rx: "25px", ry: "9px" },
  { rx: "0px", ry: "26px" },
  { rx: "-26px", ry: "2px" },
  { rx: "-18px", ry: "-19px" },
] as const;

type Spec = {
  /** CSS `animation` shorthand for each blade, given its index. */
  blade: (i: number) => string;
  /** Extra per-blade custom properties. */
  vars?: (i: number) => Record<string, string>;
  /** The core pentagon's animation. Omit to animate it like a blade. */
  core?: string;
  /** Stroke treatment (trace only). */
  stroke?: boolean;
  /** Wrap everything in a counter-rotating ring (vortex only). */
  ring?: string;
  transformBox?: "view-box" | "fill-box";
};

const s = (n: number) => `calc(${n}s * var(--sp, 1))`;
const d = (n: number) => `calc(${n}s * var(--sp, 1))`;

const SPECS: Record<LoaderVariant, Spec> = {
  assemble: {
    blade: (i) =>
      `kfAssemble ${s(3)} cubic-bezier(.25,.9,.3,1) infinite ${d(i * 0.06)} both`,
    vars: (i) => ({ "--tx": ASSEMBLE_OFFSET[i].tx, "--ty": ASSEMBLE_OFFSET[i].ty }),
    core: `kfCore ${s(3)} cubic-bezier(.25,.9,.3,1) infinite ${d(0.3)} both`,
  },
  sequence: {
    blade: (i) => `kfSeq ${s(1.7)} linear infinite ${d(-1.7 + i * 0.34)} both`,
    core: `kfSeq ${s(1.7)} linear infinite ${d(-0.34)} both`,
  },
  pulse: {
    blade: (i) => `kfRipple ${s(2.4)} ease-in-out infinite ${d(-2.4 + i * 0.48)} both`,
    core: `kfHeart ${s(2.4)} ease-in-out infinite both`,
  },
  cascade: {
    blade: (i) => `kfDrop ${s(3.4)} cubic-bezier(.2,.9,.3,1) infinite ${d(i * 0.12)} both`,
    core: `kfDropCore ${s(3.4)} cubic-bezier(.2,.9,.3,1) infinite both`,
  },
  pinwheel: {
    blade: (i) =>
      `kfPinSpin ${s(2.8)} cubic-bezier(.45,.05,.3,.95) infinite ${d(i * 0.08)} both`,
    core: `kfBreathe ${s(2.8)} ease-in-out infinite both`,
    transformBox: "fill-box",
  },
  shutter: {
    blade: (i) => `kfShutter ${s(2.2)} cubic-bezier(.6,0,.3,1) infinite ${d(i * 0.05)} both`,
    core: `kfCoreShrink ${s(2.2)} cubic-bezier(.6,0,.3,1) infinite both`,
  },
  wave: {
    blade: (i) => `kfWave ${s(1.9)} ease-in-out infinite ${d(-1.9 + i * 0.38)} both`,
    core: `kfWave ${s(1.9)} ease-in-out infinite ${d(-0.38)} both`,
  },
  bloom: {
    blade: () => `kfRadial ${s(2.6)} ease-in-out infinite both`,
    vars: (i) => ({ "--rx": BLOOM_OFFSET[i].rx, "--ry": BLOOM_OFFSET[i].ry }),
    core: `kfCoreShrink ${s(2.6)} ease-in-out infinite both`,
  },
  trace: {
    blade: (i) => `kfTrace ${s(3.2)} ease-in-out infinite ${d(i * 0.1)} both`,
    core: `kfTrace ${s(3.2)} ease-in-out infinite ${d(0.55)} both`,
    stroke: true,
  },
  unfold: {
    blade: (i) => `kfFold ${s(3)} cubic-bezier(.3,.9,.3,1) infinite ${d(i * 0.12)} both`,
    core: `kfCore ${s(3)} cubic-bezier(.3,.9,.3,1) infinite ${d(0.6)} both`,
    transformBox: "fill-box",
  },
  swing: {
    blade: (i) => `kfSwing ${s(1.6)} ease-in-out infinite ${d(-1.6 + i * 0.32)} both`,
    core: `kfBreathe ${s(1.6)} ease-in-out infinite both`,
    transformBox: "fill-box",
  },
  vortex: {
    blade: () => `kfCounterSpin ${s(3.6)} linear infinite both`,
    core: `kfBreathe ${s(3.6)} ease-in-out infinite both`,
    ring: `kfVortexRing ${s(3.6)} cubic-bezier(.45,.05,.45,.95) infinite`,
    transformBox: "fill-box",
  },
};

export function LogoLoader({
  variant = "assemble",
  size = 140,
  color = "var(--color-accent)",
  /** 1 = the designed speed. >1 slows down, <1 speeds up. */
  speed = 1,
  className,
}: {
  variant?: LoaderVariant;
  size?: number;
  color?: string;
  speed?: number;
  className?: string;
}) {
  const spec = SPECS[variant];
  const box = spec.transformBox ?? "view-box";

  const strokeProps = spec.stroke
    ? {
        fill: color,
        stroke: color,
        strokeWidth: 4,
        strokeLinejoin: "round" as const,
        strokeDasharray: 100,
      }
    : { fill: color };

  // `vars` is indexed per BLADE, so the core (index 5) must not ask for one —
  // the offset arrays have five entries and `vars(5).tx` throws, which took
  // the assemble and bloom variants out entirely.
  const node = (href: string, animation: string, i: number, withVars = true) => (
    <g
      key={href}
      style={{
        transformBox: box,
        transformOrigin: "50% 50%",
        animation,
        ...((withVars ? spec.vars?.(i) : undefined) as Record<string, string> | undefined),
      }}
    >
      <use href={href} {...strokeProps} />
    </g>
  );

  const parts = (
    <>
      {BLADES.map((href, i) => node(href, spec.blade(i), i))}
      {node("#lg-core", spec.core ?? spec.blade(4), 5, false)}
    </>
  );

  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      width={size}
      className={`logo-loader ${className ?? ""}`}
      style={{ ["--sp" as string]: String(speed) }}
      aria-hidden
      focusable="false"
    >
      {spec.ring ? (
        <g style={{ transformBox: "view-box", transformOrigin: "50% 50%", animation: spec.ring }}>
          {parts}
        </g>
      ) : (
        parts
      )}
    </svg>
  );
}
