import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { PageOpener } from "@/components/ui/PageOpener";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/motion/Reveal";
import { MarkGlyph, MarkTexture } from "@/components/brand/geometry";
import { ContactSection } from "@/components/contact/ContactSection";
import { landingImages } from "@/components/landing/assets";

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

type Brand = {
  name: string;
  audience: string;
  body: string;
  points: string[];
  cta: string;
  alt: string;
};
type Item = { title: string; body: string };

/**
 * Mattresses — brand colours, 1.15× density.
 *
 * Replaces the "Dreamzy" page: a light/mint DTC mattress template with its own
 * nav, footer, Poppins, and a mint/teal palette that belonged to a different
 * company. Three of its images had English marketing copy baked into the
 * pixels, which was visible on the Arabic route.
 *
 * The register is deliberately the OPPOSITE of /woodworks — centred rather than
 * left-hung, 1.15 density rather than 0.8, high-key photography rather than
 * close-crop contrast. A factory page should feel like a spec sheet; this one
 * should feel like rest. Same components, same type scale, same motion.
 *
 * THE TWO BRANDS ARE FULL SECTIONS, not two flat cards. `blue mattress` (B2C)
 * and `siesta` (B2B) serve genuinely different buyers, and flattening them into
 * a matched pair of cards is what made the old page read as a product grid.
 * `[data-brand]` stays contained to those two subtrees and never reaches the
 * page chrome.
 *
 * NO DTC TRUST BAR. The template's warranty / trial-period / free-delivery
 * triplet came straight from an e-commerce store. STARK has no cart, no trial
 * period and no delivery SLA to promise — so that slot carries manufacturing
 * credentials instead. Same visual weight, honest content.
 */
export default async function MattressesPage({
  params,
}: PageProps<"/[locale]/mattresses">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("mattresses");
  const brands = t.raw("brands.items") as Brand[];
  const engineering = t.raw("engineering.items") as Item[];
  const credentials = t.raw("credentials.items") as Item[];

  return (
    <div data-theme="mattresses">
      <PageOpener
        axis="center"
        eyebrow={<Eyebrow division="mattresses">{t("eyebrow")}</Eyebrow>}
        line1={t("hero.line1")}
        line2={t("hero.line2")}
        sub={t("hero.sub")}
        image={landingImages.categories[1]}
        imageAlt={t("hero.alt")}
        actions={
          <>
            <Pill variant="tan" href="/#contact">
              {t("hero.cta")}
            </Pill>
            <Pill variant="forest" href="/gallery?c=mattresses">
              {t("hero.ctaSecondary")}
            </Pill>
          </>
        }
      />

      {/* The two brands ---------------------------------------------- */}
      <Section surface="surface-2">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("brands.eyebrowLabel")}</Eyebrow>}
            heading={t("brands.heading")}
            intro={t("brands.sub")}
          />
        </Container>

        <div className="mt-[clamp(44px,6vw,80px)] flex flex-col gap-[clamp(48px,6vw,88px)]">
          {brands.map((b, i) => (
            <Container key={b.name}>
              <Reveal>
                <article
                  data-brand={i === 0 ? "blue" : "siesta"}
                  className="grid items-center gap-[clamp(28px,4vw,64px)] nav:grid-cols-2"
                >
                  <div className={i === 1 ? "nav:order-2" : undefined}>
                    <div
                      className="overflow-hidden rounded-[var(--radius-card)]"
                      style={{ boxShadow: "var(--shadow-card)" }}
                    >
                      <Photo
                        src={landingImages.gallery[i === 0 ? 3 : 6]}
                        alt={b.alt}
                        ratio="band"
                        sizes="(max-width: 860px) 100vw, 50vw"
                      />
                    </div>
                  </div>

                  <div className={`flex flex-col items-start gap-4 ${i === 1 ? "nav:order-1" : ""}`}>
                    {/* The sub-brand colour appears on a RULE and a label, not
                        as body text: --brand-blue and --brand-siesta are not
                        contrast-checked against every surface, and a decorative
                        rule has no contrast obligation the way copy does. */}
                    <span
                      aria-hidden
                      className="h-1 w-14 rounded-full"
                      style={{ background: "var(--color-accent)" }}
                    />
                    <p className="font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
                       style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}>
                      {b.audience}
                    </p>
                    <h3 className="font-display text-h2 font-bold leading-h2 tracking-display text-[color:var(--color-ink)]">
                      {b.name}
                    </h3>
                    <p className="max-w-[48ch] text-body leading-body text-[color:var(--color-ink-body)]">
                      {b.body}
                    </p>
                    <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
                        style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}>
                      {b.points.map((p, j) => (
                        <li key={p} className="flex items-center gap-5">
                          {j > 0 && (
                            <span aria-hidden className="h-1 w-1 rounded-full"
                                  style={{ background: "var(--color-accent)" }} />
                          )}
                          {p}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2">
                      <Pill variant="forest" href="/#contact">
                        {b.cta}
                      </Pill>
                    </div>
                  </div>
                </article>
              </Reveal>
            </Container>
          ))}
        </div>
      </Section>

      {/* Comfort engineering ----------------------------------------- */}
      <Section surface="surface" className="overflow-hidden">
        <MarkTexture
          variant="mark"
          color="var(--green-500)"
          opacity={0.045}
          size={520}
          style={{ top: "-120px", insetInlineStart: "-140px" }}
        />
        <Container className="relative z-[1]">
          <SectionHeader
            eyebrow={<Eyebrow>{t("engineering.eyebrowLabel")}</Eyebrow>}
            heading={t("engineering.heading")}
            intro={t("engineering.sub")}
          />

          <div className="mt-[clamp(36px,5vw,64px)] grid gap-x-10 gap-y-8 nav:grid-cols-2">
            {engineering.map((e, i) => (
              <Reveal key={e.title} delay={(i % 2) * 0.07}>
                <div className="border-t pt-5" style={{ borderColor: "var(--color-line)" }}>
                  <h3 className="flex items-center gap-2.5 font-display text-h4 font-semibold text-[color:var(--color-ink)]">
                    <MarkGlyph division="mattresses" size={20} color="var(--color-accent)" />
                    {e.title}
                  </h3>
                  <p className="mt-2.5 max-w-[52ch] text-body leading-body text-[color:var(--color-ink-body)]">
                    {e.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Manufacturing credentials (was the DTC trust bar) ------------ */}
      <Section surface="surface" data-surface="dark">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("credentials.eyebrowLabel")}</Eyebrow>}
            heading={t("credentials.heading")}
            intro={t("credentials.sub")}
          />

          <div className="mt-[clamp(36px,5vw,64px)] grid gap-5 nav:grid-cols-2">
            {credentials.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.06}>
                <div
                  className="h-full rounded-[var(--radius-card)] p-6 nav:p-8"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-line)",
                  }}
                >
                  <h3 className="font-display text-h4 font-semibold text-[color:var(--color-ink)]">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-body-sm leading-body text-[color:var(--color-ink-body)]">
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
