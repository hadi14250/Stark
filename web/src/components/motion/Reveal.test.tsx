// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithIntl as render, screen, act } from "@/test/render";
import { Reveal, isOnScreen } from "./Reveal";

/**
 * Regression guard for the bug that made the ENTIRE SITE feel static.
 *
 * `Reveal` starts at opacity 0 and waits for a viewport observer, with a
 * fail-safe in case that observer never fires. The first version of the
 * fail-safe forced the element visible 1500ms after MOUNT, unconditionally —
 * so 1.5 seconds after page load every Reveal in the document, including
 * everything far below the fold, had already been revealed. Scrolling then
 * animated nothing, on any page.
 *
 * The fix is that the fail-safe only rescues elements that are ACTUALLY ON
 * SCREEN. These tests pin both halves of that: it must fire for a visible
 * element whose observer failed, and must NOT fire for one below the fold.
 */

function mockRect(el: Element, top: number, height = 200) {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top,
    bottom: top + height,
    left: 0,
    right: 100,
    width: 100,
    height,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);
}

beforeEach(() => {
  vi.useFakeTimers();
  // jsdom has no IntersectionObserver; Framer needs one to exist. This one
  // never fires, which is exactly the failure the fail-safe is for.
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
  Object.defineProperty(window, "innerHeight", { value: 800, writable: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Reveal fail-safe", () => {
  it("applies its rescue rule to on-screen elements only", () => {
    const H = 800;
    // fully in view
    expect(isOnScreen({ top: 100, bottom: 300 }, H)).toBe(true);
    // partially in view at the bottom edge
    expect(isOnScreen({ top: 780, bottom: 980 }, H)).toBe(true);
    // partially in view at the top (scrolled past)
    expect(isOnScreen({ top: -150, bottom: 50 }, H)).toBe(true);
    // BELOW the fold — must not be rescued, or scrolling animates nothing
    expect(isOnScreen({ top: 3000, bottom: 3200 }, H)).toBe(false);
    // entirely scrolled past
    expect(isOnScreen({ top: -400, bottom: -200 }, H)).toBe(false);
  });

  it("does NOT rescue an element below the fold", () => {
    render(<Reveal>offscreen content</Reveal>);
    const el = screen.getByText("offscreen content");
    mockRect(el, 3000); // 3000px down — nowhere near the viewport

    vi.advanceTimersByTime(5000);
    // THIS is the assertion that matters. If it fails, every section below the
    // fold is pre-revealed and scrolling the site animates nothing.
    expect(el.style.opacity).toBe("0");
  });

});

describe("entrance gate", () => {
  it("animates normally with no provider", () => {
    // The gate defaults to open. A component rendered outside the shell — a
    // test, the specimen page, the gallery route — must never sit still
    // waiting for a curtain that does not exist there.
    render(<Reveal>ungated</Reveal>);
    expect(screen.getByText("ungated")).toBeTruthy();
  });

  it("releases even if nothing ever calls release()", async () => {
    // The deadlock guard. EntranceProvider starts closed and the Preloader is
    // what opens it; if the Preloader errors or never mounts, MAX_GATE_MS must
    // open it anyway. A coordination mechanism that can permanently freeze the
    // site's motion is worse than no coordination at all.
    const { EntranceProvider, useEntrance } = await import("./EntranceGate");
    let seen = false;
    function Probe() {
      seen = useEntrance().ready;
      return null;
    }
    render(
      <EntranceProvider>
        <Probe />
      </EntranceProvider>,
    );
    expect(seen).toBe(false);
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(seen).toBe(true);
  });
});
