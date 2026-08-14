"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { isCutout } from "@/components/mattresses/assets";

export type Product = { label: string; body: string };

/**
 * The eight product types from the company profile's p15, as a strip you push
 * sideways — and, since the client asked for "a very nice creative animation
 * here", a strip that responds to being pushed.
 *
 * ===========================================================================
 * THE ANIMATION IS DRIVEN BY THE STRIP'S OWN SCROLL, NOT BY THE PAGE'S
 * ===========================================================================
 *
 * That is the whole design, and it is what makes this feel like a mechanism
 * rather than a decoration. Each card knows how far it is from the centre of
 * the viewport-width track, and three things follow from that one number:
 *
 *   the photograph counter-drifts inside its frame, so the image moves
 *     against the card and the card gains depth instead of sliding as a flat
 *     tile;
 *   the card lifts and its ordinal goes from ghost to solid sand as it
 *     reaches centre, so the strip has a focus rather than eight equal cards;
 *   the sand rule under the active caption grows, so there is one unambiguous
 *     "this one" at any moment.
 *
 * Because the input is `scrollLeft`, every way of moving the strip drives it:
 * a swipe, a trackpad, a shift-wheel, a keyboard tab that scrolls a card into
 * view. A carousel script would have had to re-implement each of those and
 * would still have broken the native scroll-snap.
 *
 * ===========================================================================
 * WHAT IT MUST NOT DO
 * ===========================================================================
 *
 * 1. IT MUST NOT HIDE ANYTHING. Every card is fully legible at rest: the
 *    animation only adds emphasis. The resting state is `--p: 0`, which is a
 *    perfectly readable card, so a browser with no JS, a dead rAF or a
 *    reduced-motion preference all land on a plain scroll-snap row — which is
 *    exactly what this component was before the animation.
 * 2. IT MUST NOT FIGHT SCROLL-SNAP. Everything animated is a transform or an
 *    opacity on the card's CONTENTS; the flex item's own box never moves, so
 *    the snap positions the browser computed stay correct.
 * 3. IT MUST NOT COST A LAYOUT PASS PER FRAME. One `getBoundingClientRect` per
 *    card per rAF, batched in a single read loop before any write, and the
 *    listener unsubscribes the moment the strip leaves the viewport.
 */
export function ProductStrip({
  items,
  images,
  alt,
}: {
  items: Product[];
  images: readonly string[];
  /**
   * ONE alt for the whole set, and it is deliberately vague.
   *
   * It says what is in the frame and nothing more. It does NOT name the product
   * from the caption: a shared alt reading "a fire-rated door" would state, to
   * exactly the readers who cannot check, that the factory's own work is on
   * screen.
   *
   * TODO(F-content): eight real product photographs. p15 lists eight types and
   * `/landing/` holds six recoloured domestic interiors, so the strip currently
   * repeats two of them — and no ordering fixes a set that contains no door, no
   * pergola and no retail podium. This is the client photo folder's job.
   */
  alt: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const cardsRef = useRef<(HTMLLIElement | null)[]>([]);
  const { reduce } = useMotionConfig();
  const [ready, setReady] = useState(false);

  /**
   * Write each card's distance-from-centre as a custom property.
   *
   * `--p` is 1 at the centre of the track and falls to 0 at one card-width
   * away. Everything visual is expressed in CSS against that single number, so
   * this function stays a measurement and the design stays in the stylesheet.
   */
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const box = track.getBoundingClientRect();
    const mid = box.left + box.width / 2;
    // READ PASS — every rect first, so no write can invalidate a later read.
    const rects = cardsRef.current.map((el) => el?.getBoundingClientRect());
    // WRITE PASS.
    rects.forEach((r, i) => {
      const el = cardsRef.current[i];
      if (!el || !r) return;
      const d = Math.abs(r.left + r.width / 2 - mid);
      const p = Math.max(0, 1 - d / Math.max(r.width, 1));
      el.style.setProperty("--p", p.toFixed(3));
    });
  }, []);

  useEffect(() => {
    if (reduce) return;
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
    };

    /**
     * Only listen while the strip is on screen.
     *
     * The window scroll listener is what makes the effect respond to the PAGE
     * moving as well as the strip, and it would otherwise run on every scroll
     * of every part of a long document to animate something nobody can see.
     */
    let live = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === live) return;
        live = entry.isIntersecting;
        if (live) {
          window.addEventListener("scroll", schedule, { passive: true });
          schedule();
        } else {
          window.removeEventListener("scroll", schedule);
        }
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(track);

    track.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    // `ready` gates the CSS on, so the first paint is the plain resting state
    // and the emphasis only ever arrives — it never has to be undone.
    setReady(true);
    schedule();

    return () => {
      io.disconnect();
      track.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [measure, reduce]);

  return (
    <ul
      ref={trackRef}
      className={`ww-strip mt-[clamp(28px,4vw,52px)] ${ready ? "is-live" : ""}`}
    >
      {items.map((m, i) => {
        const src = images[i % images.length];
        return (
          <li
            key={m.label}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className="ww-card"
          >
            <figure className="flex h-full flex-col">
              <div className="ww-card-frame">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(max-width: 860px) 60vw, 320px"
                  className={isCutout(src) ? "object-contain" : "object-cover"}
                  style={{ filter: "var(--image-filter)" }}
                />
              </div>
              <figcaption className="ww-card-caption">
                <span className="flex items-baseline gap-2.5">
                  <span className="ww-card-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-h4 font-semibold text-[color:var(--color-ink)]">
                    {m.label}
                  </span>
                </span>
                <span className="mt-2 block text-body-sm leading-body text-[color:var(--color-ink-body)]">
                  {m.body}
                </span>
                <span aria-hidden className="ww-card-rule" />
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
