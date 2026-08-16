import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MarkGlyph } from "@/components/brand/geometry";
import { ContactSection } from "@/components/contact/ContactSection";
import { WoodworksHero } from "@/components/woodworks/WoodworksHero";
import { Chapters, type Chapter } from "@/components/woodworks/Chapters";
import { ProductStrip, type Product } from "@/components/woodworks/ProductStrip";
import { Certifications } from "@/components/woodworks/Certifications";
import { landingImages } from "@/components/landing/assets";
import "@/styles/woodworks.css";

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

type Cap = { title: string; body: string; meta: string[]; alt: string };
type Row = { stage: string; check: string };
type Certs = {
  recognitionLabel: string;
  certificationsLabel: string;
  note: string;
  names: Record<string, string>;
};

/**
 * WOODWORKS — the cream workshop page.
 *
 * ===========================================================================
 * THE COLOUR CHANGED; THE STRUCTURE IS WHY THAT IS SAFE
 * ===========================================================================
 *
 * This page was rebuilt once already, from an off-white page that opened with
 * the same component as Home and repeated Home's Capabilities section
 * parameter-for-parameter, down to the same three image files. It read as Home
 * with different words because structurally that is what it was, and the fix
 * was to make it near-black.
 *
 * The client has now asked for the background of their own company profile p10
 * — a cream — so the page goes light again. That does not undo the rebuild,
 * because what the rebuild actually changed was the skeleton, not the colour:
 * a full-viewport hero hung off a standing rule, a sticky chapter index, a
 * scroll-snap product strip. Home has none of those. See the long note on
 * `[data-theme="woodworks"]` in tokens.css for the three axes that still hold
 * the two pages apart (alignment, density, the neutral ink ramp).
 *
 * ===========================================================================
 * FOUR SECTIONS CAME OUT IN THE SAME REVIEW
 * ===========================================================================
 *
 *   substrates       the six board types, demoted under the product strip
 *   capacity         75M SAR and six annual volume figures
 *   services         "Integrated solutions, delivered end to end"
 *   projects         the "Selected work" band that closed the page
 *
 * The client asked for each by name. Two consequences worth knowing:
 *
 * `facts.ts` LOST SEVEN ENTRIES with the capacity band — they had exactly one
 * consumer between them, and an unused fact still whitelists its digits for the
 * whole copy deck. The tombstone there records what they were.
 *
 * THE PAGE NO LONGER ENDS ON ITS OWN WORK. `ProjectsBand` was the last image on
 * the route and the only link from here into the gallery; the nav still reaches
 * it, but if the client later misses that hand-off, this is where it was.
 *
 * ===========================================================================
 * SURFACES ALTERNATE STRICTLY, AND THE RUN WAS RE-WALKED
 * ===========================================================================
 *
 *   hero        surface      (the component paints --color-surface itself)
 *   chapters    surface-2
 *   products    surface
 *   standards   surface-2
 *   contact     surface      (ContactSection hard-codes this)
 *
 * Removing four sections shifted every surface below them, so this is not the
 * old list with gaps closed — the whole run was re-derived. Chapters used to be
 * `surface` and is `surface-2` now precisely because the page is four sections
 * shorter and the parity flipped. Two adjacent sections sharing a surface read
 * as one very long section; the previous arrangement would have ended on
 * standards→contact, both `surface`.
 *
 * NO PROCESS BAND, still. Home has one; a second copy on a four-section page
 * reads as padding.
 */
export default async function WoodworksPage({
  params,
}: PageProps<"/[locale]/woodworks">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("woodworks");
  const caps = t.raw("capabilities.items") as Cap[];
  const products = t.raw("products.items") as Product[];
  const rows = t.raw("standards.rows") as Row[];
  const certs = t.raw("standards.certs") as Certs;

  /**
   * The chapters ARE the capabilities copy, re-presented.
   *
   * Deliberately not new writing. That copy was written for this page and
   * approved; what was wrong with the section was its shape and its
   * photographs, not its words.
   */
  const chapters: Chapter[] = caps.map((c, i) => ({
    ...c,
    image: landingImages.woodworks.chapters[i % landingImages.woodworks.chapters.length],
  }));

  return (
    <div data-theme="woodworks" style={{ background: "var(--color-surface)" }}>
      <WoodworksHero
        eyebrow={t("eyebrow")}
        line1={t("hero.line1")}
        line2={t("hero.line2")}
        sub={t("hero.sub")}
        meta={t.raw("hero.meta") as string[]}
        image={landingImages.woodworks.hero}
        imageAlt={t("hero.alt")}
        ctaPrimary={t("hero.cta")}
        ctaSecondary={t("hero.ctaSecondary")}
        scrollLabel={t("hero.scrollCue")}
      />

      {/* Chapters ----------------------------------------------------- */}
      <Section surface="surface-2">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("chapters.eyebrowLabel")}</Eyebrow>}
            heading={t("capabilities.heading")}
            intro={t("capabilities.sub")}
          />
          <div className="mt-[clamp(40px,5vw,80px)]">
            <Chapters chapters={chapters} />
          </div>
        </Container>
      </Section>

      {/* Products ----------------------------------------------------- */}
      <Section surface="surface" className="overflow-hidden" id="products">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("products.eyebrowLabel")}</Eyebrow>}
            heading={t("products.heading")}
            intro={t("products.sub")}
          />
        </Container>
        {/* Outside the Container on purpose — the strip runs to the viewport
            edge so that "there is more this way" needs no chevron.

            EIGHT NOW, NOT SIX. Profile p15 replaced the range wholesale: Loose
            Furniture & Upholstery and Craftsmanship & Artistic Woodworks are
            new, "Furniture & Joinery" became "Built-in Furniture & Joinery",
            and cladding gained its exterior half. The substrate list that used
            to sit underneath this went with the same review. */}
        <ProductStrip
          items={products}
          images={landingImages.woodworks.products}
          alt={t("products.alt")}
        />
      </Section>

      {/* Standards table + the marks --------------------------------- */}
      <Section surface="surface-2">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("standards.eyebrowLabel")}</Eyebrow>}
            heading={t("standards.heading")}
            intro={t("standards.sub")}
          />

          {/* A real <table> with row headers, not a div grid: this IS tabular
              data, and a screen reader should be able to say "Machining,
              what is checked: first-off inspected". */}
          <div className="mt-[clamp(32px,4vw,56px)] overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-accent)" }}>
                  {[t("standards.colStage"), t("standards.colCheck")].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="pb-3 text-start font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
                      style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.stage}
                    className="ww-row"
                    style={{ borderBottom: "1px solid var(--color-line)" }}
                  >
                    <th
                      scope="row"
                      className="w-[38%] py-4 pe-6 ps-3 text-start align-top font-display text-h4 font-semibold text-[color:var(--color-ink)]"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <MarkGlyph division="woodworks" whole size={30} color="var(--color-accent)" />
                        {r.stage}
                      </span>
                    </th>
                    <td className="py-4 pe-3 align-top text-body leading-body text-[color:var(--color-ink-body)]">
                      {r.check}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Certifications
            recognitionLabel={certs.recognitionLabel}
            certificationsLabel={certs.certificationsLabel}
            note={certs.note}
            names={certs.names}
          />
        </Container>
      </Section>

      <ContactSection />
    </div>
  );
}
