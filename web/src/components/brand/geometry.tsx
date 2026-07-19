import type { CSSProperties, ReactNode } from "react";
import { DIVISION_ELEMENT, LOGO_VIEWBOX, type DivisionKey } from "./LogoDefs";

/**
 * The four brand-geometry techniques (plan §2.8), plus their governance.
 *
 * The handoff used the mark's geometry as structural material, and that is the
 * device that makes four differently-coloured pages read as one brand. These
 * components exist so the technique is applied deliberately rather than
 * re-improvised per page.
 *
 * BUDGET, per page — countable by a reviewer, unlike "tasteful":
 *   G1 PentagonClip  max 2 pairs      G3 MarkTexture  max 2
 *   G2 BladeField    max 1            G4 MarkGlyph    see the A0c note below
 *
 * Rules that hold everywhere:
 *   - all of it is decorative: aria-hidden + pointer-events:none, never the
 *     sole carrier of meaning, never between text and its background;
 *   - G4 does NOT replace functional icons. Contact rows and spec grids need
 *     identification — an abstract rotated wedge cannot say "phone";
 *   - a derived shape never appears near a real lockup at similar size/colour.
 *
 * WHAT THE A0c COMPS CORRECTED (all four are load-bearing):
 *   - G3 "tile" reads as WALLPAPER on light surfaces — a 300px repeating
 *     pattern at 4% competes with the copy instead of receding. Prefer "mark".
 *   - G1 pentagons must OVERLAP, not stack: two of the same silhouette in a
 *     column, pointing the same way, read as repetition and leave a void.
 *   - the photo ring needs a colour the section does NOT use, or it vanishes.
 *   - G4 at 14px is too abstract to register as a division signature; it reads
 *     as a stray mark. MIN_GLYPH below enforces the floor the comps found.
 */

/* ------------------------------------------------------------------ */
/* G1 — Clip: the pentagon silhouette, as a photo mask or a text panel */
/* ------------------------------------------------------------------ */

type PentagonClipProps = {
  /** "photo" masks an image; "panel" fills with a surface and holds copy. */
  variant: "photo" | "panel";
  children: ReactNode;
  /** Ring colour for the photo variant's double-clip border. */
  ringColor?: string;
  /** Fill for the panel variant. */
  background?: string;
  className?: string;
  style?: CSSProperties;
};

export function PentagonClip({
  variant,
  children,
  ringColor = "var(--color-surface-2)",
  background = "var(--color-panel)",
  className,
  style,
}: PentagonClipProps) {
  if (variant === "photo") {
    // Double clip: the outer element is the ring, the inner is the image. A
    // border/outline cannot follow a clip-path, so the ring has to be a second
    // clipped box behind the first.
    return (
      <div
        className={className}
        style={{ clipPath: "url(#stark-pent)", background: ringColor, padding: 8, ...style }}
      >
        <div style={{ clipPath: "url(#stark-pent)", overflow: "hidden" }}>{children}</div>
      </div>
    );
  }
  return (
    <div
      className={className}
      style={{
        clipPath: "url(#stark-pent)",
        background,
        aspectRatio: "115 / 118",
        // The asymmetric inline-start padding clears the sloped left edge —
        // without it, copy collides with the diagonal. Logical, so it mirrors
        // under RTL along with the shape.
        padding: "12% 12% 12% 23%",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* G2 — Field: large blades bleeding off the edges, behind content     */
/* ------------------------------------------------------------------ */

export type Blade = {
  element: DivisionKey;
  /** Width in px at desktop. The field scales this down on small screens. */
  width: number;
  /** Logical placement. Physical `top`/`bottom` are fine; inline is logical. */
  top?: string;
  bottom?: string;
  start?: string;
  end?: string;
  /** Float animation period, seconds. Alternates direction per index. */
  float?: number;
};

type BladeFieldProps = {
  blades: Blade[];
  /**
   * "ambient" is a faint tint behind everything; "structural" is a solid shape
   * that reads as architecture. Never both on one page — mixing them makes the
   * geometry look accidental.
   */
  weight: "ambient" | "structural";
  color: string;
  className?: string;
};

export function BladeField({ blades, weight, color, className }: BladeFieldProps) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: weight === "ambient" ? 0.12 : 1,
        zIndex: 0,
      }}
    >
      {blades.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: b.top,
            bottom: b.bottom,
            insetInlineStart: b.start,
            insetInlineEnd: b.end,
            width: `min(${b.width}px, 42vw)`,
          }}
        >
          <svg
            viewBox={LOGO_VIEWBOX}
            style={{
              display: "block",
              width: "100%",
              fill: color,
              animation: `floaty ${b.float ?? 9}s ease-in-out infinite ${
                i % 2 ? "alternate-reverse" : "alternate"
              }`,
            }}
            className="motion-reduce:animate-none"
          >
            <use href={DIVISION_ELEMENT[b.element]} />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* G3 — Texture: the mark behind content, as a watermark or a tile     */
/* ------------------------------------------------------------------ */

type MarkTextureProps = {
  variant: "mark" | "tile";
  color?: string;
  /** 0.04–0.08. Above that it stops being texture and starts being an image. */
  opacity?: number;
  /** Watermark size in px (mark variant only). */
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export function MarkTexture({
  variant,
  color = "currentColor",
  opacity = 0.06,
  size = 320,
  className,
  style,
}: MarkTextureProps) {
  if (variant === "tile") {
    return (
      <svg
        aria-hidden
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity,
          color,
          pointerEvents: "none",
          ...style,
        }}
      >
        <rect width="100%" height="100%" fill="url(#stark-pat)" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden
      viewBox={LOGO_VIEWBOX}
      className={className}
      style={{
        position: "absolute",
        width: size,
        fill: color,
        opacity,
        pointerEvents: "none",
        ...style,
      }}
    >
      <use href="#lg-all" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* G4 — Glyph: one element at icon scale                               */
/* ------------------------------------------------------------------ */

/**
 * Below this the blade stops reading as a division signature and becomes a
 * stray mark — the five blades are rotations of one wedge around a shared
 * centre, which is what makes them indistinguishable when small. Found in the
 * A0c comps at 14px, where the Woodworks eyebrow glyph read as a smudge.
 */
const MIN_GLYPH = 20;

type MarkGlyphProps = {
  /** Which division this slot belongs to. Never chosen for looks. */
  division: DivisionKey;
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
};

export function MarkGlyph({
  division,
  size = 24,
  color = "var(--color-accent)",
  className,
  style,
}: MarkGlyphProps) {
  if (process.env.NODE_ENV !== "production" && size < MIN_GLYPH) {
    console.warn(
      `MarkGlyph: size ${size} is below the ${MIN_GLYPH}px legibility floor — ` +
        `the blade will read as a stray mark rather than the ${division} signature. ` +
        `Either give it room or leave it out.`,
    );
  }
  return (
    <svg
      aria-hidden
      viewBox={LOGO_VIEWBOX}
      width={size}
      className={className}
      style={{ display: "block", fill: color, flexShrink: 0, ...style }}
    >
      <use href={DIVISION_ELEMENT[division]} />
    </svg>
  );
}
