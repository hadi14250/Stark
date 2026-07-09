import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { ScrollProgress } from "@/components/woodworks/ScrollProgress";
import { ElHero } from "@/components/woodworks/ElHero";
import { ElMarquee } from "@/components/woodworks/ElMarquee";
import { ElProducts } from "@/components/woodworks/ElProducts";
import { ElStats } from "@/components/woodworks/ElStats";
import { ElMaterials } from "@/components/woodworks/ElMaterials";
import { ElProcess } from "@/components/woodworks/ElProcess";
import { ElTestimonials } from "@/components/woodworks/ElTestimonials";
import { ElContact } from "@/components/woodworks/ElContact";
import { ElFooter } from "@/components/woodworks/ElFooter";

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

/**
 * Woodworks — the "Element / Specialty Wood Products" page, reproduced
 * pixel-for-pixel from `design_handoff_element_wood` (desktop 1200px + mobile).
 * It is a STANDALONE page: SiteChrome (in the locale layout) suppresses the
 * shared green Stark Nav/Footer for the `woodworks` segment, so this page owns
 * the full viewport and supplies its own Element nav (in the hero) and footer.
 *
 * `data-theme="element"` re-points the semantic tokens + fonts to the handoff's
 * dark charcoal / tan / PT-Serif+Mulish palette (see tokens.css). The 1200px
 * fixed-canvas sections are centred; mobile reflows to a single column.
 *
 * `showTextures` gates the decorative (⚠ watermarked) bark/branch/driftwood
 * bleeds — on by default to match the mockup; flip to false to ship without the
 * watermarked stock until licensed art is supplied.
 */
export default async function WoodworksPage({
  params,
}: PageProps<"/[locale]/woodworks">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const showTextures = true;

  return (
    // Outer: the dark charcoal fills the FULL viewport width (the mockup's
    // #0d0f12 letterbox), edge-to-edge — no cream Stark body showing at the
    // sides on wide screens.
    <div
      data-theme="element"
      className="w-full bg-[color:var(--el-bg)] font-body text-[color:var(--el-text-body)]"
    >
      <ScrollProgress />
      {/* Inner: the mockup's fixed 1200px canvas, centered. */}
      <div className="relative mx-auto w-full max-w-[1200px] overflow-hidden">
        <ElHero showTextures={showTextures} />
        <ElMarquee />
        <ElProducts showTextures={showTextures} />
        <ElStats />
        <ElMaterials />
        <ElProcess />
        <ElTestimonials />
        <ElContact showTextures={showTextures} />
        <ElFooter />
      </div>
    </div>
  );
}
