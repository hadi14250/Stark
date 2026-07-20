"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { DrawLine } from "@/components/motion/reveals";
import { useMediaQuery } from "@/components/motion/useMediaQuery";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { ease } from "@/styles/tokens";

export type LedgerItem = { title: string; body: string; image: string; alt: string };

/** Preview card size, px. Big enough to read as a photograph, small enough not
 *  to become the thing you are looking at instead of the row. */
const CARD_W = 190;
const CARD_H = 138;

/**
 * The turnkey ledger: four numbered rows, and the two devices that make it a
 * section rather than a list.
 *
 * THE COMPLAINT THIS ANSWERS was that the section is "simple" — and it was
 * literally true. Four rows, each fading up once on entry, with a hover
 * underline. Everything else about it was static, in a dark band where static
 * reads as heavy. The fix is not more decoration; it is giving the rows two
 * things to do:
 *
 *   1. THE NUMERALS FILL AS YOU SCROLL. Each ghost ordinal is scrubbed from
 *      barely-there to full sand across the band around the viewport's middle,
 *      so the column lights up progressively under the reader rather than all
 *      at once at a trigger point. Scrubbed, not triggered — the distinction
 *      is the whole difference between a page that responds to scrolling and a
 *      page that occasionally reacts to it.
 *
 *   2. THE ROW UNDER THE POINTER SUMMONS ITS PHOTOGRAPH. A card follows the
 *      cursor on a spring, showing the work that row describes. This is the
 *      section's bespoke device — nothing else on the page tracks the pointer
 *      — and it is what turns four lines of copy into four projects.
 *
 * THE PREVIEW IS DESKTOP-POINTER-ONLY, and the phone is not left with the
 * static version as a consolation. `(pointer: fine)` gates it, because a card
 * that follows a finger is a card underneath the finger; below `nav:` each row
 * carries the same photograph as a real thumbnail in the row itself. Same
 * information, delivered the way the input method allows — not a feature that
 * silently does not exist on half the traffic.
 *
 * The card is `aria-hidden` and mirrors nothing that is not already in the
 * row's text, so assistive tech and keyboard users lose nothing by never
 * triggering it.
 */
export function TurnkeyLedger({ items }: { items: LedgerItem[] }) {
  const { reduce, dir } = useMotionConfig();
  const [hovered, setHovered] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // A coarse pointer gets no preview at all — see the docblock. Read as
  // external state rather than mirrored into an effect, so it is correct on
  // the first paint instead of one render later.
  const pointerFine = useMediaQuery("(pointer: fine)");
  const canPreview = pointerFine && !reduce;

  // Raw pointer position, then a spring: an unsprung card is welded to the
  // cursor and reads as part of it, while a lagging one reads as an object
  // being led around. The lag IS the effect.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const x = useSpring(px, { stiffness: 320, damping: 34, mass: 0.6 });
  const y = useSpring(py, { stiffness: 320, damping: 34, mass: 0.6 });

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      const box = wrapRef.current?.getBoundingClientRect();
      if (!box) return;
      // Offset so the card hangs below-and-ahead of the cursor rather than
      // under it. `dir` flips which side "ahead" is, or the card sits off the
      // start edge of the page in Arabic.
      px.set(e.clientX - box.left + 22 * dir - (dir === -1 ? CARD_W : 0));
      py.set(e.clientY - box.top + 20);
    },
    [px, py, dir],
  );

  const active = hovered !== null ? items[hovered] : null;

  return (
    <div
      ref={wrapRef}
      className="relative mt-[clamp(44px,6vw,72px)]"
      onPointerMove={canPreview ? onMove : undefined}
      onPointerLeave={() => setHovered(null)}
    >
      <ol>
        {items.map((item, i) => (
          <LedgerRow
            key={item.title}
            item={item}
            index={i}
            reduce={reduce}
            onEnter={canPreview ? () => setHovered(i) : undefined}
          />
        ))}
      </ol>

      {canPreview && (
        <AnimatePresence>
          {active && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-10 overflow-hidden rounded-[var(--radius-image)]"
              style={{
                x,
                y,
                width: CARD_W,
                height: CARD_H,
                boxShadow: "var(--shadow-card)",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.28, ease: [...ease.zoom] }}
            >
              {/* Keyed on the source so switching rows crossfades the picture
                  instead of the card jumping between two different images with
                  no transition at all. Default (sync) mode on purpose: both
                  layers are absolutely positioned and stacked, so outgoing and
                  incoming overlap — which IS the crossfade. */}
              <AnimatePresence>
                <motion.div
                  key={active.image}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={active.image}
                    alt=""
                    fill
                    sizes={`${CARD_W}px`}
                    className="object-cover"
                    style={{ filter: "var(--image-filter)" }}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

function LedgerRow({
  item,
  index,
  reduce,
  onEnter,
}: {
  item: LedgerItem;
  index: number;
  reduce: boolean;
  onEnter?: () => void;
}) {
  const ref = useRef<HTMLLIElement>(null);

  // "start 90%" → "start 35%": the fill completes as the row reaches the upper
  // third, which is where it is being read. Mapping across the whole transit
  // instead would leave every visible row half-lit and only finish them on
  // their way off the top of the screen.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "start 35%"],
  });
  // The floor is 0.2 rather than 0: a scrubbed value has no fail-safe, so if
  // scroll progress were ever stuck at 0 the numeral has to still read as a
  // deliberately ghosted ordinal rather than as a missing one. Nothing on this
  // site is allowed to depend on an animation running in order to be visible.
  const opacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);

  return (
    <li
      ref={ref}
      onPointerEnter={onEnter}
      className="group relative grid items-baseline gap-x-6 gap-y-3 py-7 nav:grid-cols-[auto_minmax(0,22ch)_minmax(0,1fr)] nav:py-9"
      style={{
        // Each row steps further in, so the column reads as a descent rather
        // than a stack.
        paddingInlineStart: `calc(${index} * clamp(0px, 2.2vw, 34px))`,
      }}
    >
      {/* The row's top rule DRAWS ITSELF in rather than being a border that is
          simply there. Staggered by row, so the ledger rules itself off top to
          bottom as it arrives. */}
      <DrawLine
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--color-line)" }}
        delay={index * 0.09}
      />

      <motion.span
        aria-hidden
        className="font-mono text-[clamp(30px,4vw,52px)] font-light leading-none tabular-nums"
        style={{
          color: "var(--color-accent)",
          // Reduced motion gets the lit state outright: the scrub is the
          // effect, and without it a permanently 16%-opacity numeral is just a
          // hard-to-read numeral.
          opacity: reduce ? 1 : opacity,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </motion.span>

      <h3 className="font-display text-h3 font-semibold leading-h3 tracking-display text-[color:var(--color-ink)]">
        {item.title}
      </h3>

      <div className="flex flex-col gap-4">
        <p className="text-body leading-body text-[color:var(--color-ink-body)]">
          {item.body}
        </p>

        {/* THE MOBILE HALF OF THE PREVIEW. Not a fallback — the same photograph
            the desktop card shows, placed where a thumb can see it without
            chasing anything. Hidden above `nav:` precisely so the two are never
            both present. */}
        <div className="relative h-[132px] w-full overflow-hidden rounded-[var(--radius-image)] nav:hidden">
          <Image
            src={item.image}
            alt={item.alt}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ filter: "var(--image-filter)" }}
          />
        </div>
      </div>

      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100 motion-reduce:transition-none"
        style={{ background: "var(--color-accent)" }}
      />
    </li>
  );
}
