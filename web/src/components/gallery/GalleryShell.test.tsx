// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { renderWithIntl as render, screen, fireEvent, cleanup } from "@/test/render";
import { GalleryShell } from "./GalleryShell";
import { CATEGORIES, PROJECTS } from "@/lib/gallery/projects";
import { toSlide } from "@/lib/gallery/toSlide";
import type { CategoryId } from "@/lib/gallery/projects";
import type { Slide } from "@/lib/gallery/types";

const here = dirname(fileURLToPath(import.meta.url));
const sliderSrc = readFileSync(join(here, "PushSlider.tsx"), "utf8");

/**
 * THE CRASH THIS FILE EXISTS FOR.
 *
 * Reported as: "when I change tabs from the right side of the left side and
 * then change tabs from the left side of the left side, the site crashes."
 * Translated: pick a project other than the first, then switch category —
 * "Maximum update depth exceeded", route down.
 *
 * The mechanism was two effects in PushSlider chasing each other. One mirrored
 * the shell's `activeId` DOWN into the slider's internal index; the other
 * watched the resolved slide and reported its id back UP. A category switch
 * swaps the `slides` array while the index still points into the old one, so
 * the reporting effect announced project N of the NEW category — a project the
 * shell never chose — the shell echoed it back as `activeId`, the mirroring
 * effect pulled the index the other way, and the pair oscillated with period 2
 * until React gave up.
 *
 * Both categories in the fixture hold exactly three projects, which is why the
 * slider's bounds clamp never caught it: the stale index was always in range,
 * just wrong.
 */

/** Localised on the server in the real route; these stand in for that. */
const LABELS = {
  selectedWork: "Selected work",
  divisions: "Divisions",
  projects: "Projects",
  empty: "No projects yet",
  startProject: "Start a project",
};

/**
 * THE FIXTURE IS SYNTHETIC ON PURPOSE, and it did not used to be.
 *
 * It read `byCategory()` straight from production data, which meant this
 * test's scenario — switch between two POPULATED categories — was true only
 * for as long as the real gallery happened to have projects in both. The
 * content audit emptied the mattresses category (every documented reference
 * the company holds is a woodworks one) and these tests started throwing on
 * `projects[2]` of an empty array.
 *
 * That is the test depending on content, which is backwards: the oscillation
 * bug below is a bug in the SHELL, and it must stay guarded no matter what the
 * gallery currently contains. So the shape the bug needs is built here, and
 * only the project ids are borrowed from real data because the URL assertions
 * check them.
 *
 * Display names stay synthetic for a separate reason: the real data labels a
 * category "woodworks" AND gives projects a "woodworks" subtitle, which makes
 * every accessible-name query ambiguous. That ambiguity would be the test's,
 * not the app's.
 */
const PER_CATEGORY = 3;

function fixture() {
  // Stands in for next-intl's `t`. The real route resolves copy on the server;
  // none of it matters here, so keys pass through as their own text.
  const t = Object.assign((key: string) => key, { raw: () => [] });

  // Enough distinct entries to fill every category, cycling real projects for
  // their ids and giving each a unique slug so the URL assertions stay sharp.
  const synthetic = CATEGORIES.flatMap((id, ci) =>
    Array.from({ length: PER_CATEGORY }, (_, pi) => {
      const base = PROJECTS[(ci * PER_CATEGORY + pi) % PROJECTS.length];
      return { ...base, id: `${base.id}-${ci}${pi}`, category: id };
    }),
  );
  const inCategory = (id: CategoryId) => synthetic.filter((p) => p.category === id);

  const categories = CATEGORIES.map((id, ci) => ({
    id,
    label: `Category ${ci}`,
    projects: inCategory(id).map((p, pi) => ({
      id: p.id,
      title: `Project ${ci}-${pi}`,
      subtitle: "Sector",
    })),
  }));
  const slidesByCategory = Object.fromEntries(
    CATEGORIES.map((id) => [id, inCategory(id).map((p) => toSlide(p, t))]),
  ) as Record<CategoryId, Slide[]>;
  return { categories, slidesByCategory };
}

/**
 * Click the first control with this accessible name.
 *
 * `getAllBy` rather than `getBy` is a holdover with a reason: the old chrome
 * rendered every project twice (a desktop panel and a mobile chip bar), so a
 * name always matched more than one node. The replacement renders each control
 * once at every width — but a future chrome that duplicates again should fail
 * on its own behaviour, not by making this helper throw.
 */
function clickNamed(name: string, role: "button" | "tab") {
  const found = screen.getAllByRole(role, { name: new RegExp(name) });
  expect(found.length, `no ${role} named ${name}`).toBeGreaterThan(0);
  // Each click is one interaction, so each gets a fresh settling budget.
  writes = 0;
  fireEvent.click(found[0]);
}

