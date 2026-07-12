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
    <div className="bg-white p-[clamp(24px,2.6vw,44px)] pb-[clamp(30px,3.4vw,58px)] shadow-[0_30px_60px_rgba(0,0,0,0.10)] nav:absolute nav:start-[9.5%] nav:top-[5.2%] nav:w-[33.2%] nav:min-h-[73%]">
      <h2 className="font-display text-[clamp(22px,2.86vw,40px)] font-bold leading-[1.12] tracking-[-0.5px] text-[color:var(--dz-ink)]">
        {t("title")}
      </h2>
      <div className="mt-[clamp(16px,2vw,26px)] text-[clamp(17px,1.85vw,26px)] font-semibold text-[color:var(--dz-teal)]">
        {t("save")}
      </div>
      <Link
        href="/#contact"
        className="mt-[clamp(22px,2.6vw,34px)] inline-flex items-center gap-10 rounded-[40px] bg-[color:var(--dz-teal)] px-[30px] py-[18px] text-[16px] font-semibold text-white transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,120,100,0.35)] motion-reduce:hover:translate-y-0"
      >
        {t("cta")}
        <ArrowRightIcon width={22} height={22} strokeWidth={1.9} className="rtl:-scale-x-100" />
      </Link>
    </div>
  );

  return (
    <section className="relative overflow-hidden">
      <Image
        src={bedImages.buyset}
        alt={t("alt")}
        width={2800}
        height={1420}
        sizes="100vw"
        className="hidden h-auto w-full nav:block"
      />
      {/* Desktop: card floats over the photo. */}
      <div className="absolute inset-0 hidden nav:block">{card}</div>
      {/* Mobile: photo then a full-width card. */}
      <div className="nav:hidden">
        <Image
          src={bedImages.buyset}
          alt={t("alt")}
          width={2800}
          height={1420}
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="px-6 py-8">{card}</div>
      </div>
    </section>
  );
}
