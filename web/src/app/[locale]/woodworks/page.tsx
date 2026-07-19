import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { PageOpener } from "@/components/ui/PageOpener";
import { CapabilityBand } from "@/components/ui/CapabilityBand";
import { Reveal } from "@/components/motion/Reveal";
import { MarkGlyph, MarkTexture } from "@/components/brand/geometry";
import { ContactSection } from "@/components/contact/ContactSection";
import { landingImages } from "@/components/landing/assets";

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
 * Woodworks — the graphite theme.
 *
 * This replaces the "Element" page, a dark/tan furniture template that shared
 * nothing with the rest of the site: its own nav, its own footer, its own
 * fonts, its own palette, and copy that still named the template's own brand
 * ("Element brings extraordinary, natural wood flooring…") and listed US
 * timber species a Saudi manufacturer does not stock.
 *
 * What makes this page feel different from Home is NOT just colour. Four axes
 * move, all as Tier-3 tokens on `data-theme="woodworks"`:
 *   ink ramp  → neutral (graphite — an official brand column, not invented)
 *   axis      → start: a standing rule the copy hangs off, no centred column
 *   density   → 0.8, so sections sit tighter. A factory page should read as a
 *               spec sheet, not a brochure.
 *   image     → contrast(1.12) saturate(.92): material and grain, close-crop
 *
 * NO PROCESS BAND. Home has one; putting the same four-step band here and on
 * /mattresses would show a visitor the same component three times in one
 * session, which reads as laziness rather than as a system. Woodworks gets a
 * stage/check table instead — denser, more spec-sheet, on-theme.
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

  return (
    <div data-theme="woodworks">
      <PageOpener
        axis="start"
        eyebrow={<Eyebrow division="woodworks">{t("eyebrow")}</Eyebrow>}
        line1={t("hero.line1")}
        line2={t("hero.line2")}
        sub={t("hero.sub")}
        meta={t.raw("hero.meta") as string[]}
        image={landingImages.bands[0]}
        imageAlt={t("hero.alt")}
        actions={
          <>
            <Pill variant="tan" href="/#contact">
              {t("hero.cta")}
            </Pill>
            <Pill variant="forest" href="/gallery?c=woodworks">
              {t("hero.ctaSecondary")}
            </Pill>
          </>
        }
      />

      {/* Capabilities ------------------------------------------------- */}
      <Section surface="surface-2">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("capabilities.eyebrowLabel")}</Eyebrow>}
            heading={t("capabilities.heading")}
            intro={t("capabilities.sub")}
          />
        </Container>

        <div className="mt-[clamp(40px,5vw,72px)] flex flex-col gap-[clamp(48px,6vw,88px)]">
          {caps.map((c, i) => (
            <CapabilityBand
              key={c.title}
              index={i + 1}
              heading={c.title}
              body={c.body}
              meta={c.meta}
              image={landingImages.bands[i]}
              imageAlt={c.alt}
              /* One pentagon on this page, on the first band. The budget is two
                 pairs and Woodworks spends only one — the standing rule in the
                 opener is already carrying the structure here. */
              shape={i === 0 ? "pentagon" : "rect"}
              flip={i % 2 === 1}
            />
          ))}
        </div>
      </Section>

      {/* Services ----------------------------------------------------- */}
      <Section surface="surface">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("services.eyebrowLabel")}</Eyebrow>}
            heading={t("services.heading")}
            intro={t("services.sub")}
          />

          {/* gap-px over a line-coloured background draws the grid's rules
              without a border on every cell doubling up at the seams. */}
          <div
            className="mt-[clamp(32px,4vw,56px)] grid gap-px overflow-hidden rounded-[var(--radius-card)] nav:grid-cols-2"
            style={{ background: "var(--color-line)" }}
          >
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div
                  className="flex h-full gap-4 p-6 nav:p-8"
                  style={{ background: "var(--color-surface)" }}
                >
                  <span className="font-mono text-[11px] tabular-nums text-[color:var(--color-accent-2)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-h4 font-semibold text-[color:var(--color-ink)]">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-body-sm leading-body text-[color:var(--color-ink-body)]">
                      {s.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Materials ---------------------------------------------------- */}
      <Section surface="surface-2" className="overflow-hidden">
        <MarkTexture
          variant="mark"
          color="var(--neutral-500)"
          opacity={0.05}
          size={560}
          style={{ bottom: "-160px", insetInlineEnd: "-150px" }}
        />
        <Container className="relative z-[1]">
          <SectionHeader
            eyebrow={<Eyebrow>{t("materials.eyebrowLabel")}</Eyebrow>}
            heading={t("materials.heading")}
            intro={t("materials.sub")}
          />

          <dl className="mt-[clamp(32px,4vw,56px)] grid gap-x-10 gap-y-7 nav:grid-cols-3">
            {materials.map((m, i) => (
              <Reveal key={m.label} delay={(i % 3) * 0.06}>
                <div className="border-t pt-4" style={{ borderColor: "var(--color-line)" }}>
                  <dt className="font-display text-h4 font-semibold text-[color:var(--color-ink)]">
                    {m.label}
                  </dt>
                  <dd className="mt-2 text-body-sm leading-body text-[color:var(--color-ink-body)]">
                    {m.body}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Container>
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
                <tr style={{ borderBottom: "2px solid var(--color-ink)" }}>
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
                  <tr key={r.stage} style={{ borderBottom: "1px solid var(--color-line)" }}>
                    <th
                      scope="row"
                      className="w-[38%] py-4 pe-6 text-start align-top font-display text-h4 font-semibold text-[color:var(--color-ink)]"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <MarkGlyph division="woodworks" size={20} color="var(--color-accent)" />
                        {r.stage}
                      </span>
                    </th>
                    <td className="py-4 align-top text-body leading-body text-[color:var(--color-ink-body)]">
                      {r.check}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      {/* Projects teaser --------------------------------------------- */}
      <Section surface="surface-2">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("projects.eyebrowLabel")}</Eyebrow>}
            heading={t("projects.heading")}
            intro={t("projects.sub")}
          />
          <div className="mt-8 flex" style={{ justifyContent: "var(--align-axis)" }}>
            {/* Deep-links the gallery with Woodworks preselected. The category
                is resolved on the SERVER from searchParams, so this lands on
                the right tab with no flash and no spurious transition. */}
            <Pill variant="tan" href="/gallery?c=woodworks">
              {t("projects.cta")}
            </Pill>
          </div>
        </Container>
      </Section>

      <ContactSection />
    </div>
  );
}
