import type { CSSProperties, ReactNode } from "react";
import { WordsReveal, LineReveal } from "@/components/motion/WordsReveal";

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
 *
 * THIS IS ALSO WHERE THE SITE'S HEADING MOTION LIVES. Thirteen sections across
 * three pages render through here, so the header resolving in sequence —
 * eyebrow, then the heading word by word, then the intro — is one edit rather
 * than thirteen, and no page can end up with a section that does not animate.
 * A string heading gets the word mask; a ReactNode one falls back to a plain
 * <h2>, because there is nothing safe to split.
 */
export function SectionHeader({
  eyebrow,
  heading,
  intro,
  introMax = "74ch",
  className,
}: {
  eyebrow?: ReactNode;
  heading: ReactNode;
  intro?: ReactNode;
  /**
   * Measure for the intro paragraph.
   *
   * WAS A FIXED 58ch, AND THE CLIENT COUNTED THE LINES. At 58 characters a
   * two-sentence intro comes out as five short lines with a one-word last
   * line, which reads as a stack of fragments rather than as a paragraph —
   * they raised it on three separate sections. 74ch is past the classic
   * 45–75 comfort range at its top end, which is the right trade here: these
   * are two-sentence intros under a heading, not body copy anyone reads for
   * minutes, and the alternative was worse.
   *
   * Overridable because Turnkey's intro is longer than the rest and needed
   * more to land on three lines.
   */
  introMax?: string;
  className?: string;
}) {
  const headingClass =
    "max-w-[18ch] text-balance font-display text-h2 font-bold leading-h2 tracking-display text-[color:var(--color-ink)]";

  return (
    <div
      className={`flex flex-col gap-4 ${className ?? ""}`}
      style={{
        alignItems: "var(--align-axis)",
        textAlign: "var(--align-axis)" as CSSProperties["textAlign"],
      }}
    >
      {eyebrow && <LineReveal>{eyebrow}</LineReveal>}

      {typeof heading === "string" ? (
        <WordsReveal text={heading} as="h2" className={headingClass} delay={0.08} />
      ) : (
        <h2 className={headingClass}>{heading}</h2>
      )}

      {intro && (
        <LineReveal delay={0.26} style={{ maxWidth: introMax }}>
          <p className="text-lead leading-lead text-[color:var(--color-ink-body)]">{intro}</p>
        </LineReveal>
      )}
    </div>
  );
}
