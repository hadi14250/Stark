import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Photo } from "@/components/ui/Photo";
import { PentagonClip, MarkGlyph } from "@/components/brand/geometry";
import { Reveal } from "@/components/motion/Reveal";
import { landingImages } from "@/components/landing/assets";

type Pillar = { title: string; body: string };

/**
 * About — the positioning statement, then Vision and Mission, beside a
 * pentagon photo cluster.
 *
 * The heading is the brand book's own line ("STARK is more than a
 * manufacturer"), not a generic "About us". A section that opens with "About
 * Us" has spent its most valuable line saying nothing.
 *
 * The photo cluster is ONE G1 pair, overlapped — the per-page budget allows two
 * pairs and Capabilities already spends three across its bands, so this stays
 * a single pentagon plus a small offset square rather than a second pair.
 */
export async function About() {
  const t = await getTranslations("landing.about");
  const paragraphs = t.raw("paragraphs") as string[];
  const collageAlt = t.raw("collageAlt") as string[];
  const pillars = t.raw("pillars") as Pillar[];

  return (
    <Section surface="surface" id="about" className="scroll-mt-[var(--header-h)]">
      <Container>
        <div className="grid items-center gap-[clamp(36px,6vw,80px)] nav:grid-cols-[1.05fr_1fr]">
          <Reveal x={-24}>
            <div className="flex flex-col items-start gap-5">
              <Eyebrow>{t("eyebrowLabel")}</Eyebrow>

              <h2 className="max-w-[16ch] font-display text-h2 font-bold leading-h2 tracking-display text-[color:var(--color-ink)]">
                {t("heading")}
              </h2>

              {/* Two paragraphs, not three. The third repeated the first with
                  different nouns, which is how a positioning statement stops
                  landing. */}
              <div className="flex max-w-[54ch] flex-col gap-4 text-body leading-body text-[color:var(--color-ink-body)]">
                {paragraphs.slice(0, 2).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <dl className="mt-2 grid w-full gap-5 nav:grid-cols-2">
                {pillars.map((p) => (
                  <div
                    key={p.title}
                    className="border-t pt-4"
                    style={{ borderColor: "var(--color-line)" }}
                  >
                    <dt className="flex items-center gap-2.5 font-display text-h4 font-semibold text-[color:var(--color-ink)]">
                      <MarkGlyph division="stark" size={20} color="var(--color-accent)" />
                      {p.title}
                    </dt>
                    <dd className="mt-1.5 text-body-sm leading-body text-[color:var(--color-ink-body)]">
                      {p.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal x={24} delay={0.1}>
            <div className="relative">
              <PentagonClip
                variant="photo"
                ringColor="var(--color-surface-2)"
                style={{ boxShadow: "var(--shadow-pentagon)" }}
              >
                <Photo src={landingImages.collage[0]} alt={collageAlt[0]} ratio="pentagon" />
              </PentagonClip>

              {/* A small square offset behind the pentagon's trailing edge —
                  a second silhouette here would read as repetition. */}
              <div
                className="absolute -z-[1] hidden overflow-hidden rounded-[var(--radius-image)] nav:block"
                style={{
                  width: "42%",
                  bottom: "-10%",
                  insetInlineEnd: "-8%",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <Photo src={landingImages.collage[1]} alt={collageAlt[1]} ratio="square" />
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
