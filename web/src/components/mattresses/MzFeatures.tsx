import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import {
  LeafIcon,
  SnowflakeIcon,
  RefreshCwIcon,
  MoreHorizontalIcon,
  AwardIcon,
} from "./icons";

/**
 * Features — white band, 5 equal centered columns, each a 34px line icon over a
 * 19px title + 15px muted caption (max 210px). Icons per the handoff; the comp's
 * 5th cell was a bare "25" numeral (an invented stat) — replaced with an award
 * icon since the copy is now "Built to Last" (no fabricated number).
 */
const ICONS = [LeafIcon, SnowflakeIcon, RefreshCwIcon, MoreHorizontalIcon, AwardIcon] as const;

export async function MzFeatures() {
  const t = await getTranslations("dreamzy.features");
  const items = t.raw("items") as { title: string; caption: string }[];

  return (
    <section className="bg-white px-6 pb-[46px] pt-[52px] nav:px-0 nav:pb-[74px] nav:pt-[78px]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-[38px] nav:flex-row nav:justify-between nav:gap-6 nav:px-10">
        {items.map((item, i) => {
          const Icon = ICONS[i];
          return (
            <Reveal
              key={item.title}
              y={24}
              delay={i * 0.06}
              className="flex flex-1 flex-col items-center text-center"
            >
              <Icon
                width={32}
                height={32}
                strokeWidth={i === 3 ? 2.2 : 1.5}
                className="text-[color:var(--dz-stroke)] nav:h-[34px] nav:w-[34px]"
              />
              <div className="mt-4 text-[18px] font-bold text-[color:var(--dz-ink)] nav:mt-[22px] nav:text-[19px]">
                {item.title}
              </div>
              <div className="mt-2 max-w-[260px] text-[14px] leading-[1.55] text-[color:var(--dz-muted)] nav:mt-3 nav:max-w-[210px] nav:text-[15px]">
                {item.caption}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
