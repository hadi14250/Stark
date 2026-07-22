import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { DivisionIndex, type DivisionItem } from "./DivisionIndex";
import type { DivisionKey } from "@/components/brand/LogoDefs";

type Item = { title: string; body: string; cta: string; alt: string };

const ROUTES = ["/woodworks", "/mattresses", "/#contact"] as const;
/**
 * The third card was Turnkey and is now Engineering & Technical Services
 * (profile v3 slide 8, "Three main sectors"). Same blade — see the note on
 * `engineering` in LogoDefs — and the same route, because engineering is not
 * a page, it is a conversation.
 *
 * ⚠ INDEX-COUPLED to `landing.categories.items`. Both arrays are read by
 * position, so reordering one without the other silently gives a card the
 * wrong destination and the wrong blade. Nothing type-checks that.
 */
const DIVISION_KEYS: DivisionKey[] = ["woodworks", "mattresses", "engineering"];

/**
 * The three divisions.
 *
 * NOT a three-card icon grid — three equal cards each with an icon, a title, a
 * short paragraph and a link is the most recognisably AI-generated section on
 * the web, and swapping a Lucide icon for a brand blade does not change that.
 *
 * NOT the alternating two-column band Capabilities uses either. The first build
 * made both sections out of CapabilityBand and they came out visually
 * identical: the same template twice, one scroll apart, which is the exact
 * failure this redesign exists to fix reproduced inside a single page.
 *
 * The second attempt — a wide photo with a cream copy plate hung over its lower
 * edge — was rejected on sight, and correctly. See DivisionIndex for what
 * replaced it and why.
 *
 * This file is a server component so the copy is fetched and resolved on the
 * server; only the interactive row below it ships as client JS.
 */
export async function Divisions() {
  const t = await getTranslations("landing.categories");
  const items = t.raw("items") as Item[];

  const divisions: DivisionItem[] = items.map((item, i) => ({
    ...item,
    href: ROUTES[i],
    division: DIVISION_KEYS[i],
  }));

  return (
    <Section surface="surface" id="divisions">
      <Container>
        <SectionHeader
          eyebrow={<Eyebrow>{t("eyebrowLabel")}</Eyebrow>}
          heading={t("heading")}
          intro={t("sub")}
        />
        <DivisionIndex items={divisions} />
      </Container>
    </Section>
  );
}
