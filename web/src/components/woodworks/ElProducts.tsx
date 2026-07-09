import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { DrawLine } from "./motion";
import { woodImages } from "./assets";

type Product = { title: string; body: string; alt: string };

/**
 * "Our Products" — Furniture, Features, Flooring.
 *
 * Desktop (≥nav): the handoff's 1200×1010 overlapping collage — chair photo
 * upper-left, bed lower-right, floor lower-left; the three text blocks run down
 * the centre (Features right-aligned), with two 310px self-drawing dividers and
 * bark bleeds at right + mid-left. Reproduced with absolute positioning per the
 * exact coordinates.
 *
 * Mobile (<nav): three stacked cards — full-width image + heading + paragraph +
 * "Shop Online →".
 */
export async function ElProducts({ showTextures = true }: { showTextures?: boolean }) {
  const t = await getTranslations("element.products");
  const items = t.raw("items") as Product[];
  const cta = t("cta");
  const photos = [woodImages.chair, woodImages.bed, woodImages.floor];
  const heights = ["h-[220px]", "h-[240px]", "h-[210px]"];
  const positions = ["object-center", "object-center", "object-[center_35%]"];

  return (
    <section className="relative">
      {/* ---------- MOBILE ---------- */}
      <div className="px-6 pb-2 pt-12 nav:hidden">
        <h2 className="mb-[34px] text-center font-display text-[34px] font-bold text-[color:var(--el-text-strong)]">
          {t("title")}
        </h2>
        {items.map((item, i) => (
          <Reveal key={item.title} y={40} className={i < 2 ? "mb-11" : ""}>
            <div className={`mb-[22px] overflow-hidden rounded-[4px] ${heights[i]}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[i]}
                alt={item.alt}
                className={`h-full w-full object-cover transition-transform duration-[1100ms] hover:scale-[1.06] ${positions[i]}`}
              />
            </div>
            <h3 className="mb-3.5 font-display text-[27px] font-bold text-[color:var(--el-text-strong)]">
              {item.title}
            </h3>
            <p className="mb-4 text-[15.5px] font-light leading-[26px] text-[color:var(--el-text-body)]">
              {item.body}
            </p>
            <a
              href="#contact"
              className="text-[13px] font-bold uppercase tracking-[1.5px] text-[color:var(--el-accent)]"
            >
              {cta} &#8594;
            </a>
          </Reveal>
        ))}
      </div>

      {/* ---------- DESKTOP (1200×1010 stage) ---------- */}
      <div className="relative mx-auto hidden h-[1010px] w-[1200px] nav:block">
        <h2 className="absolute inset-x-0 top-0 z-[4] text-center font-display text-[42px] font-bold text-[color:var(--el-text-strong)]">
          <Reveal y={40}>{t("title")}</Reveal>
        </h2>

        {showTextures && (
          <>
            <div
              aria-hidden
              className="absolute left-[905px] top-[103px] z-[1] h-[905px] w-[435px] bg-[url('/woodworks/bark-right.webp')] bg-cover bg-[position:30%_center] [filter:brightness(0.8)_contrast(1.03)_saturate(0.85)]"
            />
            <div
              aria-hidden
              className="absolute left-[150px] top-[486px] z-[1] h-[300px] w-[152px] bg-[url('/woodworks/bark-left.webp')] bg-cover bg-center [filter:brightness(0.82)_saturate(0.85)]"
            />
          </>
        )}

        {/* chair — upper-left */}
        <Reveal x={-70} className="absolute left-[110px] top-[116px] z-[3] h-[382px] w-[288px] overflow-hidden rounded-[2px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={woodImages.chair} alt={items[0].alt} className="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-[1.06]" />
        </Reveal>
        {/* bed — lower-right */}
        <Reveal x={70} className="absolute left-[800px] top-[408px] z-[3] h-[375px] w-[290px] overflow-hidden rounded-[2px] shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={woodImages.bed} alt={items[1].alt} className="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-[1.06]" />
        </Reveal>
        {/* floor — lower-left */}
        <Reveal y={40} className="absolute left-[120px] top-[693px] z-[3] h-[276px] w-[278px] overflow-hidden rounded-[2px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={woodImages.floor} alt={items[2].alt} className="h-full w-full object-cover object-[center_30%] transition-transform duration-[1200ms] hover:scale-[1.06]" />
        </Reveal>

        {/* Furniture text block */}
        <Reveal y={40} className="absolute left-[448px] top-[191px] z-[4] font-display text-[30px] font-bold text-[color:var(--el-text-strong)]">
          {items[0].title}
        </Reveal>
        <Reveal y={40} delay={0.08} className="absolute left-[448px] top-[248px] z-[4] w-[412px]">
          <p className="text-base font-light leading-[25px] text-[color:var(--el-text-body)]">{items[0].body}</p>
        </Reveal>
        <Reveal y={40} delay={0.14} className="absolute left-[448px] top-[396px] z-[4]">
          <a href="#contact" className="text-[13px] font-bold uppercase tracking-[1.5px] text-[color:var(--el-text-strong)] transition-[color,letter-spacing] duration-300 hover:tracking-[2.5px] hover:text-[color:var(--el-accent)]">{cta}</a>
        </Reveal>
        <DrawLine className="absolute left-[448px] top-[450px] z-[4] h-px w-[310px] bg-[rgba(240,244,248,0.24)]" />

        {/* Features text block (right-aligned) */}
        <Reveal y={40} className="absolute left-[358px] top-[488px] z-[4] w-[400px] text-right font-display text-[30px] font-bold text-[color:var(--el-text-strong)]">
          {items[1].title}
        </Reveal>
        <Reveal y={40} delay={0.08} className="absolute left-[358px] top-[545px] z-[4] w-[400px] text-right">
          <p className="text-base font-light leading-[25px] text-[color:var(--el-text-body)]">{items[1].body}</p>
        </Reveal>
        <Reveal y={40} delay={0.14} className="absolute left-[358px] top-[679px] z-[4] w-[400px] text-right">
          <a href="#contact" className="text-[13px] font-bold uppercase tracking-[1.5px] text-[color:var(--el-text-strong)] transition-[color,letter-spacing] duration-300 hover:tracking-[2.5px] hover:text-[color:var(--el-accent)]">{cta}</a>
        </Reveal>
        <DrawLine className="absolute left-[448px] top-[732px] z-[4] h-px w-[310px] bg-[rgba(240,244,248,0.24)]" />

        {/* Flooring text block */}
        <Reveal y={40} className="absolute left-[448px] top-[774px] z-[4] font-display text-[30px] font-bold text-[color:var(--el-text-strong)]">
          {items[2].title}
        </Reveal>
        <Reveal y={40} delay={0.08} className="absolute left-[448px] top-[831px] z-[4] w-[400px]">
          <p className="text-base font-light leading-[25px] text-[color:var(--el-text-body)]">{items[2].body}</p>
        </Reveal>
        <Reveal y={40} delay={0.14} className="absolute left-[448px] top-[970px] z-[4]">
          <a href="#contact" className="text-[13px] font-bold uppercase tracking-[1.5px] text-[color:var(--el-text-strong)] transition-[color,letter-spacing] duration-300 hover:tracking-[2.5px] hover:text-[color:var(--el-accent)]">{cta}</a>
        </Reveal>
      </div>
    </section>
  );
}
