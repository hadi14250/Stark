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
 */
export default function PushSlider({ slides }: { slides: Slide[] }) {
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

  const [index, setIndex] = useState(0);
  const [overlay, setOverlay] = useState(false);
  // -1 = navigated "Previous", 1 = "Next"
  const [dirState, setDirState] = useState(1);
  // where we navigated FROM — feeds the WebGL shader's outgoing texture
  const prevIndexRef = useRef(0);

  const stageRef = useRef<HTMLDivElement>(null);

  // The click-cooldown lock is a REF, and go() keeps non-idempotent side
  // effects out of the state updater (StrictMode double-invokes updaters —
  // the ref write below is idempotent, so it's safe where a counter wouldn't be).
  const busyRef = useRef(false);

  const active = effSlides[index];
  const count = effSlides.length;
  const loop = m.loop;

  const go = useCallback(
    (d: number) => {
      if (busyRef.current) return;
      if (!loop && (index + d < 0 || index + d > count - 1)) return;
      busyRef.current = true;
      setDirState(d);
      setIndex((i) => {
        const target = loop
          ? (i + d + count) % count
          : Math.min(count - 1, Math.max(0, i + d));
        prevIndexRef.current = i;
        return target;
      });
      window.setTimeout(() => {
        busyRef.current = false;
      }, m.navCooldownMs);
    },
    [count, loop, index, m.navCooldownMs]
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

  const atStart = !loop && index === 0;
  const atEnd = !loop && index === count - 1;
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
  }, [index, m.autoplay.enabled, m.autoplay.intervalMs, autoplayPaused, next]);

  // preload neighbouring slides' images to avoid flashes mid-transition
  useEffect(() => {
    const nb = [
      effSlides[(index + 1) % count],
      effSlides[(index - 1 + count) % count],
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
  }, [index, count, effSlides]);

  /* ---------------- resolved live transition ---------------- */

  const reduced = useReducedMotion();

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
    const gridDir: PushDir = reverse ? "right" : "left";
    const from = effSlides[prevIndexRef.current];
    const to = effSlides[index];
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
      dirFor: (c: CellId) => map[c],
      imagesFor: (c: CellId) => {
        const f = CELL_IMAGE[c];
        return {
          from: f && from ? f(from) : null,
          to: f && to ? f(to) : null,
        };
      },
    };
  }, [reduced, m, config.transition, config.push, dirState, effSlides, index]);

  /* ---------------- live stage vars (Style/Colors tabs) ---------------- */

  const stageStyle = useMemo<CSSProperties>(
    () => ({
      ...themeVars(active.theme),
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
    [active.theme, st, m.enterMs, resolved.easeCss]
  );

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
