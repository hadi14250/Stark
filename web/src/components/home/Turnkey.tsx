import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { MarkTexture } from "@/components/brand/geometry";
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
      {/* One large mark bleeding off the edge, not a repeating tile. A 300px
          tile at this scale reads as wallpaper competing with the copy (A0c). */}
      <MarkTexture
        variant="mark"
        color="var(--white-500)"
        opacity={0.05}
        size={620}
        style={{ bottom: "-200px", insetInlineEnd: "-180px" }}
      />

      <Container className="relative z-[1]">
        <SectionHeader
          eyebrow={<Eyebrow>{t("eyebrow")}</Eyebrow>}
          heading={t("heading")}
          intro={t("sub")}
        />

        {/*
          WAS four bordered boxes in a 2x2 grid — the most generic possible
          treatment, and it read that way. Now a numbered ledger: a large ghost
          numeral, a hairline between rows rather than a box around each, and
          the rows offset so the eye travels down a diagonal instead of
          bouncing between four equal rectangles. Same content, same tokens.
        */}
        <ol className="mt-[clamp(44px,6vw,72px)]">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08} y={32} className="block">
              <li
                className="group relative grid items-baseline gap-x-6 gap-y-2 border-t py-7 nav:grid-cols-[auto_minmax(0,22ch)_minmax(0,1fr)] nav:py-9"
                style={{
                  borderColor: "var(--color-line)",
                  // Each row steps further in, so the column reads as a
                  // descent rather than a stack.
                  paddingInlineStart: `calc(${i} * clamp(0px, 2.2vw, 34px))`,
                }}
              >
                <span
                  aria-hidden
                  className="font-mono text-[clamp(30px,4vw,52px)] font-light leading-none tabular-nums"
                  style={{ color: "var(--color-accent)", opacity: 0.35 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <h3 className="font-display text-h3 font-semibold leading-h3 tracking-display text-[color:var(--color-ink)]">
                  {f.title}
                </h3>

                <p className="text-body leading-body text-[color:var(--color-ink-body)]">
                  {f.body}
                </p>

                {/* The rule under a row draws itself in as the row arrives —
                    the only motion in the section, so it reads as emphasis
                    rather than decoration. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100 motion-reduce:transition-none"
                  style={{ background: "var(--color-accent)" }}
                />
              </li>
            </Reveal>
          ))}
        </ol>

        <div className="mt-10 flex" style={{ justifyContent: "var(--align-axis)" }}>
          <Pill variant="tan" href="/#contact">
            {t("cta")}
          </Pill>
        </div>
      </Container>
    </Section>
  );
}
