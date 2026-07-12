import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { bedImages } from "./assets";
import { StarIcon } from "./icons";

/**
 * Hero — the handoff's opening band: a soft grey gradient (#efefef→#eaeaea)
 * with centered H1 + two-line subhead + white "Shop now" pill, then a full-bleed
 * bedroom photo. A vertical amber "STARK REVIEWS" tab is pinned to the left edge
 * (gated by `showReviewsTab`).
 *
 * The centered copy reads on the STARK nav which is fixed above; the page canvas
 * already offsets the nav height, so this section starts its own padding fresh.
 */
export async function MzHero({ showReviewsTab = true }: { showReviewsTab?: boolean }) {
  const t = await getTranslations("dreamzy.hero");

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(var(--dz-hero-1),var(--dz-hero-2))]">
      <div className="mx-auto max-w-[1280px] px-6 nav:px-10">
        <div className="px-[10px] pb-10 pt-[34px] text-center nav:px-0 nav:py-[clamp(40px,6vw,58px)] nav:pb-[clamp(44px,7vw,64px)]">
          <Reveal y={30}>
            <h1 className="mx-auto max-w-[15ch] font-display text-[31px] font-semibold leading-[1.15] tracking-[-0.5px] text-[color:var(--dz-ink)] nav:text-[clamp(36px,4.15vw,58px)] nav:font-semibold nav:leading-[1.08] nav:tracking-[-1px]">
              {t("h1")}
            </h1>
          </Reveal>
          <Reveal y={30} delay={0.08}>
            <p className="mx-auto mt-5 max-w-[46ch] text-[15px] font-medium leading-[1.75] text-[color:var(--dz-subtext)] nav:mt-[26px] nav:text-[clamp(16px,1.35vw,19px)] nav:leading-[1.9]">
              {t("subLine1")} <br className="hidden nav:block" />
              {t("subLine2")}
            </p>
          </Reveal>
          <Reveal y={30} delay={0.16}>
            <Link
              href="/#contact"
              className="mt-7 flex w-full items-center justify-center rounded-[40px] bg-white px-8 py-[18px] text-[17px] font-semibold text-[color:var(--dz-ink)] shadow-[0_18px_38px_rgba(0,0,0,0.12)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_55px_rgba(0,0,0,0.16)] motion-reduce:hover:translate-y-0 nav:mt-[34px] nav:inline-flex nav:w-auto nav:px-[clamp(38px,5vw,60px)] nav:py-[22px] nav:text-[18px] nav:shadow-[0_22px_45px_rgba(0,0,0,0.10)]"
            >
              {t("cta")}
            </Link>
          </Reveal>
        </div>
      </div>

      <div className="relative">
        <Image
          src={bedImages.hero}
          alt={t("photoAlt")}
          width={2800}
          height={1095}
          priority
          sizes="100vw"
          className="relative z-[1] h-auto w-full"
        />
        {showReviewsTab && (
          <div className="pointer-events-none absolute start-0 top-[18px] z-[6] flex select-none items-center gap-[7px] bg-[color:var(--dz-yellow)] px-[7px] py-[15px] text-[11px] font-bold uppercase tracking-[2px] text-white [writing-mode:vertical-rl] nav:top-[64px] nav:gap-2.5 nav:px-2.5 nav:py-[22px] nav:text-[13px] nav:tracking-[2.5px]">
            <StarIcon width={11} height={11} fill="currentColor" stroke="none" className="nav:h-[13px] nav:w-[13px]" />
            {t("reviewsTab")}
          </div>
        )}
      </div>
    </section>
  );
}
