"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import PushSlider from "./PushSlider";
import { MarkGlyph } from "@/components/brand/geometry";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import type { Slide } from "@/lib/gallery/types";
import type { CategoryId } from "@/lib/gallery/projects";

export type ShellProject = { id: string; title: string; subtitle: string };
export type ShellCategory = {
  id: CategoryId;
  label: string;
  projects: ShellProject[];
};

/**
 * The gallery chrome: two labelled strips above the stage.
 *
 * WHAT THIS IS NOT, ANY MORE. It was an editor shell — an icon rail of
 * unlabelled glyphs, a collapsible 300px panel, hover-delayed tooltips, and a
 * duplicate pair of chip bars below 760px. Four controls for two decisions, and
 * on a touch device the tooltips that explained the glyphs never appeared at
 * all. It is now: pick a division, pick a project. Both are words. See
 * gallery-chrome.css for the visual reasoning.
 *
 * STATE IS TWO VARIABLES, AND SELECTION ONLY EVER TRAVELS DOWN.
 *
 *   category    always set
 *   projectId   always set, always within the active category
 *
 * (`panelOpen` is gone with the panel.) Project selection lives HERE rather
 * than inside the stage, so it survives a category switch — and the stage is
 * KEYED by category so an index can never outlive the slides it indexes. That
 * key is load-bearing: without it a category switch handed the same slider a
 * different array while it still held an index into the old one, and the
 * resulting shell↔stage feedback loop crashed the route. GalleryShell.test.tsx
 * pins both halves of that fix.
 */
