import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Where we work — the geographic reach the new company profile added (p27,
 * GEOGRAPHIC DISTRIBUTION MAP).
 *
 * TYPOGRAPHIC, NOT A MAP. The profile's slide is an illustrated map of the
 * peninsula with arrows; reproducing that is a design task and a heavy asset,
 * and the claim it carries is a plain two-list one, so the section states the
 * lists cleanly and leaves the cartography out. See the plan's "out of scope".
 *
 * TWO GROUPS, DELIBERATELY DIFFERENT WEIGHTS. "Current markets" reads as ink
 * with a filled accent dot; "Future expansion" recedes to muted with a hollow
 * dot, so a reader never mistakes an aspiration for a place STARK already
 * ships to. The distinction is the whole reason both lists can sit on one page.
 *
 * Lands after Clients ("who we build for") as "where we work", and takes the
 * `surface` role to keep Home's alternation: Clients is surface-2 and the
 * Turnkey band below is dark.
 */
export async function Markets() {
  const t = await getTranslations("landing.markets");
  const current = t.raw("current") as string[];
  const future = t.raw("future") as string[];

  return (
    <Section surface="surface" id="markets">
      <Container>
        <SectionHeader
          eyebrow={<Eyebrow>{t("eyebrowLabel")}</Eyebrow>}
          heading={t("heading")}
          intro={t("sub")}
        />

        <div className="mt-[clamp(40px,5vw,64px)] grid gap-[clamp(28px,4vw,56px)] nav:grid-cols-2">
          <MarketGroup label={t("currentLabel")} items={current} accent />
          <MarketGroup label={t("futureLabel")} items={future} />
        </div>
      </Container>
    </Section>
  );
}

function MarketGroup({
  label,
  items,
  accent = false,
}: {
  label: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <Reveal y={20} className="border-t pt-5 [border-color:var(--color-line)]">
      <p
        className="font-mono text-eyebrow tracking-eyebrow text-[color:var(--color-ink-muted)]"
        style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
      >
        {label}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-body-sm [border-color:var(--color-line)]"
            style={{ color: accent ? "var(--color-ink)" : "var(--color-ink-muted)" }}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={
                accent
                  ? { background: "var(--color-accent)" }
                  : { border: "1px solid var(--color-ink-muted)" }
              }
            />
            {item}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
