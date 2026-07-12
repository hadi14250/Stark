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
    <section className="bg-[color:var(--dz-mint)] px-6 pb-20 pt-[66px] text-center">
      <Reveal y={24}>
        <div className="font-display text-[clamp(28px,2.4vw,34px)] font-bold tracking-[-0.5px] text-[color:var(--dz-ink)]">
          {t("wordmark")}
        </div>
        <div className="mt-0.5 text-[15px] text-[color:var(--dz-on-mint)]">{t("sub")}</div>
        <h2 className="mx-auto mt-12 max-w-[820px] font-display text-[clamp(28px,3.15vw,44px)] font-bold leading-[1.28] tracking-[-0.5px] text-[color:var(--dz-ink)]">
          {t("title")}
        </h2>
        <p className="mt-10 text-[18px] font-medium text-[color:var(--dz-on-mint)]">{t("closing")}</p>
      </Reveal>
    </section>
  );
}