export function GalleryShell({
  categories,
  slidesByCategory,
  initialCategory,
  initialProjectId,
  labels,
}: {
  categories: ShellCategory[];
  /** Pre-resolved on the server — the client stage never sees an i18n key. */
  slidesByCategory: Record<CategoryId, Slide[]>;
  initialCategory: CategoryId;
  initialProjectId: string;
  labels: {
    /** Strip label — "Selected work". */
    selectedWork: string;
    /** Accessible name for the division tablist. */
    divisions: string;
    /** Accessible name for the project tablist. */
    projects: string;
    empty: string;
    startProject: string;
  };
}) {
  const [category, setCategory] = useState<CategoryId>(initialCategory);
  const [projectId, setProjectId] = useState(initialProjectId);
  const { reduce } = useMotionConfig();
  const uid = useId();
  const stageId = `${uid}-stage`;

  const active = categories.find((c) => c.id === category) ?? categories[0];
  const slides = slidesByCategory[category] ?? [];

  /**
   * Reflect selection into the URL with replaceState, not pushState.
   *
   * The tradeoff is explicit: Back leaves the gallery rather than stepping
   * through projects. Six projects deep, a pushState history would make Back
   * unusable as a way out — and "escape the page I am on" is the job Back is
   * actually doing for most people.
   */
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("c", category);
    url.searchParams.set("p", projectId);
    window.history.replaceState(null, "", url);
  }, [category, projectId]);

  /**
   * Ships anyway, at 8 lines: if anyone later switches to pushState, URL and
   * state cannot silently desync. Cheap insurance against a subtle bug.
   */
  useEffect(() => {
    const onPop = () => {
      const q = new URLSearchParams(window.location.search);
      const c = q.get("c");
      const p = q.get("p");
      if (c && categories.some((x) => x.id === c)) setCategory(c as CategoryId);
      if (p) setProjectId(p);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [categories]);

  const selectCategory = useCallback(
    (id: CategoryId) => {
      setCategory(id);
      // Move to the new category's first project. Leaving projectId pointing
      // at a project from the OTHER category would put the stage in a state
      // its bounds clamp has to rescue on the next render.
      const first = categories.find((c) => c.id === id)?.projects[0];
      if (first) setProjectId(first.id);
    },
    [categories],
  );

  /**
   * Roving arrow-key navigation, per the tablist pattern — one Tab stop per
   * strip, arrows move within it. Ported from the deleted rail: the chrome
   * changed, the keyboard contract did not.
   *
   * Both strips are horizontal, so Left/Right are the semantic keys; Up/Down
   * are accepted too because the rail taught this page's users to use them and
   * it costs one array entry.
   */
  const catsRef = useRef<HTMLDivElement>(null);
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

  const categoryIndex = categories.findIndex((c) => c.id === category);
  const projectIndex = active.projects.findIndex((p) => p.id === projectId);

  return (
    <div className="gallery-chrome">
      {/* ---------- top strip: what this page is, and the two divisions ------ */}
      <div className="gl-strip gl-strip--top">
        <span className="gl-eyebrow">{labels.selectedWork}</span>

        <div
          ref={catsRef}
          className="gl-cats"
          role="tablist"
          aria-label={labels.divisions}
          onKeyDown={(e) =>
            rove(
              e,
              categories.length,
              categoryIndex,
              (i) => selectCategory(categories[i].id),
              catsRef,
              ".gl-cat",
            )
          }
        >
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              className="gl-cat"
              aria-selected={c.id === category}
              aria-controls={stageId}
              tabIndex={c.id === category ? 0 : -1}
              onClick={() => selectCategory(c.id)}
            >
              {/*
                Accompanies the label, never replaces it — that confusion is
                exactly what the deleted rail was. MarkGlyph is aria-hidden
                internally, so the tab's accessible name is just the division.

                Size 20 is the floor MIN_GLYPH enforces rather than a number
                picked to fit: below it the blade reads as a stray mark instead
                of the division's signature. It stays at 20 on every screen —
                once the CTA drops out below 700px there is room for both chips
                at full size, so nothing has to be shrunk under the floor.
              */}
              <MarkGlyph
                division={c.id === "woodworks" ? "woodworks" : "mattresses"}
                size={20}
                color="currentColor"
              />
              {c.label}
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

      {/* ---------- project strip: the active division's work ---------- */}
      <div className="gl-strip gl-strip--projects">
        <div
          ref={projectsRef}
          className="gl-projects"
          role="tablist"
          aria-label={labels.projects}
          onKeyDown={(e) =>
            rove(
              e,
              active.projects.length,
              projectIndex,
              (i) => setProjectId(active.projects[i].id),
              projectsRef,
              ".gl-project",
            )
          }
        >
          {active.projects.length === 0 ? (
            <p className="gl-eyebrow" style={{ display: "block", padding: "18px 0" }}>
              {labels.empty}
            </p>
          ) : (
            active.projects.map((p, i) => {
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
                  <span className="gl-project-sub">{p.subtitle}</span>

                  {/*
                    ONE rule with a shared layoutId, so Framer moves the SAME
                    element between tabs instead of crossfading two. The
                    movement is what says "you navigated along a row" rather
                    than "the page redrew". Keyed by category as well, because
                    across a category switch the old and new tab rows are
                    unrelated lists and sliding between them would animate a
                    relationship that does not exist.
                  */}
                  {isActive &&
                    (reduce ? (
                      <span aria-hidden className="gl-project-rule" />
                    ) : (
                      <motion.span
                        aria-hidden
                        layoutId={`gl-project-rule-${category}`}
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
      <div className="gl-stage" id={stageId} role="tabpanel" aria-label={active.label}>
        {/* stage-viewport = the design's query container. It must have a
            definite size or `container: stage / size` never resolves and every
            cqw/cqh inside collapses. */}
        <div className="stage-viewport">
          {/*
            KEYED BY CATEGORY, deliberately.

            Without the key, a category switch hands the same slider a
            completely different `slides` array while it still holds an index
            into the old one. Two things follow, and both are wrong: for one
            render the stage resolves a project by POSITION rather than by
            identity (project 3 of Woodworks becomes project 3 of Mattresses),
            and the push transition then animates between two projects that
            have nothing to do with each other.

            Remounting gives the new category a fresh index seeded from
            `activeId`, and a clean entrance instead of a nonsensical push.
          */}
          <PushSlider
            key={category}
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
