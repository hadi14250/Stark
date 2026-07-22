"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import PushSlider from "./PushSlider";
import { MarkGlyph } from "@/components/brand/geometry";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import type { Slide } from "@/lib/gallery/types";
import type { DivisionId, SubCategoryId } from "@/lib/gallery/projects";

export type ShellProject = { id: string; title: string; subtitle: string };
export type ShellSub = {
  id: SubCategoryId;
  label: string;
  projects: ShellProject[];
};
export type ShellDivision = {
  id: DivisionId;
  label: string;
  subs: ShellSub[];
};

/**
 * The gallery chrome: three labelled strips above the stage.
 *
 * WHAT THIS IS NOT, ANY MORE. It was an editor shell — an icon rail of
 * unlabelled glyphs, a collapsible 300px panel, hover-delayed tooltips, and a
 * duplicate pair of chip bars below 760px. Four controls for two decisions, and
 * on a touch device the tooltips that explained the glyphs never appeared at
 * all. It is now: pick a division, pick a product type, pick an entry. All
 * three are words. See gallery-chrome.css for the visual reasoning.
 *
 * WHY THERE ARE THREE STRIPS NOW. The client's gallery note asks for three
 * divisions, each browsable by what the factory makes — so the middle level
 * (slide 14's product types, plus blue and siesta) is new, and it is a genuine
 * third dimension rather than a relabelling. The two strips before this were
 * (division, project), NOT two levels of category.
 *
 * STATE IS THREE VARIABLES, AND SELECTION ONLY EVER TRAVELS DOWN.
 *
 *   division    always set
 *   subId       always set, always within the active division
 *   projectId   always set, always within the active sub-category
 *
 * (`panelOpen` is gone with the panel.) Each selector resets EVERY level below
 * it, not just the next one: picking a division that keeps the old sub-category
 * would leave the stage holding slides from a sub-category the division does
 * not contain. Project selection lives HERE rather than inside the stage, so it
 * survives a switch — and the stage is KEYED by the deepest selection so an
 * index can never outlive the slides it indexes. That key is load-bearing:
 * without it a switch handed the same slider a different array while it still
 * held an index into the old one, and the resulting shell↔stage feedback loop
 * crashed the route. GalleryShell.test.tsx pins both halves of that fix.
 */
