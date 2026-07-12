"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { bedImages } from "./assets";
import { StarIcon, ArrowLeftIcon, ArrowRightIcon } from "./icons";

type Quote = { quote: string; author: string };

/**
 * Testimonial — a full-bleed customer photo with a teal overlay card (large
 * decorative quote glyph, 5 amber stars, italic quote, avatar + author, and
 * prev/next controls). Auto-rotates through the quotes every 6s; prev/next step
 * manually. Rotation pauses under reduced motion. On mobile the card stacks over
 * the photo full-width.
 *
 * TODO(F-facts): quotes are clearly-marked placeholders + a stock avatar until
 * the client supplies real, approved customer testimonials and photos.
 */
export function MzTestimonial() {
  const t = useTranslations("dreamzy.testimonial");
  const quotes = t.raw("items") as Quote[];
  const { reduce } = useMotionConfig();
  const [i, setI] = useState(0);

  const go = useCallback(
    (d: number) => setI((v) => (v + d + quotes.length) % quotes.length),
    [quotes.length],
  );

  useEffect(() => {
    if (reduce || quotes.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % quotes.length), 6000);
    return () => clearInterval(id);
  }, [reduce, quotes.length]);

  const active = quotes[i];

  const card = (
    <div className="flex flex-col bg-[color:var(--dz-teal)] p-[clamp(24px,2.8vw,44px)] pb-[clamp(20px,2.4vw,38px)] shadow-[0_30px_60px_rgba(0,0,0,0.14)] nav:absolute nav:start-[9.5%] nav:top-[5.3%] nav:h-[87.6%] nav:w-[34%]">
      <div className="font-serif text-[clamp(80px,9vw,120px)] leading-[0.7] text-white" aria-hidden>
        &ldquo;
      </div>
      <div className="mt-[22px] flex gap-1.5">
        {Array.from({ length: 5 }).map((_, s) => (
          <StarIcon key={s} width={22} height={22} fill="var(--dz-yellow)" stroke="none" />
        ))}
      </div>
      <p className="mt-[22px] text-[clamp(16px,1.7vw,24px)] italic leading-[1.5] text-white">
        {active.quote}
      </p>
      <div className="mt-7 flex items-center gap-4">
        <Image
          src={bedImages.avatar}
          alt={active.author}
          width={56}
          height={56}
          className="h-14 w-14 rounded-full border-2 border-white object-cover"
        />
        <span className="text-[18px] font-bold text-white">{active.author}</span>
      </div>
      <div className="mt-auto flex gap-5 pt-[26px]">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={t("prev")}
          className="flex h-[50px] w-[50px] items-center justify-center rounded-full border-[1.5px] border-white/55 text-white/75 transition-colors hover:text-white"
        >
          <ArrowLeftIcon width={22} height={22} strokeWidth={1.8} className="rtl:-scale-x-100" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label={t("next")}
          className="flex h-[50px] w-[50px] items-center justify-center rounded-full border-[1.5px] border-white text-white"
        >
          <ArrowRightIcon width={22} height={22} strokeWidth={1.8} className="rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden">
      {/* Desktop: photo with the card floating over it. */}
      <div className="relative hidden nav:block">
        <Image
          src={bedImages.testimonial}
          alt=""
          width={2800}
          height={1650}
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="absolute inset-0">{card}</div>
      </div>
      {/* Mobile: photo then full-width card. */}
      <div className="nav:hidden">
        <Image
          src={bedImages.testimonial}
          alt=""
          width={2800}
          height={1650}
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="px-6 py-8">{card}</div>
      </div>
    </section>
  );
}
