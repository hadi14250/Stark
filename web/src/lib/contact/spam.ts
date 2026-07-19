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

/**
 * Hidden field marking a single-input form, so the action can pick the right
 * timing threshold. Absent = the full form, which is the stricter default —
 * a form that forgets to declare itself gets MORE protection, not less.
 */
export const SHORT_FORM_FIELD = "short_form";

/**
 * Minimum plausible human fill time for the FULL contact form — name, email,
 * division, project type and a message. Nobody types all of that in 2.5s.
 */
export const MIN_FILL_MS = 2500;

/**
 * Minimum for a single-field form (a newsletter/email capture).
 *
 * This exists because 2500ms was applied to both, and the consequence is worse
 * than it looks: a real person who PASTES their email and hits submit beats
 * 2.5s easily, and the action's response to "too fast" is a FAKE SUCCESS. So
 * the form said "thanks", the user believed it, and the message was silently
 * discarded. A spam heuristic that quietly drops genuine submissions is worse
 * than no heuristic — the failure is invisible on both ends.
 *
 * 800ms still catches a bot that submits on page load, which is what the gate
 * is actually for.
 */
export const MIN_FILL_MS_SHORT = 800;

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
