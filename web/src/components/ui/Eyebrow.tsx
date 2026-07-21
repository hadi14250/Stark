import type { ReactNode } from "react";
import { MarkGlyph } from "@/components/brand/geometry";
import type { DivisionKey } from "@/components/brand/LogoDefs";

/**
 * Section eyebrow.
 *
 * Latin gets mono + `.3em` tracking + uppercase. Arabic gets NONE of those —
 * tracking fragments cursive joins (a rendering defect, not a style choice) and
 * `text-transform` is a silent no-op — so under `[lang="ar"]` the tokens zero
 * themselves out and the eyebrow needs a different differentiator entirely.
 *
 * That differentiator is the trailing rule plus a weight and colour shift, and
 * it is why this is a component rather than a utility class: the two languages
 * need structurally different treatments from the same call site.
 *
 * `division` is optional and, when present, must have room — MarkGlyph warns
 * below 20px because a single blade is illegible small (A0c).
 */
export function Eyebrow({
  children,
  division,
  className,
}: {
  children: ReactNode;
  division?: DivisionKey;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-3 font-mono text-eyebrow tracking-eyebrow text-[color:var(--color-ink-muted)] ${className ?? ""}`}
      style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
    >
      {division && <MarkGlyph division={division} size={22} color="var(--color-accent)" />}
      {children}
      {/*
        `ms-2` on top of the flex gap, so the rule sits ~22px from the last
        letter rather than 10px. The client read the tighter spacing as the
        rule being attached to the word ("the line is too close to the text")
        rather than as a separate mark closing the eyebrow — and they were
        right: at 0.16em tracking the gap was narrower than the space between
        two words in the eyebrow itself.
      */}
      <span
        aria-hidden
        className="ms-2 inline-block h-px w-10 shrink-0"
        style={{ background: "var(--color-accent)" }}
      />
    </span>
  );
}
