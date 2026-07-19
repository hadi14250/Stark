import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { DrawLine, DrawLineY } from "@/components/motion/reveals";

type Step = { title: string; body: string };

/**
 * "From Forest to Home" — a 4-step process (01 Sourced · 02 Milled · 03 Crafted
 * · 04 Finished), each a numbered dark circle (1px tan border, accent number) +
 * title + description.
 *
 * Desktop (≥nav): a horizontal row of 4 with a self-drawing connector line
 * behind. Mobile (<nav): a vertical timeline with a self-drawing vertical line.
 */
export async function ElProcess() {
  const t = await getTranslations("element.process");
  const steps = t.raw("steps") as Step[];

  return (
    <section className="px-6 pb-10 pt-[50px] nav:mx-auto nav:mt-16 nav:h-[500px] nav:w-[1200px] nav:px-0 nav:pb-0 nav:pt-0">
      <p className="mb-3.5 text-center text-[12px] font-semibold uppercase tracking-[3.5px] text-[color:var(--el-accent)] nav:mb-0 nav:text-[13px] nav:tracking-[4px]">
        <Reveal as="span">{t("eyebrow")}</Reveal>
      </p>
      <h2 className="mb-9 text-center font-display text-[31px] font-bold leading-[38px] text-[color:var(--el-text-strong)] nav:mb-0 nav:text-[42px] nav:leading-normal">
        <Reveal delay={0.06}>{t("title")}</Reveal>
      </h2>

      {/* ---------- MOBILE vertical timeline ---------- */}
      <div className="relative nav:hidden">
        <DrawLineY className="absolute bottom-7 left-[27px] top-7 w-0.5 bg-[linear-gradient(180deg,rgba(195,160,106,0.15),rgba(195,160,106,0.55),rgba(195,160,106,0.15))]" />
        {steps.map((step, i) => (
          <Reveal key={step.title} y={40} delay={i * 0.1} className={i < 3 ? "mb-[30px]" : ""}>
            <div className="relative flex gap-[22px]">
              <StepCircle n={i + 1} mobile />
              <div className="pt-1">
                <div className="mb-1.5 font-display text-[20px] font-bold text-[color:var(--el-text-strong)]">
                  {step.title}
                </div>
                <div className="text-[14px] font-light leading-[23px] text-[color:var(--el-text-body-2)]">
                  {step.body}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* ---------- DESKTOP horizontal row (steps at x 60/330/600/870) ---------- */}
      <div className="relative mx-auto hidden h-[360px] w-[1200px] nav:block">
        <DrawLine className="absolute left-[60px] top-[172px] h-0.5 w-[1080px] bg-[linear-gradient(90deg,rgba(195,160,106,0.15),rgba(195,160,106,0.55),rgba(195,160,106,0.15))]" />
        {steps.map((step, i) => (
          <div key={step.title} className="absolute top-[140px] w-[270px]" style={{ left: 60 + i * 270 }}>
            <Reveal y={40} delay={i * 0.13} className="text-center">
              <StepCircle n={i + 1} />
              <div className="mt-[22px] font-display text-[22px] font-bold text-[color:var(--el-text-strong)]">
                {step.title}
              </div>
              <div className="mx-auto mt-3 w-[210px] text-[14px] font-light leading-[23px] text-[color:var(--el-text-body-2)]">
                {step.body}
              </div>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Numbered circle (01–04): dark panel fill, 1px tan border, accent PT-Serif. */
function StepCircle({ n, mobile }: { n: number; mobile?: boolean }) {
  const num = String(n).padStart(2, "0");
  return (
    <div
      className={`flex items-center justify-center rounded-full border border-[rgba(195,160,106,0.4)] bg-[color:var(--el-surface-panel)] font-display font-bold text-[color:var(--el-accent)] ${
        mobile
          ? "h-14 w-14 flex-none text-[21px]"
          : "mx-auto h-[66px] w-[66px] text-[24px]"
      }`}
    >
      {num}
    </div>
  );
}
