import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { HomeHero } from "@/components/home/HomeHero";
import { About } from "@/components/home/About";
import { Capabilities } from "@/components/home/Capabilities";
import { Divisions } from "@/components/home/Divisions";
import { Turnkey } from "@/components/home/Turnkey";
import { GalleryTeaser } from "@/components/home/GalleryTeaser";
import { Marquee } from "@/components/landing/Marquee";
import { ProcessSection } from "@/components/landing/ProcessSection";
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

/**
 * Home. Sets `data-theme="home"` explicitly rather than relying on the :root
 * defaults, so the four differentiation axes are declared at the top of every
 * page rather than being implicit on one of them.
 *
 * Section order is deliberate: the marquee immediately after the hero acts as
 * a palate cleanser between the centred hero and the editorial About, and
 * Process sits AFTER the gallery teaser because "how we work" only becomes
 * interesting once someone has seen what the work looks like.
 */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <div data-theme="home">
      <HomeHero />
      <Marquee />
      <About />
      <Capabilities />
      <Divisions />
      <Turnkey />
      <GalleryTeaser />
      <ProcessSection />
      <ContactSection />
    </div>
  );
}
