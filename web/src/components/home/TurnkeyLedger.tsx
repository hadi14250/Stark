"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { DrawLine } from "@/components/motion/reveals";
import { useMotionConfig } from "@/components/motion/useMotionConfig";

export type LedgerItem = { title: string; body: string; image: string; alt: string };

/**
 * The turnkey ledger: four numbered rows, and the two devices that make it a
 * section rather than a list.
 *
 * THE COMPLAINT THIS ANSWERS was that the section is "simple" — and it was
 * literally true. Four rows, each fading up once on entry, with a hover
 * underline. Everything else about it was static, in a dark band where static
 * reads as heavy.
 *
 *   1. THE ROW FILLS WITH ITS OWN WORK. Hovering a row wipes its photograph in
 *      from the reading edge across the full width of the row, behind a scrim,
 *      while the image settles out of a slight over-scale and the numeral goes
 *      solid. The whole row is the target and the motion belongs to it.
 *
 *      This replaced a card that followed the cursor. That version was
 *      rejected, correctly: a cursor-tracked card belongs to the POINTER
 *      rather than to the layout, so it reads as a widget stuck on top of the
 *      page instead of the page responding — and it cannot exist on touch at
 *      all, which made it a device half the traffic never saw. See ledger.css.
 *
 *   2. THE NUMERALS FILL AS YOU SCROLL. Each ghost ordinal is scrubbed from
 *      barely-there to full sand across the band around the viewport's middle,
 *      so the column lights up progressively under the reader rather than all
 *      at once at a trigger point. Scrubbed, not triggered — that distinction
 *      is the whole difference between a page that responds to scrolling and a
 *      page that occasionally reacts to it.
 *
 * TOUCH GETS THE PHOTOGRAPH TOO, as a real thumbnail inside the row. The hover
 * layer is gated on `(hover: hover)` in CSS and the thumbnail is hidden above
 * the same breakpoint, so exactly one of the two is ever present. Same
 * information, delivered the way the input method allows — not a feature that
 * silently does not exist on half the traffic.
 */
export function TurnkeyLedger({ items }: { items: LedgerItem[] }) {
  const { reduce } = useMotionConfig();

  return (
    <div className="relative mt-[clamp(44px,6vw,72px)]">
      <ol>
        {items.map((item, i) => (
          <LedgerRow key={item.title} item={item} index={i} reduce={reduce} />
        ))}
      </ol>
    </div>
  );
}

function LedgerRow({
  item,
  index,
  reduce,
}: {
  item: LedgerItem;
  index: number;
  reduce: boolean;
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
      className="ledger-row group relative isolate grid items-baseline gap-x-6 gap-y-3 px-[clamp(0px,1.5vw,28px)] py-7 transition-[padding] duration-500 nav:grid-cols-[auto_minmax(0,22ch)_minmax(0,1fr)] nav:py-10 nav:hover:px-[clamp(12px,2.2vw,36px)]"
      style={{
        // Each row steps further in, so the column reads as a descent rather
        // than a stack.
        marginInlineStart: `calc(${index} * clamp(0px, 2.2vw, 34px))`,
      }}
    >
      {/* THE PHOTOGRAPH, behind everything. Its resting state is wiped away,
          which is also the section's correct resting state — the row reads
          perfectly with no image at all, so nothing here can cost content. */}
      <div aria-hidden className="ledger-photo">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 860px) 0px, 100vw"
          className="object-cover"
          style={{ filter: "var(--image-filter)" }}
        />
        {/* Fixed dark green rather than a theme role: it exists to guarantee
            the copy stays legible over an unknown photograph, so it must not
            re-point when a theme does. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgb(12 26 19 / 0.94) 0%, rgb(12 26 19 / 0.86) 45%, rgb(12 26 19 / 0.62) 100%)",
          }}
        />
      </div>

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
        className="font-mono text-[clamp(30px,4vw,52px)] font-light leading-none tabular-nums transition-opacity duration-500 nav:group-hover:!opacity-100"
        style={{
          color: "var(--color-accent)",
          // Reduced motion gets the lit state outright: the scrub is the
          // effect, and without it a permanently 20%-opacity numeral is just a
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

        {/* THE TOUCH HALF OF THE DEVICE. Not a fallback — the same photograph
            the hover fill uses, placed where a thumb can see it without
            chasing anything. Hidden above `nav:` precisely so the two are
            never both present. */}
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

      {/* The sand rule under a row, drawn on hover. Kept from the previous
          version: it is the cheapest possible confirmation that the row is
          the thing responding. */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100 motion-reduce:transition-none rtl:origin-right"
        style={{ background: "var(--color-accent)" }}
      />
    </li>
  );
}
