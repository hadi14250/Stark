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
    <div className="flex flex-col bg-[color:var(--dz-teal)] p-[28px] pb-[30px] shadow-[0_26px_50px_rgba(0,0,0,0.16)] nav:absolute nav:start-[9.5%] nav:top-[5.3%] nav:h-[87.6%] nav:w-[34%] nav:p-[clamp(24px,2.8vw,44px)] nav:pb-[clamp(20px,2.4vw,38px)] nav:shadow-[0_30px_60px_rgba(0,0,0,0.14)]">
      <div className="h-[58px] font-serif text-[96px] leading-[0.7] text-white nav:h-auto nav:text-[clamp(80px,9vw,120px)]" aria-hidden>
        &ldquo;
      </div>
      <div className="mt-[18px] flex gap-1.5 nav:mt-[22px]">
        {Array.from({ length: 5 }).map((_, s) => (
          <StarIcon key={s} width={20} height={20} fill="var(--dz-yellow)" stroke="none" className="nav:h-[22px] nav:w-[22px]" />
        ))}
      </div>
      <p className="mt-[18px] text-[18px] italic leading-[1.5] text-white nav:mt-[22px] nav:text-[clamp(16px,1.7vw,24px)]">
        {active.quote}
      </p>
      <div className="mt-6 flex items-center gap-3.5 nav:mt-7 nav:gap-4">
        <Image
          src={bedImages.avatar}
          alt={active.author}
          width={56}
          height={56}
          className="h-[52px] w-[52px] rounded-full border-2 border-white object-cover nav:h-14 nav:w-14"
        />
        <span className="text-[17px] font-bold text-white nav:text-[18px]">{active.author}</span>
      </div>
      <div className="mt-7 flex gap-4 nav:mt-auto nav:gap-5 nav:pt-[26px]">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={t("prev")}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-full border-[1.5px] border-white/55 text-white/75 transition-colors hover:text-white nav:h-[50px] nav:w-[50px]"
        >
          <ArrowLeftIcon width={20} height={20} strokeWidth={1.8} className="rtl:-scale-x-100 nav:h-[22px] nav:w-[22px]" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label={t("next")}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-full border-[1.5px] border-white text-white nav:h-[50px] nav:w-[50px]"
        >
          <ArrowRightIcon width={20} height={20} strokeWidth={1.8} className="rtl:-scale-x-100 nav:h-[22px] nav:w-[22px]" />
        </button>
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden bg-white pb-11 nav:pb-0">
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
      {/* Mobile: card-free crop then a card pulled up over the photo's bottom. */}
      <div className="nav:hidden">
        <Image
          src={bedImages.testimonialMobile}
          alt=""
          width={1540}
          height={1650}
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="mx-[22px] -mt-[60px]">{card}</div>
      </div>
    </section>
  );
}
