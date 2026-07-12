import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { AwardIcon, MoonIcon, PackageIcon } from "./icons";

/**
 * Trust bar — #f6f6f6 band with a top hairline, three equal cells split by
 * 1px×34px dividers. Each cell: a 28px line icon with a small mint dot accent
 * tucked at a corner, then a 16px label. Wraps to a stacked column on mobile
 * (dividers hidden below the `nav` breakpoint).
 */
const CELLS = [
  { Icon: AwardIcon, dot: "start-[-3px] top-[-3px] h-5 w-5" },
  { Icon: MoonIcon, dot: "end-[-3px] bottom-[-2px] h-[18px] w-[18px]" },
  { Icon: PackageIcon, dot: "start-[-3px] bottom-[-2px] h-[18px] w-[18px]" },
] as const;

export async function MzTrustBar() {
  const t = await getTranslations("dreamzy.trust");
  const items = t.raw("items") as { label: string }[];

  return (
    <section className="border-t border-[color:var(--dz-trust-border)] bg-[color:var(--dz-trust-bg)]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-stretch px-6 py-2 nav:flex-row nav:items-center nav:gap-5 nav:py-[34px] nav:px-10">
        {items.map((item, i) => {
          const { Icon, dot } = CELLS[i];
          const last = i === items.length - 1;
          return (
            <Fragment key={item.label}>
              {i > 0 && (
                <span className="hidden h-[34px] w-px shrink-0 bg-[#dcdcdc] nav:block" aria-hidden />
              )}
              <div
                className={`flex flex-1 items-center gap-4 py-[22px] nav:justify-center nav:py-0 ${
                  last ? "" : "border-b border-[#e2e2e2] nav:border-b-0"
                }`}
              >
                <span className="relative inline-flex shrink-0">
                  <span className={`absolute rounded-full bg-[color:var(--dz-green)] ${dot}`} aria-hidden />
                  <Icon width={26} height={26} strokeWidth={1.7} className="relative text-[color:var(--dz-stroke)] nav:h-7 nav:w-7" />
                </span>
                <span className="text-[15px] text-[color:var(--dz-trust-label)] nav:text-[16px]">{item.label}</span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
