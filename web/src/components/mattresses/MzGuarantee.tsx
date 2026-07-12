import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Home-trial guarantee — a centered mint band. STARK wordmark + "satisfaction
 * guarantee" over a large H2 and a closing line.
 *
 * TODO(F-facts): the handoff's "100 nights" trial length is an unconfirmed
 * figure, so the copy is phrased without a number until the client confirms the
 * real trial terms.
 */
export async function MzGuarantee() {
  const t = await getTranslations("dreamzy.guarantee");

  return (
    <section className="bg-[color:var(--dz-mint)] px-6 pb-[58px] pt-[52px] text-center nav:pb-20 nav:pt-[66px]">
      <Reveal y={24}>
        <div className="font-display text-[28px] font-bold tracking-[-0.5px] text-[color:var(--dz-ink)] nav:text-[clamp(28px,2.4vw,34px)]">
          {t("wordmark")}
        </div>
        <div className="mt-0.5 text-[14px] text-[color:var(--dz-on-mint)] nav:text-[15px]">{t("sub")}</div>
        <h2 className="mx-auto mt-[34px] max-w-[820px] font-display text-[26px] font-bold leading-[1.3] tracking-[-0.3px] text-[color:var(--dz-ink)] nav:mt-12 nav:text-[clamp(28px,3.15vw,44px)] nav:leading-[1.28] nav:tracking-[-0.5px]">
          {t("title")}
        </h2>
        <p className="mt-7 text-[16px] font-medium text-[color:var(--dz-on-mint)] nav:mt-10 nav:text-[18px]">{t("closing")}</p>
      </Reveal>
    </section>
  );
}
