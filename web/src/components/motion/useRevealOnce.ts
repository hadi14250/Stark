"use client";

import { useEffect, useRef } from "react";

/**
 * The scroll-reveal state machine.
 *
 * ===========================================================================
 * WHY THIS IS NO LONGER "JUST ADD A CLASS"
 * ===========================================================================
 *
 * The previous version had exactly one effect on the DOM — it added
 * `is-revealed`, and the hidden pose existed only inside a keyframe's `from`.
 * Nothing was ever pre-hidden, so no failure could hide content. That property
 * is why it was written that way, and it is not being given up here.
 *
 * But it bought that guarantee with a visible defect, and the client filed it:
 * an element renders in its FINAL pose, sits there while the reader scrolls,
 * and then, when the trigger finally fires, snaps back to the hidden pose and
 * animates in. Measured on /en/woodworks at 1440x900: 48 of 56 reveals were
 * visible for 120-360px of scrolling before they yanked. On /en/mattresses,
 * 28 of 33. The client's words were "why does the picture appear to snap then
 * slide in", and that is precisely what the architecture guaranteed.
 *
 * The snap and the fail-safe are the same fact seen from two sides. Anything
 * that starts visible and later animates from a hidden pose MUST snap; the
 * only cure is for the element to already be hidden before the reader can see
 * it. So an element does now get pre-hidden — and the entire design below
 * exists to make that safe rather than to avoid it.
 *
 * ===========================================================================
 * THE THREE STATES
 * ===========================================================================
 *
 *   untouched   Visible. Plain content. This is the state every element is
 *               born in and the ONLY state any JS failure can leave it in.
 *   armed       Hidden, and off screen. Waiting for the reading line.
 *   revealed    Animating, then done. Terminal.
 *
 * The transitions are deliberately asymmetric:
 *
 *   untouched -> armed      ONLY from inside an IntersectionObserver callback,
 *                           and only while the element is off screen.
 *   armed -> revealed       From EITHER of two independent mechanisms, a
 *                           second observer or a shared scroll pass. Either
 *                           one alone is sufficient.
 *
 * Read the first transition again, because it is the whole safety argument:
 * arming is downstream of the observer. If IntersectionObserver is missing,
 * throws, or simply never fires — the exact failure that blanked this site
 * before — nothing is ever armed, and every element stays in `untouched`.
 * That is not a degraded reveal, it is byte-for-byte the old behaviour: all
 * content visible, no animation. The catastrophic path was not made safer,
 * it was made unreachable.
 *
 * The other three protections, in order of how much work they do:
 *
 * 1. NEVER ARM SOMETHING THE READER CAN SEE. An element is armed only while
 *    it is below the fold. Hiding what is already on screen is the one move
 *    that would be indistinguishable from the bug, so it is not available.
 *    (The sole exception is the pre-scroll entrance, below.)
 * 2. TWO INDEPENDENT WAYS OUT. A reveal observer AND a scroll pass, both able
 *    to reveal any armed element. They do not share a failure mode: one is
 *    the browser's intersection machinery, the other is arithmetic on
 *    getBoundingClientRect.
 * 3. THE BOTTOM OF THE DOCUMENT IS A BACKSTOP. When the page can scroll no
 *    further, everything still armed is revealed unconditionally. Every page
 *    has a bottom and every bottom is reachable, so "armed forever" has no
 *    path to exist. This is not hypothetical: before this change one
 *    `reveal-fade` on Woodworks (the 06 Hardware card) NEVER fired, because a
 *    threshold expressed as a fraction of the element could not be met near
 *    the end of the document. Under the old architecture that was invisible —
 *    the card just never animated. Under this one it would have been a hidden
 *    card, so the backstop is load-bearing.
 *
 * Reduced motion is handled entirely in CSS, and handled by SUBTRACTION: the
 * armed poses live inside `@media (prefers-reduced-motion: no-preference)`,
 * so for a reader who asked for less motion the hidden pose does not exist as
 * a rule at all. It cannot be applied by mistake.
 */

