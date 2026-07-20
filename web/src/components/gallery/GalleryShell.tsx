"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import PushSlider from "./PushSlider";
import { MarkGlyph } from "@/components/brand/geometry";
import type { Slide } from "@/lib/gallery/types";
import type { CategoryId } from "@/lib/gallery/projects";

export type ShellProject = { id: string; title: string; subtitle: string };
export type ShellCategory = {
  id: CategoryId;
  label: string;
  projects: ShellProject[];
};

/**
 * The gallery chrome: [rail][panel][stage].
 *
 * Ported in spirit from the handoff's EditorShell, but rewritten rather than
 * lifted — that file was half editor (7 tabs, a preview toolbar, localStorage
 * UI persistence, a `JSX.Element` annotation that no longer compiles under
 * @types/react 19) and half chrome. The chrome is what is worth keeping, and
 * it is here. The visual language lives in gallery-chrome.css.
 *
 * STATE IS THREE VARIABLES, NOT ONE. The handoff had `active: TabId | null`,
 * where null meant "panel closed". Mapping TabId onto CategoryId would have
 * made "no category selected" a reachable state, and the stage has nothing to
 * render in it. So:
 *
 *   panelOpen   the collapse gesture — what `active` actually meant
 *   category    always set
 *   projectId   always set, always within the active category
 *
 * Project selection lives HERE rather than inside a tab, so it survives a
 * category switch. (The handoff's tabs unmount and lose local state — correct
 * for an editor, wrong for navigation.)
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
    panelTitle: string;
    projects: string;
    close: string;
    open: string;
    empty: string;
    startProject: string;
  };
}) {
  const [panelOpen, setPanelOpen] = useState(true);
  const [category, setCategory] = useState<CategoryId>(initialCategory);
  const [projectId, setProjectId] = useState(initialProjectId);
  const uid = useId();

  const active = categories.find((c) => c.id === category) ?? categories[0];
  const slides = slidesByCategory[category] ?? [];

  /** Default the panel closed on narrow desktops, as the handoff did. */
  useEffect(() => {
    if (window.innerWidth < 1200) setPanelOpen(false);
  }, []);

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

  /** Esc closes the panel. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectCategory = useCallback(
    (id: CategoryId) => {
      setCategory(id);
      // Move to the new category's first project. Leaving projectId pointing
      // at a project from the OTHER category would put the slider in a state
      // its bounds clamp has to rescue on the next render.
      const first = categories.find((c) => c.id === id)?.projects[0];
      if (first) setProjectId(first.id);
      setPanelOpen(true);
    },
    [categories],
  );

  /** Roving arrow-key navigation across the rail, per the tablist pattern. */
  const railRef = useRef<HTMLDivElement>(null);
  const onRailKey = (e: React.KeyboardEvent) => {
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const i = categories.findIndex((c) => c.id === category);
    const fwd = e.key === "ArrowDown" || e.key === "ArrowRight";
    const nextIdx = (i + (fwd ? 1 : -1) + categories.length) % categories.length;
    selectCategory(categories[nextIdx].id);
    railRef.current
      ?.querySelectorAll<HTMLButtonElement>(".ed-railbtn")
      [nextIdx]?.focus();
  };

  const panelId = `${uid}-panel`;

  return (
    <div className="gallery-chrome h-full">
      <div className="shell">
        {/* ---------- rail: the two categories ---------- */}
        <div
          ref={railRef}
          className="ed-rail"
          role="tablist"
          aria-orientation="vertical"
          aria-label={labels.projects}
          onKeyDown={onRailKey}
        >
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              className="ed-railbtn"
              data-tip={c.label}
              aria-selected={c.id === category}
              aria-controls={panelId}
              /* Roving tabIndex: one stop for the whole rail, arrows move
                 within it. Two tabs is small, but the pattern is the same one
                 a screen-reader user expects from any tablist. */
              tabIndex={c.id === category ? 0 : -1}
              onClick={() => selectCategory(c.id)}
            >
              <span className="sr-only">{c.label}</span>
              {/* The one place a division glyph is genuinely self-explanatory:
                  two categories, each with a fixed blade. */}
              <MarkGlyph
                division={c.id === "woodworks" ? "woodworks" : "mattresses"}
                size={22}
                color="currentColor"
              />
            </button>
          ))}

          <div className="mt-auto">
            <a
              href="/#contact"
              className="ed-railbtn"
              data-tip={labels.startProject}
              aria-label={labels.startProject}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* ---------- panel: the projects in the active category ---------- */}
        <div className={`ed-panel-slot${panelOpen ? " open" : ""}`}>
          <div className="ed-panel" id={panelId} role="tabpanel" aria-label={active.label}>
            <div className="ed-panel-head">
              <h2>{active.label}</h2>
              <button
                type="button"
                className="ed-railbtn"
                style={{ width: 28, height: 28 }}
                onClick={() => setPanelOpen(false)}
                aria-label={labels.close}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="ed-panel-body">
              <div className="ed-section">
                <div className="ed-sec-inner">
                  {active.projects.length === 0 ? (
                    <p className="px-3 py-4 text-[11px]" style={{ color: "var(--ed-faint)" }}>
                      {labels.empty}
                    </p>
                  ) : (
                    /*
                      A LIST OF ROWS THAT WRAP, not the handoff's `.ed-chip-btn`
                      in `.ed-target-grid`. That is a fixed 3-column export
                      picker at roughly 95px per column, which ellipsizes:
                      "Hospitality Fit-Out" and "Hotel Bedding Programme" would
                      both render as "Hospi…". Project names are NAVIGATION —
                      if you cannot read them you cannot choose.
                    */
                    <ul>
                      {active.projects.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            className="ed-projectrow"
                            aria-current={p.id === projectId}
                            onClick={() => setProjectId(p.id)}
                          >
                            <span>
                              {p.title}
                              <span className="ed-projectrow-meta">{p.subtitle}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*
          MOBILE. The handoff hid the rail below 760px and left a gear FAB as
          the only route to another project — correct for an editor whose
          panel is optional, wrong for a gallery where moving between projects
          IS the page. A horizontal strip replaces both.
        */}
        <div className="ed-mobilebar">
          <div className="ed-mobilescroll" role="tablist" aria-label={labels.projects}>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                className="ed-mobilechip"
                aria-selected={c.id === category}
                onClick={() => selectCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="ed-mobilescroll">
            {active.projects.map((p) => (
              <button
                key={p.id}
                type="button"
                className="ed-mobilechip"
                aria-current={p.id === projectId}
                onClick={() => setProjectId(p.id)}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <div className="canvas">
          {/* stage-viewport = the design's query container. It must have a
              definite size or `container: stage / size` never resolves and
              every cqw/cqh inside collapses. */}
          <div className="stage-viewport">
            {/*
              KEYED BY CATEGORY, deliberately.

              Without the key, a category switch hands the same slider a
              completely different `slides` array while it still holds an index
              into the old one. Two things follow, and both are wrong: for one
              render the stage resolves a project by POSITION rather than by
              identity (project 3 of Woodworks becomes project 3 of
              Mattresses), and the push transition then animates between two
              projects that have nothing to do with each other.

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
    </div>
  );
}
