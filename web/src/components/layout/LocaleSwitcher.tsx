"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Toggles between EN and AR while keeping the user on the same page.
 * `usePathname` (from next-intl navigation) returns the pathname WITHOUT the
 * locale prefix, and <Link locale={other}> re-adds the correct prefix.
 */
export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const other = routing.locales.find((l) => l !== locale) ?? locale;

  return (
    <Link
      href={pathname}
      locale={other}
      lang={other}
      className={`font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:text-accent ${className}`}
      aria-label={t("switchTo")}
    >
      {t("switchTo")}
    </Link>
  );
}