/**
 * Where the reading line sits, as a fraction of viewport height. An armed
 * element reveals when its top edge crosses it.
 *
 * WHY A LINE AND NOT A THRESHOLD. This used to be `threshold: 0.2` — "reveal
 * when a fifth of the element is showing" — which makes the trigger depend on
 * the element's own height. A short chip and a 520px photograph fired at
 * completely different places on screen, and something taller than the
 * viewport could never satisfy it at all (see the 06 Hardware card above). A
 * line is height-independent: everything fires at the same place, which is
 * the only thing "when the reader gets to it" can mean.
 *
 * 0.6 puts it just below centre. Measured before the change, reveals were
 * landing with their tops between 0.69 and 0.87 of the way down the screen —
 * bottom third, still arriving. That is the "too early" the client kept
 * reporting: by the time the element was somewhere you would actually look at
 * it, the animation had been over for several hundred pixels.
 */
const REVEAL_LINE = 0.6;

/**
 * How far below the fold an element is armed, as a fraction of viewport
 * height. Only needs to be far enough that arming is never witnessed; the
 * reveal line is what governs timing.
 */
const ARM_MARGIN = "0px 0px 45% 0px";

/** The reveal observer's line, as a rootMargin. Mirrors REVEAL_LINE. */
const REVEAL_MARGIN = `0px 0px -${Math.round((1 - REVEAL_LINE) * 100)}% 0px`;

/**
 * The one moment arming an on-screen element is allowed: the page is at its
 * top, so it is still arriving rather than being read.
 *
 * This is what lets the first screen animate at all. Without it, rule 1 would
 * forbid arming anything above the fold and no page would have an entrance.
 *
 * WHY A LIVE READING AND NOT A `hasScrolled` FLAG. A flag set on the first
 * scroll is sticky for the lifetime of the module, and this is a single-page
 * app: scroll down on the home page, click through to Woodworks, and the new
 * page mounts with the flag still true, so its hero would be excluded from
 * arming and would render with no entrance at all. Route changes reset scroll
 * position, so asking the scroller where it is answers correctly for a fresh
 * load, a client-side navigation and a restored mid-page position alike.
 */
function atTop() {
  return window.scrollY <= 0;
}

/** Armed and not yet revealed. Small: only what is near the fold. */
const armed = new Set<HTMLElement>();

let armObserver: IntersectionObserver | null = null;
let revealObserver: IntersectionObserver | null = null;
let passScheduled = 0;
let listening = false;

/* ==========================================================================
   THE CURTAIN HOLD
   ==========================================================================

   WHY THIS IS HERE AND NOT IN EntranceGate. That provider exists for exactly
   this job — hold the page's entrance until the brand curtain has lifted, so
   the hero's staged reveal is not performed to an opaque green panel. It works
   through `useRevealPlay`, which every reveal used to consume.

   Then the reveals moved from Framer to this CSS state machine, and NOTHING
   consumes `useRevealPlay` any more. The gate still mounts, still counts down,
   still flips `ready` — and reaches nothing. So on a fresh load of `/` the
   hero's word-by-word entrance plays underneath the 2.4s preloader and is over
   before anyone sees it: the precise bug EntranceGate was written to fix,
   quietly restored by a refactor that had no reason to look at it.

   Adding the route curtain would have reproduced it on every internal click as
   well, so the hold lives where the reveals actually are.

   ⚠ IT CANNOT BE ALLOWED TO HIDE THE PAGE. Everything else in this file is
   built so that no failure leaves content invisible, and a hold is the one
   mechanism here that could: held elements stay armed, and armed means hidden.
   So `holdReveals` takes its own ceiling and arms a timer against itself — if
   the caller crashes, unmounts, or simply forgets, reveals resume anyway. */

let held = false;
let holdCeiling = 0;

/**
 * Keep armed elements hidden until the curtain is gone.
 *
 * Returns the release. `maxMs` is a hard ceiling, not a schedule: whatever
 * happens to the caller, the page reveals within it.
 */
export function holdReveals(maxMs: number): () => void {
  held = true;
  window.clearTimeout(holdCeiling);
  holdCeiling = window.setTimeout(releaseReveals, maxMs);
  return releaseReveals;
}

