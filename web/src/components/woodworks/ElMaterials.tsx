import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";

type DiscLabel = { label: string };

/**
 * The six wood-species discs — verbatim layered `background` + `box-shadow`
 * strings from the handoff (README §Wood-disc backgrounds). Each is a circle
 * with an end-grain gradient; hover scales 1.08 and adds a golden ring.
 * `dur`/`delay` give each disc an organic float offset.
 */
const DISCS: Array<{ background: string; dur: string; delay: string }> = [
  {
    // Maple
    background:
      "repeating-linear-gradient(112deg, rgba(150,105,55,0.06) 0 5px, rgba(255,244,214,0.05) 5px 11px), radial-gradient(circle at 40% 33%, #e7cb9a 0%, #d0a970 68%, #b98f57 100%)",
    dur: "4.6s",
    delay: "0s",
  },
  {
    // Walnut
    background:
      "repeating-linear-gradient(98deg, rgba(28,14,4,0.22) 0 4px, rgba(96,60,32,0.10) 4px 10px), radial-gradient(circle at 44% 30%, #7c5030 0%, #4e3018 72%, #3a2211 100%)",
    dur: "5.4s",
    delay: "0.4s",
  },
  {
    // Cherry
    background:
      "repeating-linear-gradient(108deg, rgba(70,24,12,0.18) 0 4px, rgba(158,74,42,0.08) 4px 11px), radial-gradient(circle at 42% 32%, #a75f3a 0%, #7d3f24 70%, #5d2e19 100%)",
    dur: "5.0s",
    delay: "0.2s",
  },
  {
    // Pine
    background:
      "repeating-radial-gradient(circle at 52% 56%, #d9b06a 0 6px, #c69a52 6px 13px), radial-gradient(circle at 50% 50%, rgba(232,198,132,0.4), rgba(150,110,60,0.25))",
    dur: "5.8s",
    delay: "0.6s",
  },
  {
    // Oak
    background:
      "repeating-linear-gradient(122deg, rgba(92,62,32,0.12) 0 5px, rgba(206,172,116,0.06) 5px 12px), radial-gradient(circle at 45% 34%, #c6a26c 0%, #a67f4c 70%, #8b6636 100%)",
    dur: "4.9s",
    delay: "0.3s",
  },
  {
    // Cedar
    background:
      "repeating-linear-gradient(90deg, rgba(84,46,20,0.16) 0 6px, rgba(196,124,68,0.06) 6px 14px), radial-gradient(circle at 45% 34%, #ba7a42 0%, #965a2c 72%, #71401d 100%)",
    dur: "5.6s",
    delay: "0.5s",
  },
];

const DISC_SHADOW =
  "0 22px 44px rgba(0,0,0,0.5), inset 0 2px 6px rgba(255,255,255,0.11), inset 0 -10px 20px rgba(0,0,0,0.32)";

// Desktop absolute positions (x,y) for the 2×3 grid at 162px.
const DESKTOP_POS = [
  { left: 271, top: 178 },
  { left: 519, top: 178 },
  { left: 767, top: 178 },
  { left: 271, top: 398 },
  { left: 519, top: 398 },
  { left: 767, top: 398 },
];

/**
 * "Materials" — a centred title over a moody dark forest backdrop (a layered CSS
 * gradient stand-in, per the handoff) with six floating wood-species discs.
 * Desktop: two rows of three 162px discs, absolutely positioned. Mobile: a 3×2
 * grid of discs ≤104px.
 */
