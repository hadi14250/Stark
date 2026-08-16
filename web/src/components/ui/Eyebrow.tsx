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
 *
 * THE GLYPH IS THE WHOLE MARK AT 34px, NOT A BLADE AT 22.
 *
 * Both halves of that matter, and the second is the one that actually answers
 * the client. They reported it twice — "the logo part which acts like the
 * bullet point … is small, make it big and anywhere in the entire website too"
 * — naming the mattresses hero and the woodworks page. Both were single blades.
 *
 * Scaling a blade up does not make it legible, it makes a bigger sliver: the
 * five blades are rotations of one wedge around a shared centre, which is
 * exactly what makes any one of them unidentifiable alone (DESIGN.md §5.4, and
 * the `MIN_GLYPH` floor in geometry.tsx exists for the same reason). The whole
 * pentagon is recognisable at this size because it is the actual mark.
 *
 * `division` is still taken and still meaningful — it says which section this
 * is, and it is what a future variant would key off — but the eyebrow slot
 * renders `whole`. The flex gap went up with the size: at `gap-3` a 34px mark
 * crowds the label.
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
      className={`inline-flex items-center gap-4 font-mono text-eyebrow tracking-eyebrow text-[color:var(--color-ink-muted)] ${className ?? ""}`}
      style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
    >
      {division && (
        <MarkGlyph division={division} whole size={34} color="var(--color-accent)" />
      )}
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
