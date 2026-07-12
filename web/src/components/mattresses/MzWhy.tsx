import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import {
  AwardIcon,
  HexagonIcon,
  LeafIcon,
  CheckCircleIcon,
  PlusIcon,
  ThermometerIcon,
} from "./icons";

/**
 * "Why our products?" — white band, a left title column beside a right 3-column
 * grid of six cells (stacks to a single column on mobile). Each cell: a 32px
 * line icon with a mint dot accent, a 20px navy heading, and a 16px muted body.
 */
const CELLS = [
  { Icon: AwardIcon, dot: "end-[-4px] top-[-3px] h-5 w-5", sw: 1.7 },
  { Icon: HexagonIcon, dot: "end-[-4px] top-[-3px] h-5 w-5", sw: 1.7 },
  { Icon: LeafIcon, dot: "start-[-4px] bottom-[-2px] h-[18px] w-[18px]", sw: 1.7 },
  { Icon: CheckCircleIcon, dot: "end-[-4px] bottom-[-3px] h-[18px] w-[18px]", sw: 1.7 },
  { Icon: PlusIcon, dot: "start-[-5px] top-[-4px] h-5 w-5", sw: 2.4 },
  { Icon: ThermometerIcon, dot: "start-[-4px] bottom-[-2px] h-[18px] w-[18px]", sw: 1.7 },
] as const;

export async function MzWhy() {
  const t = await getTranslations("dreamzy.why");
  const items = t.raw("items") as { title: string; body: string }[];

  return (
    <section className="bg-white py-[100px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-14 px-6 nav:flex-row nav:gap-14 nav:px-10">
        <Reveal x={-24} className="nav:flex-[1_1_280px]">
          <h2 className="font-display text-[clamp(34px,3.7vw,52px)] font-bold leading-[1.05] tracking-[-1px] text-[color:var(--dz-navy)]">
            {t("title")}
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-x-10 gap-y-14 nav:flex-[2_1_560px] nav:grid-cols-3">
          {items.map((item, i) => {
            const { Icon, dot, sw } = CELLS[i];
            return (
              <Reveal key={item.title} y={24} delay={(i % 3) * 0.06}>
                <span className="relative inline-flex">
                  <span className={`absolute rounded-full bg-[color:var(--dz-green)] ${dot}`} aria-hidden />
                  <Icon width={32} height={32} strokeWidth={sw} className="relative text-[color:var(--dz-stroke)]" />
                </span>
                <div className="mt-[22px] text-[20px] font-bold text-[color:var(--dz-navy)]">
                  {item.title}
                </div>
                <div className="mt-3 text-[16px] leading-[1.6] text-[color:var(--dz-muted)]">
                  {item.body}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