/** URL writes allowed per interaction. Settling takes one or two. */
const BUDGET = 12;
let writes = 0;

beforeEach(() => {
  // Framer's viewport hooks need one to exist; it never has to fire.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds = [];
    },
  );
  // jsdom has no matchMedia; PushSlider asks it whether hover is available.
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );

  /**
   * A CIRCUIT BREAKER, and the reason this file can test a runaway loop at all.
   *
   * Left to itself the regression does not throw here — it SPINS. The two
   * effects re-enter each other through passive-effect flushes fast enough to
   * starve the event loop, so React never reaches the nested-update ceiling
   * that produces "Maximum update depth exceeded" in a browser, vitest's own
   * per-test timeout never gets a turn to fire, and the run simply hangs. A
   * guard that hangs CI instead of failing it is not a guard.
   *
   * The shell writes the URL on every (category, projectId) change, so that
   * write is a faithful proxy for "the state settled". Capping it converts an
   * unbounded spin into an immediate, legible failure.
   */
  writes = 0;
  const real = window.history.replaceState.bind(window.history);
  vi.spyOn(window.history, "replaceState").mockImplementation((...args) => {
    if (++writes > BUDGET) {
      throw new Error(
        `the shell rewrote the URL more than ${BUDGET} times for one ` +
          `interaction — selection is oscillating between the shell and the stage`,
      );
    }
    // Still perform the write: the URL is also what the assertions read.
    real(...args);
  });
});

