"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, cubicBezier, useReducedMotion } from "framer-motion";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import type { Slide } from "@/lib/gallery/types";
import { themeVars } from "@/lib/gallery/theme";
import {
  DEFAULT_CONFIG,
  applySlideText,
  type GalleryConfig,
} from "@/lib/gallery/config";
import {
  CELL_IMAGE,
  PUSH_EASE,
  mirrorDir,
  type CellId,
  type PushDir,
} from "@/lib/gallery/transitions/core";
import {
  INSTANT_IMPL,
  REDUCED_FADE_IMPL,
  getImpl,
} from "@/lib/gallery/transitions/registry";
import {
  TransitionProvider,
  type ResolvedTransition,
} from "@/lib/gallery/transitions/context";
import SlideGrid from "./SlideGrid";
import SliderControls from "./SliderControls";
import DetailOverlay from "./DetailOverlay";
import GlowLayer from "./GlowLayer";
import GridTransitionFrame from "./GridTransitionFrame";

/**
 * The slider. In the handoff this was LIVE-DRIVEN by an editor config store —
 * every knob in the panel applied the instant it changed. Stark ships the
 * stage without the editor, so it runs the frozen DEFAULT_CONFIG: the
 * original's declared push spec.
 *
 * MODIFIED FROM THE HANDOFF: the index is now optionally CONTROLLED. The
 * original held it in a `useState(0)` with no setter exposed and no prop, so
 * the shell had no way to select a project — the chip row could not exist.
 * Passing `activeId` drives it from outside; `onActiveChange` reports the
 * slider's own Prev/Next back up so the URL and the panel stay in step.
 */
