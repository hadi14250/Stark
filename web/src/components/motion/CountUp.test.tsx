// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithIntl as render, cleanup, screen, act } from "@/test/render";
import { CountUp } from "./CountUp";

/**
 * ===========================================================================
 * THE FAIL-SAFE MUST NOT COUNT WHAT NOBODY IS LOOKING AT
 * ===========================================================================
 *
 * WHAT SHIPPED. `CountUp` guards against a dead IntersectionObserver with a
 * fail-safe that snaps the number to its final value. That guard used to be
 * `setTimeout(run, 1500)` — unconditional, so it fired 1.5 seconds after mount
 * whether or not the element had ever been near the viewport.
 *
 * The home page's stat band is several screens below the fold. By the time any
 * reader scrolled to it, the count had been finished for a long time. The
 * animation existed, was correct, and had never run in front of a human. The
 * client reported it as "the numbers don't animate"; that was an accurate bug
 * report against a feature everyone believed was working.
 *
 * WHY NOTHING CAUGHT IT. Every check that existed asked "does the number end
 * up right?" — and it always did. The defect was in WHEN, and nothing was
 * asserting on when. A screenshot at any moment after load looks perfect.
 *
 * So these tests hold the fail-safe to the narrower promise it was always
 * meant to make: rescue a stat the observer forgot, and only that. The middle
 * test is the regression — restore the old `setTimeout(run, 1500)` and it goes
 * red, while the other two stay green.
 */

/** Neither of the two rects below ever fires the observer — that is the point. */
function stubObserver() {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
    },
  );
}

/** jsdom gives every element a zero rect, so position has to be stubbed. */
function stubRect(top: number, height = 60) {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    top,
    bottom: top + height,
    height,
    left: 0,
    right: 100,
    width: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);
}

const FAKE = {
  toFake: [
    "setInterval",
    "clearInterval",
    "setTimeout",
    "clearTimeout",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "performance",
  ] as const,
};

/**
 * Advance fake time inside `act`.
 *
 * The count runs on requestAnimationFrame, so every frame is a React state
 * update originating outside an event handler. Without `act` those updates are
 * scheduled but never flushed, and the assertions read a stale DOM showing 0 —
 * which looks exactly like the bug these tests exist to catch. That false
 * negative is worth the wrapper.
 */
function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe("CountUp only counts once it is on screen", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: [...FAKE.toFake] });
    stubObserver();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("still rescues a visible stat when the observer never fires", () => {
    // The original reason the fail-safe exists. It has to keep working.
    stubRect(100); // inside a 768px-tall jsdom viewport
    render(<CountUp to={500} duration={1} locale="en" />);

    expect(screen.getByText("0")).toBeTruthy();

    advance(1500); // poll fires, sees the element, starts
    advance(1200); // the 1s ease runs to completion

    expect(screen.getByText("500")).toBeTruthy();
  });

  it("leaves a below-the-fold stat at zero, however long it waits", () => {
    // THE REGRESSION. `window.innerHeight` is 768 in jsdom; 4000 is several
    // screens down, exactly like the home stat band. Under the old
    // unconditional timeout this reached 500 after 1.5s and the reader never
    // saw a single frame of the animation.
    stubRect(4000);
    render(<CountUp to={500} duration={1} locale="en" />);

    advance(30_000); // twenty poll intervals

    expect(
      screen.getByText("0"),
      "the count ran while the element was off screen, so the reader will arrive to a finished number",
    ).toBeTruthy();
  });

  it("counts when that stat is finally scrolled into view", () => {
    // The other half of the promise: waiting must not mean never running.
    stubRect(4000);
    render(<CountUp to={500} duration={1} locale="en" />);

    advance(5000);
    expect(screen.getByText("0")).toBeTruthy();

    stubRect(200); // the reader scrolls down
    advance(1500); // next poll sees it
    advance(1200);

    expect(screen.getByText("500")).toBeTruthy();
  });
});

describe("CountUp shapes digits for the locale", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: [...FAKE.toFake] });
    stubObserver();
    stubRect(100);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("groups a quantity and joins its unit with a non-breaking space", () => {
    // Mirrors FACTS.factoryArea. The nbsp is what stops "60,000 m²" breaking
    // after the comma and dropping the unit onto its own line, which is the
    // wrap the client reported.
    //
    // Asserted on `textContent`, NOT through `getByText`. Testing Library's
    // default normaliser collapses whitespace, and a non-breaking space is
    // whitespace to a JS regex, so a text query treats "60,000 m2" with a
    // plain space and with a nbsp as the same string and passes whichever
    // one shipped. The byte IS the subject of this test, so the test has to
    // look at the byte.
    const { container } = render(
      <CountUp to={60000} suffix={"\u00A0m²"} grouping locale="en" duration={1} />,
    );
    advance(1500);
    advance(1200);

    expect(container.querySelector("span")?.textContent).toBe("60,000\u00A0m²");
  });

  it("renders a year without a thousands separator", () => {
    // "1,967" is a quantity; "1967" is a date. The separator is the only thing
    // telling a reader which one they are looking at.
    render(<CountUp to={1967} grouping={false} locale="en" duration={1} />);
    advance(1500);
    advance(1200);

    expect(screen.getByText("1967")).toBeTruthy();
  });
});
