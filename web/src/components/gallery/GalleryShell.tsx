"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { MarkGlyph } from "@/components/brand/geometry";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { isCutout } from "@/components/mattresses/assets";
import { Lightbox } from "./Lightbox";
import type { DivisionId, GalleryImage, SubCategoryId } from "@/lib/gallery/images";

export type ShellSub = { id: SubCategoryId; label: string };
export type ShellDivision = { id: DivisionId; label: string; subs: ShellSub[] };

/**
 * The gallery: two levels of tabs over a grid of pictures, and nothing else.
 *
 * ===========================================================================
 * WHAT THE REVIEW CHANGED, AND WHY IT IS A REBUILD
 * ===========================================================================
 *
 * This was a three-level browser (division → product type → project) over a
 * bento slide stage with a push-transition engine and a ten-field detail
 * overlay. The client's notes removed the reason for every part of it:
 *
 *   "remove all text and put pictures"          → no headline, paragraph, spec
 *                                                 lines or overlay copy
 *   "if there's only a text container replace    → the text cards in the bento
 *    it with a picture that's the same size"       layout have no equivalent
 *   "remove the view details button"             → no overlay to open
 *   "only two levels of tabs not 3"              → the project level goes
 *   "next and previous will move us through      → paging is sub-categories,
 *    the subtab"                                    not projects
 *   "when I click on a picture it should         → a lightbox, which the stage
 *    become bigger to preview it"                   had no concept of
 *
 * ===========================================================================
 * STATE IS TWO VARIABLES, AND SELECTION ONLY EVER TRAVELS DOWN
 * ===========================================================================
 *
 *   division   always set
 *   subId      always set, always within the active division
 *
 * Picking a division resets the sub-category, because a division that kept the
 * old one would leave the grid holding images from a sub-category it does not
 * contain. The grid is KEYED by the sub-category so an open lightbox index can
 * never outlive the array it indexes — the three-level version crashed the
 * route exactly this way before it was keyed, and the failure mode survives
 * the rebuild even though the level that caused it did not.
 */