export default function PushSlider({
  slides,
  activeId,
  onActiveChange,
  emptyLabel = "",
}: {
  slides: Slide[];
  /** Controlled selection. Omit to let the slider own its index. */
  activeId?: string;
  onActiveChange?: (id: string) => void;
  /** Shown when the category has no projects. Already localised. */
  emptyLabel?: string;
}) {
  const config: GalleryConfig = DEFAULT_CONFIG;
  const m = config.motion;
  const st = config.style;

  // The editor's live text / theme / image-override layers are gone; Stark
  // resolves copy and theme on the server in the Project → Slide adapter. Kept
  // as a pass-through so everything downstream (stage vars, per-layer palette
  // freeze, neighbor preload, overlay) still reads from a single `effSlides`.
  const effSlides = useMemo(
    () => slides.map((s) => applySlideText(s, undefined)),
    [slides]
  );

  /**
   * Seed the index from `activeId` on the FIRST render, not in an effect.
   *
   * Resolving the deep link on the server is only half the fix. If the slider
   * still mounts at index 0 and an effect corrects it afterwards, a shared
   * `?p=` link renders the wrong project for one frame and then plays a full
   * 1.2s push transition into the right one — `AnimatePresence initial={false}`
   * suppresses only the very first render, so the correction animates. Wrong
   * content, then a spurious animation, on every link anyone shares.
   */
  const [index, setIndex] = useState(() => {
    if (activeId == null) return 0;
    const i = slides.findIndex((s) => s.id === activeId);
    return i >= 0 ? i : 0;
  });
  const [overlay, setOverlay] = useState(false);
  // -1 = navigated "Previous", 1 = "Next"
  const [dirState, setDirState] = useState(1);
  /**
   * Where we navigated FROM — feeds the transition's outgoing texture.
   *
   * STATE, NOT A REF. It is read during render (the resolved-transition memo
   * below picks the outgoing slide with it), and a ref read during render is
   * a value React does not know it depends on: the memo listed `safeIndex` in
   * its deps and then quietly reached for a ref, which happened to work only
   * because the two were always written together. As state it is tracked,
   * batches with the index it belongs to, and the render stays pure.
   */
  const [prevIndex, setPrevIndex] = useState(0);

  /**
   * BOUNDS CLAMP. Without this, switching to a category with fewer projects
   * takes the route down: `effSlides[index]` is undefined and `themeVars`
   * throws on `active.theme` during render. The preload effect below also
   * does `% count`, which is NaN at count 0.
   *
   * Runs during render rather than in an effect because the crash would happen
   * on THIS render, before any effect could fix it.
   */
  const count = effSlides.length;
  const safeIndex = count === 0 ? 0 : Math.min(index, count - 1);
  if (safeIndex !== index) {
    // Safe in render: setState during render of the same component is React's
    // supported "derive state from props" escape hatch, and this is idempotent.
    // It deliberately leaves `prevIndex` alone — a clamp is a correction, not
    // a navigation, and there is no meaningful slide to have travelled from.
    setIndex(safeIndex);
  }

  /**
   * Controlled selection: mirror `activeId` into the internal index.
   *
   * DERIVED DURING RENDER, NOT IN AN EFFECT, and that is the crash fix.
   *
   * This used to be a `useEffect` watching `activeId`, paired with a second
   * effect that reported the resolved slide back up through `onActiveChange`.
   * The two formed a cycle. Switching category swapped the `slides` array
   * while the index still pointed into the old one, so the reporting effect
   * announced a project the shell had never chosen, the shell echoed it back
   * as `activeId`, this effect pulled the index the other way, and the pair
   * oscillated until React gave up with "Maximum update depth exceeded".
   *
   * Adjusting state during render is React's documented answer to "a prop
   * changed and some state derives from it" — it re-renders immediately,
   * before children or the browser see the stale value, so there is no
   * intermediate frame to report and nothing for an effect to chase. The
   * upward report now happens only in `go()`, where a real navigation is
   * known to have occurred. Selection travels one direction per cause.
   */
  const [seenActiveId, setSeenActiveId] = useState(activeId);
  if (activeId !== seenActiveId) {
    setSeenActiveId(activeId);
    const target = activeId == null ? -1 : effSlides.findIndex((s) => s.id === activeId);
    if (target >= 0 && target !== safeIndex) {
      setPrevIndex(safeIndex);
      // Direction so the push travels the way the list reads.
      setDirState(target > safeIndex ? 1 : -1);
      setIndex(target);
    }
  }

  const stageRef = useRef<HTMLDivElement>(null);

  // The click-cooldown lock is a REF, and go() keeps non-idempotent side
  // effects out of the state updater (StrictMode double-invokes updaters —
  // the ref write below is idempotent, so it's safe where a counter wouldn't be).
  const busyRef = useRef(false);

  const active = effSlides[safeIndex];
  const loop = m.loop;

  /**
   * Latest-ref for the change callback.
   *
   * Callers pass an inline arrow, so depending on it directly would rebuild
   * `go` on every parent render. A ref keeps `go` stable without going stale.
   */
  const onActiveChangeRef = useRef(onActiveChange);
  useEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  });

  /**
   * Advance the stage, and REPORT THE MOVE UPWARD FROM HERE.
   *
   * There used to be an effect watching `active?.id` that called
   * `onActiveChange` whenever the resolved slide changed. That is a feedback
   * loop with the effect above, and it took the route down: switching category
   * while the index was non-zero swapped `slides` under a stale index, so the
   * reporting effect pushed the WRONG project of the NEW category up to the
   * shell, the shell fed it back as `activeId`, the mirroring effect pulled the
   * index the other way, and the two chased each other until React threw
   * "Maximum update depth exceeded". (Both categories hold three projects, so
   * the bounds clamp above never intervened.)
   *
   * Selection now travels in exactly one direction per cause: the shell owns it
   * and pushes down via `activeId`; the stage's own navigation — Prev/Next, the
   * overlay's arrows, autoplay — pushes up from here, where an actual move is
   * known to have happened. No effect reports state it merely observed.
   */
  const go = useCallback(
    (d: number) => {
      if (busyRef.current || count === 0) return;
      const raw = safeIndex + d;
      if (!loop && (raw < 0 || raw > count - 1)) return;
      const target = loop
        ? (raw + count) % count
        : Math.min(count - 1, Math.max(0, raw));
      if (target === safeIndex) return;
      busyRef.current = true;
      setPrevIndex(safeIndex);
      setDirState(d);
      setIndex(target);
      onActiveChangeRef.current?.(effSlides[target].id);
      window.setTimeout(() => {
        busyRef.current = false;
      }, m.navCooldownMs);
    },
    [count, loop, safeIndex, m.navCooldownMs, effSlides]
  );

  const next = useCallback(() => go(1), [go]);
  const prev = useCallback(() => go(-1), [go]);

  /* ---------------- playback ---------------- */

  const [hovering, setHovering] = useState(false);
  const [docHidden, setDocHidden] = useState(false);

  useEffect(() => {
    const on = () => setDocHidden(document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !window.matchMedia("(hover: hover)").matches) return;
    const enter = () => setHovering(true);
    const leave = () => setHovering(false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const atStart = !loop && safeIndex === 0;
  const atEnd = !loop && safeIndex === count - 1;
  const autoplayPaused =
    overlay || docHidden || (m.autoplay.pauseOnHover && hovering) || atEnd;

  useEffect(() => {
    if (!m.autoplay.enabled || autoplayPaused) return;
    let t: number;
    const tick = () => {
      // go() silently no-ops during the nav cooldown; if the tick lands
      // inside it, index never changes and this effect would never re-arm —
      // autoplay would die after one slide. Retry until the lock clears.
      if (busyRef.current) {
        t = window.setTimeout(tick, 250);
        return;
      }
      next();
    };
    t = window.setTimeout(tick, Math.max(800, m.autoplay.intervalMs));
    return () => window.clearTimeout(t);
  }, [safeIndex, m.autoplay.enabled, m.autoplay.intervalMs, autoplayPaused, next]);

  // preload neighbouring slides' images to avoid flashes mid-transition
  useEffect(() => {
    // Guard count 0: `% 0` is NaN, and an empty category would otherwise throw
    // reading `.heroImage` of undefined.
    if (count === 0) return;
    const nb = [
      effSlides[(safeIndex + 1) % count],
      effSlides[(safeIndex - 1 + count) % count],
    ];
    const urls = nb.flatMap((s) => [
      s.heroImage,
      s.portraitA,
      s.portraitB,
      s.blossom,
      s.cuisineImage,
      s.introImage,
      s.overlay.bg,
    ]);
    urls.forEach((u) => {
      const im = new Image();
      im.src = u;
    });
  }, [safeIndex, count, effSlides]);

  /* ---------------- resolved live transition ---------------- */

  const reduced = useReducedMotion();
  // `dir` is -1 under RTL — the same source the rest of the site's motion uses.
  const rtl = useMotionConfig().dir === -1;

  const resolved = useMemo<ResolvedTransition>(() => {
    const impl = reduced
      ? m.reducedMotion === "instant"
        ? INSTANT_IMPL
        : REDUCED_FADE_IMPL
      : getImpl(config.transition);
    // the original preset keeps the EXACT quartic function — the bezier is
    // only its editor/CSS representation
    const ease =
      m.ease.preset === "power3-inout" ? PUSH_EASE : cubicBezier(...m.ease.bezier);
    const easeCss = `cubic-bezier(${m.ease.bezier.join(", ")})`;
    const map = config.push.directionMap;
    const reverse = dirState === -1 && config.push.reverseOnPrev;
    // RTL mirroring lives in mirrorDir (transitions/core.ts) so it is testable.
    const gridDir: PushDir = mirrorDir(reverse ? "right" : "left", rtl);
    const from = effSlides[prevIndex];
    const to = effSlides[safeIndex];
    return {
      id: config.transition,
      impl,
      enter: m.enterMs / 1000,
      exit: m.exitMs / 1000,
      ease,
      easeCss,
      textDelay: m.textDelayMs / 1000,
      textStagger: m.textStaggerMs / 1000,
      reverse,
      gridDir,
      dirFor: (c: CellId) => mirrorDir(map[c], rtl),
      imagesFor: (c: CellId) => {
        const f = CELL_IMAGE[c];
        return {
          from: f && from ? f(from) : null,
          to: f && to ? f(to) : null,
        };
      },
    };
  }, [reduced, m, config.transition, config.push, dirState, effSlides, safeIndex, prevIndex, rtl]);

  /* ---------------- live stage vars (Style/Colors tabs) ---------------- */

  const stageStyle = useMemo<CSSProperties>(
    () => ({
      // `active` is undefined only when the category is empty; the component
      // returns an empty state below, but this memo still runs (hooks cannot
      // be skipped), so it must not throw on the way there.
      ...(active ? themeVars(active.theme) : {}),
      ["--gap-base" as string]: `${st.gap}px`,
      ["--radius-base" as string]: `${st.radius}px`,
      ["--btn-radius-base" as string]: `${st.btnRadius}px`,
      ["--pad-base" as string]: `${st.pad}px`,
      // The gallery CSS reads `var(--font-heading, var(--font-poppins))` in four
      // places; NEITHER name exists in Stark, so without this map every gallery
      // heading silently falls through to system-ui. `--font-body` is
      // deliberately NOT set here — it already resolves from Stark's :root, and
      // re-declaring it as var(--font-body) would be a self-reference.
      ["--font-heading" as string]: "var(--font-display)",
      // type-size scales as unitless multipliers (percent/100)
      ["--fs-heading" as string]: String(st.fontScale.heading / 100),
      ["--fs-body" as string]: String(st.fontScale.body / 100),
      ["--glow" as string]: st.glow.enabled ? st.glow.color : "transparent",
      ["--glow-size" as string]: `${st.glow.size}px`,
      // theme colors fade on the enter's clock with the configured curve
      ["--dur" as string]: `${m.enterMs}ms`,
      ["--ease" as string]: resolved.easeCss,
    }),
    [active?.theme, st, m.enterMs, resolved.easeCss]
  );

  // Every hook has run by here, so an early return is safe. An empty category
  // is a real state (a division with no published projects yet), not an error:
  // the shell stays usable and the stage says so rather than crashing.
  if (!active) {
    return (
      <div ref={stageRef} className="stage" style={stageStyle}>
        <p className="stage-empty">{emptyLabel}</p>
      </div>
    );
  }

  const legacyReverse = dirState === -1; // fallback path only (no provider)

  const grid = (
    <SlideGrid
      slide={active}
      reverse={legacyReverse}
      controls={
        <SliderControls
          slide={active}
          contentKey={active.id}
          reverse={legacyReverse}
          prevDisabled={atStart}
          nextDisabled={atEnd}
          onCta={() => setOverlay(true)}
          onPrev={prev}
          onNext={next}
        />
      }
    />
  );

  return (
    <TransitionProvider value={resolved}>
      <div ref={stageRef} className="stage" style={stageStyle}>
        <GlowLayer stageRef={stageRef} />
        <div className="deck">
          {resolved.impl.scope === "grid" ? (
            <GridTransitionFrame contentKey={active.id}>{grid}</GridTransitionFrame>
          ) : (
            grid
          )}
        </div>

        <AnimatePresence>
          {overlay && (
            <DetailOverlay
              key={`ov-${active.id}`}
              slide={active}
              onClose={() => setOverlay(false)}
              onPrev={prev}
              onNext={next}
            />
          )}
        </AnimatePresence>
      </div>
    </TransitionProvider>
  );
}
