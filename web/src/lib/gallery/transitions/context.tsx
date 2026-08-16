"use client";

/**
 * The resolved, LIVE transition configuration — provided by PushSlider from
 * the editor's config store, consumed by PushCard / GridTransitionFrame /
 * textMotion. Everything here is already resolved: durations in seconds,
 * the ease as a function (the exact quartic for the original preset, a
 * cubicBezier for everything else), directions per cell with reverse applied
 * by the consumer via `reverse`.
 *
 * Null context = standalone usage: components fall back to the shipped
 * constants and behave exactly like the original push slider.
 */
import { createContext, useContext } from "react";
import type { CellId, PushDir } from "./core";
import type { TransitionImpl } from "./types";

export interface ResolvedTransition {
  id: string;
  impl: TransitionImpl;
  /** seconds */
  enter: number;
  exit: number;
  ease: (t: number) => number;
  /** cubic-bezier(...) string for CSS consumers (theme fade) */
  easeCss: string;
  /** seconds */
  textDelay: number;
  textStagger: number;
  /** true when THIS navigation mirrors the direction map (Previous + reverseOnPrev) */
  reverse: boolean;
  /** travel direction for grid-scope (whole-deck) transitions: Next → "left" */
  gridDir: PushDir;
  dirFor: (cellId: CellId) => PushDir;
  /** this cell's photo on the outgoing/incoming slide (equal urls when idle) */
  imagesFor: (cellId: CellId) => { from: string | null; to: string | null };
}

const TransitionCtx = createContext<ResolvedTransition | null>(null);

export const TransitionProvider = TransitionCtx.Provider;

export function useTransitionConfig(): ResolvedTransition | null {
  return useContext(TransitionCtx);
}
