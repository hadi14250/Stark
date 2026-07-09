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
}: PageProps<"/[locale]/woodworks">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "pages.woodworks",
  });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternates("/woodworks"),
  };
}

export default async function WoodworksPage({
  params,
}: PageProps<"/[locale]/woodworks">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("pages.woodworks");
  const nav = await getTranslations("nav");

  // data-theme scopes the wood sub-theme: semantic tokens remap, no component edits.
  return (
    <div data-theme="woodworks">
      <PlaceholderHero
        eyebrow={nav("woodworks")}
        heading={t("heading")}
        note={t("placeholder")}
      />
    </div>
  );
}
