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
import {
  MaterialsStrip,
  ServicesList,
  ProjectsBand,
} from "@/components/woodworks/sections";
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
type Service = { title: string; body: string };
type Material = { label: string; body: string };
type Row = { stage: string; check: string };

/**
 * WOODWORKS — the dark workshop page.
 *
 * WHAT THE CLIENT SAW BEFORE, and they were right about all of it: an off-white
 * page that opened with the same component as Home, then repeated Home's
 * Capabilities section parameter-for-parameter — same component, same order,
 * the SAME THREE IMAGE FILES, one of them appearing three times. Its theme
 * delta from Home was ink colour and a density multiplier, neither of which a
 * visitor perceives. It read as Home with different words, because structurally
 * that is what it was.
 *
 * THE DIRECTION IS THE OPPOSITE REGISTER. Home is light, centred, airy, and
 * sells an outcome. This is the factory floor: near-black, left-aligned against
 * a standing rule, dense, and sells a process. The difference is legible in the
 * first 200ms without reading a word, which is the only test that matters —
 * nobody compares two pages side by side, they just feel whether they have
 * arrived somewhere new.
 *
 * FOUR AXES MOVE, all Tier-3 tokens on `data-theme="woodworks"` (tokens.css):
 *   surface   → the graphite ramp at its DARK end, ink inverted to off-white.
 *               An official brand column, used as a page instead of as ink.
 *   axis      → start. A standing rule the copy hangs off, no centred column.
 *   density   → 0.8. A factory page reads as a spec sheet, not a brochure.
 *   image     → contrast(1.1) saturate(.88) brightness(.82) — grain and shadow.
 *
 * AND THE STRUCTURE MOVES, which matters more than any of them:
 *   hero        full-viewport, photograph bleeding off the end edge
 *   chapters    a sticky index beside panels — a device Home does not have
 *   materials   a horizontal scroll-snap strip — changes the page's axis
 *   standards   the stage/check table (kept: it is unique on the site)
 *   services    a ruled mono list, the page's one quiet block
 *   projects    a full-bleed band with the CTA over it
 *
 * NO PROCESS BAND, still. Home has one; a third copy across three pages in one
 * session reads as laziness rather than as a system.
 *
 * NO CAPABILITY BANDS, now. `CapabilityBand` remains Home's; this page having
 * its own structure is the entire point of the rebuild.
 */
export default async function WoodworksPage({
  params,
}: PageProps<"/[locale]/woodworks">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("woodworks");
  const caps = t.raw("capabilities.items") as Cap[];
  const services = t.raw("services.items") as Service[];
  const materials = t.raw("materials.items") as Material[];
  const rows = t.raw("standards.rows") as Row[];

  /**
   * The chapters ARE the capabilities copy, re-presented.
   *
   * Deliberately not new writing. That copy was written for this page and
   * approved; what was wrong with the section was its shape and its
   * photographs, not its words. Rewriting approved copy to justify a structural
   * change would have put unreviewed claims about a real factory on a live
   * page — the one thing this project must never do.
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
      <Section surface="surface">
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

      {/* Materials ---------------------------------------------------- */}
      <Section surface="surface-2" className="overflow-hidden">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("materials.eyebrowLabel")}</Eyebrow>}
            heading={t("materials.heading")}
            intro={t("materials.sub")}
          />
        </Container>
        {/* Outside the Container on purpose — the strip runs to the viewport
            edge so that "there is more this way" needs no chevron. */}
        <MaterialsStrip
          items={materials}
          images={landingImages.woodworks.materials}
          alt={t("materials.alt")}
        />
      </Section>

      {/* Standards table --------------------------------------------- */}
      <Section surface="surface">
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
                        <MarkGlyph division="woodworks" size={20} color="var(--color-accent)" />
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
        </Container>
      </Section>

      {/* Services ----------------------------------------------------- */}
      <Section surface="surface-2">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("services.eyebrowLabel")}</Eyebrow>}
            heading={t("services.heading")}
            intro={t("services.sub")}
          />
          <ServicesList items={services} />
        </Container>
      </Section>

      {/* Projects band ------------------------------------------------ */}
      <ProjectsBand
        eyebrow={<Eyebrow>{t("projects.eyebrowLabel")}</Eyebrow>}
        heading={t("projects.heading")}
        sub={t("projects.sub")}
        cta={t("projects.cta")}
        image={landingImages.woodworks.projects}
        alt={t("projects.alt")}
      />

      <ContactSection />
    </div>
  );
}
