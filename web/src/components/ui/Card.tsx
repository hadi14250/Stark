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
    <div className="flex h-full flex-col rounded-[50px] border border-dashed border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] p-[25px] shadow-[0_16px_35px_0_rgba(0,0,0,0.10),0_63px_63px_0_rgba(0,0,0,0.09),0_143px_86px_0_rgba(0,0,0,0.05)]">
      <div className="relative aspect-[310/286] w-full overflow-hidden rounded-[40px]">
        <Image src={image} alt={alt} fill className="object-cover" sizes={sizes} />
      </div>
      <div className="flex flex-1 flex-col items-center gap-3 px-2 pb-2 pt-8 text-center">
        <h3 className="font-display text-base font-bold text-[color:var(--color-ink)]">
          {title}
        </h3>
        {body ? (
          <p className="text-xs leading-5 text-[color:var(--color-ink-body)]">
            {body}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
