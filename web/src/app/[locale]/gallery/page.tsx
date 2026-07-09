import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { PlaceholderHero } from "@/components/ui/PlaceholderHero";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/gallery">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "pages.gallery",
  });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternates("/gallery"),
  };
}

export default async function GalleryPage({
  params,
}: PageProps<"/[locale]/gallery">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("pages.gallery");
  const nav = await getTranslations("nav");

  return (
    <PlaceholderHero
      eyebrow={nav("gallery")}
      heading={t("heading")}
      note={t("placeholder")}
    />
  );
}
