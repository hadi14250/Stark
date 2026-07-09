"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { submitContact } from "@/app/[locale]/actions/contact";
import { initialContactState } from "@/app/[locale]/actions/contact-state";
import { HONEYPOT_FIELD, STARTED_AT_FIELD } from "@/lib/contact/spam";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Element contact panel — reproduces the handoff's dark panel (Your Name + Email
 * side-by-side on desktop / stacked on mobile, Message textarea, full-width SEND
 * button, tan focus ring/glow) BUT wires it to the real Stark contact backend
 * (`submitContact` server action + zod schema). The mockup's form is
 * name/email/message only; `division` is fixed to "woodworks" via a hidden field,
 * alongside the hidden locale + honeypot + timing-gate fields the action expects.
 *
 * `showTextures` gates the decorative (⚠ watermarked) driftwood bleeds.
 */
export function ElContact({ showTextures = true }: { showTextures?: boolean }) {
  const t = useTranslations("element.contact");
  const locale = useLocale();
  const [state, formAction] = useActionState(submitContact, initialContactState);
  const formRef = useRef<HTMLFormElement>(null);

  const succeeded = state.status === "success";
  const errored = state.status === "error";

  useEffect(() => {
    if (succeeded) formRef.current?.reset();
  }, [succeeded]);

  return (
    <section id="contact" className="relative overflow-hidden px-6 pb-11 pt-5 nav:mx-auto nav:h-[740px] nav:w-[1200px] nav:px-0 nav:pb-0 nav:pt-14">
      {showTextures && (
        <>
          {/* Desktop driftwood bleeds. ⚠ watermarked placeholder. */}
          <div
            aria-hidden
            className="hidden nav:absolute nav:left-[762px] nav:top-[163px] nav:z-[2] nav:block nav:h-[512px] nav:w-[492px] nav:bg-[url('/woodworks/bark-log.png')] nav:bg-cover nav:bg-center nav:[filter:saturate(0.42)_brightness(0.92)_contrast(1.03)]"
          />
          <div
            aria-hidden
            className="hidden nav:absolute nav:left-[-118px] nav:top-[430px] nav:z-[2] nav:block nav:h-[290px] nav:w-[250px] nav:-scale-x-100 nav:bg-[url('/woodworks/bark-right.webp')] nav:bg-cover nav:bg-center nav:[filter:saturate(0.4)_brightness(0.82)]"
          />
          {/* Mobile driftwood bleed. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 right-[-90px] z-0 h-[270px] w-[260px] bg-[url('/woodworks/bark-log.png')] bg-cover bg-center opacity-50 [filter:saturate(0.42)_brightness(0.9)_contrast(1.03)] nav:hidden"
          />
        </>
      )}

      <Reveal className="relative z-[4] nav:absolute nav:left-[243px] nav:top-0 nav:w-[714px]">
        <div className="rounded-[4px] bg-[color:var(--el-surface-panel)] px-[22px] pb-[26px] pt-[34px] shadow-[0_30px_70px_rgba(0,0,0,0.45)] nav:h-[555px] nav:rounded-[3px] nav:px-0 nav:py-0 nav:shadow-[0_44px_100px_rgba(0,0,0,0.45)]">
          <h2 className="mb-[26px] text-center font-display text-[34px] font-bold text-[color:var(--el-text-strong)] nav:mb-0 nav:pt-[143px] nav:text-[44px]">
            {t("title")}
          </h2>

          <form ref={formRef} action={formAction} noValidate className="nav:relative">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="division" value="woodworks" />
            <StartedAt />
            {/* Honeypot — visually hidden. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor={`el-${HONEYPOT_FIELD}`}>Do not fill this field</label>
              <input id={`el-${HONEYPOT_FIELD}`} type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
            </div>

            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder={t("name")}
              className={`${FIELD} mb-3 nav:absolute nav:left-[57px] nav:top-[227px] nav:mb-0 nav:h-[51px] nav:w-[293px]`}
            />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder={t("email")}
              className={`${FIELD} mb-3 nav:absolute nav:left-[364px] nav:top-[227px] nav:mb-0 nav:h-[51px] nav:w-[293px]`}
            />
            <textarea
              name="message"
              required
              rows={5}
              placeholder={t("message")}
              className={`${FIELD} mb-3 h-[120px] resize-none py-[15px] leading-[24px] nav:absolute nav:left-[57px] nav:top-[305px] nav:mb-0 nav:h-[103px] nav:w-[600px] nav:py-4`}
            />
            <ElSubmit label={t("send")} pendingLabel={t("sending")} />

            <p
              role="status"
              aria-live="polite"
              className={`mt-3 text-center text-sm nav:absolute nav:left-[57px] nav:top-[500px] nav:mt-0 nav:w-[600px] ${
                succeeded
                  ? "text-[color:var(--el-accent)]"
                  : errored
                    ? "text-[#e0876b]"
                    : "sr-only"
              }`}
            >
              {succeeded ? t("success") : errored ? t("error") : ""}
            </p>
          </form>
        </div>
      </Reveal>
    </section>
  );
}

/** Element field styling (dark fill, tan focus ring + glow). */
const FIELD =
  "block w-full rounded-[3px] bg-[color:var(--el-input)] px-[18px] text-[15px] text-[#dfe3e7] outline-none transition-[background,box-shadow] duration-300 placeholder:text-[#6f757b] focus:bg-[color:var(--el-input-focus)] focus:shadow-[0_0_0_1px_rgba(195,160,106,0.55),0_0_22px_rgba(195,160,106,0.12)] h-[52px] nav:rounded-[2px] nav:px-[22px]";

/** Full-width SEND button; swaps label + disables while the action runs. */
function ElSubmit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="flex h-[52px] w-full items-center justify-center rounded-[3px] bg-[color:var(--el-control)] text-[15px] font-semibold uppercase tracking-[2px] text-[color:var(--el-text-strong)] transition-[background,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--el-control-hover)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.4)] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:hover:translate-y-0 nav:absolute nav:left-[57px] nav:top-[436px] nav:h-[50px] nav:w-[600px] nav:rounded-[2px]"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/** Stamp the submit-timing field on mount (SSR emits empty → no mismatch). */
function StartedAt() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.value = String(Date.now());
  }, []);
  return <input type="hidden" name={STARTED_AT_FIELD} value="" ref={ref} />;
}
