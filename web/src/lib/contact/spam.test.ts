import { describe, it, expect } from "vitest";
import {
  isHoneypotTripped,
  isTooFast,
  MIN_FILL_MS,
  MIN_FILL_MS_SHORT,
} from "./spam";

describe("isHoneypotTripped", () => {
  it("is false for empty / whitespace / null", () => {
    expect(isHoneypotTripped(null)).toBe(false);
    expect(isHoneypotTripped("")).toBe(false);
    expect(isHoneypotTripped("   ")).toBe(false);
  });
  it("is true for any real value", () => {
    expect(isHoneypotTripped("http://spam.example")).toBe(true);
  });
});

describe("isTooFast", () => {
  const now = 1_000_000;

  it("fails open when the timestamp is missing (no-JS submit)", () => {
    expect(isTooFast(null, now)).toBe(false);
    expect(isTooFast("", now)).toBe(false);
    expect(isTooFast("not-a-number", now)).toBe(false);
  });

  it("flags a fill faster than the minimum", () => {
    const started = String(now - (MIN_FILL_MS - 500));
    expect(isTooFast(started, now)).toBe(true);
  });

  it("allows a plausible human fill time", () => {
    const started = String(now - (MIN_FILL_MS + 5000));
    expect(isTooFast(started, now)).toBe(false);
  });

  it("flags a future (skewed / tampered) timestamp", () => {
    expect(isTooFast(String(now + 10_000), now)).toBe(true);
  });
});

describe("timing gate: short forms need a lower threshold", () => {
  const t0 = 1_000_000;

  it("a pasted email at 1.2s passes the SHORT threshold", () => {
    // The bug this guards: the full-form 2500ms was applied to the one-field
    // newsletter, and the action's response to "too fast" is a FAKE SUCCESS —
    // so a real person pasting their address was told it worked while the
    // submission was discarded.
    expect(isTooFast(String(t0), t0 + 1200, MIN_FILL_MS_SHORT)).toBe(false);
    expect(isTooFast(String(t0), t0 + 1200, MIN_FILL_MS)).toBe(true);
  });

  it("still catches a bot submitting on load", () => {
    expect(isTooFast(String(t0), t0 + 50, MIN_FILL_MS_SHORT)).toBe(true);
  });

  it("the short threshold is genuinely shorter, and neither is zero", () => {
    expect(MIN_FILL_MS_SHORT).toBeLessThan(MIN_FILL_MS);
    expect(MIN_FILL_MS_SHORT).toBeGreaterThan(0);
  });
});
