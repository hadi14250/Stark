"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SocialLinks, type SocialKey } from "@/components/ui/SocialLinks";
import { submitContact } from "@/app/[locale]/actions/contact";
import { initialContactState } from "@/app/[locale]/actions/contact-state";
import { HONEYPOT_FIELD, STARTED_AT_FIELD } from "@/lib/contact/spam";
import { HeadphonesIcon, SquarePenIcon, ArrowRightIcon } from "./icons";
import logoGreen from "../../../public/brand/logo-horizontal-green.png";

const SOCIAL_KEYS: readonly SocialKey[] = ["facebook", "instagram", "youtube", "x"];

const MENU = [
  { href: "/mattresses", key: "mattresses" },
  { href: "/woodworks", key: "woodworks" },
  { href: "/gallery", key: "gallery" },
  { href: "/#contact", key: "contact" },
] as const;

/**
 * Footer — the handoff's footer LAYOUT (wordmark · MENU · ADDRESS · subscribe
 * column with a rounded email input + mint circular submit · contact rows · a
 * bottom bar with copyright + socials) filled with STARK's real CONTENT: Stark
 * routes, Jeddah address, hello@stark-ksa.net, © 2026 STARK, Stark socials.
 *
 * The newsletter posts to the real `submitContact` backend (division "blue" —
 * the B2C mattress sub-brand) with the honeypot + timing spam guards, exactly
 * like the Woodworks contact panel. A newsletter is email-only, so a fixed
 * name + message satisfy the schema's required fields.
 */
export function MzFooter() {
  const t = useTranslations("dreamzy.footer");
  const tFooter = useTranslations("footer");
  const tSocial = useTranslations("landing.social");
  const locale = useLocale();
  const year = 2026;

  const [state, formAction] = useActionState(submitContact, initialContactState);
  const formRef = useRef<HTMLFormElement>(null);
  const succeeded = state.status === "success";
  const errored = state.status === "error";

  useEffect(() => {
    if (succeeded) formRef.current?.reset();
  }, [succeeded]);

  const socialLabels = Object.fromEntries(
    SOCIAL_KEYS.map((k) => [k, tSocial(k)]),
  ) as Record<SocialKey, string>;

  const email = tFooter("email");

  return (
    <footer className="bg-white pb-[46px] pt-[78px]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-x-[30px] gap-y-10 px-6 nav:px-10">
        {/* Brand wordmark */}
        <div className="flex-[0_0_200px]">
          <Image src={logoGreen} alt="STARK" width={155} height={40} className="h-[34px] w-auto" />
        </div>

        {/* MENU — Stark routes */}
        <div>
          <div className="text-[15px] font-bold uppercase tracking-[2px] text-[color:var(--dz-ink)]">
            {t("menuHeading")}
          </div>
          <div className="mt-7 flex flex-col gap-3.5 text-[16px]">
            {MENU.map((m) => (
              <Link
                key={m.key}
                href={m.href}
                className="text-[color:var(--dz-muted)] transition-colors hover:text-[color:var(--dz-teal)]"
              >
                {tFooter(m.key)}
              </Link>
            ))}
          </div>
        </div>

        {/* ADDRESS — Stark (Jeddah) */}
        <div>
          <div className="text-[15px] font-bold uppercase tracking-[2px] text-[color:var(--dz-ink)]">
            {t("addressHeading")}
          </div>
          <div className="mt-7 text-[16px] leading-[2.35] text-[color:var(--dz-muted)]">
            {tFooter("location")}
          </div>
        </div>

        {/* SUBSCRIBE — wired to submitContact */}
        <div className="flex-[0_1_420px]">
          <div className="text-[15px] font-bold uppercase tracking-[2px] text-[color:var(--dz-ink)]">
            {t("subscribeHeading")}
          </div>
          <form ref={formRef} action={formAction} noValidate className="relative mt-[26px] max-w-[430px]">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="division" value="blue" />
            <input type="hidden" name="name" value="Newsletter subscriber" />
            <input type="hidden" name="message" value="Newsletter signup from the mattresses page." />
            <StartedAt />
            <div aria-hidden className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor={`mz-${HONEYPOT_FIELD}`}>Do not fill this field</label>
              <input id={`mz-${HONEYPOT_FIELD}`} type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
            </div>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              className="h-[58px] w-full rounded-[29px] border border-[color:var(--dz-input-border)] bg-white ps-[30px] pe-16 text-[15px] text-[color:var(--dz-muted)] outline-none placeholder:text-[color:var(--dz-placeholder)] focus:border-[color:var(--dz-green)]"
            />
            <SubscribeButton label={t("subscribe")} />
            <p
              role="status"
              aria-live="polite"
              className={`mt-2 text-[13px] ${succeeded ? "text-[color:var(--dz-teal)]" : errored ? "text-[#c0392b]" : "sr-only"}`}
            >
              {succeeded ? t("subscribeSuccess") : errored ? t("subscribeError") : ""}
            </p>
          </form>

          {/* Contact rows — Stark email (phone gated on F6, omitted). */}
          <div className="mt-10 flex items-center gap-4">
            <span className="relative inline-flex shrink-0">
              <span className="absolute -start-[3px] -bottom-[2px] h-[18px] w-[18px] rounded bg-[color:var(--dz-green)]" aria-hidden />
              <HeadphonesIcon width={28} height={28} strokeWidth={1.7} className="relative text-[color:var(--dz-stroke)]" />
            </span>
            <a href={`mailto:${email}`} className="text-[19px] text-[color:var(--dz-ink)] transition-colors hover:text-[color:var(--dz-teal)]">
              {email}
            </a>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <span className="relative inline-flex shrink-0">
              <span className="absolute -start-[3px] -bottom-[2px] h-[18px] w-[18px] rounded bg-[color:var(--dz-green)]" aria-hidden />
              <SquarePenIcon width={28} height={28} strokeWidth={1.7} className="relative text-[color:var(--dz-stroke)]" />
            </span>
            <Link href="/#contact" className="text-[19px] text-[color:var(--dz-ink)] transition-colors hover:text-[color:var(--dz-teal)]">
              {tFooter("contact")}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar — Stark copyright + Stark socials */}
      <div className="mx-auto mt-[66px] flex max-w-[1200px] flex-wrap items-center justify-between gap-5 px-6 nav:px-10">
        <div className="text-[14px] text-[color:var(--dz-copyright)]">
          © {year} STARK. {tFooter("rights")}
        </div>
        <SocialLinks
          labels={socialLabels}
          size={20}
          linkClassName="!text-[color:var(--dz-ink)] hover:!text-[color:var(--dz-teal)]"
        />
      </div>
    </footer>
  );
}

/** Circular mint submit button; disables + swaps affordance while pending. */
function SubscribeButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-label={label}
      className="absolute end-[7px] top-[7px] flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--dz-green)] text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 motion-reduce:hover:translate-y-0"
    >
      <ArrowRightIcon width={20} height={20} strokeWidth={2} className="rtl:-scale-x-100" />
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
