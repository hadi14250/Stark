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
      <div className="mx-auto flex max-w-[1200px] flex-col items-stretch gap-6 px-6 py-[34px] nav:flex-row nav:items-center nav:gap-5 nav:px-10">
        {items.map((item, i) => {
          const { Icon, dot } = CELLS[i];
          return (
            <Fragment key={item.label}>
              {i > 0 && (
                <span className="hidden h-[34px] w-px shrink-0 bg-[#dcdcdc] nav:block" aria-hidden />
              )}
              <div className="flex flex-1 items-center justify-center gap-4">
                <span className="relative inline-flex shrink-0">
                  <span className={`absolute rounded-full bg-[color:var(--dz-green)] ${dot}`} aria-hidden />
                  <Icon width={28} height={28} strokeWidth={1.7} className="relative text-[color:var(--dz-stroke)]" />
                </span>
                <span className="text-[16px] text-[color:var(--dz-trust-label)]">{item.label}</span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
