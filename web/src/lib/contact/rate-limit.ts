/**
 * In-memory sliding-window rate limiter — the zero-infra floor for launch.
 *
 * A module-level Map holds recent submit timestamps per key (IP). This resets
 * on every cold start and is per serverless instance, so it is a FLOOR, not a
 * guarantee. The durable upgrade (Upstash Redis via Vercel Marketplace) swaps
 * in behind this same `checkRateLimit` signature — one file changes.
 *
 * `now` is injectable so tests control the clock without timers.
 */

export const RATE_LIMIT_MAX = 5; // submissions...
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // ...per 10 minutes / key

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the caller may retry (0 when ok). */
  retryAfter: number;
}

/**
 * Record a hit for `key` and report whether it is within the window budget.
 * Prunes timestamps older than the window on each call so the Map stays small.
 */
export function checkRateLimit(
  key: string,
  now: number = Date.now(),
  max: number = RATE_LIMIT_MAX,
  windowMs: number = RATE_LIMIT_WINDOW_MS,
): RateLimitResult {
  const cutoff = now - windowMs;
  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= max) {
    const oldest = recent[0];
    const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    hits.set(key, recent); // persist the pruned list
    return { ok: false, retryAfter };
  }

  recent.push(now);
  hits.set(key, recent);
  return { ok: true, retryAfter: 0 };
}

/** Test helper — clears all recorded hits. */
export function _resetRateLimit(): void {
  hits.clear();
}
