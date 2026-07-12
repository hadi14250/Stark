import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { bedImages } from "./assets";
import {
  ArrowRightIcon,
  AwardIcon,
  MoveVerticalIcon,
  ScaleIcon,
  HandIcon,
  RefreshCwIcon,
  SunSnowIcon,
  LeafIcon,
  StethoscopeIcon,
  SunIcon,
  ThermometerSnowflakeIcon,
} from "./icons";

type Variant = "mattress" | "pillow" | "comforter";
type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Product block — one of Mattress / Pillow / Comforter. Anatomy from the
 * handoff: "STARK®" eyebrow, big title, muted paragraph, white "Learn more"
 * pill (arrow-right), then a row of spec chips (a line icon over a 12px label).
 *
 * Layout per variant:
 *  - mattress / comforter: image BLEEDS to the (end) edge, text in the centered
 *    gutter (46/54 split).
 *  - pillow: a contained 50/50 row with the image on the (start) side.
 *
 * The comp's numbered badges ("12 Year Guarantee", "11' Thickness", "5 Year")
 * were invented figures — replaced here with icon chips + neutral labels so no
 * fabricated number ships. TODO(F-facts): restore real warranty terms +
 * thickness once the client confirms them.
 */
const CHIP_ICONS: Record<Variant, Icon[]> = {
  mattress: [AwardIcon, MoveVerticalIcon, ScaleIcon, HandIcon, RefreshCwIcon, SunSnowIcon, LeafIcon],
  pillow: [AwardIcon, StethoscopeIcon, SunIcon, LeafIcon],
  comforter: [AwardIcon, StethoscopeIcon, SunIcon, LeafIcon, ThermometerSnowflakeIcon],
};

const PHOTO: Record<Variant, { src: string; w: number; h: number }> = {
  mattress: { src: bedImages.mattress, w: 1420, h: 1365 },
  pillow: { src: bedImages.pillow, w: 1070, h: 750 },
  comforter: { src: bedImages.comforter, w: 1560, h: 920 },
};

const INDEX: Record<Variant, number> = { mattress: 0, pillow: 1, comforter: 2 };

export async function MzProduct({ variant }: { variant: Variant }) {
  const t = await getTranslations("dreamzy.products");
  const items = t.raw("items") as {
    eyebrow: string;
    title: string;
    body: string;
    alt: string;
    chips: string[];
  }[];
  const item = items[INDEX[variant]];
  const icons = CHIP_ICONS[variant];
  const photo = PHOTO[variant];
  const cta = t("cta");
  const contained = variant === "pillow";

  const copy = (
    <Reveal y={28} className="w-full">
      <div className="text-[18px] font-semibold tracking-[0.3px] text-[color:var(--dz-label)] nav:text-[20px]">
        {item.eyebrow}
      </div>
      <h2 className="mt-0.5 font-display text-[40px] font-bold leading-[1.05] tracking-[-1px] text-[color:var(--dz-ink)] nav:mt-1 nav:text-[clamp(40px,4.3vw,60px)]">
        {item.title}
      </h2>
      <p className="mt-[18px] text-[15px] leading-[1.85] text-[color:var(--dz-muted)] nav:mt-6 nav:text-[16px] nav:leading-[1.9]">
        {item.body}
      </p>
      <Link
        href="/#contact"
        className="mt-[26px] flex w-full items-center justify-between gap-6 rounded-[40px] bg-white px-7 py-5 text-[16px] font-semibold text-[color:var(--dz-ink)] shadow-[0_16px_34px_rgba(0,0,0,0.09)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(0,0,0,0.15)] motion-reduce:hover:translate-y-0 nav:mt-8 nav:inline-flex nav:w-auto nav:justify-start nav:gap-12 nav:px-[34px] nav:py-[22px] nav:text-[17px] nav:shadow-[0_18px_40px_rgba(0,0,0,0.09)]"
      >
        {cta}
        <ArrowRightIcon width={22} height={22} strokeWidth={1.8} className="rtl:-scale-x-100 nav:h-6 nav:w-6" />
      </Link>
      <ul className="mt-[34px] flex flex-wrap justify-center gap-x-4 gap-y-[22px] nav:mt-[42px] nav:justify-start nav:gap-x-4 nav:gap-y-6">
        {item.chips.map((label, i) => {
          const Chip = icons[i];
          return (
            <li key={label} className="flex w-[66px] flex-col items-center gap-[9px] text-center">
              <span className="flex h-11 items-center justify-center">
                <Chip width={26} height={26} strokeWidth={1.7} className="text-[color:var(--dz-stroke)] nav:h-7 nav:w-7" />
              </span>
              <span className="text-[11px] leading-[1.3] text-[color:var(--dz-muted)] nav:text-[12px]">{label}</span>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );

  const photoEl = (
    <Image
      src={photo.src}
      alt={item.alt}
      width={photo.w}
      height={photo.h}
      sizes="(max-width: 860px) 100vw, 54vw"
      className="h-auto w-full"
    />
  );

  if (contained) {
    // Pillow — mobile: photo on top, then text. Desktop: contained 50/50 row
    // with the image on the start side.
    return (
      <section className="bg-[color:var(--dz-bg)]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center nav:flex-row nav:gap-10 nav:px-10 nav:py-[30px]">
          <div className="w-full nav:flex-1 nav:basis-1/2">{photoEl}</div>
          <div className="w-full px-6 pb-11 pt-5 nav:flex-1 nav:basis-1/2 nav:p-0">{copy}</div>
        </div>
      </section>
    );
  }

  // Mattress / Comforter — mobile: photo on top, then text (photo pulled ahead
  // with `order`). Desktop: image bleeds to the end edge; text padded to the
  // centered 1200px gutter. Comforter adds bottom padding to close the band.
  return (
    <section
      className={`overflow-hidden bg-[color:var(--dz-bg)] ${variant === "mattress" ? "pt-[14px] nav:pt-0" : ""} ${variant === "comforter" ? "pb-2 nav:pb-20" : ""}`}
    >
      <div className="flex flex-col items-center nav:flex-row nav:gap-[30px]">
        <div className="order-2 w-full px-6 pb-11 pt-5 nav:order-1 nav:w-auto nav:flex-1 nav:basis-[46%] nav:py-[70px] nav:ps-[max(40px,calc((100%-1200px)/2+40px))] nav:pe-5">
          {copy}
        </div>
        <div className="order-1 w-full min-w-0 nav:order-2 nav:flex-1 nav:basis-[54%]">{photoEl}</div>
      </div>
    </section>
  );
}
