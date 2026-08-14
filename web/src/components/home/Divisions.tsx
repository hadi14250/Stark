import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
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
  const core = t.raw("coreServices") as {
    label: string;
    items: { title: string; body: string }[];
  };

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

        {/*
          THE FIVE NAMED SERVICES, straight off the new profile's p8.

          WHAT WAS HERE: six bare words in a mono tag strip — "Design
          development · Technical office support · Shop drawings · Value
          engineering · Interior design · Project coordination". That treatment
          was right when this was a footnote to the third division panel, which
          has no photograph of its own subject (see the TODO in DivisionIndex).

          p8 promotes them. The profile's page is a three-service row over a
          FIVE-service row, and the second row is not a list of words: each entry
          carries a sentence saying what it is. Six tags cannot explain what
          "Custom Sleep Solutions" means, and the client asked for this section
          to follow p8.

          So they are titled entries now, five across, dropping to two and then
          one. Still a ruled band rather than five cards — the panels above are
          already the section's photographic weight, and five boxes under three
          photographs is two competing treatments of one idea a scroll apart.
          Same argument the stat band makes in Turnkey.tsx.

          ⚠ THE COPY IS TRIMMED, NOT REWRITTEN. p8 prints Architectural
          Woodwork's description as a verbatim repeat of the Custom Wood Works
          paragraph above it, which reads as a mistake when both are on one
          screen — so that one states the distinctive half. The rest are the
          profile's own sentences with their tails cut. No claim was added.
        */}
        <div className="mt-[clamp(28px,3.5vw,48px)] border-t pt-5 [border-color:var(--color-line)]">
          <p
            className="font-mono text-eyebrow tracking-eyebrow text-[color:var(--color-ink-muted)]"
            style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
          >
            {core.label}
          </p>
          <ul className="mt-5 grid gap-x-[clamp(20px,2.5vw,40px)] gap-y-[clamp(20px,2.5vw,28px)] sm:grid-cols-2 nav:grid-cols-5">
            {core.items.map((s, i) => (
              <Reveal
                as="li"
                key={s.title}
                y={20}
                /* Stagger by column so the wave stays short at every
                   breakpoint. A flat i*0.07 runs the fifth entry a third of a
                   second behind the first, which on a two-column phone layout
                   reads as the grid loading rather than as a reveal. */
                delay={(i % 5) * 0.06}
                className="h-full list-none border-t pt-3.5 [border-color:var(--color-line)]"
              >
                <h3 className="font-display text-h4 font-semibold leading-h3 text-[color:var(--color-ink)]">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-body-sm leading-body text-[color:var(--color-ink-body)]">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
