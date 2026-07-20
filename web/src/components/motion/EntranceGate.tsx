"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Coordinates the preloader with the page's entrance animations.
 *
 * This exists because of a specific failure: the preloader is a full-screen
 * curtain, and the hero's staged reveal was playing UNDERNEATH it. By the time
 * the curtain lifted, the best piece of motion on the site had already
 * finished, unseen — every single time. The first attempt at a fix was to
 * delete the preloader, which was the wrong trade: keeping it was a deliberate
 * decision, and the actual problem was that nothing told the hero to wait.
 *
 * So: `ready` is false while a curtain is up, every <Reveal> holds its initial
 * state until it flips, and the hero's staged entrance then plays to an
 * audience. Elements below the fold are unaffected — they are waiting on
 * scroll regardless.
 */

/**
 * Hard ceiling on how long the gate may hold motion, whatever else happens.
 *
 * The gate is only allowed to DELAY animation, never to prevent it. If the
 * preloader errors, never mounts, or forgets to release, this fires and the
 * page animates anyway. A coordination mechanism that can deadlock the entire
 * site's motion is worse than no coordination — which is exactly the class of
 * bug this file is cleaning up after.
 *
 * It must stay ABOVE the preloader's own HOLD_MS + LIFT_MS, or the ceiling
 * fires first and releases the hero's entrance while the curtain is still in
 * front of it — the exact failure the gate exists to prevent, arriving by the
 * safety net instead of by the bug. Preloader.test.ts asserts the ordering.
 */
const MAX_GATE_MS = 1900;

const EntranceContext = createContext<{
  ready: boolean;
  release: () => void;
}>({ ready: true, release: () => {} });

export function EntranceProvider({ children }: { children: ReactNode }) {
  // Starts gated. Whether a curtain actually appears depends on sessionStorage
  // and reduced-motion, which cannot be read during render without desyncing
  // the server HTML — so the Preloader decides on mount and calls release()
  // immediately when it is not going to show.
  const [ready, setReady] = useState(false);
  const release = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(release, MAX_GATE_MS);
    return () => window.clearTimeout(t);
  }, [ready, release]);

  const value = useMemo(() => ({ ready, release }), [ready, release]);
  return <EntranceContext.Provider value={value}>{children}</EntranceContext.Provider>;
}

/**
 * Defaults to `ready: true` with no provider, so a component rendered outside
 * the shell (a test, the specimen page) animates normally.
 */
export function useEntrance() {
  return useContext(EntranceContext);
}
