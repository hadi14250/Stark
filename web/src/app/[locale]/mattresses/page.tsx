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
import { BlueRange } from "@/components/mattresses/BlueRange";
import { SiestaRange } from "@/components/mattresses/SiestaRange";
import { ComfortLayers, type Layer } from "@/components/mattresses/ComfortLayers";
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
 *   hero          full-viewport photograph, headline lying on it, one CTA
 *   duet          the two sub-brands as tinted full-height panels, side by side
 *   range         blue's nine models, real product photography
 *   siesta-range  siesta's sixteen models, now with real product photography
 *   layers        the set-piece — a CSS cross-section that comes apart on scroll
 *   credentials   output figure, reach, and a light band of manufacturing claims
 *   turnkey       the link across to woodworks
 *
 * SURFACES ALTERNATE, AND SIX SECTIONS FINALLY MAKE THE PARITY CLEAN.
 *
 * The run is pinned at BOTH ends: the hero's veil fades to `--color-surface` so
 * the first section wants `surface`, and `ContactSection` hard-codes
 * `surface="surface"` so the last section wants `surface-2` before it. With FIVE
 * sections that was impossible — strict alternation from `surface` landed on
 * `surface` again at the end, so `turnkey→contact` had to share a surface and
 * leaned on contact's near-black opening panel to hide the seam.
 *
 * Adding `siesta-range` makes SIX, and six alternates perfectly:
 *   surface, surface-2, surface, surface-2, surface, surface-2 → contact surface.
 * Every boundary now differs, including turnkey→contact, so the old masked seam
 * is gone. Inserting the section flipped `layers`, `credentials` and `turnkey`
 * one step each — that is the cost the parity note always warned an inserted
 * section would cost, paid here to buy a cleaner page rather than a hidden
 * collision. blue's range and siesta's range are DELIBERATELY on different
 * surfaces so the two brands read as two sections, not one very long range.
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
  const output = t.raw("credentials.output") as { label: string };

  /**
   * BOTH HALVES ARE NOW REAL, and they still must not be crossed.
   *
   * blue's panel carries the manufacturer's own photography; siesta's now does
   * too — the client supplied a full product folder, so its panel shows the
   * Comfort model's hospitality room instead of the furniture-template
   * placeholder it wore for months. The old dependency (TODO(F-content)) is
   * resolved.
   *
   * ⚠ THE ONE RULE THAT SURVIVES: never put a blue shot under siesta's heading
   * or the reverse. siesta is the HOSPITALITY brand, a different buyer with
   * different models and warranties, and a crossed photograph would tell a hotel
   * it was looking at the contract range when it was looking at a consumer
   * product. `siestaImages` and `mattressImages` are separate for exactly this.
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

      {/* blue's range — the answer to "lacks a lot of pictures" -------- */}
      <Section surface="surface-2" id="range">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("models.eyebrowLabel")}</Eyebrow>}
            heading={t("models.heading")}
            intro={t("models.sub")}
          />
          {/*
            `t.raw`, NOT `t`. The alt string is a template with a `{name}` hole,
            and next-intl reads `{name}` as an ICU argument: calling `t()`
            without supplying one does not return the template, it fails and
            falls back to emitting the KEY. Every one of the eight images
            shipped with `alt="mattresses.models.alt"` until this was caught by
            curling the page and grepping for message keys.

            That failure is invisible from every other angle. It type-checks,
            it renders, no test covers it, and on screen the pictures look
            perfect, because alt text is the one string on a page that nobody
            sighted ever sees. The only readers affected are the ones who
            cannot check.

            `t.raw` hands back the unparsed string and the substitution happens
            in the component, which is also why the placeholder is written
            `{name}` rather than interpolated here: the component owns the loop
            over the models and the page does not know their names.
          */}
          <BlueRange
            alt={t.raw("models.alt")}
            note={t("models.note")}
            techLabel={t("models.techLabel")}
            techItems={t.raw("models.techItems")}
          />
        </Container>
      </Section>

      {/* siesta's range — the collection the client asked for ---------- */}
      <Section surface="surface" id="siesta-range">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("siestaCollection.eyebrowLabel")}</Eyebrow>}
            heading={t("siestaCollection.heading")}
            intro={t("siestaCollection.sub")}
          />
          <SiestaRange alt={t.raw("siestaCollection.alt")} />
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

          {/*
            Output and reach: the two things the client asked this section to
            say, in one block.

            THE FIGURE IS NOT A CAPACITY, and the copy is careful about it in a
            way the woodworks page deliberately is not. Slide 12's wood figures
            are annotated as what the division is EQUIPPED to produce; slide 15
            says only "60,000 مرتبة في السنة" — sixty thousand mattresses in the
            year, with no word for capacity anywhere near it. So this reads
            "mattresses a year" under "Current annual production", and the
            ledger entry carries the same warning. If the client later confirms
            it is a ceiling, this string changes and the number does not.

            THE REACH SENTENCE names no address and no store. The client asked
            twice for retail and distribution to be mentioned (slides 15 and 16)
            and once for online sales; the first two are claims about how they
            sell that need no destination, and the third is a link the site does
            not have. A "buy online" with nowhere to click is a worse answer to
            the request than not answering it yet, so online sales is on the ask
            list rather than in this paragraph.
          */}
          <Reveal>
            <div className="mt-output mt-[clamp(32px,4vw,60px)]">
              <div>
                {/*
                  THE UNIT IS THE CAPTION, NOT A SUFFIX, and that is a fix
                  rather than a preference. It first shipped as
                  `suffix=" mattresses a year"` with a non-breaking space
                  gluing the phrase to the figure, which is the right trick
                  for "60,000 m²" and the wrong one for a four-word unit: at
                  1440 the line broke to "60,000 mattresses a" / "year",
                  orphaning a word on the second line. That is precisely the
                  defect the client reported on Home's stat band, reproduced
                  at three times the type size.

                  A phrase-length unit cannot be glued to its number. So the
                  number is the number and the unit joins the label, which is
                  also how Home's band and the woodworks grid already read.
                */}
                <p className="font-display text-[clamp(38px,6vw,72px)] font-bold leading-[1.02] tracking-display text-[color:var(--color-ink)]">
                  <CountUp
                    to={FACTS.mattressesPerYear.value}
                    grouping={FACTS.mattressesPerYear.grouping}
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
            /*
              64ch AT THIS ONE CALL SITE, and only this one.

              The client reported "fit-out" landing alone on the last line. At
              the shared 74ch default this intro breaks so that the final line
              is one hyphenated word, which reads as a typo rather than as a
              line break. Pulling the measure in moves the break earlier and
              gives the last line company.

              ⚠ DO NOT FIX THIS IN `Section.tsx`. The 74ch default is there
              because the client counted lines on three OTHER sections and asked
              for the measure to go UP; the prop exists precisely so one
              paragraph can differ without moving every section on every page.
            */
            introMax="64ch"
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
