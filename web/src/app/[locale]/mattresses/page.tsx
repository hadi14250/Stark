import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { ContactSection } from "@/components/contact/ContactSection";
import { MattressHero } from "@/components/mattresses/MattressHero";
import { BrandDuet, type BrandPanel } from "@/components/mattresses/BrandDuet";
import { BrandBand } from "@/components/mattresses/BrandBand";
import { BlueRange } from "@/components/mattresses/BlueRange";
import { SiestaRange } from "@/components/mattresses/SiestaRange";
import { CountUp } from "@/components/motion/CountUp";
import { mattressImages, siestaImages } from "@/components/mattresses/assets";
import { FACTS } from "@/content/facts";
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
 * The register is deliberately the opposite of Woodworks: that page is a spec
 * sheet hung off a standing rule at 0.8 density; this one is centred, airy and
 * photographic at 1.15, and every transition runs through `--ease-cushion`,
 * which overshoots slightly and settles. A mattress page should decelerate.
 *
 * ===========================================================================
 * THE REVIEW REORDERED THE PAGE AND CUT A THIRD OF IT
 * ===========================================================================
 *
 * MANUFACTURING LEADS NOW. The credentials block — 60,000 mattresses a year,
 * the reach sentence, the four manufacturing claims — used to sit fifth, after
 * both ranges and the cross-section. The client asked for it directly under the
 * hero, and it is the right call: everything below it is product, and "we make
 * sixty thousand of these a year in a factory that has been running since 1967"
 * is the sentence that makes the product worth looking at. It also gives the
 * page a number in its first screen, which nothing else here has.
 *
 * THREE SECTIONS WENT:
 *
 *   engineering   "The same four layers, every model" — the CSS cross-section
 *                 that came apart on scroll. It was the page's one diagram and
 *                 its only explanation of how a mattress is built; if the
 *                 client later misses that, `ComfortLayers` is in git history
 *                 and its copy is `mattresses.engineering`.
 *   turnkey       "Beyond the mattress" — the only link from this route across
 *                 to woodworks. The nav still reaches it.
 *   the panel CTAs (see BrandDuet).
 *
 * ===========================================================================
 * SURFACES, RE-DERIVED FROM SCRATCH
 * ===========================================================================
 *
 *   hero           its own photograph, veil fading to `--color-surface`
 *   credentials    surface
 *   brands         surface-2
 *   blue range     BAND — full-bleed navy, outside the alternation
 *   siesta range   BAND — full-bleed purple, outside the alternation
 *   contact        surface   (ContactSection hard-codes this)
 *
 * THE TWO BANDS ARE NOT PART OF THE RUN, and that is what makes this work. They
 * paint their own full-bleed colour, so the alternating pair either side of
 * them is `brands` (surface-2) and `contact` (surface) — which differ. The old
 * page needed exactly six sections to make strict alternation land; taking
 * three out would have broken that arithmetic if the ranges had stayed on page
 * surfaces. They do not, so it holds at four.
 *
 * Two saturated bands back to back is deliberate and is the section's whole
 * argument: navy then purple, one after the other, is what "two brands, one
 * standard" looks like without a word being read.
 */
