"use client";

import { motion } from "framer-motion";
import { LOGO_VIEWBOX } from "@/components/brand/LogoDefs";
import { ease } from "@/styles/tokens";
import { useMotionConfig } from "./useMotionConfig";

const BLADES = ["#lg-b1", "#lg-b2", "#lg-b3", "#lg-b4", "#lg-b5"] as const;

/**
 * The mark draws itself: five blades stroke on in sequence, then the core
 * pentagon fills.
 *
 * This is the ONE place the real lockup is animated, and it is reserved for the
 * preloader and the route curtain. Everywhere else the mark's parts are used as
 * derived geometry (see components/brand/geometry.tsx) — the brand's Don'ts
 * govern the logo presenting AS the logo, which is what this is.
 *
 * Works because every path in LogoDefs carries `pathLength="100"`, so one
 * dashoffset animation on a 0-100 scale drives paths of wildly different true
 * lengths at the same visual rate.
 *
 * Requires <LogoDefs /> in the tree.
 */
export function LogoTrace({
  size = 120,
  color = "var(--color-accent)",
  /** Seconds for the whole sequence. */
  duration = 1.1,
  className,
}: {
  size?: number;
  color?: string;
  duration?: number;
  className?: string;
}) {
  const { reduce } = useMotionConfig();
  const strokeDur = (duration * 0.62) / BLADES.length;

  // Reduced motion gets the finished mark, immediately. A preloader that
  // animates for a user who asked for no animation is worse than no preloader.
  if (reduce) {
    return (
      <svg viewBox={LOGO_VIEWBOX} width={size} className={className} aria-hidden>
        <use href="#lg-all" fill={color} />
      </svg>
    );
  }

  return (
    <svg viewBox={LOGO_VIEWBOX} width={size} className={className} aria-hidden>
      {BLADES.map((id, i) => (
        <motion.use
          key={id}
          href={id}
          fill="transparent"
          stroke={color}
          strokeWidth={2}
          initial={{ strokeDasharray: "100 100", strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 0, fill: color }}
          transition={{
            strokeDashoffset: {
              duration: strokeDur,
              delay: i * strokeDur,
              ease: [...ease.line],
            },
            fill: {
              duration: duration * 0.3,
              delay: duration * 0.62,
              ease: [...ease.standard],
            },
          }}
        />
      ))}
      <motion.use
        href="#lg-core"
        fill={color}
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ transformOrigin: "center" }}
        transition={{
          duration: duration * 0.34,
          delay: duration * 0.66,
          ease: [...ease.zoom],
        }}
      />
    </svg>
  );
}
