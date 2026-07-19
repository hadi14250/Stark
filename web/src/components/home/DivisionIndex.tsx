"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Pill } from "@/components/ui/Pill";
import { MarkGlyph } from "@/components/brand/geometry";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { landingImages } from "@/components/landing/assets";
import type { DivisionKey } from "@/components/brand/LogoDefs";
import { ease } from "@/styles/tokens";

export type DivisionItem = {
  title: string;
  body: string;
  cta: string;
  alt: string;
  href: string;
  division: DivisionKey;
};

/**
 * The three divisions, as an expanding photographic index.
 *
 * WHAT WAS HERE: a wide photo band with a cream card floating over its lower
 * edge. Three problems, and the client named all three. The card covered 64% of
 * the photograph, so the photo was reduced to a strip of texture peeking out at
 * the top and sides — the image was paying for its bandwidth and delivering
 * nothing. The card carried an EYEBROW and an H3 with the identical string
 * ("TURNKEY PROJECTS" over "Turnkey Projects"), which is not a style choice,
 * it is a bug that shipped. And the whole thing was static: a box on a picture.
 *
 * WHAT IT IS NOW: the photograph IS the panel. Three of them side by side, and
 * the one under the pointer opens — taking width from the other two, its image
 * settling out of a slight over-scale as it goes. Nothing is hidden to make
 * that work: every panel shows its name, its line of positioning and its link
 * at all times, so the interaction adds emphasis rather than gating content.
 * That distinction is the whole reason this is not a hover-accordion.
 *
 * KEYBOARD AND TOUCH BOTH WORK, and for the same reason: `onFocus` opens a
 * panel exactly as hover does, and since nothing was hidden in the first place,
 * a touch user who never triggers either state loses nothing at all.
 *
 * BELOW `nav:` the row becomes a stack of fixed-height panels. Expansion is a
 * width behaviour and there is no width to trade on a phone, so it simply does
 * not apply — `flex-grow` has no free space to distribute in an auto-height
 * column, which is why the same markup can serve both.
 */
export function DivisionIndex({ items }: { items: DivisionItem[] }) {
  const [active, setActive] = useState(0);
  const { reduce, dir } = useMotionConfig();

  return (
    <div className="mt-[clamp(40px,5vw,64px)] flex flex-col gap-4 nav:h-[clamp(440px,62vh,600px)] nav:flex-row nav:gap-3">
      {items.map((item, i) => {
        const open = active === i;

        return (
          <motion.article
            key={item.title}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="group relative isolate h-[340px] min-w-0 basis-auto overflow-hidden rounded-[var(--radius-card)] nav:h-full nav:basis-0"
            initial={false}
            animate={{ flexGrow: reduce ? 1 : open ? 2.3 : 1 }}
            transition={{ duration: 0.75, ease: [...ease.zoom] }}
          >
            <motion.div
              className="absolute inset-0 -z-10"
              initial={false}
              // The image is oversized so opening can settle it back to 1
              // rather than cropping harder. A panel that zooms IN on open
              // fights the widening; one that relaxes moves with it.
              animate={{ scale: reduce ? 1 : open ? 1 : 1.12 }}
              transition={{ duration: 0.9, ease: [...ease.zoom] }}
            >
              <Image
                src={landingImages.categories[i]}
                alt={item.alt}
                fill
                sizes="(max-width: 860px) 100vw, 45vw"
                className="object-cover"
                style={{ filter: "var(--image-filter)" }}
              />
            </motion.div>

            {/* Scrim. Fixed dark-green rather than a theme role: it exists to
                guarantee contrast for the copy over an unknown photograph, so
                it must not re-point when a theme does. */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "linear-gradient(to top, rgb(12 26 19 / 0.92) 0%, rgb(12 26 19 / 0.62) 38%, rgb(12 26 19 / 0.12) 72%, rgb(12 26 19 / 0.05) 100%)",
              }}
            />

            <div className="flex h-full flex-col justify-between p-6 nav:p-8">
              <div className="flex items-start justify-between gap-4">
                <MarkGlyph division={item.division} size={44} color="var(--sand-500)" />
                <span
                  aria-hidden
                  className="font-mono text-[11px] tracking-eyebrow"
                  style={{ color: "rgb(250 245 239 / 0.6)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <div>
                <h3
                  className="font-display text-h3 font-bold leading-h3 tracking-display"
                  style={{ color: "var(--white-500)" }}
                >
                  {item.title}
                </h3>

                {/* The rule is the open-state signal. It is cheap, it does not
                    move anything else, and it gives the panel a state that
                    survives reduced motion as a plain colour change. */}
                <motion.span
                  aria-hidden
                  className="mt-4 block h-px w-full"
                  style={{
                    background: "var(--sand-500)",
                    // No logical form of transform-origin exists, so the growth
                    // edge comes from `dir` like every other scaleX on the site.
                    transformOrigin: dir === -1 ? "right center" : "left center",
                  }}
                  initial={false}
                  animate={{ scaleX: open ? 1 : 0.12, opacity: open ? 1 : 0.45 }}
                  transition={{ duration: 0.7, ease: [...ease.zoom] }}
                />

                <p
                  className="mt-4 max-w-[38ch] text-body-sm leading-body"
                  style={{ color: "rgb(250 245 239 / 0.82)" }}
                >
                  {item.body}
                </p>

                <div className="mt-6">
                  <Pill variant="tan" href={item.href}>
                    {item.cta}
                  </Pill>
                </div>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
