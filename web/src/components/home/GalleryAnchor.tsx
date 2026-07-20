"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Photo } from "@/components/ui/Photo";
import { useMotionConfig } from "@/components/motion/useMotionConfig";

/** How long each image holds before the next crossfades in. */
const INTERVAL_MS = 6000;

/**
 * The teaser's anchor tile, crossfading through several gallery images.
 *
 * WHY IT MOVES ON ITS OWN. This section's job is to make someone want to open
 * /gallery, and the honest argument for doing that is "there is more here than
 * you can see". A single still photograph makes the opposite case. Cycling the
 * largest tile shows the range without spending the page space a bigger grid
 * would cost — and it is the one device that works identically on a phone,
 * where nothing on this page can be hovered.
 *
 * SIX SECONDS, not two. This is ambient, not a slideshow demanding attention;
 * it should be something a reader notices has changed rather than something
 * that changes at them. The fade is 1.2s for the same reason.
 *
 * It pauses on hover — someone who has stopped on the tile is looking at THAT
 * photograph — and does not run at all under reduced motion, where it renders
 * the first image and stops. A crossfade is a cross-fade whichever way it is
 * dressed up, and "images swap themselves" is exactly what that setting is
 * asking not to happen.
 */
export function GalleryAnchor({
  images,
  alts,
  height,
}: {
  images: string[];
  alts: string[];
  height: string;
}) {
  const { reduce } = useMotionConfig();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused || images.length < 2) return;
    const t = window.setInterval(
      () => setI((n) => (n + 1) % images.length),
      INTERVAL_MS,
    );
    return () => window.clearInterval(t);
  }, [reduce, paused, images.length]);

  if (reduce) {
    return <Photo src={images[0]} alt={alts[0]} height={height} className="h-full" />;
  }

  return (
    <div
      className="relative h-full"
      style={{ height }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {/*
        `mode="popLayout"` is wrong here and `wait` is worse: the outgoing
        image must stay in place while the incoming one fades over it, or the
        tile shows its own background mid-swap. Both layers are absolutely
        positioned in the same box so they overlap exactly.

        Only the ACTIVE image is described. Announcing every frame of an
        ambient loop would have a screen reader read out five interiors as the
        tile idles; the alt travels with whichever photograph is showing.
      */}
      <AnimatePresence initial={false}>
        <motion.div
          key={images[i]}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <Photo src={images[i]} alt={alts[i] ?? ""} height="100%" className="h-full" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
