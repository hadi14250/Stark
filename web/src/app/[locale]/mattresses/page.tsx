import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { Reveal } from "@/components/motion/Reveal";
import { MarkTexture } from "@/components/brand/geometry";
import { ContactSection } from "@/components/contact/ContactSection";
import { MattressHero } from "@/components/mattresses/MattressHero";
import { BrandDuet, type BrandPanel } from "@/components/mattresses/BrandDuet";
import { ComfortLayers, type Layer } from "@/components/mattresses/ComfortLayers";
import { landingImages } from "@/components/landing/assets";
import { mattressImages } from "@/components/mattresses/assets";
import "@/styles/mattresses.css";

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

type Brand = Omit<BrandPanel, "image" | "brand">;
type Item = { title: string; body: string };

/**
 * MATTRESSES — photography-first, soft, slow.
 *
 * WHAT THE CLIENT SAW BEFORE: a hero that was about 56% centred text on white
 * with the photograph arriving below it as a letterboxed strip, and a theme
 * whose entire delta from Home was `surface-2: white-300` against Home's
 * `sand-200` — roughly four percent of luminance. The page read as Home
 * reordered, and it was.
 *
 * THE DIRECTION IS THE OPPOSITE REGISTER TO WOODWORKS, and the two pages prove
 * the system by being as far apart as it allows while sharing every component.
 * Woodworks is near-black, left-hung, dense, close-cropped: a spec sheet. This
 * is ivory, centred, airy, photographic: rest. A visitor moving between them
 * should not need to read a word to know they have gone somewhere.
 *
 * The softness is carried by things colour cannot do at this luminance range —
 * radii up (24→32), shadows diffused rather than dropped, and every transition
 * on the page running through `--ease-cushion`, which overshoots slightly and
 * settles. `--ease-cushion` had been declared and never consumed; it is the
 * page's motion signature now.
 *
 * STRUCTURE:
 *   hero        full-viewport photograph, headline lying on it, one CTA
 *   duet        the two sub-brands as tinted full-height panels, side by side
 *   layers      the set-piece — a CSS cross-section that comes apart on scroll
 *   credentials a light band of manufacturing claims
 *   turnkey     the link across to woodworks
 *
 * NO DTC TRUST BAR, still. The template's warranty / trial-period / free-
 * delivery triplet came from an e-commerce store; STARK has no cart, no trial
 * and no delivery SLA to promise. That slot carries manufacturing credentials.
 *
 * `[data-brand]` stays contained to the two panel subtrees and never reaches
 * page chrome — that containment is why the sub-brand colours are allowed on
 * the site at all.
 */
export default async function MattressesPage({
  params,
}: PageProps<"/[locale]/mattresses">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("mattresses");
  const brands = t.raw("brands.items") as Brand[];
  const engineering = t.raw("engineering.items") as Layer[];
  const credentials = t.raw("credentials.items") as Item[];

  /**
   * HALF OF THIS IS NOW REAL, and the halves must not be levelled up to match.
   *
   * blue's panel carries the manufacturer's own photography. siesta's does not
   * and still cannot: there is no siesta photography in the client's product
   * folder, and siesta is the HOSPITALITY brand — a different buyer, different
   * models, warranties from one year to ten. Putting a blue mattress under
   * siesta's heading would tell a hotel it was looking at the contract range
   * when it was looking at a consumer product. That is the one photograph on
   * this route that would be a false statement rather than a placeholder.
   *
   * TODO(F-content): siesta product photography is a client dependency. Until
   * it lands, its panel keeps a landing-set frame, which claims nothing.
   */
  const panels: BrandPanel[] = brands.map((b, i) => ({
    ...b,
    brand: i === 0 ? "blue" : "siesta",
    image: i === 0 ? mattressImages.blueBrand : landingImages.gallery[6],
  }));

  return (
    <div data-theme="mattresses">
      <MattressHero
        eyebrow={t("eyebrow")}
        line1={t("hero.line1")}
        line2={t("hero.line2")}
        sub={t("hero.sub")}
        cta={t("hero.cta")}
        image={mattressImages.hero}
        imageAlt={t("hero.alt")}
      />

      {/* The two brands ---------------------------------------------- */}
      <Section surface="surface">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("brands.eyebrowLabel")}</Eyebrow>}
            heading={t("brands.heading")}
            intro={t("brands.sub")}
          />
          <BrandDuet panels={panels} />
        </Container>
      </Section>

      {/* Comfort layers — the set-piece ------------------------------- */}
      <Section surface="surface-2" className="overflow-hidden">
        <MarkTexture
          variant="mark"
          color="var(--green-500)"
          opacity={0.04}
          size={520}
          style={{ top: "-120px", insetInlineStart: "-140px" }}
        />
        <Container className="relative z-[1]">
          <SectionHeader
            eyebrow={<Eyebrow>{t("engineering.eyebrowLabel")}</Eyebrow>}
            heading={t("engineering.heading")}
            intro={t("engineering.sub")}
          />
          <ComfortLayers layers={engineering} />
        </Container>
      </Section>

      {/* Manufacturing credentials ----------------------------------- */}
      <Section surface="surface">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("credentials.eyebrowLabel")}</Eyebrow>}
            heading={t("credentials.heading")}
            intro={t("credentials.sub")}
          />

          {/* Border-top items rather than bordered cards: this page's other
              two sections are a photographic duet and a diagram, so the band
              that follows them should recede. Four boxed cards after a
              full-bleed duet is three competing frames in a row. */}
          <div className="mt-[clamp(32px,4vw,60px)] grid gap-x-[clamp(28px,4vw,56px)] gap-y-[clamp(20px,3vw,32px)] nav:grid-cols-2">
            {credentials.map((c, i) => (
              <Reveal key={c.title} delay={(i % 2) * 0.07}>
                <div className="mt-cred h-full">
                  <h3 className="font-display text-h4 font-semibold text-[color:var(--color-ink)]">
                    {c.title}
                  </h3>
                  <p className="mt-2 max-w-[48ch] text-body-sm leading-body text-[color:var(--color-ink-body)]">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Turnkey link-out -------------------------------------------- */}
      <Section surface="surface-2">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("turnkey.eyebrowLabel")}</Eyebrow>}
            heading={t("turnkey.heading")}
            intro={t("turnkey.sub")}
          />
          <div className="mt-8 flex" style={{ justifyContent: "var(--align-axis)" }}>
            <Pill variant="tan" href="/woodworks">
              {t("turnkey.cta")}
            </Pill>
          </div>
        </Container>
      </Section>

      <ContactSection />
    </div>
  );
}