export function GalleryShell({
  divisions,
  imagesBySub,
  initialDivision,
  initialSub,
  alts,
  labels,
}: {
  divisions: ShellDivision[];
  imagesBySub: Record<SubCategoryId, GalleryImage[]>;
  initialDivision: DivisionId;
  initialSub: SubCategoryId;
  /** Resolved on the server — the client never sees a message key. */
  alts: Record<string, string>;
  labels: {
    selectedWork: string;
    divisions: string;
    subCategories: string;
    empty: string;
    startProject: string;
    prev: string;
    next: string;
    close: string;
  };
}) {
  const [division, setDivision] = useState<DivisionId>(initialDivision);
  const [subId, setSubId] = useState<SubCategoryId>(initialSub);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const { reduce } = useMotionConfig();
  const uid = useId();
  const gridId = `${uid}-grid`;

  const activeDivision = divisions.find((d) => d.id === division) ?? divisions[0];
  const activeSub =
    activeDivision.subs.find((s) => s.id === subId) ?? activeDivision.subs[0];
  const images = imagesBySub[activeSub.id] ?? [];

  /**
   * Remember which tile opened the lightbox, so focus can go back to it.
   *
   * Not `document.activeElement` at close time: by then the lightbox's own
   * button has it, and on a backdrop click nothing in the grid ever had it.
   */
  const openerRef = useRef<HTMLButtonElement | null>(null);

  /**
   * Reflect selection into the URL with replaceState, not pushState.
   *
   * Back leaves the gallery rather than stepping through tabs — with two levels
   * a pushState history would make Back unusable as a way out, and "escape the
   * page I am on" is the job Back is actually doing for most people.
   *
   * ⚠ `?p=` IS RETIRED. It addressed the project level, which no longer exists.
   * Old shared links still work: `page.tsx` reads a legacy `?p=` and resolves it
   * to the sub-category that project used to live in, rather than 404ing.
   */
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("c", division);
    url.searchParams.set("s", activeSub.id);
    url.searchParams.delete("p");
    window.history.replaceState(null, "", url);
  }, [division, activeSub.id]);

  const selectDivision = useCallback(
    (id: DivisionId) => {
      const next = divisions.find((d) => d.id === id);
      if (!next) return;
      setDivision(id);
      setSubId(next.subs[0].id);
      setLightbox(null);
    },
    [divisions],
  );

  const selectSub = useCallback((id: SubCategoryId) => {
    setSubId(id);
    setLightbox(null);
  }, []);

  /**
   * PREV / NEXT PAGE THE SUB-CATEGORIES, which is what the client asked for
   * ("the next and previous will move us through the subtab"). They wrap, and
   * they wrap ACROSS divisions — running off the end of Woodworks' eight lands
   * on blue rather than dead-ending, so the arrows are a way to see everything
   * rather than a way to reach the end of one list.
   */
  const flatSubs = divisions.flatMap((d) => d.subs.map((s) => ({ ...s, division: d.id })));
  const flatIndex = flatSubs.findIndex((s) => s.id === activeSub.id);

  const stepSub = useCallback(
    (delta: number) => {
      const next = flatSubs[(flatIndex + delta + flatSubs.length) % flatSubs.length];
      if (!next) return;
      setDivision(next.division);
      setSubId(next.id);
      setLightbox(null);
    },
    [flatSubs, flatIndex],
  );

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    openerRef.current?.focus();
  }, []);

  const stepImage = useCallback(
    (delta: number) => {
      setLightbox((i) =>
        i === null ? i : (i + delta + images.length) % images.length,
      );
    },
    [images.length],
  );

  /** Roving focus for a tablist. Home/End jump; arrows wrap; RTL mirrors. */
  function rove(
    e: React.KeyboardEvent,
    count: number,
    currentIndex: number,
    onMove: (i: number) => void,
    container: React.RefObject<HTMLDivElement | null>,
    selector: string,
  ) {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const rtl =
      typeof document !== "undefined" && document.documentElement.dir === "rtl";
    let next: number;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    else {
      const forwardKey =
        e.key === "ArrowDown" || (rtl ? e.key === "ArrowLeft" : e.key === "ArrowRight");
      next = (currentIndex + (forwardKey ? 1 : -1) + count) % count;
    }
    onMove(next);
    container.current?.querySelectorAll<HTMLElement>(selector)[next]?.focus();
  }

  const divisionsRef = useRef<HTMLDivElement>(null);
  const subsRef = useRef<HTMLDivElement>(null);
  const divisionIndex = divisions.findIndex((d) => d.id === division);
  const subIndex = activeDivision.subs.findIndex((s) => s.id === activeSub.id);

  return (
    <div className="gallery-chrome">
      {/* ---------- level 1: the three divisions ---------- */}
      <div className="gl-strip gl-strip--top">
        <span className="gl-eyebrow">{labels.selectedWork}</span>

        <div
          ref={divisionsRef}
          className="gl-cats"
          role="tablist"
          aria-label={labels.divisions}
          onKeyDown={(e) =>
            rove(
              e,
              divisions.length,
              divisionIndex,
              (i) => selectDivision(divisions[i].id),
              divisionsRef,
              ".gl-cat",
            )
          }
        >
          {divisions.map((d) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              className="gl-cat"
              aria-selected={d.id === division}
              aria-controls={gridId}
              tabIndex={d.id === division ? 0 : -1}
              onClick={() => selectDivision(d.id)}
            >
              {/*
                THE WHOLE MARK, NOT A DIVISION BLADE. It was `MarkGlyph
                division={d.id}` — one of the five blades — which is
                unidentifiable at any size (see the note on `whole` in
                geometry.tsx) and, worse, `design` has no blade of its own: the
                three-division set this replaced was woodworks/furniture/
                mattresses, and DIVISION_ELEMENT has no `design` key. A single
                mark beside all three labels is honest about what it is.
              */}
              <MarkGlyph division="stark" whole size={28} color="currentColor" />
              {d.label}
            </button>
          ))}
        </div>

        <Link className="gl-cta" href="/#contact">
          {labels.startProject}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {/* ---------- level 2: what the division makes ---------- */}
      <div className="gl-strip gl-strip--subs">
        <button
          type="button"
          className="gl-step"
          onClick={() => stepSub(-1)}
          aria-label={labels.prev}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          ref={subsRef}
          className="gl-subs"
          role="tablist"
          aria-label={labels.subCategories}
          onKeyDown={(e) =>
            rove(
              e,
              activeDivision.subs.length,
              subIndex,
              (i) => selectSub(activeDivision.subs[i].id),
              subsRef,
              ".gl-sub",
            )
          }
        >
          {activeDivision.subs.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              className="gl-sub"
              aria-selected={s.id === activeSub.id}
              aria-controls={gridId}
              tabIndex={s.id === activeSub.id ? 0 : -1}
              onClick={() => selectSub(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="gl-step"
          onClick={() => stepSub(1)}
          aria-label={labels.next}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ---------- the pictures ---------- */}
      <div
        id={gridId}
        role="tabpanel"
        aria-label={activeSub.label}
        className="gl-grid-scroll"
        /* KEYED BY SUB-CATEGORY. Remounting on every switch is what guarantees
           no lightbox index, scroll offset or in-flight layout animation
           outlives the array it belongs to. */
        key={activeSub.id}
      >
        {images.length === 0 ? (
          <p className="gl-empty">{labels.empty}</p>
        ) : (
          <ul className="gl-grid">
            {images.map((img, i) => (
              <li key={img.src} className="gl-tile">
                <button
                  type="button"
                  className="gl-tile-button"
                  onClick={(e) => {
                    openerRef.current = e.currentTarget;
                    setLightbox(i);
                  }}
                >
                  <span className="sr-only">{alts[img.altKey] ?? ""}</span>
                  <motion.span
                    // Paired with the lightbox figure — this is the expansion.
                    layoutId={reduce ? undefined : `gl-${img.src}`}
                    className="gl-tile-frame"
                  >
                    <Image
                      src={img.src}
                      alt=""
                      fill
                      sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
                      className={isCutout(img.src) ? "object-contain" : "object-cover"}
                    />
                  </motion.span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Lightbox
        images={images}
        index={lightbox}
        alts={alts}
        labels={{ close: labels.close, prev: labels.prev, next: labels.next }}
        onClose={closeLightbox}
        onStep={stepImage}
      />
    </div>
  );
}
