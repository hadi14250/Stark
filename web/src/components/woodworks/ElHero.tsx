import { getTranslations } from "next-intl/server";
import { ElementMark } from "./icons";
import { Reveal } from "@/components/motion/Reveal";
import { ClipReveal } from "@/components/motion/reveals";
import { woodImages } from "./assets";

/**
 * Element hero — reproduced from the handoff, both layouts.
 *
 * Desktop (≥nav): a 1200×792 stage. A weathered-bark PNG bleeds off the
 * top-left behind an #1e232a card (x85 y113, 980×537) split by a vertical rule
 * at x515; left column = logo + H1 "Specialty / Wood / Products" + three
 * 127×103 thumbnails; right column = paragraph + full-width dark "Contact Us"
 * button. A dead branch extends to the right of the card and sways.
 *
 * Mobile (<nav): no card — H1, paragraph, full-width button, a 3-col thumbnail
 * row, then the branch below; a faint bark texture sits top-right.
 *
 * `showTextures` gates the decorative (⚠ watermarked) bark/branch bleeds.
 */
export async function ElHero({ showTextures = true }: { showTextures?: boolean }) {
  const t = await getTranslations("element.hero");
  const tNav = await getTranslations("element.nav");
  const brand = tNav("brand");
  const thumbAlt = t.raw("thumbAlt") as string[];

  const thumbs = [woodImages.thumbs[0], woodImages.thumbs[1], woodImages.thumbs[2]];

  return (
    <section id="top" className="relative">
      {/* ---------- MOBILE ---------- */}
      <div className="relative overflow-hidden px-6 pb-10 pt-4 nav:hidden">
        {showTextures && (
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 right-[-70px] z-0 h-60 w-56 bg-[url('/woodworks/bark-log.png')] bg-cover bg-center opacity-55 [filter:brightness(0.7)_contrast(1.02)_saturate(0.8)]"
          />
        )}

        <h1 className="relative z-[2] mb-5 font-display text-[46px] font-bold leading-[52px] text-[color:var(--el-text-strong)]">
          <Reveal as="span" y={40} className="block">{t("line1")}</Reveal>
          <Reveal as="span" y={40} delay={0.09} className="block">{t("line2")}</Reveal>
          <Reveal as="span" y={40} delay={0.18} className="block">{t("line3")}</Reveal>
        </h1>

        <Reveal y={40} delay={0.32} className="relative z-[2] mb-[26px]">
          <p className="text-base font-light leading-[27px] text-[color:var(--el-text-body)]">
            {t("body")}
          </p>
        </Reveal>

        <Reveal y={40} delay={0.4} className="relative z-[2] mb-[26px]">
          <a
            href="#contact"
            className="flex h-14 w-full items-center justify-center rounded-[3px] bg-[color:var(--el-control)] text-[15px] font-semibold uppercase tracking-[2px] text-[color:var(--el-text-strong)] transition-colors duration-300 hover:bg-[color:var(--el-control-hover)]"
          >
            {t("cta")}
          </a>
        </Reveal>

        <Reveal y={40} delay={0.48} className="relative z-[2] flex gap-[9px]">
          {thumbs.map((src, i) => (
            <div key={src} className="h-[88px] flex-1 overflow-hidden rounded-[3px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={thumbAlt[i]} className="h-full w-full object-cover" />
            </div>
          ))}
        </Reveal>

        {showTextures && (
          <ClipReveal delay={0.56} className="relative z-[1] mt-3.5 h-[104px]">
            <div
              aria-hidden
              className="h-full w-full origin-[right_center] animate-el-sway bg-[url('/woodworks/branch-clean.png')] bg-contain bg-center bg-no-repeat motion-reduce:animate-none"
              style={{ animationDuration: "7.5s" }}
            />
          </ClipReveal>
        )}
      </div>

      {/* ---------- DESKTOP (1200px stage) ---------- */}
      <div className="relative mx-auto hidden h-[792px] w-[1200px] overflow-hidden nav:block">
        {showTextures && (
          <>
            <div
              aria-hidden
              className="absolute left-[-165px] top-[-140px] z-[1] h-[845px] w-[725px] bg-[url('/woodworks/bark-log.png')] bg-cover bg-center [filter:brightness(0.82)_contrast(1.02)_saturate(0.85)]"
            />
            <ClipReveal delay={0.64} className="absolute left-[642px] top-[468px] z-[1] h-[315px] w-[562px]">
              <div
                aria-hidden
                className="h-full w-full origin-[right_center] animate-el-sway bg-[url('/woodworks/branch-clean.png')] bg-contain bg-center bg-no-repeat [filter:brightness(1.02)_contrast(1.03)] motion-reduce:animate-none"
                style={{ animationDuration: "7.5s" }}
              />
            </ClipReveal>
          </>
        )}

        {/* Hero card */}
        <Reveal y={40} delay={0.08} className="absolute left-[85px] top-[113px] z-[5] h-[537px] w-[980px] rounded-[3px] bg-[color:var(--el-surface-card)] shadow-[0_44px_90px_rgba(0,0,0,0.42)]">
          {/* logo */}
          <div className="absolute left-[50px] top-[40px] flex items-center gap-[11px] text-[color:var(--el-text-strong)]">
            <ElementMark className="h-[27px] w-[27px]" />
            <span className="font-display text-[25px] font-bold tracking-[0.4px]">
              {brand}
            </span>
          </div>

          {/* H1 */}
          <h1 className="absolute left-[50px] top-[96px] w-[520px] font-display text-[64px] font-bold leading-[78px] text-[color:var(--el-text-strong)]">
            <span className="block">{t("line1")}</span>
            <span className="block">{t("line2")}</span>
            <span className="block">{t("line3")}</span>
          </h1>

          {/* thumbnails */}
          <div className="absolute left-[50px] top-[374px] flex gap-2.5">
            {thumbs.map((src, i) => (
              <div key={src} className="h-[103px] w-[127px] overflow-hidden rounded-[2px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={thumbAlt[i]}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.08]"
                />
              </div>
            ))}
          </div>

          {/* vertical rule */}
          <div className="absolute left-[515px] top-[70px] h-[437px] w-px bg-[rgba(240,244,248,0.26)]" />

          {/* paragraph */}
          <p className="absolute left-[565px] top-[72px] w-[400px] text-[18.5px] font-light leading-[30px] text-[color:var(--el-text-body)]">
            {t("body")}
          </p>

          {/* button */}
          <a
            href="#contact"
            className="absolute left-[565px] top-[281px] flex h-[53px] w-[400px] items-center justify-center rounded-[2px] bg-[color:var(--el-control)] transition-[background,transform] duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--el-control-hover)]"
          >
            <span className="text-[15px] font-semibold uppercase tracking-[2px] text-[color:var(--el-text-strong)]">
              {t("cta")}
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