export async function ElMaterials() {
  const t = await getTranslations("element.materials");
  const labels = t.raw("items") as DiscLabel[];

  return (
    <section className="relative">
      {/* ---------- MOBILE ---------- */}
      <div className="relative overflow-hidden px-6 pb-[46px] pt-[50px] nav:hidden">
        <ForestBackdrop className="absolute inset-x-0 bottom-0 top-[100px] z-0" mobile />
        <h2 className="relative z-[2] mb-[34px] text-center font-display text-[34px] font-bold text-[color:var(--el-text-strong)]">
          <Reveal>{t("title")}</Reveal>
        </h2>
        <div className="relative z-[2] grid grid-cols-3 justify-items-center gap-4">
          {DISCS.map((disc, i) => (
            <Reveal key={i} y={0} className="w-full max-w-[104px] [&>*]:aspect-square">
              <Disc disc={disc} label={labels[i]?.label} />
            </Reveal>
          ))}
        </div>
      </div>

      {/* ---------- DESKTOP (1200×600 stage) ---------- */}
      <div className="relative mx-auto hidden h-[600px] w-[1200px] nav:block">
        <h2 className="absolute inset-x-0 top-0 z-[4] text-center font-display text-[42px] font-bold text-[color:var(--el-text-strong)]">
          <Reveal>{t("title")}</Reveal>
        </h2>
        <ForestBackdrop className="absolute left-0 top-[78px] z-[1] h-[520px] w-[1200px]" />
        {DISCS.map((disc, i) => (
          <div
            key={i}
            className="absolute z-[3] h-[162px] w-[162px]"
            style={{ left: DESKTOP_POS[i].left, top: DESKTOP_POS[i].top }}
          >
            <Reveal className="h-full w-full">
              <Disc disc={disc} label={labels[i]?.label} />
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

/** One floating disc with its end-grain gradient + hover golden ring. */
function Disc({ disc, label }: { disc: (typeof DISCS)[number]; label?: string }) {
  return (
    <div
      className="h-full w-full animate-el-float motion-reduce:animate-none"
      style={{ animationDuration: disc.dur, animationDelay: disc.delay }}
    >
      <div
        className="group flex h-full w-full items-center justify-center rounded-full transition-[transform,box-shadow] duration-500 hover:scale-[1.08]"
        style={{ background: disc.background, boxShadow: DISC_SHADOW }}
      >
        <span className="text-[12px] font-semibold uppercase tracking-[1.5px] text-[color:var(--el-text-disc)] [text-shadow:0_1px_4px_rgba(0,0,0,0.7)] nav:text-[15px] nav:tracking-[2.5px]">
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * The forest backdrop — the handoff's layered CSS gradient (misty dark forest),
 * with a drifting mist overlay. A photo could swap in here later.
 */
function ForestBackdrop({ className, mobile }: { className?: string; mobile?: boolean }) {
  const stripe = mobile
    ? "repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 38px, rgba(0,0,0,0.16) 38px 41px, rgba(0,0,0,0) 41px 78px)"
    : "repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 46px, rgba(0,0,0,0.16) 46px 49px, rgba(0,0,0,0) 49px 94px)";
  const fadeTop = mobile ? "60px" : "58px";
  const fadeBottom = mobile ? "50px" : "60px";
  const glow = mobile
    ? "radial-gradient(130% 70% at 30% 18%, rgba(150,170,150,0.10), rgba(60,78,66,0.05) 42%, transparent 66%)"
    : "radial-gradient(130% 85% at 24% 20%, rgba(150,170,150,0.10), rgba(60,78,66,0.05) 42%, transparent 66%)";

  return (
    <div
      aria-hidden
      className={`overflow-hidden ${className ?? ""}`}
      style={{
        background: [
          `linear-gradient(180deg,#191d22 0%,rgba(25,29,34,0) ${fadeTop})`,
          `linear-gradient(0deg,#191d22 0%,rgba(25,29,34,0) ${fadeBottom})`,
          stripe,
          glow,
          "linear-gradient(180deg,#141b1b 0%,#0f1618 55%,#0b1011 100%)",
        ].join(", "),
      }}
    >
      <div
        className="absolute inset-[-12%] animate-el-mist motion-reduce:animate-none"
        style={{
          background:
            "radial-gradient(58% 46% at 32% 42%, rgba(150,172,150,0.18), transparent 70%)",
        }}
      />
    </div>
  );
}
