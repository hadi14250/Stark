"use client";

import { useMotionConfig } from "@/components/motion/useMotionConfig";

/**
 * Forest circle button with a cream down-arrow, sitting on the hero's
 * torn-paper seam. Scrolls to the section below the hero. Lenis owns smooth
 * scrolling; a plain `scrollIntoView` is intercepted by Lenis when motion is
 * on, and falls back to an instant jump under reduced motion.
 */
export function ScrollCue({ targetId, label }: { targetId: string; label: string }) {
  const { reduce } = useMotionConfig();

  function onClick() {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--color-hero-bg)] text-[color:var(--ink-green-strong)] shadow-[0_12px_20px_0_rgba(17,39,28,0.28)] transition-transform hover:-translate-y-0.5 nav:h-[74px] nav:w-[74px] nav:shadow-[0_18px_24px_0_rgba(17,39,28,0.22)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <svg viewBox="0 0 42 42" width="30" height="30" fill="none" aria-hidden>
        <path
          d="M21 10 L21 31 M12.5 23 L21 31.5 L29.5 23"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
