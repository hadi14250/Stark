"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed 3px scroll-progress bar at the very top of the viewport, width = page
 * scroll %. Writes width imperatively (no per-frame React state) off a passive
 * scroll listener.
 *
 * Site-wide, so it consumes SEMANTIC tokens: it was previously hardcoded to
 * `--el-accent`/`--el-accent-bright`, primitives that belong to the Element
 * page and are deleted in Phase C. Reading `--color-accent` instead means the
 * bar picks up whichever theme it is rendered under, for free.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    const onScroll = () => {
      const el = document.scrollingElement || document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? el.scrollTop / max : 0;
      bar.style.width = `${p * 100}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-x-0 top-0 z-[9999] h-[3px] w-0 bg-[linear-gradient(to_right,var(--color-accent-2),var(--color-accent))] shadow-[0_0_12px_rgb(219_202_173/0.5)]"
      style={{ insetInlineStart: 0 }}
    />
  );
}
