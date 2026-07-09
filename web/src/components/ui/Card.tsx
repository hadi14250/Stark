import type { ReactNode } from "react";
import Image from "next/image";

/**
 * Cream content card matching the design's category/news cards:
 * radius-50 surface (--color-surface-2), 1px dashed hairline (--color-line),
 * layered soft drop shadow, with an inset image (25px inset, radius-40,
 * object-cover). Presentational + server-safe. Used by the Categories carousel.
 *
 * The image uses next/image `fill`, so the image box sets its own aspect ratio.
 */
export function Card({
  image,
  alt,
  title,
  body,
  sizes = "(max-width: 860px) 90vw, 360px",
  children,
}: {
  image: string;
  alt: string;
  title: string;
  body?: string;
  sizes?: string;
  /** Optional footer slot (e.g. a "View" link). */
  children?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-[44px] border border-dashed border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] p-[22px] shadow-[0_26px_40px_-20px_rgba(28,60,45,0.28)] nav:rounded-[50px] nav:p-[25px] nav:shadow-[0_16px_35px_0_rgba(0,0,0,0.10),0_63px_63px_0_rgba(0,0,0,0.09),0_143px_86px_0_rgba(0,0,0,0.05)]">
      <div className="relative h-[210px] w-full overflow-hidden rounded-[34px] nav:aspect-[310/286] nav:h-auto nav:rounded-[40px]">
        <Image src={image} alt={alt} fill className="object-cover" sizes={sizes} />
      </div>
      <div className="flex flex-1 flex-col items-center gap-2.5 px-2 pb-1.5 pt-[22px] text-center nav:gap-3 nav:pb-2 nav:pt-8">
        <h3 className="font-display text-[17px] font-bold text-[color:var(--color-ink)] nav:text-base">
          {title}
        </h3>
        {body ? (
          <p className="text-[13px] leading-[21px] text-[color:var(--color-ink-body)] nav:text-xs nav:leading-5">
            {body}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
