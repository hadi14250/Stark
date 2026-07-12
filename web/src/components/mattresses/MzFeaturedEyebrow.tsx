import { getTranslations } from "next-intl/server";

/**
 * Featured-products eyebrow — on the #f2f2f2 band: a centered 54×3px mint rule
 * over the "FEATURED PRODUCTS" label (15px, weight 700, letter-spacing 3.5px).
 */
export async function MzFeaturedEyebrow() {
  const t = await getTranslations("dreamzy");

  return (
    <section className="bg-[color:var(--dz-bg)] px-6 pb-2 pt-[52px] nav:px-0 nav:pb-10 nav:pt-[70px]">
      <div className="text-center">
        <div className="mx-auto mb-[18px] h-[3px] w-[50px] rounded-[2px] bg-[color:var(--dz-green)] nav:mb-[22px] nav:w-[54px]" />
        <div className="text-[13px] font-bold uppercase tracking-[3px] text-[color:var(--dz-ink)] nav:text-[15px] nav:tracking-[3.5px]">
          {t("featuredEyebrow")}
        </div>
      </div>
    </section>
  );
}
