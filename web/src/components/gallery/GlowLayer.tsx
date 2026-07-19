"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-following "torch" glow, matching the original template.
 *
 * Two layers of light track the pointer:
 *  1) a large soft glow on the page background (behind the grid) that lightens
 *     the theme colour near the cursor, and
 *  2) a smaller glow inside whichever card the cursor is over — each card reads
 *     its own local `--gx/--gy` (0–100%) + `--gon` (0/1 fade) to paint a
 *     radial highlight exactly where the mouse is.
 *
 * One pointermove listener on the stage drives everything (cheap; only writes
 * CSS custom properties, no React re-renders). Honours reduced-motion.
 */
export default function GlowLayer({
  stageRef,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
}) {
  // the card the pointer is currently inside (so we can clear its glow on leave)
  const currentCard = useRef<HTMLElement | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // skip on touch / no-hover devices
    if (!window.matchMedia("(hover: hover)").matches) return;

    const onMove = (e: PointerEvent) => {
      if (raf.current != null) return; // throttle to one write per frame
      raf.current = window.requestAnimationFrame(() => {
        raf.current = null;

        // 1) background glow — viewport-relative position on the stage
        const sb = stage.getBoundingClientRect();
        stage.style.setProperty("--mx", `${e.clientX - sb.left}px`);
        stage.style.setProperty("--my", `${e.clientY - sb.top}px`);
        stage.style.setProperty("--mon", "1");

        // 2) per-card glow — find the card under the pointer
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const card = el ? (el.closest(".card") as HTMLElement | null) : null;

        if (card !== currentCard.current) {
          if (currentCard.current)
            currentCard.current.style.setProperty("--gon", "0");
          currentCard.current = card;
        }
        if (card) {
          const cb = card.getBoundingClientRect();
          const gx = ((e.clientX - cb.left) / cb.width) * 100;
          const gy = ((e.clientY - cb.top) / cb.height) * 100;
          card.style.setProperty("--gx", `${gx}%`);
          card.style.setProperty("--gy", `${gy}%`);
          card.style.setProperty("--gon", "1");
        }
      });
    };

    const onLeave = () => {
      stage.style.setProperty("--mon", "0");
      if (currentCard.current) {
        currentCard.current.style.setProperty("--gon", "0");
        currentCard.current = null;
      }
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [stageRef]);

  return null;
}
