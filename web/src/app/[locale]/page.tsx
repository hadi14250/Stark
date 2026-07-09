import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { Hero } from "@/components/landing/Hero";
import { AboutSection } from "@/components/landing/AboutSection";
import { FeatureBands } from "@/components/landing/FeatureBands";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { GallerySection } from "@/components/landing/GallerySection";
import { ContactSection } from "@/components/contact/ContactSection";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "pages.home",
  });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternates(""),
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      <Hero />
      <AboutSection />
      <FeatureBands />
      <CategoriesSection />
      <GallerySection />
      <ContactSection />
    </>
  );
}
