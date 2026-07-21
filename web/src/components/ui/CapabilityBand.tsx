import type { ReactNode } from "react";
import { Container } from "./Container";
import { Photo } from "./Photo";
import { PentagonClip } from "@/components/brand/geometry";
import { ParallaxImage } from "@/components/motion/Parallax";
import { ClipReveal, DrawLine } from "@/components/motion/reveals";
import { WordsReveal, LineReveal } from "@/components/motion/WordsReveal";

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
        <div className={flip ? "nav:order-2" : undefined}>
          <div className="flex flex-col items-start gap-5">
            {index !== undefined && (
              /*
                THE ORDINAL IS IN FLOW. The previous one was an 11px mono label;
                the one before that (on Process) was a display-scale numeral
                positioned absolutely, which is what put it through its own
                heading at some viewport widths. This is the version that gets
                the scale without the risk: a real block in the column, so the
                copy below it is laid out around it by the browser and there is
                no width at which it can collide with anything.

                Hollow rather than filled because at 96px a solid numeral
                outweighs the heading it is numbering. `outline-digits` is the
                opt-out from the Arabic solid-fallback — see outline-type.css;
                these are Latin figures in both locales and stroke cleanly.

                The negative bottom margin pulls the heading back up under the
                numeral's optical baseline: display figures carry a lot of
                internal leading, and without it the ordinal floats away from
                the thing it belongs to.
              */
              <span
                aria-hidden
                className="outline-type outline-digits -mb-2 font-display text-[clamp(56px,6vw,96px)] font-bold leading-[0.85] tabular-nums"
                style={
                  {
                    "--outline-c": "var(--color-accent)",
                    "--outline-w": "2px",
                  } as React.CSSProperties
                }
              >
                {String(index).padStart(2, "0")}
              </span>
            )}
            {eyebrow}
            {/*
              Word-by-word rather than the whole block fading. A band heading is
              the one string in this layout long enough for the stagger to read,
              and it is what makes the copy column arrive rather than appear.
            */}
            {typeof heading === "string" ? (
              <WordsReveal
                text={heading}
                as="h3"
                justify="flex-start"
                className="max-w-[16ch] font-display text-h3 font-bold leading-h3 tracking-display text-[color:var(--color-ink)]"
              />
            ) : (
              <h3 className="max-w-[16ch] font-display text-h3 font-bold leading-h3 tracking-display text-[color:var(--color-ink)]">
                {heading}
              </h3>
            )}
            <LineReveal delay={0.12}>
              <p className="max-w-[52ch] text-body leading-body text-[color:var(--color-ink-body)]">
                {body}
              </p>
            </LineReveal>

            {/*
              A qualitative strip, deliberately not a spec table with numbers.
              The first pass used CAPACITY / STANDARD / LEAD TIME with em-dashes
              standing in for unconfirmed figures, and it read as BROKEN rather
              than pending — three em-dashes look like the page failed to load.
              These say the same thing, need no client confirmation, and look
              finished. Same pattern applies to every facts-blocked slot.
            */}
            {meta && meta.length > 0 && (
              <LineReveal delay={0.2} className="w-full">
                {/* The rule draws itself in above the strip, so the strip
                    arrives as a footer to the copy rather than as one more
                    line of it. */}
                <DrawLine
                  className="mb-4 h-px w-full"
                  style={{ background: "var(--color-line)" }}
                  delay={0.28}
                />
                {/*
                  ONE ROW ON DESKTOP, wrapping only on phones. The client's
                  note on this section was that "the words are under each
                  other, make them next to each other" — three chips at the old
                  lengths could not fit the copy column, so they stacked, and a
                  three-line stack of mono labels reads as a list of failures
                  rather than as a capability strip.

                  Two things fix it together and both are needed: the strings
                  are shorter (see the messages), and the row is `nowrap` above
                  the breakpoint so it cannot silently stack again if a
                  translation runs long — under `nav:` it scrolls instead,
                  which is visible and recoverable. Below the breakpoint there
                  is genuinely no room for three, so wrapping is correct there.
                */}
                <ul
                  className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)] nav:flex-nowrap nav:overflow-x-auto"
                  style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
                >
                  {meta.map((m, i) => (
                    <li key={m} className="flex items-center gap-5 nav:whitespace-nowrap">
                      {i > 0 && (
                        <span
                          aria-hidden
                          className="h-1 w-1 shrink-0 rounded-full"
                          style={{ background: "var(--color-accent)" }}
                        />
                      )}
                      {m}
                    </li>
                  ))}
                </ul>
              </LineReveal>
            )}

            {cta}
          </div>
        </div>

        {/*
          The photograph WIPES in rather than fading up. A fade is the least
          legible motion there is — nothing inside the element moves relative
          to anything else, so a photo fading in reads as a slow image load. A
          clip wipe has a moving edge, which reads as a reveal.
        */}
        <ClipReveal delay={0.1} className={flip ? "nav:order-1" : undefined}>
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
              {/* 12% rather than the 8% default: this is the largest image on
                  the page after the hero, and at 8% the drift was below the
                  threshold where anyone notices it is happening. */}
              <ParallaxImage amount={12} className="rounded-[var(--radius-card)]">
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
        </ClipReveal>
      </div>
    </Container>
  );
}
