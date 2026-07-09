import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  _resetRateLimit,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from "./rate-limit";

beforeEach(() => _resetRateLimit());

describe("checkRateLimit", () => {
  const now = 5_000_000;

  it("allows up to the max within the window, then blocks", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      expect(checkRateLimit("ip-a", now).ok).toBe(true);
    }
    const blocked = checkRateLimit("ip-a", now);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("keys are independent", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) checkRateLimit("ip-a", now);
    expect(checkRateLimit("ip-a", now).ok).toBe(false);
    expect(checkRateLimit("ip-b", now).ok).toBe(true);
  });

  it("recovers after the window rolls over", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) checkRateLimit("ip-a", now);
    expect(checkRateLimit("ip-a", now).ok).toBe(false);
    const later = now + RATE_LIMIT_WINDOW_MS + 1;
    expect(checkRateLimit("ip-a", later).ok).toBe(true);
  });
});
