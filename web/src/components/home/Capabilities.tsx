import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CapabilityBand } from "@/components/ui/CapabilityBand";
import { BladeField } from "@/components/brand/geometry";
import { landingImages } from "@/components/landing/assets";
import { CapabilitySpine } from "./CapabilitySpine";

type Item = { title: string; body: string; meta: string[]; alt: string };

/*
 * THE CHIP STRIPS USED TO LIVE HERE, AS AN ENGLISH ARRAY IN THE COMPONENT.
 * That was a bug hiding in plain sight: nine strings of visible UI copy that
 * never went through next-intl, so the Arabic page rendered them in English.
 * They are message keys now, alongside the copy they belong to.
 *
 * They were also wrong. The client read the third band's out loud — "there's
 * nothing called 'site-ready on arrival', they don't make sense" — and the
 * strings were long enough to wrap onto three stacked lines, which is the
 * "words are under each other" note on the same section. The replacements are
 * short enough to sit on one row and describe operations that exist.
 */

/**
 * The section the client cared most about.
 *
 * NO OVERLAY PANELS. There were pentagon plates reading "Saudi precision." and
 * so on, sitting on top of the photographs. They did not work: the pentagon
 * needs size to read as the brand shape, but the copy in it was three words,
 * so it came out as a large empty green shape with text jammed into one corner
 * — and it covered the product it was sitting on. It was decoration carrying a
 * line the body copy already makes. The photograph is stronger without it.
 *
 * Three alternating photo/copy bands, numbered. G2 STRUCTURAL blades bleed off
 * the section edges behind them — this is Home's one structural field, which is
 * why the hero's is ambient. Mixing the two weights on one page makes the
 * geometry read as accidental rather than authored.
 */
export async function Capabilities() {
  const t = await getTranslations("landing.features");
  const items = t.raw("items") as Item[];

  return (
    <Section surface="surface-2" className="overflow-hidden" id="capabilities">
      {/* The two blades now drift at DIFFERENT rates as the section passes, so
          they sit at different depths instead of reading as one flat backdrop
          that happens to have two shapes on it. Opposite signs: they shear
          against each other rather than travelling together. */}
      <BladeField
        weight="structural"
        color="var(--sand-300)"
        blades={[
          { element: "stark", width: 520, top: "6%", end: "-220px", float: 12, depth: 14 },
          {
            element: "turnkey",
            width: 460,
            bottom: "-140px",
            start: "-200px",
            float: 10,
            depth: -8,
          },
        ]}
      />

      <div className="relative z-[1]">
        <Container>
          <SectionHeader
            eyebrow={<Eyebrow>{t("eyebrowLabel")}</Eyebrow>}
            heading={t("heading")}
            intro={t("sub")}
          />
        </Container>

        {/* `relative` so the spine can size itself to exactly this stack —
            start of band 01, end of band 03. */}
        <div className="relative mt-[clamp(48px,6vw,80px)] flex flex-col gap-[clamp(56px,7vw,96px)]">
          <CapabilitySpine />

          {items.map((item, i) => (
            <CapabilityBand
              key={item.title}
              index={i + 1}
              heading={item.title}
              body={item.body}
              meta={item.meta}
              image={landingImages.bands[i]}
              imageAlt={item.alt}
              /*
                ONLY the first band is a pentagon. Home's G1 budget is two pairs
                and About spends the other one. When all three were pentagons
                the section became one shape repeated, and — worse — became
                visually identical to Divisions below it, which is the
                "one template" failure this redesign exists to fix, reproduced
                inside a single page.
              */
              shape={i === 0 ? "pentagon" : "rect"}
              flip={i % 2 === 1}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
