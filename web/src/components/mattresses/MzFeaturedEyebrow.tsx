import { getTranslations } from "next-intl/server";

/**
 * Featured-products eyebrow — on the #f2f2f2 band: a centered 54×3px mint rule
 * over the "FEATURED PRODUCTS" label (15px, weight 700, letter-spacing 3.5px).
 */
export async function MzFeaturedEyebrow() {
  const t = await getTranslations("dreamzy");

  return (
    <section className="bg-[color:var(--dz-bg)] pb-10 pt-[70px]">
      <div className="text-center">
        <div className="mx-auto mb-[22px] h-[3px] w-[54px] rounded-[2px] bg-[color:var(--dz-green)]" />
        <div className="text-[15px] font-bold uppercase tracking-[3.5px] text-[color:var(--dz-ink)]">
          {t("featuredEyebrow")}
        </div>
      </div>
    </section>
  );
}
