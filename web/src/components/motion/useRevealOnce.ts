"use client";

import { useEffect, useRef } from "react";

/**
 * Adds `is-revealed` to an element the first time it enters the viewport.
 *
 * THIS IS THE WHOLE REVEAL MECHANISM NOW, and it is deliberately the least
 * powerful thing that does the job. It cannot hide anything. It has one effect
 * on the DOM — adding a class — and the class only ever turns an animation ON
 * (see reveal.css, where every base class is empty and the hidden pose exists
 * solely inside a keyframe's `from`).
 *
 * That constraint is the point. The previous mechanism computed a "play signal"
 * from an entrance gate, a reduced-motion flag, a fail-safe timer and a
 * viewport observer, and the element held a hidden state until all four agreed.
 * Any one of them failing meant permanently invisible content, which is how
 * this site shipped blank sections three times for three different reasons.
 * Here, every one of those failures degrades to "no animation".
 *
 * `once` semantics: the observer stops watching an element as soon as it fires,
 * so nothing re-animates on scroll-back and the observer set shrinks as the
 * reader moves down the page.
 */
export function useRevealOnce<T extends HTMLElement = HTMLDivElement>(options?: {
  /** Fraction of the element that must be visible. Default 0.2. */
  amount?: number;
}) {
  const ref = useRef<T>(null);
  const amount = options?.amount ?? 0.2;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer at all (very old browser, some test environments): leave the
    // element in its visible base state. Never a reason to hide something.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-revealed");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      },
      { threshold: amount },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  return ref;
}
