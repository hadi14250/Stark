"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LogoLoader } from "./LogoLoader";
import { holdReveals } from "./useRevealOnce";
import { CURTAIN_MS, LOADER_SPEED, LOADER_VARIANT } from "./loader-timing";
import { useMotionConfig } from "./useMotionConfig";
import "@/styles/logo-loader.css";

/**
 * The brand curtain on in-app navigation.
 *
 * WHY IT IS A SECOND COMPONENT. `Preloader` cannot do this job from where it
 * sits: SiteChrome lives in the layout, the layout does not remount between
 * routes, so the preloader mounts once per real page load and a client-side
 * navigation never reaches it. That is why the loader appears on refresh and
 * not on a click — the client's report, and an accurate one.
 *
 * Both play the same variant for the same beat, from `loader-timing.ts`. If
 * they ever diverge the site has two different loading animations depending on
 * how you arrived, which is the original complaint wearing a new hat;
 * `Preloader.test.ts` pins them together.
 *
 * ===========================================================================
 * WHY IT TRIGGERS ON THE CLICK RATHER THAN ON THE PATHNAME
 * ===========================================================================
 *
 * The obvious build is `useEffect(..., [pathname])`. It is wrong, and visibly
 * so: `usePathname()` updates when the new route has already COMMITTED, so the
 * sequence a visitor sees is new-page-paints, then a curtain drops over it,
 * then the curtain lifts to reveal the page they were already looking at. The
 * flash of arrived content is exactly what a curtain exists to prevent.
 *
 * So the trigger is a capture-phase click on any internal link. That covers
 * every real navigation on this site — every route change here is an <a> — and
 * the curtain then runs on its own clock from the click, which is also the
 * moment the reader committed. Nothing waits on the pathname.
 *
 * ===========================================================================
 * IT CAN NEVER STICK
 * ===========================================================================
 *
 * A curtain is opaque, fixed and z-10000. Anything that can leave one up is a
 * blank site, so there are three independent ways down:
 *
 *   1. the CSS lift (`.stark-preloader`) runs on `forwards` and translates it
 *      away without React's help, exactly as it does for the preloader;
 *   2. this component's own timer unmounts it a beat after it went up;
 *   3. `holdReveals` carries its own ceiling, so even a stuck curtain cannot
 *      leave the page's content armed and therefore invisible.
 *
 * A cancelled navigation (a link that 404s, a click the router drops) is
 * covered by 2 — the timer does not wait for a pathname that may never change.
 */
export function RouteCurtain() {
  const { reduce } = useMotionConfig();
  const [active, setActive] = useState(false);
  /** Set when the curtain goes up, so the pathname effect knows to clear it. */
  const raised = useRef(false);
  const releaseRef = useRef<(() => void) | null>(null);
  const timer = useRef(0);

  const drop = useCallback(() => {
    window.clearTimeout(timer.current);
    releaseRef.current?.();
    releaseRef.current = null;
    raised.current = false;
    setActive(false);
  }, []);

  const raise = useCallback(() => {
    if (raised.current) return;
    raised.current = true;
    // Hold the incoming page's entrance so it is not performed to the back of
    // an opaque panel. See the long note in useRevealOnce.ts.
    releaseRef.current = holdReveals(CURTAIN_MS);
    setActive(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(drop, CURTAIN_MS);
  }, [drop]);

  useEffect(() => {
    // Reduced motion gets no curtain, for the same reason the preloader is
    // display:none there: a loading screen whose entire content is an animation
    // should not be shown-but-frozen to someone who asked for no animation.
    if (reduce) return;

    function onClick(e: MouseEvent) {
      // Anything the browser will not handle as a plain in-page navigation is
      // not ours: modified clicks open tabs, middle clicks open tabs, and a
      // prevented default means something else already took the click.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;

      const href = a.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      // Same page: an in-page anchor (`/#contact` is most of this site's CTAs)
      // or a re-click on the current route. Neither is a navigation, and
      // putting a two-second curtain in front of a jump to the contact form
      // would be the single most irritating thing on the site.
      if (url.pathname === window.location.pathname) return;

      raise();
    }

    // Capture, so a link whose own handler stops propagation still raises it.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [reduce, raise]);

  /**
   * Unmount safety, and NOTHING keyed on the pathname.
   *
   * The first version of this ran its cleanup on `[pathname]`, which reads as
   * tidy and is actively wrong: the pathname changes DURING the curtain, so the
   * cleanup fired mid-beat — clearing the timer that unmounts the curtain and
   * releasing the reveals it was holding. The result was the worst of both, a
   * curtain left in the DOM (translated away by CSS, so invisible and easy to
   * miss) around an entrance that had already played underneath it.
   *
   * The curtain is on its own clock from the click. Nothing about the route
   * committing should touch it.
   */
  useEffect(() => {
    const t = timer;
    const r = releaseRef;
    return () => {
      window.clearTimeout(t.current);
      r.current?.();
    };
  }, []);

  if (!active) return null;

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
