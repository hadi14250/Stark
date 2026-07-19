"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ease, duration as dur } from "@/styles/tokens";
import { useMotionConfig } from "./useMotionConfig";
import { useEntrance } from "./EntranceGate";
import { LogoTrace } from "./LogoTrace";

const SESSION_KEY = "stark-preloaded";
/** Compressed from the prototype's ~2.6s. Ceremony, not a toll booth. */
const HOLD_MS = 1200;

/**
 * The mark traces itself, then the curtain lifts.
 *
 * Three constraints, all of which the prototype's version violated:
 *
 * 1. ONCE PER SESSION. A preloader on every navigation is an obstacle. It runs
 *    on the first visit of a session and never again (sessionStorage, so it
 *    returns for a genuinely new visit).
 * 2. IT NEVER BLOCKS THE HERO. The curtain is a fixed overlay above content
 *    that is already rendered and already interactive underneath. If the
 *    JavaScript fails outright, there is no curtain and the page is simply
 *    there — rather than a permanently blank screen.
 * 3. SKIPPED ENTIRELY UNDER REDUCED MOTION.
 * 4. IT DOES NOT EAT THE HERO ANIMATION. This is the one the first version got
 *    wrong: the hero's staged entrance ran underneath the curtain and was over
 *    before anyone saw it. The entrance gate holds every <Reveal> until this
 *    calls `release()` — on the curtain's exit, or immediately when there is
 *    going to be no curtain at all.
 *
 * Mounts hidden and reveals in an effect: reading sessionStorage during render
 * would desync server and client HTML.
 */
export function Preloader() {
  const { reduce } = useMotionConfig();
  const { release } = useEntrance();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Every path that does NOT show a curtain must release the gate at once,
    // or the page sits still waiting for a curtain that is never coming.
    if (reduce) {
      release();
      return;
    }
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        release();
        return;
      }
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Private mode / storage disabled — show it, don't crash.
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [reduce, release]);

  return (
    /* The gate opens on EXIT COMPLETE, not when the timer fires: the curtain
       slides up over --dur-curtain, and releasing early would start the hero
       behind the tail of it. */
    <AnimatePresence onExitComplete={release}>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[10000] grid place-items-center"
          style={{ background: "var(--green-900)" }}
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: dur.curtain, ease: [...ease.curtain] }}
          aria-hidden
        >
          <LogoTrace size={140} duration={HOLD_MS / 1000} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
