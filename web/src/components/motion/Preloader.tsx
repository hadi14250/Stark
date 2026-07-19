"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ease, duration as dur } from "@/styles/tokens";
import { useMotionConfig } from "./useMotionConfig";
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
 *
 * Mounts hidden and reveals in an effect: reading sessionStorage during render
 * would desync server and client HTML.
 */
export function Preloader() {
  const { reduce } = useMotionConfig();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduce) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Private mode / storage disabled — show it, don't crash.
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence>
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
