import type { ReactNode } from "react";
import { Container } from "./Container";
import { Photo } from "./Photo";
import { PentagonClip } from "@/components/brand/geometry";
import { Reveal } from "@/components/motion/Reveal";
import { ParallaxImage } from "@/components/motion/Parallax";

/**
 * A full-width alternating band: a pentagon-clipped photograph on one side,
 * copy on the other, with an optional overlapping pentagon panel.
 *
 * This carries a lot of the site. Home's Capabilities uses it three times,
 * Home's Divisions uses it three more (INSTEAD of the three-icon-card grid the
 * first draft called for — that layout is the single most recognisably
 * AI-generated section on the web, and swapping a Lucide icon for a brand blade
 * does not change that), and Woodworks reuses it again. Fewer, bigger, routed.
 *
 * The G1 pair overlaps rather than stacks: two of the same silhouette in a
 * column, pointing the same way, read as repetition and leave a void under the
 * shorter column. A0c found this.
 */
export function CapabilityBand({
  index,
  eyebrow,
  heading,
  body,
  meta,
  cta,
  image,
  imageAlt,
  panel,
  shape = "rect",
  flip = false,
}: {
  /** Rendered as an ordinal (01, 02…). Omit for unnumbered bands. */
  index?: number;
  eyebrow?: ReactNode;
  heading: ReactNode;
  body: ReactNode;
  /** Qualitative capability strip. NOT a spec table — see below. */
  meta?: string[];
  cta?: ReactNode;
  image: string;
  imageAlt: string;
  /** Short line for the overlapping pentagon panel. Pentagon shape only. */
  panel?: ReactNode;
  /**
   * G1 costs budget, and the budget is TWO pentagon pairs per page — a rule
   * that exists because the first Home build used seven. Every section became
   * the same silhouette, Capabilities and Divisions became indistinguishable
   * from each other, and the mark stopped reading as a device and started
   * reading as a template. The default is therefore `rect`; `pentagon` is
   * something a page spends deliberately, near the top, where it has room.
   */
  shape?: "pentagon" | "rect";
  /** Put the photograph on the inline-start side instead. */
  flip?: boolean;
}) {
  return (
    <Container>
      <div
        className="grid items-center gap-[clamp(32px,5vw,72px)]"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))" }}
      >
        <Reveal className={flip ? "nav:order-2" : undefined}>
          <div className="flex flex-col items-start gap-5">
            {index !== undefined && (
              <span
                aria-hidden
                className="font-mono text-eyebrow tabular-nums text-[color:var(--color-accent-2)]"
              >
                {String(index).padStart(2, "0")}
              </span>
            )}
            {eyebrow}
            <h3 className="max-w-[16ch] font-display text-h3 font-bold leading-h3 tracking-display text-[color:var(--color-ink)]">
              {heading}
            </h3>
            <p className="max-w-[52ch] text-body leading-body text-[color:var(--color-ink-body)]">
              {body}
            </p>

            {/*
              A qualitative strip, deliberately not a spec table with numbers.
              The first pass used CAPACITY / STANDARD / LEAD TIME with em-dashes
              standing in for unconfirmed figures, and it read as BROKEN rather
              than pending — three em-dashes look like the page failed to load.
              These say the same thing, need no client confirmation, and look
              finished. Same pattern applies to every facts-blocked slot.
            */}
            {meta && meta.length > 0 && (
              <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
                  style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}>
                {meta.map((m, i) => (
                  <li key={m} className="flex items-center gap-5">
                    {i > 0 && (
                      <span
                        aria-hidden
                        className="h-1 w-1 rounded-full"
                        style={{ background: "var(--color-accent)" }}
                      />
                    )}
                    {m}
                  </li>
                ))}
              </ul>
            )}

            {cta}
          </div>
        </Reveal>

        <Reveal delay={0.1} className={flip ? "nav:order-1" : undefined}>
          {shape === "pentagon" ? (
            <div className="relative">
              <PentagonClip
                variant="photo"
                /* A colour the section does NOT use, or the ring vanishes —
                   warm-300 on warm-200 was invisible in the A0c comp. */
                ringColor="var(--color-surface)"
                style={{ boxShadow: "var(--shadow-pentagon)" }}
              >
                <Photo src={image} alt={imageAlt} ratio="pentagon" />
              </PentagonClip>

              {panel && (
                <PentagonClip
                  variant="panel"
                  background="var(--color-panel)"
                  style={{
                    position: "absolute",
                    width: "46%",
                    bottom: "-8%",
                    insetInlineStart: "-6%",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <p className="font-display text-[clamp(13px,1.2vw,16px)] font-semibold leading-[1.35] text-[color:var(--white-500)]">
                    {panel}
                  </p>
                </PentagonClip>
              )}
            </div>
          ) : (
            <div className="relative">
              <ParallaxImage className="rounded-[var(--radius-card)]">
                <Photo
                  src={image}
                  alt={imageAlt}
                  height="clamp(220px, 34vh, 380px)"
                />
              </ParallaxImage>

              {/* The rect variant's panel is a flat plate tucked under the
                  photo's leading corner — same job as the pentagon panel,
                  without spending a G1. */}
              {panel && (
                <div
                  className="absolute bottom-[-18px] max-w-[62%] rounded-[var(--radius-image)] px-5 py-4"
                  style={{
                    insetInlineStart: "-14px",
                    background: "var(--color-panel)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <p className="font-display text-[clamp(13px,1.1vw,15px)] font-semibold leading-[1.35] text-[color:var(--white-500)]">
                    {panel}
                  </p>
                </div>
              )}
            </div>
          )}
        </Reveal>
      </div>
    </Container>
  );
}
