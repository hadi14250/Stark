/**
 * Frozen stage config.
 *
 * The handoff drove every one of these values from a live editor store
 * (`lib/editor/config.tsx`, 384 lines + localStorage + a React context).
 * Stark ships the stage, not the editor, so the store is gone and this file
 * is its replacement: one frozen object holding the values the slider reads.
 *
 * `useGalleryConfigOptional` is kept as a null-returning stub so the ported
 * components need no edits at their call sites — they already handle the
 * standalone (no-provider) case.
 */
import type { Slide, SlideText } from "@/lib/gallery/types";
import { ENTER_DUR, EXIT_DUR, type CellId, type PushDir } from "@/lib/gallery/transitions/core";
import { TEXT_DELAY } from "@/components/gallery/textMotion";

export type { CellId } from "@/lib/gallery/transitions/core";

export interface GalleryConfig {
  transition: string;
  push: {
    directionMap: Record<CellId, PushDir>;
    reverseOnPrev: boolean;
  };
  motion: {
    ease: { preset: string; bezier: [number, number, number, number] };
    enterMs: number;
    exitMs: number;
    textDelayMs: number;
    textStaggerMs: number;
    navCooldownMs: number;
    autoplay: { enabled: boolean; intervalMs: number; pauseOnHover: boolean };
    loop: boolean;
    reducedMotion: "crossfade" | "instant";
  };
  style: {
    gap: number;
    radius: number;
    btnRadius: number;
    pad: number;
    fontScale: { heading: number; body: number };
    glow: { enabled: boolean; size: number; color: string };
  };
}

export const DEFAULT_CONFIG: GalleryConfig = {
  transition: "push",
  push: {
    // the original's declared per-card direction map (see SlideGrid.tsx)
    directionMap: {
      hero: "right",
      intro: "left",
      portraitA: "up",
      explore: "down",
      blossom: "right",
      stay: "up",
      portraitB: "down",
      cuisine: "left",
      cta: "right",
      prevnext: "down",
    },
    reverseOnPrev: true,
  },
  motion: {
    // bezier is only the CSS representation; the "power3-inout" preset makes
    // PushSlider use the exact quartic PUSH_EASE function instead.
    ease: { preset: "power3-inout", bezier: [0.77, 0, 0.175, 1] },
    enterMs: Math.round(ENTER_DUR * 1000),
    exitMs: Math.round(EXIT_DUR * 1000),
    textDelayMs: Math.round(TEXT_DELAY * 1000),
    textStaggerMs: 0,
    navCooldownMs: 1000,
    autoplay: { enabled: false, intervalMs: 5000, pauseOnHover: true },
    loop: true,
    reducedMotion: "crossfade",
  },
  style: {
    gap: 16,
    radius: 10,
    btnRadius: 6,
    pad: 26,
    fontScale: { heading: 100, body: 100 },
    glow: { enabled: true, size: 620, color: "rgba(255, 236, 210, 0.42)" },
  },
};

/**
 * Overlay a slide's edited copy onto the shipped Slide. Stark resolves copy on
 * the server via the Project → Slide adapter, so nothing calls this with a
 * text entry today; it is kept so the ported slider needs no edit.
 */
export function applySlideText(slide: Slide, t: SlideText | undefined): Slide {
  if (!t) return slide;
  return {
    ...slide,
    city: t.city,
    subtitle: t.subtitle,
    headline: t.headline,
    paragraph: t.paragraph,
    ctaLabel: t.ctaLabel,
    exploreLine: t.exploreLine,
    stayLine: t.stayLine,
    cuisineLine: t.cuisineLine,
    overlay: {
      ...slide.overlay,
      eyebrow: t.overlayEyebrow,
      title: t.overlayTitle,
      bestTime: t.overlayBestTime,
      ctaLabel: t.overlayCtaLabel,
      activities: t.overlayActivities,
    },
  };
}

/** No editor in Stark — always standalone. */
export function useGalleryConfigOptional(): null {
  return null;
}
