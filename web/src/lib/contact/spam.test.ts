import { describe, it, expect } from "vitest";
import { isHoneypotTripped, isTooFast, MIN_FILL_MS } from "./spam";

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
