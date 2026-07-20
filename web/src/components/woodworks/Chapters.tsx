"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/ui/Photo";
import { WordsReveal, LineReveal } from "@/components/motion/WordsReveal";
import { ClipReveal } from "@/components/motion/reveals";

export type Chapter = {
  title: string;
  body: string;
  meta: string[];
  alt: string;
  image: string;
};

/**
 * THE PAGE'S OWN STRUCTURE — a sticky index beside full-bleed panels.
 *
 * What was here: three `CapabilityBand`s. The same component, in the same
 * order, with the same three image files as Home's Capabilities section. The
 * client's review said Woodworks read as a recolour of Home, and this was the
 * single clearest reason why — not the palette, the STRUCTURE. A visitor does
 * not have to compare the two pages side by side to feel it; the shape of the
 * scroll is the same.
 *
 * So the shape changes. The chapter names stand still on the start edge while
 * their panels move past, and the current one lights up. That is a reading
 * device Home has nowhere: Home's sections arrive one at a time and leave, and
 * nothing on it persists across a scroll.
 *
 * WHY AN OBSERVER RATHER THAN A SCROLL SCRUB. A scrub maps scroll position to
 * an index continuously, which means it has to re-measure on every resize,
 * font load and image settle, and it is wrong until it does. An observer is
 * told when a panel is in the reading band and is never wrong about anything
 * else. The index is a readout of "which chapter am I in", which is exactly a
 * boolean per panel.
 *
 * NOTHING HERE HIDES CONTENT. The index renders every chapter name at all
 * times and the panels are ordinary flow content — if the observer never
 * fires, the first chapter stays marked and the page reads top to bottom
 * exactly as it would on paper. That constraint is not optional on this
 * codebase; see reveal.css for what happened the last time something needed
 * JavaScript in order to be visible.
 */
export function Chapters({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(0);
  const panelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = panelsRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-chapter]"));
    if (panels.length === 0) return;

    /**
     * A reading BAND, not a line. `rootMargin` shrinks the viewport to a strip
     * across its middle, so a chapter becomes current when it reaches the
     * place a reader is actually looking rather than when its first pixel
     * crosses the bottom edge.
     *
     * Sorting by position and taking the first intersecting panel keeps the
     * index monotonic while scrolling up: without it, two panels in the band
     * at once resolve to whichever fired last, and the marker jitters.
     */
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length === 0) return;
        const index = panels.indexOf(visible[0].target as HTMLElement);
        if (index >= 0) setActive(index);
      },
      { rootMargin: "-38% 0px -46% 0px", threshold: 0 },
    );

    for (const panel of panels) io.observe(panel);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* ---- narrow: the index is a position readout pinned under the header.
              Not tabs. On a phone the panels ARE the page — an index that looks
              operable but only reports position is a worse lie than no index. */}
      {/* Hidden above the nav breakpoint by woodworks.css, NOT by `nav:hidden`
          — that layer outranks utilities, so the class would lose. */}
      <div className="ww-index-strip" aria-hidden>
        {chapters.map((c, i) => (
          <span
            key={c.title}
            className="flex flex-none items-baseline gap-2 font-mono text-[11px] tracking-eyebrow"
            style={{
              color: i === active ? "var(--color-ink)" : "var(--color-ink-muted)",
              textTransform: "var(--eyebrow-transform)" as "uppercase",
            }}
          >
            <span style={{ color: i === active ? "var(--color-accent)" : undefined }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            {c.title}
          </span>
        ))}
      </div>

      <div className="grid gap-[clamp(28px,4vw,64px)] nav:grid-cols-[minmax(0,0.32fr)_minmax(0,1fr)]">
        {/* ---- the sticky index (desktop) ---- */}
        <nav className="ww-index hidden nav:block" aria-label="Chapters">
          <ol className="flex flex-col">
            {chapters.map((c, i) => (
              <li key={c.title} className="relative ps-4">
                {/*
                  A link, not a button. Each chapter has an id and this moves
                  the page to it — which means it works with no JavaScript, can
                  be middle-clicked, and reads to a screen reader as navigation
                  rather than as a control with an unexplained effect.
                */}
                <a
                  href={`#chapter-${i + 1}`}
                  className="ww-index-item"
                  aria-current={i === active}
                >
                  <span aria-hidden className="ww-index-rule" />
                  <span className="ww-index-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-body-sm leading-snug">{c.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ---- the panels ---- */}
        <div ref={panelsRef} className="flex flex-col gap-[clamp(56px,8vw,120px)]">
          {chapters.map((c, i) => (
            <article
              key={c.title}
              id={`chapter-${i + 1}`}
              data-chapter={i}
              className="scroll-mt-[calc(var(--header-h)+72px)]"
            >
              <ClipReveal>
                <Photo
                  src={c.image}
                  alt={c.alt}
                  height="clamp(240px, 46vh, 520px)"
                  sizes="(max-width: 860px) 100vw, 62vw"
                  className="rounded-[var(--radius-image)]"
                />
              </ClipReveal>

              <div className="mt-6 flex items-start gap-4">
                <span
                  className="font-mono text-[11px] tabular-nums leading-none"
                  style={{ color: "var(--color-accent)", marginTop: "0.55em" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <WordsReveal
                    as="h3"
                    text={c.title}
                    justify="flex-start"
                    className="font-display text-h3 font-semibold leading-h3 tracking-display text-[color:var(--color-ink)]"
                  />
                  <LineReveal delay={0.1}>
                    <p className="mt-3 max-w-[58ch] text-body leading-body text-[color:var(--color-ink-body)]">
                      {c.body}
                    </p>
                  </LineReveal>
                  <LineReveal delay={0.18}>
                    <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4" style={{ borderColor: "var(--color-line)" }}>
                      {c.meta.map((m) => (
                        <li
                          key={m}
                          className="font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
                          style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
                        >
                          {m}
                        </li>
                      ))}
                    </ul>
                  </LineReveal>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
