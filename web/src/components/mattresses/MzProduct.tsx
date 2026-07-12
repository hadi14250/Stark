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
      <div className="text-[20px] font-semibold tracking-[0.3px] text-[color:var(--dz-label)]">
        {item.eyebrow}
      </div>
      <h2 className="mt-1 font-display text-[clamp(40px,4.3vw,60px)] font-bold leading-[1.05] tracking-[-1px] text-[color:var(--dz-ink)]">
        {item.title}
      </h2>
      <p className="mt-6 text-[16px] leading-[1.9] text-[color:var(--dz-muted)]">{item.body}</p>
      <Link
        href="/#contact"
        className="mt-8 inline-flex items-center gap-12 rounded-[40px] bg-white px-[34px] py-[22px] text-[17px] font-semibold text-[color:var(--dz-ink)] shadow-[0_18px_40px_rgba(0,0,0,0.09)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(0,0,0,0.15)] motion-reduce:hover:translate-y-0"
      >
        {cta}
        <ArrowRightIcon width={24} height={24} strokeWidth={1.8} className="rtl:-scale-x-100" />
      </Link>
      <ul className="mt-[42px] flex flex-wrap gap-x-4 gap-y-6">
        {item.chips.map((label, i) => {
          const Chip = icons[i];
          return (
            <li key={label} className="flex w-16 flex-col items-center gap-[9px] text-center">
              <span className="flex h-[46px] items-center justify-center">
                <Chip width={28} height={28} strokeWidth={1.7} className="text-[color:var(--dz-stroke)]" />
              </span>
              <span className="text-[12px] leading-[1.3] text-[color:var(--dz-muted)]">{label}</span>
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
    // Pillow — contained 50/50, image on the start side.
    return (
      <section className="bg-[color:var(--dz-bg)]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-10 px-6 py-[30px] nav:flex-row nav:gap-10 nav:px-10">
          <div className="w-full nav:flex-1 nav:basis-1/2">{photoEl}</div>
          <div className="w-full nav:flex-1 nav:basis-1/2">{copy}</div>
        </div>
      </section>
    );
  }

  // Mattress / Comforter — image bleeds to the end edge; text padded to the
  // centered 1200px gutter. Comforter adds bottom padding to close the band.
  return (
    <section className={`overflow-hidden bg-[color:var(--dz-bg)] ${variant === "comforter" ? "pb-20" : ""}`}>
      <div className="flex flex-col items-center gap-8 nav:flex-row nav:gap-[30px]">
        <div className="w-full px-6 py-[30px] nav:w-auto nav:flex-1 nav:basis-[46%] nav:py-[70px] nav:ps-[max(40px,calc((100%-1200px)/2+40px))] nav:pe-5">
          {copy}
        </div>
        <div className="w-full min-w-0 nav:flex-1 nav:basis-[54%]">{photoEl}</div>
      </div>
    </section>
  );
}
