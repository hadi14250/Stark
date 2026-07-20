import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { MarkTexture } from "@/components/brand/geometry";
import { Parallax } from "@/components/motion/Parallax";
import { landingImages } from "@/components/landing/assets";
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
        <SectionHeader
          eyebrow={<Eyebrow>{t("eyebrow")}</Eyebrow>}
          heading={t("heading")}
          intro={t("sub")}
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

        <div className="mt-10 flex" style={{ justifyContent: "var(--align-axis)" }}>
          <Pill variant="tan" href="/#contact">
            {t("cta")}
          </Pill>
        </div>
      </Container>
    </Section>
  );
}
