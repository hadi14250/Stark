import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/motion/Reveal";
import { landingImages } from "@/components/landing/assets";
import type { DivisionKey } from "@/components/brand/LogoDefs";

type Item = { title: string; body: string; cta: string; alt: string };

const ROUTES = ["/woodworks", "/mattresses", "/#contact"] as const;
const DIVISION_KEYS: DivisionKey[] = ["woodworks", "mattresses", "turnkey"];

/**
 * The three divisions.
 *
 * NOT a three-card icon grid — three equal cards each with an icon, a title, a
 * short paragraph and a link is the most recognisably AI-generated section on
 * the web, and swapping a Lucide icon for a brand blade does not change that.
 *
 * But also NOT the alternating two-column band Capabilities uses. The first
 * build made both sections out of CapabilityBand and they came out visually
 * identical — the same template twice, one scroll apart, which is the exact
 * failure this redesign exists to fix reproduced inside a single page.
 *
 * So: wide full-width photographs, stacked rather than alternating, each with
 * the copy in a plate that overlaps the image's lower edge. Same type scale,
 * same tokens, same motion language — a different structure.
 */
export async function Divisions() {
  const t = await getTranslations("landing.categories");
  const items = t.raw("items") as Item[];

  return (
    <Section surface="surface" id="divisions">
      <Container>
        <SectionHeader
          eyebrow={<Eyebrow>{t("eyebrowLabel")}</Eyebrow>}
          heading={t("heading")}
          intro={t("sub")}
        />

        <div className="mt-[clamp(44px,6vw,72px)] flex flex-col gap-[clamp(48px,6vw,88px)]">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={0.05}>
              <article className="relative">
                <div
                  className="overflow-hidden rounded-[var(--radius-card)]"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <Photo
                    src={landingImages.categories[i]}
                    alt={item.alt}
                    ratio="band"
                    sizes="(max-width: 860px) 100vw, 1180px"
                  />
                </div>

                {/* The copy plate overlaps the photo's lower edge, alternating
                    which side it hangs off so the stack has rhythm without
                    becoming a zig-zag of two-column grids. */}
                <div
                  className="relative mx-auto -mt-12 w-[92%] rounded-[var(--radius-card)] p-6 nav:-mt-16 nav:w-[64%] nav:p-9"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-line)",
                    boxShadow: "var(--shadow-panel)",
                    marginInlineStart: i % 2 === 1 ? "auto" : undefined,
                    marginInlineEnd: i % 2 === 1 ? "0" : undefined,
                  }}
                >
                  <Eyebrow division={DIVISION_KEYS[i]}>{item.title}</Eyebrow>

                  <h3 className="mt-4 font-display text-h3 font-bold leading-h3 tracking-display text-[color:var(--color-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-[46ch] text-body leading-body text-[color:var(--color-ink-body)]">
                    {item.body}
                  </p>
                  <div className="mt-6">
                    <Pill variant="forest" href={ROUTES[i]}>
                      {item.cta}
                    </Pill>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
