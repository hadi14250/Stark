/**
 * Push — the original, shipping transition, transcribed 1:1 from the old
 * fixed PushCard variants. At default config this MUST reproduce the declared
 * spec exactly: enter from ±100% of the card's own box over `enter` seconds,
 * exit to the opposite edge over `exit` seconds, one ease, both from t=0,
 * no stagger. Do not "improve" it.
 */
import { enterOffset, exitOffset } from "./core";
import type { CardCtx, LayerSpec, TransitionImpl } from "./types";

export const pushImpl: TransitionImpl = {
  scope: "card",
  directional: true,
  textMode: "push",
  card: (ctx: CardCtx): LayerSpec => ({
    initial: { ...enterOffset(ctx.dir) },
    animate: { x: 0, y: 0 },
    exitTarget: { ...exitOffset(ctx.dir) },
    // default transitions ({duration: ctx.enter/ctx.exit, ease: ctx.ease})
    // are exactly the declared config — nothing to override.
  }),
};

export const IMPLS: Record<string, TransitionImpl> = {
  push: pushImpl,
};
