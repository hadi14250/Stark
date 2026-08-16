"use client";

import { useEffect, useState } from "react";
import { useEntrance } from "./EntranceGate";
import { holdReveals } from "./useRevealOnce";
import { LogoLoader } from "./LogoLoader";
import {
  CURTAIN_MS,
  HOLD_MS,
  LIFT_MS,
  LOADER_SPEED,
  LOADER_VARIANT,
} from "./loader-timing";
import "@/styles/logo-loader.css";

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
 * IT DOES NOT RUN ON IN-APP NAVIGATION, and that is not an oversight — it is
 * structural. SiteChrome lives in the layout and does not remount between
 * routes, so this mounts once per real page load and a client-side navigation
 * can never reach it. The client asked for the loading animation on route
 * changes too; that is `RouteCurtain`, which plays the same mark for the same
 * beat from `loader-timing.ts`. Both exist because neither can do the other's
 * job from where it sits.
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
    /**
     * HOLD THE PAGE'S ENTRANCE UNTIL THE CURTAIN IS GONE.
     *
     * This is what `EntranceGate` was written to do, and it stopped working
     * when the reveals moved from Framer to the CSS state machine in
     * `useRevealOnce` — nothing consumes `useRevealPlay` any more, so `ready`
     * flips and reaches nothing. The visible symptom: on a fresh load of `/`,
     * the hero's word-by-word entrance plays underneath this curtain and is
     * finished by the time it lifts. Every time.
     *
     * `release()` is still called below so the gate's own contract holds for
     * anything that consumes it later; `holdReveals` is what actually defers
     * the animation people can see.
     */
    const releaseReveals = holdReveals(CURTAIN_MS);

    const t = window.setTimeout(() => {
      setDone(true);
      releaseReveals();
      release();
    }, CURTAIN_MS);

    return () => {
      window.clearTimeout(t);
      releaseReveals();
    };
  }, [release]);

  if (done) return null;

  return (
    <div className="stark-preloader" aria-hidden>
      <LogoLoader
        variant={LOADER_VARIANT}
        size={150}
        color="var(--sand-500)"
        speed={LOADER_SPEED}
      />
    </div>
  );
}

/**
 * Re-exported so `Preloader.test.ts` keeps asserting against the numbers this
 * component actually runs on, now that they live in `loader-timing.ts`. The
 * test recomputes the assemble lock window from the CSS keyframes and the
 * per-blade offsets, which is the check that stops any one of them moving
 * alone.
 */
export { HOLD_MS, LIFT_MS, LOADER_SPEED };
