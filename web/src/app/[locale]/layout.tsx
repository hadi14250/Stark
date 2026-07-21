import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";

import { routing, type Locale } from "@/i18n/routing";
import { fontVariables } from "@/styles/fonts";
import { SITE_URL, alternates } from "@/lib/seo";
import { Providers } from "@/components/motion/Providers";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { JsonLd } from "@/components/seo/JsonLd";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${t("siteName")} — ${t("tagline")}`,
      // A pipe, not an em-dash. The dash sweep covered the copy deck; this is
      // the one string that builds a user-visible line in code rather than in
      // messages, so it has to be changed here or the browser tab keeps it.
      template: `%s | ${t("siteName")}`,
    },
    description: t("defaultDescription"),
    alternates: alternates(""),
    openGraph: {
      siteName: t("siteName"),
      locale,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <Providers>
            <JsonLd />
            {/* SiteChrome renders the shared green Nav/Footer + header offset —
                except on standalone segments (the Woodworks "Element" page),
                which supply their own chrome and render full-bleed. */}
            <SiteChrome>{children}</SiteChrome>
          </Providers>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
