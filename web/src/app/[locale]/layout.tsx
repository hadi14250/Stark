import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";

import { routing, type Locale } from "@/i18n/routing";
import { fontVariables } from "@/styles/fonts";
import { SITE_URL, alternates } from "@/lib/seo";
import { Providers } from "@/components/motion/Providers";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
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
      template: `%s — ${t("siteName")}`,
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
            <Nav />
            {/* Offset the fixed header: utility strip (40) + bar (64 mobile / 76 desktop).
                overflow-x-clip contains decorative bleed (diagonal bands, collage) without
                affecting vertical scroll or the fixed header (which sits outside <main>). */}
            <main className="flex-1 overflow-x-clip pt-[104px] nav:pt-[116px]">{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