export function GalleryShell({
  divisions,
  slidesBySub,
  initialDivision,
  initialSub,
  initialProjectId,
  labels,
}: {
  divisions: ShellDivision[];
  /**
   * Pre-resolved on the server — the client stage never sees an i18n key.
   *
   * Keyed by SUB-CATEGORY, not by division, because the sub-category is what
   * owns a list of slides. Sub-category ids are globally unique (see the note
   * on SUB_CATEGORIES), which is what lets this stay a flat record instead of
   * a nested one.
   */
  slidesBySub: Record<SubCategoryId, Slide[]>;
  initialDivision: DivisionId;
  initialSub: SubCategoryId;
  initialProjectId: string;
  labels: {
    /** Strip label — "Selected work". */
    selectedWork: string;
    /** Accessible name for the division tablist. */
    divisions: string;
    /** Accessible name for the product-type tablist. */
    subCategories: string;
    /** Accessible name for the project tablist. */
    projects: string;
    empty: string;
    startProject: string;
  };
}) {
  const [division, setDivision] = useState<DivisionId>(initialDivision);
  const [subId, setSubId] = useState<SubCategoryId>(initialSub);
  const [projectId, setProjectId] = useState(initialProjectId);
  const { reduce } = useMotionConfig();
  const uid = useId();
  const stageId = `${uid}-stage`;

  const activeDivision = divisions.find((d) => d.id === division) ?? divisions[0];
  const activeSub =
    activeDivision.subs.find((s) => s.id === subId) ?? activeDivision.subs[0];
  const slides = slidesBySub[activeSub.id] ?? [];

  /**
   * Reflect selection into the URL with replaceState, not pushState.
   *
   * The tradeoff is explicit: Back leaves the gallery rather than stepping
   * through projects. Three levels deep, a pushState history would make Back
   * unusable as a way out — and "escape the page I am on" is the job Back is
   * actually doing for most people.
   *
   * `?c=` and `?p=` keep their names through the restructure. They are in
   * shared links and in the landing page's teaser tiles, so renaming them would
   * break every link anyone has already sent.
   */
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("c", division);
    url.searchParams.set("s", activeSub.id);
    url.searchParams.set("p", projectId);
    window.history.replaceState(null, "", url);
  }, [division, activeSub.id, projectId]);

  /**
   * Ships anyway, at 10 lines: if anyone later switches to pushState, URL and
   * state cannot silently desync. Cheap insurance against a subtle bug.
   */
  useEffect(() => {
    const onPop = () => {
      const q = new URLSearchParams(window.location.search);
      const c = q.get("c");
      const s = q.get("s");
      const p = q.get("p");
      const d = divisions.find((x) => x.id === c);
      if (d) setDivision(d.id);
      // Only accept a sub-category that belongs to the division being restored,
      // or Back could seat the shell on a pair that cannot coexist.
      if (s && (d ?? activeDivision).subs.some((x) => x.id === s)) {
        setSubId(s as SubCategoryId);
      }
      if (p) setProjectId(p);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [divisions, activeDivision]);

  /**
   * Selecting a division resets BOTH levels below it.
   *
   * Leaving projectId — or subId — pointing into the other division would put
   * the stage in a state its bounds clamp has to rescue on the next render,
   * which is the shape of the crash this file's tests exist for.
   */
  const selectDivision = useCallback(
    (id: DivisionId) => {
      setDivision(id);
      const firstSub = divisions.find((d) => d.id === id)?.subs[0];
      if (firstSub) {
        setSubId(firstSub.id);
        const first = firstSub.projects[0];
        if (first) setProjectId(first.id);
      }
    },
    [divisions],
  );

  const selectSub = useCallback(
    (id: SubCategoryId) => {
      setSubId(id);
      const first = activeDivision.subs.find((s) => s.id === id)?.projects[0];
      if (first) setProjectId(first.id);
    },
    [activeDivision],
  );

  /**
   * Roving arrow-key navigation, per the tablist pattern — one Tab stop per
   * strip, arrows move within it. Ported from the deleted rail: the chrome
   * changed, the keyboard contract did not.
   *
   * All three strips are horizontal, so Left/Right are the semantic keys;
   * Up/Down are accepted too because the rail taught this page's users to use
   * them and it costs one array entry.
   */
  const divisionsRef = useRef<HTMLDivElement>(null);
  const subsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  function rove(
    e: React.KeyboardEvent,
    count: number,
    currentIndex: number,
    onMove: (index: number) => void,
    container: React.RefObject<HTMLDivElement | null>,
    selector: string,
  ) {
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();

    // In RTL the strips render end-to-start, so ArrowLeft must advance. Reading
    // direction off the document is what keeps the keyboard matching the eye.
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

  const divisionIndex = divisions.findIndex((d) => d.id === division);
  const subIndex = activeDivision.subs.findIndex((s) => s.id === activeSub.id);
  const projectIndex = activeSub.projects.findIndex((p) => p.id === projectId);

  return (
    <div className="gallery-chrome">
      {/* ---------- top strip: what this page is, and the three divisions ---- */}
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
              aria-controls={stageId}
              tabIndex={d.id === division ? 0 : -1}
              onClick={() => selectDivision(d.id)}
            >
              {/*
                Accompanies the label, never replaces it — that confusion is
                exactly what the deleted rail was. MarkGlyph is aria-hidden
                internally, so the tab's accessible name is just the division.

                ⚠ THE DIVISION IS PASSED THROUGH, NOT DECIDED HERE. This was
                `c.id === "woodworks" ? "woodworks" : "mattresses"` — a binary
                ternary written when there were exactly two divisions. Adding
                Furniture would have silently given it the MATTRESSES blade,
                and nothing would have failed: the ternary typechecks, renders,
                and is wrong. DIVISION_ELEMENT has carried a `furniture` key all
                along (it is #lg-b3); the ternary simply could not reach it.

                Size 20 is the floor MIN_GLYPH enforces rather than a number
                picked to fit: below it the blade reads as a stray mark instead
                of the division's signature. It stays at 20 on every screen —
                once the CTA drops out below 700px there is room for all three
                chips at full size, so nothing has to be shrunk under the floor.
              */}
              <MarkGlyph division={d.id} size={20} color="currentColor" />
              {d.label}
            </button>
          ))}
        </div>

        {/*
          Replaces the rail's bare "+", which navigated off the page with no
          indication that it would. A plain anchor rather than the site Pill:
          this is chrome inside a fixed-height strip, and the Pill's generous
          section-CTA padding would push the strip 20px taller.
        */}
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

      {/* ---------- sub-category strip: what the division makes ---------- */}
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
              aria-controls={stageId}
              tabIndex={s.id === activeSub.id ? 0 : -1}
              onClick={() => selectSub(s.id)}
            >
              {/*
                A THIRD MECHANIC, and it has to be a third one. The divisions
                above are a segmented control and the projects below are
                underline tabs; that difference is what stops two stacked tab
                rows from reading as one confusing control. A third row in
                either of those two styles would collapse the distinction it
                was making. So this level is a marker dot and a weight change,
                which is quieter than both and unmistakably not either.
              */}
              <span aria-hidden className="gl-sub-dot" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- project strip: the active product type's entries ---------- */}
      <div className="gl-strip gl-strip--projects">
        <div
          ref={projectsRef}
          className="gl-projects"
          role="tablist"
          aria-label={labels.projects}
          onKeyDown={(e) =>
            rove(
              e,
              activeSub.projects.length,
              projectIndex,
              (i) => setProjectId(activeSub.projects[i].id),
              projectsRef,
              ".gl-project",
            )
          }
        >
          {activeSub.projects.length === 0 ? (
            <p className="gl-eyebrow" style={{ display: "block", padding: "18px 0" }}>
              {labels.empty}
            </p>
          ) : (
            activeSub.projects.map((p, i) => {
              const isActive = p.id === projectId;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  className="gl-project"
                  aria-selected={isActive}
                  aria-controls={stageId}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setProjectId(p.id)}
                >
                  <span className="gl-project-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="gl-project-name">{p.title}</span>
                  {/*
                    NO SUBTITLE IN THE TAB. Each tab carried its sector line
                    too ("Hotel · Public areas"), which put three pieces of
                    text in every tab across a row of three — the client's word
                    was "crowded", and on a narrow window the row scrolled
                    horizontally because of it. The subtitle still appears on
                    the hero card inside the stage, where it belongs and has
                    room; a tab only has to be nameable.
                  */}

                  {/*
                    ONE rule with a shared layoutId, so Framer moves the SAME
                    element between tabs instead of crossfading two. The
                    movement is what says "you navigated along a row" rather
                    than "the page redrew". Keyed by SUB-CATEGORY, because
                    across a switch the old and new tab rows are unrelated
                    lists and sliding between them would animate a relationship
                    that does not exist.
                  */}
                  {isActive &&
                    (reduce ? (
                      <span aria-hidden className="gl-project-rule" />
                    ) : (
                      <motion.span
                        aria-hidden
                        layoutId={`gl-project-rule-${activeSub.id}`}
                        className="gl-project-rule"
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                      />
                    ))}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ---------- stage ---------- */}
      <div
        className="gl-stage"
        id={stageId}
        role="tabpanel"
        aria-label={`${activeDivision.label}, ${activeSub.label}`}
      >
        {/* stage-viewport = the design's query container. It must have a
            definite size or `container: stage / size` never resolves and every
            cqw/cqh inside collapses. */}
        <div className="stage-viewport">
          {/*
            KEYED BY THE DEEPEST SELECTION, deliberately.

            Without the key, a switch hands the same slider a completely
            different `slides` array while it still holds an index into the old
            one. Two things follow, and both are wrong: for one render the stage
            resolves a project by POSITION rather than by identity (project 3 of
            Doors & Panels becomes project 3 of blue), and the push transition
            then animates between two projects that have nothing to do with each
            other.

            ⚠ IT IS THE SUB-CATEGORY THAT MUST BE IN THIS KEY, not the division.
            The division alone was enough when a division owned the slide list;
            it does not any more. Keyed by division, moving between two product
            types INSIDE one division would keep the stale index and reproduce
            exactly the crash this key was added to prevent. Both are in the key
            because reading `division:sub` makes that reasoning visible.

            Remounting gives the new selection a fresh index seeded from
            `activeId`, and a clean entrance instead of a nonsensical push.
          */}
          <PushSlider
            key={`${division}:${activeSub.id}`}
            slides={slides}
            activeId={projectId}
            onActiveChange={setProjectId}
            emptyLabel={labels.empty}
          />
        </div>
      </div>
    </div>
  );
}
