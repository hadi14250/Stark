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
 * "assemble" runs a 3s cycle; the earlier 1.2s hold lifted the curtain while
 * the mark was still flying together, which reads as a glitch rather than an
 * entrance.
 */
const HOLD_MS = 2100;
/** The curtain's own lift, matching --dur-curtain. */
const LIFT_MS = 600;

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
      <LogoLoader variant={VARIANT} size={150} color="var(--sand-500)" />
    </div>
  );
}
