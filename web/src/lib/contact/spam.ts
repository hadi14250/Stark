/**
 * Pure, dependency-free spam heuristics. Kept separate from the action so they
 * are trivially unit-testable and the action body stays readable.
 *
 * These are the zero-infra layers (honeypot + timing). The heavier layers live
 * in `rate-limit.ts` (per-IP) and `turnstile.ts` (CAPTCHA, deferred).
 */

/** Hidden field name a human never fills but naive bots do. */
export const HONEYPOT_FIELD = "company_url";

/** Hidden field carrying the client-side mount timestamp (ms). */
export const STARTED_AT_FIELD = "started_at";

/** Minimum plausible human fill time. Below this we treat the submit as a bot. */
export const MIN_FILL_MS = 2500;

/**
 * True when the honeypot was filled (a bot). Humans never see or touch it, so
 * any non-empty value is a signal. The action responds with a fake success so
 * the bot gets no feedback that it was caught.
 */
export function isHoneypotTripped(value: FormDataEntryValue | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * True when the form was submitted implausibly fast. `startedAt` is the raw
 * hidden-field value; `now` is injectable for tests.
 *
 * Fail-open on a missing/unparseable timestamp: a no-JS submission (where the
 * client never stamped the field) must NOT be rejected — other layers still
 * apply. Only a present-and-too-recent timestamp trips this.
 */
export function isTooFast(
  startedAt: FormDataEntryValue | null,
  now: number,
  minMs: number = MIN_FILL_MS,
): boolean {
  if (typeof startedAt !== "string" || startedAt.trim() === "") return false;
  const started = Number(startedAt);
  if (!Number.isFinite(started) || started <= 0) return false;
  const elapsed = now - started;
  // Negative elapsed (clock skew / tampered future timestamp) is also suspect.
  return elapsed < minMs;
}
