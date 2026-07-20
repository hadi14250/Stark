// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithIntl as render, act, fireEvent } from "@/test/render";
import { DivisionIndex, type DivisionItem } from "./DivisionIndex";

/**
 * The auto-cycle is the whole reason this section is not static on a phone.
 *
 * Before it, `active` only ever changed on hover or focus — neither of which
 * exists on touch until something is tabbed to. So on every phone the section
 * was three photographs that never changed, permanently, and no test would
 * have noticed because every assertion anyone would write (does it render, do
 * the panels respond to hover) passed perfectly.
 *
 * The three rules below are the ones that are easy to break by accident while
 * editing this file, and each one is invisible when broken: a cycle that never
 * starts looks identical to a working one in a screenshot; a cycle that never
 * stops only reveals itself by yanking the panel out from under a reader; and
 * a cycle that ignores reduced motion is an accessibility failure nobody can
 * see on their own machine.
 */

const ITEMS: DivisionItem[] = [
  { title: "Alpha", body: "a", cta: "go", alt: "a", href: "/a", division: "woodworks" },
  { title: "Beta", body: "b", cta: "go", alt: "b", href: "/b", division: "mattresses" },
  { title: "Gamma", body: "c", cta: "go", alt: "c", href: "/c", division: "turnkey" },
];

/** Mirrors CYCLE_MS in the component. */
const CYCLE_MS = 4500;

/**
 * Which panel is open, read off the flex-grow the component sets.
 *
 * Deliberately NOT read off a class name or a data attribute: `flex-grow` is
 * the actual mechanism the expansion runs on, so asserting it means the test
 * fails if the widening stops working, not merely if a label stops being
 * applied.
 */
function openIndex(container: HTMLElement): number {
  const items = Array.from(container.querySelectorAll<HTMLElement>("[style*='flex-grow']"));
  return items.findIndex((el) => Number(el.style.flexGrow) > 1);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private cb: IntersectionObserverCallback) {}
      observe() {
        // Reveal wrappers gate content on the viewport; fire immediately so the
        // panels are present and this file is testing the cycle, not the gate.
        this.cb(
          [
            { isIntersecting: true, target: document.body } as unknown as IntersectionObserverEntry,
          ],
          this as unknown as IntersectionObserver,
        );
      }
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
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("the divisions row moves without input", () => {
  it("advances on its own", () => {
    const { container } = render(<DivisionIndex items={ITEMS} />);
    expect(openIndex(container)).toBe(0);

    act(() => {
      vi.advanceTimersByTime(CYCLE_MS);
    });
    expect(openIndex(container)).toBe(1);

    act(() => {
      vi.advanceTimersByTime(CYCLE_MS);
    });
    expect(openIndex(container)).toBe(2);
  });

  it("wraps around rather than stopping at the last panel", () => {
    const { container } = render(<DivisionIndex items={ITEMS} />);
    act(() => {
      vi.advanceTimersByTime(CYCLE_MS * ITEMS.length);
    });
    expect(openIndex(container)).toBe(0);
  });

  it("hands control over permanently on the first interaction", () => {
    const { container } = render(<DivisionIndex items={ITEMS} />);

    // A tap rather than a hover: it is the interaction the phone actually has,
    // and it is the one the cycle exists to hand over to.
    const panels = container.querySelectorAll("article");
    act(() => {
      fireEvent.pointerDown(panels[2]);
    });
    expect(openIndex(container)).toBe(2);

    // The reader chose this panel. Several cycles later it must still be the
    // one open — an auto-cycle that resumes is an auto-cycle that fights you.
    act(() => {
      vi.advanceTimersByTime(CYCLE_MS * 4);
    });
    expect(openIndex(container)).toBe(2);
  });
});
