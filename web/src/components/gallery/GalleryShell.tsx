"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { MarkGlyph } from "@/components/brand/geometry";
import { Lightbox } from "./Lightbox";
import PushSlider from "./PushSlider";
import { slidesForSubs } from "@/lib/gallery/toSlide";
import type { DivisionId, GalleryImage, SubCategoryId } from "@/lib/gallery/images";

export type ShellSub = { id: SubCategoryId; label: string };
export type ShellDivision = { id: DivisionId; label: string; subs: ShellSub[] };

/**
 * The gallery: two levels of tabs over the bento stage.
 *
 * ===========================================================================
 * WHAT THE REVIEW CHANGED — AND, JUST AS IMPORTANTLY, WHAT IT DID NOT
 * ===========================================================================
 *
 * This was a THREE-level browser (division → product type → project) over the
 * bento stage. The review changed what the stage holds and how you move through
 * it. It did not ask for a different stage:
 *
 *   "remove all text and put pictures"          → the cards lose their copy
 *   "if there's only a text container replace    → the three text cells become
 *    it with a picture that's the same size"       picture cells, same slots
 *   "remove the view details button"             → the CTA and its overlay go
 *   "only two levels of tabs not 3"              → the project level goes
 *   "next and previous will move us through      → Prev/Next page sub-tabs
 *    the subtab"                                    instead of projects
 *   "when I click on a picture it should         → the lightbox, which the
 *    become bigger to preview it"                   stage had no concept of
 *
 * ⚠ A PREVIOUS PASS READ THIS AS "REPLACE THE STAGE" AND WAS WRONG. It swapped
 * the bento for a flat uniform tile grid, which threw away the layout, the push
 * transition between slides and the Previous/Next buttons — none of which
 * anybody asked to remove. The client's correction was explicit: keep the grid
 * design exactly as it was, keep the buttons, keep the transition. So the stage
 * below is the original engine, with pictures in the cells that used to hold
 * copy. Do not "simplify" it away again.
 *
 * ===========================================================================
 * STATE IS THREE VARIABLES, AND SELECTION ONLY EVER TRAVELS DOWN
 * ===========================================================================
 *
 *   division   always set
 *   subId      always set, always within the active division
 *   lightbox   an index into the ACTIVE sub-category's pictures, or null
 *
 * Picking a division resets the sub-category, because a division that kept the
 * old one would leave the stage holding pictures from a sub-category it does
 * not contain. Every selection change closes the lightbox, so an open index can
 * never outlive the array it indexes — the three-level version crashed the
 * route exactly this way, and the failure mode survives the rework even though
 * the level that caused it did not.
 *
 * THE STAGE SHOWS EIGHT, THE LIGHTBOX SHOWS ALL OF THEM. The bento has eight
 * slots and blue alone resolves to seventy-five pictures. Clicking any tile
 * opens the full list at that tile's index, so the grid is the way in rather
 * than the whole of it.
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
  const uid = useId();
  const gridId = `${uid}-grid`;

  const activeDivision = divisions.find((d) => d.id === division) ?? divisions[0];
  const activeSub =
    activeDivision.subs.find((s) => s.id === subId) ?? activeDivision.subs[0];
  const images = imagesBySub[activeSub.id] ?? [];

  /**
   * One slide per sub-category of the active division.
   *
   * MEMOISED ON THE DIVISION, not rebuilt every render: `PushSlider` holds the
   * array in a `useMemo` dependency and diffs `slides` to decide whether the
   * index is still valid. A fresh array identity on every keystroke of parent
   * state would churn that and can re-enter the bounds clamp mid-transition.
   */
  const slides = useMemo(() => {
    /*
      THE SUB-CATEGORY'S OWN LABEL IS THE PICTURES' ACCESSIBLE NAME.

      "Interior & Exterior Cladding" is already localised, already on screen as
      the selected tab, and already the most accurate thing anyone has written
      about what is in these frames. Inventing eight per-picture descriptions
      would mean either writing captions the client did not supply or, worse,
      asserting to exactly the readers who cannot check that a placeholder is a
      photograph of the factory's own cladding.
    */
    const names = Object.fromEntries(activeDivision.subs.map((s) => [s.id, s.label]));
    return slidesForSubs(
      activeDivision.subs.map((s) => s.id),
      names,
    );
  }, [activeDivision]);

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
   * ⚠ THE SUB-STRIP'S OWN CHEVRONS WERE HERE AND WERE REMOVED.
   *
   * They paged the sub-categories across division boundaries. The stage's own
   * PREVIOUS / NEXT buttons are what the client meant by "the next and previous
   * will move us through the subtab", and they were the ones asked for back by
   * name — so two pagers now sat within 200px of each other, wrapping over
   * different ranges (the chevrons across all thirteen sub-categories, the
   * buttons around the active division's own). Two controls that look
   * equivalent and are not is worse than one.
   *
   * The buttons in the bento win because they are the design; the chevrons were
   * scaffolding added when the bento was gone.
   */
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
      </div>

      {/* ---------- the stage ---------- */}
      <div
        className="gl-stage"
        id={gridId}
        role="tabpanel"
        aria-label={`${activeDivision.label}, ${activeSub.label}`}
      >
        {/* stage-viewport = the design's query container. It must have a
            definite size or `container: stage / size` never resolves and every
            cqw/cqh inside collapses. */}
        <div className="stage-viewport">
          {/*
            KEYED BY THE DIVISION, AND ONLY THE DIVISION.

            It used to be `${division}:${sub}` because a slide was a PROJECT and
            the slide list belonged to the sub-category — so moving between two
            sub-categories handed the slider a different array while it held an
            index into the old one, and it had to remount to stay honest.

            A slide is a sub-category now, so the array belongs to the DIVISION.
            Keeping the sub-category in this key would remount the slider on
            every Previous / Next — which is precisely the transition the client
            asked to have back, destroyed by its own guard. Changing division
            still swaps the array wholesale, so that half of the key stays.

            Within a division, `activeId` moves the selection and `PushSlider`
            derives its index from it during render.
          */}
          <PushSlider
            key={division}
            slides={slides}
            activeId={activeSub.id}
            onActiveChange={(id) => selectSub(id as SubCategoryId)}
            emptyLabel={labels.empty}
            labels={{ prev: labels.prev, next: labels.next }}
            paused={lightbox !== null}
            onOpen={(index, el) => {
              openerRef.current = el;
              setLightbox(index);
            }}
          />
        </div>
      </div>

      <Lightbox
        images={images}
        index={lightbox}
        alts={alts}
        labels={{ close: labels.close, prev: labels.prev, next: labels.next }}
        // The same ref that restores focus is the box the picture grows out of.
        opener={openerRef}
        onClose={closeLightbox}
        onStep={stepImage}
      />
    </div>
  );
}
