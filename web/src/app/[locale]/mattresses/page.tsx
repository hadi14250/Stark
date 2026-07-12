import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { MattressesNav } from "@/components/mattresses/MattressesNav";
import { MzHero } from "@/components/mattresses/MzHero";
import { MzFeatures } from "@/components/mattresses/MzFeatures";
import { MzTrustBar } from "@/components/mattresses/MzTrustBar";
import { MzFeaturedEyebrow } from "@/components/mattresses/MzFeaturedEyebrow";
import { MzProduct } from "@/components/mattresses/MzProduct";
import { MzBuySet } from "@/components/mattresses/MzBuySet";
import { MzWhy } from "@/components/mattresses/MzWhy";
import { MzGuarantee } from "@/components/mattresses/MzGuarantee";
import { MzTestimonial } from "@/components/mattresses/MzTestimonial";
import { MzFooter } from "@/components/mattresses/MzFooter";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/mattresses">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "pages.mattresses",
  });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternates("/mattresses"),
  };
}

/**
 * Mattresses — the "Dreamzy" page, reproduced pixel-for-pixel from
 * `design_handoff_dreamzy_mattress` (a light/mint D2C sleep-brand comp).
 *
 * It is a STANDALONE page: SiteChrome (in the locale layout) suppresses the
 * shared green Stark Nav/Footer for the `mattresses` segment, so this page owns
 * the full viewport. Per the client's directive the DESIGN is Dreamzy's but the
 * CONTENT is Stark's — the nav is the Stark nav restyled to the Dreamzy palette
 * (same links/logo/CTA), the footer uses the Dreamzy layout with real Stark
 * content, and the body copy follows the comp's structure with Stark's real
 * facts (invented specifics are `TODO(F-facts)` placeholders, not shipped).
 *
 * `data-theme="dreamzy"` re-points the semantic tokens + fonts to the handoff's
 * white / mint / teal / Poppins palette (see tokens.css). The page canvas is
 * fluid: full-bleed photo bands + centered 1200px content columns.
 */
export default async function MattressesPage({
  params,
}: PageProps<"/[locale]/mattresses">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <div
      data-theme="dreamzy"
      className="w-full bg-white font-body text-[color:var(--dz-ink)]"
    >
      <MattressesNav />
      {/* Offset the fixed Stark nav. Mobile: bar only (56). Desktop: utility
          strip (40) + bar (76) = 116. */}
      <div className="pt-[56px] nav:pt-[116px]">
        <MzHero />
        <MzFeatures />
        <MzTrustBar />
        <MzFeaturedEyebrow />
        <MzProduct variant="mattress" />
        <MzProduct variant="pillow" />
        <MzProduct variant="comforter" />
        <MzBuySet />
        <MzWhy />
        <MzGuarantee />
        <MzTestimonial />
        <MzFooter />
      </div>
    </div>
  );
}
