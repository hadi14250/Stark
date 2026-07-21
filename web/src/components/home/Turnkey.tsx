import { getTranslations, getLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { MarkTexture } from "@/components/brand/geometry";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { landingImages } from "@/components/landing/assets";
import { HOME_STATS } from "@/content/facts";
import { TurnkeyLedger } from "./TurnkeyLedger";

type Feature = { title: string; body: string };

/**
 * One photograph per ledger row.
 *
 * The categories set (woodworks / mattresses / turnkey) plus a band shot for
 * the fourth row. Chosen so the picture a row summons is actually of the thing
 * the row is describing — a random image under a specific claim is worse than
 * no image, because it reads as stock.
 */
const ROW_IMAGES = [
  landingImages.categories[0],
  landingImages.categories[1],
  landingImages.categories[2],
  landingImages.bands[2],
] as const;

/**
 * THE FOUR FIGURES NOW COME FROM `content/facts.ts`, with a document and page
 * attached to each. They used to be four literals right here, which is how the
 * most quotable numbers on the site ended up outside every check that governs
 * the copy deck: the content audit swept the message files, and these were in a
 * component, so nothing looked at them.
 *
 * ⚠ THE 1967-vs-2019 ALARM THIS FILE USED TO CARRY IS RETIRED, and the note is
 * kept rather than deleted because the apparent conflict is still there in the
 * documents and the next person will find it too. STARK is a brand over two
 * factories: 1967 is Saudi Light Industries' founding, 2019 is Trust Wood's.
 * Two companies, two dates, no contradiction. What IS still open is 1967 vs
 * 1968 — the client's own catalogue prints both. See the fact's caveat.
 */

/**
 * Turnkey — the dark band, and the page's one `[data-surface="dark"]` subtree.
 *
 * Setting the attribute rather than hand-picking dark colours is what lets the
 * SAME components render here: every semantic role re-points, so ink becomes
 * off-white, lines become the light hairline, and interactive becomes sage —
 * which is the one place sage is legible (4.95:1 on green-800; it is 2.94:1 on
 * off-white and fails even the 3:1 non-text floor).
 *
 * THE STAT BAND FINALLY LANDS. This slot carried a qualitative fallback for
 * three rounds because the figures behind it were unconfirmed, and a count-up
 * animating to an invented number is worse than no number — it draws the eye to
 * the exact thing that is wrong. The company profile turned out to state all
 * four, and the client confirmed them, so the four <CountUp>s this file has been
 * describing since Phase 3 are now real.
 */
export async function Turnkey() {
  const t = await getTranslations("landing.turnkey");
  const stats = await getTranslations("landing.stats");
  const locale = await getLocale();
  const features = t.raw("features") as Feature[];
  const statItems = stats.raw("items") as { label: string }[];

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
          tile at this scale reads as wallpaper competing with the copy (A0c).

          The drift is what stops it reading as a flat sticker on the slab: it
          moves against the scroll, slowly, so the watermark sits BEHIND the
          copy in depth rather than just underneath it in z-order. At 5%
          opacity nobody will consciously see it move, which is the point. */}
      <Parallax amount={10} className="pointer-events-none absolute inset-0">
        <MarkTexture
          variant="mark"
          color="var(--white-500)"
          opacity={0.05}
          size={620}
          style={{ bottom: "-200px", insetInlineEnd: "-180px" }}
        />
      </Parallax>

      <Container className="relative z-[1]">
        {/* A wider measure than the site default. This intro is the longest on
            the page and came out as five short lines; the client counted them
            and asked for three. */}
        <SectionHeader
          eyebrow={<Eyebrow>{t("eyebrow")}</Eyebrow>}
          heading={t("heading")}
          intro={t("sub")}
          introMax="86ch"
        />

        {/*
          WAS four bordered boxes in a 2x2 grid — the most generic possible
          treatment, and it read that way. Then a numbered ledger, which was the
          right structure but still entirely static once it had faded in. The
          ledger keeps its structure and gains the two devices in
          TurnkeyLedger: scrubbed numerals and a pointer-tracked photograph of
          the work each row describes (a real in-row thumbnail on touch).

          The images are the landing set's category photographs, one per row,
          because the row copy describes exactly those three offerings plus the
          turnkey whole. Real project photography per row is a client
          dependency — TODO(F-content).
        */}
        <TurnkeyLedger
          items={features.map((f, i) => ({
            title: f.title,
            body: f.body,
            image: ROW_IMAGES[i % ROW_IMAGES.length],
            alt: f.title,
          }))}
        />

        {/*
          The stat band. Border-top items rather than boxed cards, matching the
          ledger above it — four framed boxes under a ruled ledger would be two
          competing treatments of the same idea one scroll apart.
        */}
        <dl className="mt-[clamp(40px,5vw,68px)] grid grid-cols-2 gap-x-[clamp(20px,3vw,44px)] gap-y-[clamp(24px,3vw,36px)] nav:grid-cols-4">
          {HOME_STATS.map((stat, i) => (
            <Reveal
              key={statItems[i]?.label ?? i}
              y={22}
              delay={i * 0.08}
              className="border-t pt-4 [border-color:var(--color-line)]"
            >
              <dt className="sr-only">{statItems[i]?.label}</dt>
              <dd>
                <CountUp
                  to={stat.value}
                  suffix={stat.suffix}
                  grouping={stat.grouping}
                  locale={locale}
                  className="block font-display text-[clamp(30px,4vw,54px)] font-bold leading-[1.05] tracking-display text-[color:var(--color-ink)]"
                />
                <span
                  className="mt-2 block font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
                  style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
                >
                  {statItems[i]?.label}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>

        <div className="mt-10 flex" style={{ justifyContent: "var(--align-axis)" }}>
          <Pill variant="tan" href="/#contact">
            {t("cta")}
          </Pill>
        </div>
      </Container>
    </Section>
  );
}
