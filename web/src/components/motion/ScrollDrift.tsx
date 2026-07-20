"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMotionConfig } from "./useMotionConfig";

/**
 * Horizontal drift tied to the element's pass through the viewport.
 *
 * Built for the two full-bleed bands — the watchword marquee and the client
 * wall — which already loop on a CSS animation. This does NOT replace that
 * loop; it layers on top of it. The band keeps travelling on its own clock,
 * and scrolling additionally drags it, so the section responds to the reader
 * instead of just playing at them. The two transforms compose because they sit
 * on different elements: this one wraps the track rather than being the track.
 *
 * TRAVEL IS IN `vw`, which is also the mobile answer. A fixed pixel drift is
 * either invisible on a phone or violent on a desktop; a viewport-relative one
 * is proportionate on both without a media query — 6vw is 23px at 390px wide
 * and 86px at 1440px.
 *
 * RTL mirrors, because a band that drags left as you scroll down reads as
 * "forward" only if the page reads left to right.
 */
export function ScrollDrift({
  children,
  /** Peak travel each way, in vw, across the whole transit. */
  amount = 6,
  className,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { dir, reduce } = useMotionConfig();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-amount * dir}vw`, `${amount * dir}vw`],
  );

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ x }}>{children}</motion.div>
    </div>
  );
}
