import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CapabilityBand } from "@/components/ui/CapabilityBand";
import { BladeField } from "@/components/brand/geometry";
import { landingImages } from "@/components/landing/assets";

type Item = { title: string; body: string; alt: string };

/** The capability strips, per band. Qualitative — no unconfirmed figures. */
const META: string[][] = [
  ["European lines", "Repeatable tolerance", "Full component range"],
  ["Project volume", "Multi-unit hospitality", "Complete interiors"],
  ["Stage-gated QC", "Raw material to install", "Site-ready on arrival"],
];

const PANELS = ["Saudi precision.", "Built for project scale.", "Checked at every stage."];

/**
 * The section the client cared most about.
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
      <BladeField
        weight="structural"
        color="var(--sand-300)"
        blades={[
          { element: "stark", width: 520, top: "6%", end: "-220px", float: 12 },
          { element: "turnkey", width: 460, bottom: "-140px", start: "-200px", float: 10 },
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

        <div className="mt-[clamp(48px,6vw,80px)] flex flex-col gap-[clamp(56px,7vw,96px)]">
          {items.map((item, i) => (
            <CapabilityBand
              key={item.title}
              index={i + 1}
              heading={item.title}
              body={item.body}
              meta={META[i]}
              panel={PANELS[i]}
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
