import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { MarkTexture, MarkGlyph } from "@/components/brand/geometry";
import { Reveal } from "@/components/motion/Reveal";

type Feature = { title: string; body: string };

/**
 * Turnkey — the dark band, and the page's one `[data-surface="dark"]` subtree.
 *
 * Setting the attribute rather than hand-picking dark colours is what lets the
 * SAME components render here: every semantic role re-points, so ink becomes
 * off-white, lines become the light hairline, and interactive becomes sage —
 * which is the one place sage is legible (4.95:1 on green-800; it is 2.94:1 on
 * off-white and fails even the 3:1 non-text floor).
 *
 * NO STAT BAND. The plan called for four animated count-ups here, and the
 * numbers behind them (F1–F8: founding year, city, floor area, headcount) are
 * still unconfirmed by the client. A count-up animating to an invented figure
 * is worse than no figure — it draws the eye to the exact thing that is wrong.
 * This is the qualitative fallback: same visual slot, same weight, no numerals.
 * When the facts land, four <CountUp> instances drop into this grid.
 */
export async function Turnkey() {
  const t = await getTranslations("landing.turnkey");
  const features = t.raw("features") as Feature[];

  return (
    <Section surface="surface" data-surface="dark" className="overflow-hidden" id="turnkey">
      {/* Radial sand glow — pushes the centre forward so the slab does not read
          as a flat rectangle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgb(219 202 173 / 0.16), transparent 70%)",
        }}
      />
      <MarkTexture
        variant="tile"
        color="var(--white-500)"
        opacity={0.035}
      />

      <Container className="relative z-[1]">
        <SectionHeader
          eyebrow={<Eyebrow>{t("eyebrow")}</Eyebrow>}
          heading={t("heading")}
          intro={t("sub")}
        />

        <div className="mt-[clamp(40px,5vw,64px)] grid gap-5 nav:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <div
                className="flex h-full gap-4 rounded-[var(--radius-card)] p-6 nav:p-8"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-line)",
                }}
              >
                <MarkGlyph division="stark" size={26} color="var(--color-accent)" />
                <div>
                  <h3 className="font-display text-h4 font-semibold text-[color:var(--color-ink)]">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-body-sm leading-body text-[color:var(--color-ink-body)]">
                    {f.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex" style={{ justifyContent: "var(--align-axis)" }}>
          <Pill variant="tan" href="/#contact">
            {t("cta")}
          </Pill>
        </div>
      </Container>
    </Section>
  );
}