export default async function MattressesPage({
  params,
}: PageProps<"/[locale]/mattresses">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("mattresses");
  const brands = t.raw("brands.items") as Brand[];
  const credentials = t.raw("credentials.items") as Item[];
  const output = t.raw("credentials.output") as { label: string };

  /**
   * ⚠ NEVER CROSS THE BRANDS. siesta is the HOSPITALITY brand — a different
   * buyer, different models, different warranties — so a blue photograph under
   * siesta's name would tell a hotel it was looking at the contract range when
   * it was looking at a consumer product. `siestaImages` and `mattressImages`
   * are separate resolvers for exactly this reason.
   */
  const panels: BrandPanel[] = brands.map((b, i) => ({
    ...b,
    brand: i === 0 ? "blue" : "siesta",
    image: i === 0 ? mattressImages.blueBrand : siestaImages.brand,
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

      {/* Manufacturing — the client asked for this first ---------------- */}
      <Section surface="surface">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("credentials.eyebrowLabel")}</Eyebrow>}
            heading={t("credentials.heading")}
            intro={t("credentials.sub")}
          />

          {/*
            THE FIGURE IS NOT A CAPACITY, and the copy is careful about it in a
            way the woodworks page deliberately was not. Slide 12's wood figures
            were annotated as what the division is EQUIPPED to produce; slide 15
            says only "60,000 مرتبة في السنة" — sixty thousand mattresses in the
            year, with no word for capacity anywhere near it. So this reads
            "mattresses a year", and the ledger entry carries the same warning.

            ⚠ THE UNIT IS THE CAPTION, NOT A SUFFIX. It first shipped as
            `suffix=" mattresses a year"` with a non-breaking space gluing the
            phrase to the figure — the right trick for "60,000 m²" and the wrong
            one for a four-word unit: at 1440 the line broke to "60,000
            mattresses a" / "year", orphaning a word. That is the defect the
            client reported on Home's stat band, at three times the type size.

            THE COUNT RUNS LONGER THAN ANY OTHER ON THE SITE. The client asked
            for this number to visibly increment; it is the largest numeral on
            the site and has the furthest to travel, so 3.4s against the 3s
            default. The reason it was not visibly counting at all is fixed in
            CountUp.tsx — the fail-safe was firing before the observer.
          */}
          <Reveal>
            <div className="mt-output mt-[clamp(32px,4vw,60px)]">
              <div>
                <p className="font-display text-[clamp(38px,6vw,72px)] font-bold leading-[1.02] tracking-display text-[color:var(--color-ink)]">
                  <CountUp
                    to={FACTS.mattressesPerYear.value}
                    grouping={FACTS.mattressesPerYear.grouping}
                    duration={3.4}
                    locale={locale}
                  />
                </p>
                <p
                  className="mt-2 font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
                  style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
                >
                  {output.label}
                </p>
              </div>
              <p className="max-w-[46ch] text-body leading-body text-[color:var(--color-ink-body)]">
                {t("credentials.reach")}
              </p>
            </div>
          </Reveal>

          {/* Border-top items rather than bordered cards: the sections around
              this are a photographic duet and two saturated bands, so the block
              that introduces them should recede. */}
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

      {/* The two brands ---------------------------------------------- */}
      <Section surface="surface-2">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("brands.eyebrowLabel")}</Eyebrow>}
            heading={t("brands.heading")}
            intro={t("brands.sub")}
          />
          <BrandDuet panels={panels} />
        </Container>
      </Section>

      {/* blue's range, on blue's own ground --------------------------- */}
      <BrandBand
        brand="blue"
        logoAlt={t("models.logoAlt")}
        eyebrow={t("models.eyebrowLabel")}
        heading={t("models.heading")}
        intro={t("models.sub")}
      >
        {/*
          `t.raw`, NOT `t`. The alt string is a template with a `{name}` hole,
          and next-intl reads `{name}` as an ICU argument: calling `t()` without
          supplying one does not return the template, it fails and emits the
          KEY. Every one of these images shipped with `alt="mattresses.models.alt"`
          until it was caught by curling the page and grepping for message keys —
          a failure invisible from every other angle, because alt text is the one
          string nobody sighted ever sees.
        */}
        <BlueRange
          alt={t.raw("models.alt")}
          note={t("models.note")}
          techLabel={t("models.techLabel")}
          techItems={t.raw("models.techItems")}
        />
      </BrandBand>

      {/* siesta's range, on siesta's ---------------------------------- */}
      <BrandBand
        brand="siesta"
        logoAlt={t("siestaCollection.logoAlt")}
        eyebrow={t("siestaCollection.eyebrowLabel")}
        heading={t("siestaCollection.heading")}
        intro={t("siestaCollection.sub")}
      >
        <SiestaRange alt={t.raw("siestaCollection.alt")} />
      </BrandBand>

      <ContactSection />
    </div>
  );
}
