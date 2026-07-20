"use client";

import { type CSSProperties, type ReactNode } from "react";
import { useRevealOnce } from "./useRevealOnce";

/**
 * Type that rises out of a mask, word by word.
 *
 * This is the site's default heading entrance, applied inside SectionHeader so
 * EVERY section gets it from one edit rather than nine. The complaint it
 * answers: with only whole-block fades, a long page reads as static — a block
 * that translates 40px and fades is the least legible kind of motion there is,
 * because nothing inside it moves relative to anything else. Words arriving in
 * sequence is motion you can actually SEE.
 *
 * WHY A MASK RATHER THAN A FADE: each word sits in an overflow-hidden box and
 * slides up from below its own baseline, so it appears to be revealed by the
 * page rather than to materialise on top of it. That reads as typography; a
 * staggered opacity fade reads as a loading state.
 *
 * THE HEADING IS VISIBLE WITHOUT JS, WITHOUT AN OBSERVER, AND WITHOUT THE
 * ANIMATION RUNNING. That matters more here than anywhere else on the site:
 * this component renders the h1/h2 of thirteen sections across four pages, and
 * the version it replaces held every one of them at opacity 0 until a Framer
 * play-signal arrived. When that signal did not arrive — and it did not, for
 * three different reasons over three rounds of fixes — the site had no
 * headings. The stagger is now `--reveal-i` on each word plus arithmetic in
 * CSS, so the worst case is all the words appearing at once, already readable.
 *
 * ARABIC IS SAFE HERE. Splitting on whitespace never lands inside a word, so no
 * cursive join is broken. Wrapping is flex-based, so word ORDER mirrors under
 * `dir="rtl"` automatically.
 */

type Tag = "h1" | "h2" | "h3" | "p" | "span";

export function WordsReveal({
  text,
  as = "h2",
  id,
  className,
  style,
  delay = 0,
  /**
   * Where the wrapped lines align. Defaults to the theme's `--align-axis` so a
   * left-aligned theme cannot accidentally get a centred heading.
   */
  justify = "var(--align-axis)",
}: {
  text: string;
  as?: Tag;
  /** So a section can point `aria-labelledby` at its own heading. */
  id?: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  justify?: string;
}) {
  const ref = useRevealOnce<HTMLElement>({ amount: 0.4 });
  const Element = as;
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Element
      ref={ref as React.Ref<never>}
      id={id}
      className={`reveal-word ${className ?? ""}`}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: justify,
        columnGap: "0.26em",
        ["--reveal-delay" as string]: `${delay}s`,
        ...style,
      }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            display: "inline-block",
            overflow: "hidden",
            // Descenders (g, y, p) and Arabic diacritics sit BELOW the line box
            // and an overflow-hidden mask clips them flat. The padding gives
            // them room; the equal negative margin gives the space back so the
            // heading's line rhythm is unchanged.
            paddingBottom: "0.16em",
            marginBottom: "-0.16em",
          }}
        >
          {/* The animated child. The index drives the stagger arithmetic in
              reveal.css, so there is no per-element delay for JS to compute
              and nothing to go stale if the words change. */}
          <span
            style={
              { display: "inline-block", ["--reveal-i" as string]: i } as CSSProperties
            }
          >
            {word}
          </span>
        </span>
      ))}
    </Element>
  );
}

/**
 * The same entrance for a block that is not a single string — an intro
 * paragraph, a row of pills, a form field. One lift, sequenced AFTER the
 * heading it follows so a section header resolves top-to-bottom.
 */
export function LineReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRevealOnce<HTMLDivElement>({ amount: 0.4 });

  return (
    <div
      ref={ref}
      className={`reveal-fade ${className ?? ""}`}
      style={
        {
          "--reveal-delay": `${delay}s`,
          "--reveal-y": "22px",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
