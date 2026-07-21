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
      /*
        TRACKING COMES FROM THE TARGET LANGUAGE, not from the page's.
        This link is the one place on the site whose label is always in the
        OTHER language: on the English page it reads "العربية". It was hardcoded
        to 0.2em, which meant letter-spacing applied to Arabic — and tracking
        does not merely look wide on cursive, it breaks the joins between
        letters, so the word rendered as disconnected glyphs. That is a
        rendering defect rather than a style choice, and it is the same reason
        `[lang="ar"]` zeroes this token globally (see tokens.css).

        `lang={other}` is already on the element, so the token's own
        language-scoped override does the work: Latin gets the eyebrow tracking,
        Arabic gets none.
      */
      className={`font-mono text-xs uppercase tracking-eyebrow transition-colors hover:text-accent ${className}`}
      aria-label={t("switchTo")}
    >
      {t("switchTo")}
    </Link>
  );
}
