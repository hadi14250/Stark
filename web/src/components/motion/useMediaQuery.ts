"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A media query as React state.
 *
 * `useSyncExternalStore` rather than the `useEffect` + `setState` version
 * everyone writes first, for three concrete reasons and not for style points:
 *
 *   - A media query IS external state with a subscription API. Mirroring it
 *     into `useState` from an effect means the first paint is always the wrong
 *     answer, and the correct one arrives a frame later as a second render.
 *     For a pointer check that gates a whole feature, that is a visible flash
 *     of the wrong variant.
 *   - It keeps changes live. `matchMedia` fires on change, so plugging in a
 *     mouse, rotating a tablet or resizing past a breakpoint is picked up
 *     instead of being frozen at whatever was true on mount.
 *   - The server snapshot is explicit. There is no `window` during SSR, so the
 *     third argument answers `false` — the conservative branch — and hydration
 *     matches by construction rather than by luck.
 *
 * `false` on the server means callers must treat the query as "not matched"
 * until proven otherwise. That is the right default for progressive
 * enhancement: gate the enhancement on a true result, never the base
 * experience on a false one.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
