import type { CSSProperties, ReactNode } from "react";

/**
 * A page section: vertical rhythm, an optional surface, and the theme's
 * density baked in.
 *
 * `--space-section * --density` is the whole point. Density is a Tier-3 token
 * (Home 1.0, Woodworks 0.8, Mattresses 1.15), so a factory page comes out
 * tighter and a mattress page airier from the SAME component. That is one of
 * the four differentiation axes, and it costs nothing at the call site.
 */
export function Section({
  children,
  surface = "surface",
  className,
  style,
  id,
  ...rest
}: {
  children: ReactNode;
  /** Which surface role fills the band. "none" leaves it transparent. */
  surface?: "surface" | "surface-2" | "panel" | "none";
  className?: string;
  style?: CSSProperties;
  id?: string;
} & Omit<React.HTMLAttributes<HTMLElement>, "style" | "className" | "id">) {
  const bg =
    surface === "none"
      ? undefined
      : surface === "panel"
        ? "var(--color-panel)"
        : `var(--color-${surface})`;

  return (
    <section
      id={id}
      className={`relative ${className ?? ""}`}
      style={{
        paddingBlock: "calc(var(--space-section) * var(--density))",
        background: bg,
        ...style,
      }}
      {...rest}
    >
      {children}
    </section>
  );
}

/**
 * Eyebrow + heading + optional intro, aligned on the theme's axis.
 *
 * `--align-axis` (Home `center`, Woodworks `start`) is the differentiation axis
 * the A0c comps found does more perceptual work than the entire colour swap —
 * so it is a token read here, never a per-call-site prop. A page cannot
 * accidentally centre a heading on the left-aligned theme.
 */
export function SectionHeader({
  eyebrow,
  heading,
  intro,
  className,
}: {
  eyebrow?: ReactNode;
  heading: ReactNode;
  intro?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-4 ${className ?? ""}`}
      style={{
        alignItems: "var(--align-axis)",
        textAlign: "var(--align-axis)" as CSSProperties["textAlign"],
      }}
    >
      {eyebrow}
      <h2 className="max-w-[18ch] font-display text-h2 font-bold leading-h2 tracking-display text-[color:var(--color-ink)]">
        {heading}
      </h2>
      {intro && (
        <p className="max-w-[58ch] text-lead leading-lead text-[color:var(--color-ink-body)]">
          {intro}
        </p>
      )}
    </div>
  );
}
