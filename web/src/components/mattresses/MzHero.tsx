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
      {showReviewsTab && (
        <div className="pointer-events-none absolute start-0 top-[220px] z-[6] hidden select-none items-center gap-2.5 bg-[color:var(--dz-yellow)] px-2.5 py-[22px] text-[13px] font-bold uppercase tracking-[2.5px] text-white [writing-mode:vertical-rl] nav:flex nav:top-[300px]">
          <StarIcon width={13} height={13} fill="currentColor" stroke="none" />
          {t("reviewsTab")}
        </div>
      )}

      <div className="mx-auto max-w-[1280px] px-6 nav:px-10">
        <div className="py-[clamp(40px,6vw,58px)] text-center pb-[clamp(44px,7vw,64px)]">
          <Reveal y={30}>
            <h1 className="mx-auto max-w-[15ch] font-display text-[clamp(36px,4.15vw,58px)] font-semibold leading-[1.08] tracking-[-1px] text-[color:var(--dz-ink)]">
              {t("h1")}
            </h1>
          </Reveal>
          <Reveal y={30} delay={0.08}>
            <p className="mx-auto mt-[26px] max-w-[46ch] text-[clamp(16px,1.35vw,19px)] font-medium leading-[1.9] text-[color:var(--dz-subtext)]">
              {t("subLine1")}
              <br />
              {t("subLine2")}
            </p>
          </Reveal>
          <Reveal y={30} delay={0.16}>
            <Link
              href="/#contact"
              className="mt-[34px] inline-flex items-center justify-center rounded-[40px] bg-white px-[clamp(38px,5vw,60px)] py-[22px] text-[18px] font-semibold text-[color:var(--dz-ink)] shadow-[0_22px_45px_rgba(0,0,0,0.10)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_55px_rgba(0,0,0,0.16)] motion-reduce:hover:translate-y-0"
            >
              {t("cta")}
            </Link>
          </Reveal>
        </div>
      </div>

      <Image
        src={bedImages.hero}
        alt={t("photoAlt")}
        width={2800}
        height={1095}
        priority
        sizes="100vw"
        className="relative z-[1] h-auto w-full"
      />
    </section>
  );
}
