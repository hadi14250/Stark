"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMotionConfig } from "./useMotionConfig";

/**
 * Scroll-linked parallax, on Framer's `useScroll` rather than GSAP.
 *
 * The plan chose GSAP ScrollTrigger for this and Phase F removed GSAP, because
 * the only thing importing it was a marquee and it was costing every route
 * ~43KB. Framer is already in the bundle for every reveal on the site, and
 * `useScroll` + `useTransform` does scroll-linked motion natively — so this
 * costs nothing extra and the parallax is back.
 *
 * `offset: ["start end", "end start"]` measures the element's whole pass
 * through the viewport, so `progress` runs 0→1 from "about to enter" to "just
 * left". That is a transform-independent measurement, which is the thing the
 * prototype's own loop got wrong: it read `getBoundingClientRect()` on the
 * element it was translating, so each frame measured a position it had itself
 * displaced and the realised factor came out as `f/(1+f)` rather than `f`.
 */
export function Parallax({
  children,
  /** Travel as a % of the element's height. Negative moves against the scroll. */
  amount = 12,
  className,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduce } = useMotionConfig();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${-amount}%`, `${amount}%`]);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/**
 * Scroll-linked scale for a photograph inside a fixed-height frame.
 *
 * Wants a parent with `overflow: hidden` — the image is oversized on purpose
 * so it has somewhere to move.
 */
export function ParallaxImage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduce } = useMotionConfig();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  if (reduce) {
    return (
      <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ y, height: "116%", marginTop: "-8%" }}>
        {children}
      </motion.div>
    </div>
  );
}
