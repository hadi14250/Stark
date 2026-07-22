"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Pill } from "@/components/ui/Pill";
import { MarkGlyph } from "@/components/brand/geometry";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { ClipReveal } from "@/components/motion/reveals";
import { landingImages } from "@/components/landing/assets";
import { mattressImages } from "@/components/mattresses/assets";
import type { DivisionKey } from "@/components/brand/LogoDefs";
import { ease, easeCss } from "@/styles/tokens";

/** How long each panel holds before the row advances on its own. */
const CYCLE_MS = 4500;

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
 *
 * THE ROW NOW MOVES WITHOUT INPUT. Hover-driven emphasis has a failure mode
 * nobody notices on a desktop: on a phone there is no hover, no focus until
 * something is tabbed to, and therefore no state change ever — the section was
 * three still photographs, permanently. So the active panel advances on its own
 * every 4.5s until the reader takes over, and the active panel's photograph
 * runs a slow Ken Burns. That is the same section being alive on both, from one
 * mechanic, and it is why the phone deliberately does NOT get an accordion:
 * collapsing the copy would gate content behind a tap to buy motion that the
 * cycle already provides for free, and would put the panel's only link inside
 * a collapsed region where the keyboard cannot reach it.
 */
export function DivisionIndex({ items }: { items: DivisionItem[] }) {
  const [active, setActive] = useState(0);
  /**
   * Set by the first hover/focus/tap, and never unset.
   *
   * Deliberately permanent rather than "resume after N seconds idle". A row
   * that starts moving again while you are reading the panel you chose is
   * fighting you, and the auto-cycle's whole job — proving the section is
   * interactive — is already done the moment you interact with it.
   */
  const [engaged, setEngaged] = useState(false);
  const { reduce, dir } = useMotionConfig();

  const take = useCallback((i: number) => {
    setEngaged(true);
    setActive(i);
  }, []);

  useEffect(() => {
    // Reduced motion gets the first panel, held. An auto-advancing carousel is
    // exactly the vestibular trigger the preference exists to suppress.
    if (reduce || engaged) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % items.length),
      CYCLE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduce, engaged, items.length]);

  return (
    <div className="mt-[clamp(40px,5vw,64px)] flex flex-col gap-4 nav:h-[clamp(440px,62vh,600px)] nav:flex-row nav:gap-3">
      {items.map((item, i) => {
        const open = active === i;

        return (
          /*
            THE WIPE WRAPPER IS ALSO THE FLEX ITEM, and the widening is a CSS
            transition rather than a Framer animation because of it. Nesting an
            animated article inside a wrapper would put `flex-grow` on an
            element whose parent is the wrapper, not the row — it would have
            had no effect at all, and the panels would simply have stopped
            expanding. `flex-grow` is a transitionable property, so one styled
            div does both jobs and there is no second element to keep in sync.
          */
          <ClipReveal
            key={item.title}
            delay={i * 0.12}
            className="flex min-w-0 nav:h-full nav:basis-0"
            style={{
              flexGrow: reduce ? 1 : open ? 2.3 : 1,
              transition: `flex-grow 750ms ${easeCss.zoom}`,
            }}
          >
            <article
              onMouseEnter={() => take(i)}
              onFocus={() => take(i)}
              onPointerDown={() => take(i)}
              className="group relative isolate h-[340px] w-full min-w-0 overflow-hidden rounded-[var(--radius-card)] nav:h-full"
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
              {/*
                KEN BURNS, on its own element. It has to be a separate layer
                from the settle above because both are `scale` — put them on one
                element and the looping animation and the state transition
                overwrite each other, and the panel jitters every time the
                cycle ticks. Nested, they multiply, which is what depth is.

                Only the ACTIVE panel drifts. Three photographs all slowly
                zooming at once is aquarium screensaver; one drifting while two
                sit still is emphasis.
              */}
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={
                  reduce || !open
                    ? { scale: 1, x: "0%", y: "0%" }
                    : { scale: 1.08, x: `${1.5 * dir}%`, y: "-1.5%" }
                }
                transition={
                  reduce || !open
                    ? { duration: 1.2, ease: [...ease.zoom] }
                    : { duration: 9, ease: "linear", repeat: Infinity, repeatType: "reverse" }
                }
              >
                {/*
                  TODO(F-content): panel 3 has no photograph of its subject.

                  It is Engineering & Technical Services now, and it still
                  shows `categories[2]` — a furnished dining room, chosen back
                  when the panel was "Turnkey". Under a card about design
                  development and shop drawings that is a visible mismatch, and
                  it was not left here out of inattention: the entire
                  `/landing/` set is recoloured furniture-template interiors,
                  there is no drawing office, plant or production frame in it,
                  and the one architectural interior that would read closest is
                  already on this page in the gallery teaser — putting it here
                  would reproduce the duplicate-photo problem the client
                  raised. A wrong-but-unique photo beats the same photo twice.
                  The fix is a real photograph, which is a client dependency.
                  The `alt` describes the picture that is actually there.
                */}
                <Image
                  src={i === 1 ? mattressImages.homeCard : landingImages.categories[i]}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 860px) 100vw, 45vw"
                  className="object-cover"
                  style={{ filter: "var(--image-filter)" }}
                />
              </motion.div>
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
                {/*
                  A size that tops out below the h3 scale, because a collapsed
                  panel is roughly a fifth of the row. Clamping the size rather
                  than shortening the word is the version that survives an
                  Arabic translation being longer.

                  ⚠ `whitespace-nowrap` WAS HERE AND HAD TO GO. It was added
                  when the longest name was "Turnkey Projects" and the client
                  asked for the names to sit on one line; with two short words
                  that was a fine way to get it. The third division is
                  "Engineering & Technical Services" now, which cannot fit one
                  line of a fifth-width panel at any size a heading can be — so
                  `nowrap` stopped meaning "keep it on one line" and started
                  meaning "run it off the edge", and the panel's own
                  `overflow-hidden` cut it to "Engineering & Te".
                  `text-balance` splits what is left across even lines instead
                  of leaving one word stranded. The one-word names are
                  unaffected: a single word has nowhere to wrap.
                */}
                <h3
                  className="text-balance font-display font-bold leading-h3 tracking-display"
                  style={{
                    color: "var(--white-500)",
                    fontSize: "clamp(19px, 1.9vw, 28px)",
                  }}
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

                {/* No `max-w`. The panel is already the measure — capping the
                    body at 38ch inside a column that is often narrower than
                    that just guaranteed a stack of short lines with nothing
                    gained, which is what the client was pointing at. */}
                <p
                  className="mt-4 text-body-sm leading-body"
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
            </article>
          </ClipReveal>
        );
      })}
    </div>
  );
}
