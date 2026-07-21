"use client";

import { useEffect, useState } from "react";
import { useEntrance } from "./EntranceGate";
import { LogoLoader } from "./LogoLoader";
import "@/styles/logo-loader.css";

/**
 * Which of the handoff's twelve designed loading animations to run.
 *
 * "assemble" — the five blades fly in from the directions they actually sit in
 * and lock around the core. It is the one that says what the mark means (brand
 * book p.8: five elements of one ecosystem interlocking into a closed
 * structure), which makes it the right default for a first impression. Swap
 * this constant for any of the other eleven; see /specimen for all of them.
 */
const VARIANT = "assemble" as const;

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
 * Preloader.test.ts recomputes that window from the keyframe stops in
 * logo-loader.css and the per-blade offsets in LogoLoader.tsx, so changing any
 * one of the four numbers without the others fails rather than shipping a
 * glitchy entrance.
 */
const HOLD_MS = 1800;
/** The curtain's own lift, matching --dur-curtain. */
const LIFT_MS = 600;
/** Playback rate for the mark. 1 = the designer's 3s cycle, as drawn. */
const LOADER_SPEED = 1;

/**
 * The brand loader: the mark assembles itself, then the curtain lifts.
 *
 * IT RUNS ON EVERY FULL PAGE LOAD. It used to be gated to once per session via
 * sessionStorage, which sounded reasonable in planning and was wrong in
 * practice: you see it on the first load of a tab and then never again, no
 * matter how many times you reload. For anyone actually looking at the site —
 * building it, reviewing it, showing it to a client — that means it may as
 * well not exist. It is part of the entrance, so it plays on entrance.
 *
 * It does NOT run on in-app navigation: SiteChrome lives in the layout and does
 * not remount between routes, so this mounts once per real page load. Clicking
 * around the site never hits a curtain.
 *
 * RENDERED SERVER-SIDE, not mounted in an effect. The previous version started
 * hidden and revealed itself after mount, which meant the page painted first
 * and the curtain dropped over it a frame later — a flash of exactly the
 * content it exists to cover. It is in the HTML now, so it is there from the
 * first paint.
 *
 * NO-JS SAFE, and that matters precisely because it starts visible: a
 * JavaScript failure would otherwise leave a permanent opaque panel over the
 * whole site. The lift is a CSS animation with `forwards` that runs regardless
 * of React; this component only unmounts the element afterwards and opens the
 * entrance gate. If JS never runs, CSS still clears the screen.
 */
export function Preloader() {
  const { release } = useEntrance();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDone(true);
      release();
    }, HOLD_MS + LIFT_MS);
    return () => window.clearTimeout(t);
  }, [release]);

  if (done) return null;

  return (
    <div className="stark-preloader" aria-hidden>
      <LogoLoader
        variant={VARIANT}
        size={150}
        color="var(--sand-500)"
        speed={LOADER_SPEED}
      />
    </div>
  );
}
