"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed 3px tan scroll-progress bar at the very top of the viewport, width =
 * page scroll %. Matches the handoff's `[data-progress]` element. Writes width
 * imperatively (no per-frame React state) off a passive scroll listener.
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
      className="fixed inset-x-0 top-0 z-[9999] h-[3px] w-0 bg-[linear-gradient(90deg,var(--el-accent),var(--el-accent-bright))] shadow-[0_0_12px_rgba(195,160,106,0.5)]"
      style={{ insetInlineStart: 0 }}
    />
  );
}
