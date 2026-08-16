/**
 * The brand curtain's timing, in one place.
 *
 * IT HAS TWO CONSUMERS NOW, WHICH IS WHY IT IS A MODULE. `Preloader` plays the
 * curtain on a real page load; `RouteCurtain` plays the same one on in-app
 * navigation. They must be the same length and the same variant or the site has
 * two different loading animations depending on how you arrived, which is the
 * exact inconsistency the client reported ("the logo loading animation doesn't
 * appear the same as it does when we refresh").
 *
 * A third consumer is the CSS: `--preloader-hold` in logo-loader.css drives the
 * lift so the curtain clears even if JavaScript never runs. `Preloader.test.ts`
 * asserts the two agree, and recomputes the assemble lock window from the
 * keyframes so none of these numbers can move alone.
 */

/**
 * Which of the handoff's twelve designed loading animations to run.
 *
 * "assemble" — the five blades fly in from the directions they actually sit in
 * and lock around the core. It is the one that says what the mark means (brand
 * book p.8: five elements of one ecosystem interlocking into a closed
 * structure), which makes it the right default for a first impression. Swap
 * this constant for any of the other eleven; see /specimen for all of them.
 */
export const LOADER_VARIANT = "assemble" as const;

/**
 * How long the mark animates before the curtain lifts. Must be kept in sync
 * with --preloader-hold in logo-loader.css, which drives the no-JS path.
 *
 * THE CONSTRAINT IS THE MARK, NOT THE CLOCK. "assemble" is a loop: the blades
 * fly in, lock for a beat, then fly back out. Lifting the curtain outside that
 * locked beat shows a half-built or dispersing logo, which reads as a glitch
 * rather than an entrance — that is what a 1.2s hold did against the designed
 * 3s cycle, and why the hold was raised to 2100ms.
 *
 * THE HOLD WENT DOWN, THEN BACK UP. A previous round compressed the cycle to
 * ~1.95s (LOADER_SPEED 0.65) and cut the hold to 1100ms, for a 1.7s entrance.
 * The client's review asked for the opposite — "increase the length of
 * loading" — so the cycle is back at the designed speed and the hold sits in
 * the middle of the locked beat rather than at its front edge.
 *
 * At LOADER_SPEED 1.0 the mark is whole from 1200ms (the core is the last part
 * to land: 300ms delay + the 30% lock stop of a 3s cycle) until 1920ms (the
 * 64% release stop, when blade 0 starts leaving). 1800ms sits inside that with
 * 120ms of margin on the late side, so the logo is not merely assembled when
 * the curtain moves — it has visibly been assembled for a beat. Total entrance
 * is 2.4s.
 *
 * ⚠ THIS IS NOW ALSO THE PRICE OF EVERY INTERNAL CLICK. DESIGN.md §6.2 argued a
 * route curtain should be ~0.6s precisely because three navigations on a
 * four-page site should not each cost over a second. The client asked for the
 * route change to look exactly like a refresh, so it does — but if it drags in
 * review, this constant and LOADER_SPEED are the two dials, and shortening them
 * for BOTH consumers is a one-line change here rather than a hunt.
 */
export const HOLD_MS = 1800;

/** The curtain's own lift, matching --dur-curtain. */
export const LIFT_MS = 600;

/** Playback rate for the mark. 1 = the designer's 3s cycle, as drawn. */
export const LOADER_SPEED = 1;

/** Curtain up to curtain gone. What both consumers actually wait on. */
export const CURTAIN_MS = HOLD_MS + LIFT_MS;