/** Let the entrance play. Idempotent — both the caller and the ceiling call it. */
export function releaseReveals() {
  if (!held) return;
  held = false;
  window.clearTimeout(holdCeiling);
  schedulePass();
}

function revealNow(el: HTMLElement) {
  // THE HOLD IS ENFORCED HERE, not only in `pass()`, because there are two
  // ways in: the scroll pass and the reveal observer's own callback, which
  // reveals its entries directly. Guarding one path would have let the observer
  // play the entrance behind the curtain anyway — and it is the path that fires
  // first, so it would have looked like the hold did nothing at all.
  // The element stays armed and observed; the release schedules a pass that
  // picks it up.
  if (held) return;
  armed.delete(el);
  revealObserver?.unobserve(el);
  el.classList.add("is-revealed");
}

/**
 * The scroll pass: the non-observer half of "two independent ways out".
 *
 * Runs at most once per frame, only while something is armed, and only looks
 * at armed elements — so its cost is a handful of rect reads near the fold,
 * not a walk of the document.
 */
function pass() {
  passScheduled = 0;
  // Curtain up: leave everything armed and keep listening. `releaseReveals`
  // schedules another pass, so nothing is lost by returning here.
  if (held) return;
  if (armed.size === 0) {
    stopListening();
    return;
  }

  const vh = window.innerHeight;
  const line = vh * REVEAL_LINE;
  const doc = document.documentElement;
  // Only meaningful on a page that can actually scroll. On a page shorter than
  // the viewport this would be true at mount and would reveal the document in
  // one go — which is the "fail-safe that pre-revealed everything" bug, and it
  // is why the scrollable check is here rather than being obviously redundant.
  const atBottom =
    doc.scrollHeight > vh + 4 && vh + window.scrollY >= doc.scrollHeight - 2;

  // At the top of the page the whole viewport reveals at once: that is the
  // entrance. Once scrolled, the reading line governs.
  const entrance = atTop();

  for (const el of [...armed]) {
    const box = el.getBoundingClientRect();
    if (
      atBottom || // backstop: nothing may stay armed at the end of the page
      box.bottom < 0 || // scrolled past above; never leave it hidden behind us
      (entrance ? box.top < vh : box.top <= line)
    ) {
      revealNow(el);
    }
  }

  if (armed.size === 0) stopListening();
}

function schedulePass() {
  if (passScheduled) return;
  passScheduled = requestAnimationFrame(pass);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedulePass, { passive: true });
  window.addEventListener("resize", schedulePass, { passive: true });
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", schedulePass);
  window.removeEventListener("resize", schedulePass);
}

/**
 * Builds the two observers once per page. Returns false if the browser has no
 * IntersectionObserver, or if constructing one throws — in which case nothing
 * is ever armed and every reveal stays visible and unanimated.
 */
function ensureObservers(): boolean {
  if (armObserver && revealObserver) return true;
  if (typeof IntersectionObserver === "undefined") return false;

  try {
    revealObserver ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) revealNow(entry.target as HTMLElement);
        }
      },
      { rootMargin: REVEAL_MARGIN, threshold: 0 },
    );

    armObserver ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          armObserver?.unobserve(el);
          if (el.classList.contains("is-revealed")) continue;

          // RULE 1. Measured fresh, because the entry's rect was captured when
          // the observation was queued and the page may have moved since.
          const onScreen = el.getBoundingClientRect().top < window.innerHeight;
          if (onScreen && !atTop()) continue; // leave it alone: it is being read

          el.classList.add("is-armed");
          armed.add(el);
          revealObserver?.observe(el);
          startListening();
          schedulePass();
        }
      },
      { rootMargin: ARM_MARGIN, threshold: 0 },
    );
  } catch {
    return false;
  }

  return true;
}

/**
 * Arms an element as it approaches the fold and reveals it at the reading
 * line. Returns the ref to put on the element.
 */
export function useRevealOnce<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!ensureObservers()) return; // no observer, no arming: content stays visible

    armObserver!.observe(el);
    return () => {
      armObserver?.unobserve(el);
      revealObserver?.unobserve(el);
      armed.delete(el);
    };
  }, []);

  return ref;
}
