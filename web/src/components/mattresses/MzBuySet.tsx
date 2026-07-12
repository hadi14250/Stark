import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { bedImages } from "./assets";
import { ArrowRightIcon } from "./icons";

/**
 * "Buy a set" — a full-bleed lifestyle photo with a white overlay card. On
 * desktop the card is absolutely positioned over the photo (left 9.5% / top 5.2%
 * / width 33.2%, per the handoff); on mobile the photo stacks above a full-width
 * card so the copy stays readable. Teal "Explore sets" CTA.
 */
export async function MzBuySet() {
  const t = await getTranslations("dreamzy.buyset");

  const card = (
    <div className="relative bg-white p-[30px] pb-[34px] shadow-[0_26px_50px_rgba(0,0,0,0.12)] nav:absolute nav:start-[9.5%] nav:top-[5.2%] nav:w-[33.2%] nav:min-h-[73%] nav:p-[clamp(24px,2.6vw,44px)] nav:pb-[clamp(30px,3.4vw,58px)] nav:shadow-[0_30px_60px_rgba(0,0,0,0.10)]">
      <h2 className="font-display text-[27px] font-bold leading-[1.14] tracking-[-0.5px] text-[color:var(--dz-ink)] nav:text-[clamp(22px,2.86vw,40px)] nav:leading-[1.12]">
        {t("title")}
      </h2>
      <div className="mt-[18px] text-[21px] font-semibold text-[color:var(--dz-teal)] nav:mt-[clamp(16px,2vw,26px)] nav:text-[clamp(17px,1.85vw,26px)]">
        {t("save")}
      </div>
      <Link
        href="/#contact"
        className="mt-6 flex w-full items-center justify-between gap-6 rounded-[40px] bg-[color:var(--dz-teal)] px-7 py-[18px] text-[16px] font-semibold text-white transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,120,100,0.35)] motion-reduce:hover:translate-y-0 nav:mt-[clamp(22px,2.6vw,34px)] nav:inline-flex nav:w-auto nav:justify-start nav:gap-10 nav:px-[30px]"
      >
        {t("cta")}
        <ArrowRightIcon width={22} height={22} strokeWidth={1.9} className="rtl:-scale-x-100" />
      </Link>
    </div>
  );

  return (
    <section className="relative overflow-hidden bg-[color:var(--dz-bg)] pb-12 nav:bg-transparent nav:pb-0">
      {/* Desktop: full photo with the card floating over it. */}
      <Image
        src={bedImages.buyset}
        alt={t("alt")}
        width={2800}
        height={1420}
        sizes="100vw"
        className="hidden h-auto w-full nav:block"
      />
      <div className="absolute inset-0 hidden nav:block">{card}</div>
      {/* Mobile: card-free crop then a card pulled up over the photo's bottom. */}
      <div className="nav:hidden">
        <Image
          src={bedImages.buysetMobile}
          alt={t("alt")}
          width={1560}
          height={1420}
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="mx-[22px] -mt-14">{card}</div>
      </div>
    </section>
  );
}
