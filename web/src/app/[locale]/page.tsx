import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { HomeHero } from "@/components/home/HomeHero";
import { About } from "@/components/home/About";
import { Capabilities } from "@/components/home/Capabilities";
import { Divisions } from "@/components/home/Divisions";
import { Clients } from "@/components/home/Clients";
import { Markets } from "@/components/home/Markets";
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
 *
 * Clients lands straight after Divisions — "here is what we deliver" is the
 * claim, and "here is who we delivered it to" is the evidence, so they belong
 * adjacent. It also keeps the surface rhythm alternating (surface-2, surface,
 * surface-2, dark) rather than putting two identical bands back to back.
 *
 * Markets follows Clients — "who we build for" then "where we work" — and takes
 * the surface role so the run stays surface-2, surface, then the dark Turnkey
 * band. It carries the geographic reach the 2026 profile added (p27).
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
      <Clients />
      <Markets />
      <Turnkey />
      <GalleryTeaser />
      <ProcessSection />
      <ContactSection />
    </div>
  );
}