afterEach(() => {
  // Explicit, because vitest runs with `globals: false` — Testing Library's
  // automatic cleanup only registers when it can see a global afterEach, so
  // without this the DOM accumulates across tests and every `getAllByRole`
  // starts matching the previous test's shell too.
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("switching category after selecting a project", () => {
  it("does not send the shell and the stage into an update loop", () => {
    const { categories, slidesByCategory } = fixture();
    const woodworks = categories[0];
    const mattresses = categories[1];
    // Third project — the case that breaks. With the first selected the index
    // is already 0 and the stale-index swap has nothing to go wrong with,
    // which is why this was easy to miss by hand.
    const third = woodworks.projects[2];

    render(
      <GalleryShell
        categories={categories}
        slidesByCategory={slidesByCategory}
        initialCategory={woodworks.id}
        initialProjectId={woodworks.projects[0].id}
        labels={LABELS}
      />,
    );

    // Select the third project, then cross to the other category. React throws
    // synchronously inside the click handler when the effects oscillate, so a
    // regression fails this test rather than merely logging.
    clickNamed(third.title, "tab");
    expect(() => clickNamed(mattresses.label, "tab")).not.toThrow();

    // …and it lands somewhere coherent: the new category's FIRST project, not
    // whatever happened to sit at the old index.
    const url = new URL(window.location.href);
    expect(url.searchParams.get("c")).toBe(mattresses.id);
    expect(url.searchParams.get("p")).toBe(mattresses.projects[0].id);
  });

  it("survives being bounced back and forth", () => {
    // The oscillation needed two crossings to show up reliably by hand. Doing
    // it four times with a non-first project selected each way is the shape of
    // the original report.
    const { categories, slidesByCategory } = fixture();
    render(
      <GalleryShell
        categories={categories}
        slidesByCategory={slidesByCategory}
        initialCategory={categories[0].id}
        initialProjectId={categories[0].projects[0].id}
        labels={LABELS}
      />,
    );

    expect(() => {
      for (let i = 0; i < 4; i++) {
        const c = categories[i % 2];
        clickNamed(c.label, "tab");
        clickNamed(c.projects[2].title, "tab");
      }
    }).not.toThrow();
  });
});

describe("every control in the chrome is a word", () => {
  /**
   * THE CLIENT'S ACTUAL COMPLAINT, pinned so it cannot come back.
   *
   * The chrome this replaced navigated with two unlabelled abstract glyphs and
   * a bare "+". The only way to learn what any of them did was to hover and
   * wait 450ms for a tooltip — which on a touch device never appears at all, so
   * on a phone the controls were permanently unexplained.
   *
   * A glyph MAY accompany a label. It may not be the label. Testing accessible
   * names rather than "is there an svg" is what makes that distinction: an icon
   * with a visually-hidden name would pass a DOM check and still leave a
   * sighted user guessing.
   */
  function renderShell() {
    const { categories, slidesByCategory } = fixture();
    render(
      <GalleryShell
        categories={categories}
        slidesByCategory={slidesByCategory}
        initialCategory={categories[0].id}
        initialProjectId={categories[0].projects[0].id}
        labels={LABELS}
      />,
    );
    return categories;
  }

  it("gives every tab a visible text label", () => {
    const categories = renderShell();
    for (const tab of screen.getAllByRole("tab")) {
      expect(
        tab.textContent?.trim(),
        `a tab renders no visible text — it is a glyph again`,
      ).toBeTruthy();
    }
    // Specifically: the divisions are named, not drawn.
    for (const c of categories) {
      expect(screen.getAllByRole("tab", { name: new RegExp(c.label) }).length)
        .toBeGreaterThan(0);
    }
  });

  it("spells out the call to action instead of drawing a plus", () => {
    renderShell();
    const cta = screen.getByRole("link", { name: new RegExp(LABELS.startProject) });
    expect(cta.textContent?.trim()).toBeTruthy();
  });

  it("has no collapsible panel left to hide navigation behind", () => {
    /**
     * The panel could be collapsed to zero width, and DEFAULTED collapsed under
     * 1200px — so the common desktop first paint offered no visible route to
     * another project. Nothing in the chrome may be hideable now: both strips
     * are always rendered.
     */
    // Comments stripped first: the file's own docblock names what it removed,
    // and a guard that trips on its own explanation is a guard nobody keeps.
    const shell = readFileSync(join(here, "GalleryShell.tsx"), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
      .replace(/\/\/.*$/gm, "");
    expect(shell).not.toMatch(/panelOpen|ed-panel|ed-rail|innerWidth/);
  });

  it("keeps a roving tabindex on both strips", () => {
    // One Tab stop per tablist, arrows move within it. Without this a keyboard
    // user tabs through every project before reaching the stage.
    const categories = renderShell();
    const selected = screen
      .getAllByRole("tab")
      .filter((t) => t.getAttribute("tabindex") === "0");
    // Exactly one per strip: the active division and the active project.
    expect(selected).toHaveLength(2);
    expect(categories.length).toBeGreaterThan(1);
  });
});

describe("selection travels in one direction per cause", () => {
  it("keys the stage by category so an index never outlives its slides", () => {
    const shell = readFileSync(join(here, "GalleryShell.tsx"), "utf8");
    expect(shell).toMatch(/<PushSlider\s+key=\{category\}/);
  });

  it("never reports the active slide back up from an effect", () => {
    // The upward report must be caused by a NAVIGATION, not by an observation.
    // An effect that fires `onActiveChange` whenever the resolved slide
    // changes will also fire when the slide changed because the parent told it
    // to — which is the feedback edge that closed the loop.
    const code = sliderSrc.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    const effects = [...code.matchAll(/useEffect\(([\s\S]*?)\n {2}\}(?:,|\))/g)].map(
      (m) => m[1],
    );
    for (const body of effects) {
      // CALLING it is the feedback edge. Keeping a latest-ref in sync with the
      // prop is not — that effect only assigns.
      expect(body).not.toMatch(/onActiveChange(?:Ref\.current)?\??\.?\(/);
    }
    // It still has to report SOMEHOW, or Prev/Next and autoplay silently
    // desync the URL and the project strip from the stage.
    expect(code).toMatch(/onActiveChangeRef\.current\?\.\(/);
  });

  it("keeps the index updater free of side effects", () => {
    // `setIndex(cur => { …setDirState(…)… })` fires twice under StrictMode,
    // which double-invokes updaters to surface exactly this.
    const updaters = [...sliderSrc.matchAll(/setIndex\(\((?:i|cur)\)? =>([\s\S]*?)\n {4}\}\)/g)];
    for (const [, body] of updaters) {
      expect(body).not.toMatch(/setDirState|onActiveChange/);
    }
  });

  it("does not read or write refs during render", () => {
    // The outgoing index feeds the transition and is therefore READ during
    // render. Held in a ref, that is a dependency React cannot see — it worked
    // only because the ref happened to be written next to the state it shadows.
    // It is state now, so the two batch together and the memo tracks it.
    const code = sliderSrc.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/prevIndexRef/);
    expect(code).toMatch(/const \[prevIndex, setPrevIndex\] = useState/);
  });

  it("derives the controlled index during render rather than in an effect", () => {
    // An effect mirroring a prop into state renders once with the stale value
    // before correcting it — and that intermediate render is exactly what the
    // deleted reporting effect used to broadcast. Deriving in render leaves no
    // intermediate value for anything to observe or echo.
    const code = sliderSrc.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    const effects = [...code.matchAll(/useEffect\(([\s\S]*?)\n {2}\}(?:,|\))/g)].map(
      (m) => m[1],
    );
    for (const body of effects) {
      expect(body).not.toMatch(/\bactiveId\b/);
    }
    expect(code).toMatch(/if \(activeId !== seenActiveId\)/);
  });
});
