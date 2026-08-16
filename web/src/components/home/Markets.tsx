import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Where we work — the geographic reach the 29-page profile added (p27).
 *
 * TYPOGRAPHIC, NOT A MAP. That profile's slide is an illustrated peninsula with
 * arrows; reproducing it is a design task and a heavy asset, and the claim it
 * carries is a plain two-list one, so the section states the lists cleanly and
 * leaves the cartography out.
 *
 * ⚠ THE NEWEST PROFILE (S.F 2.4) DISAGREES WITH THIS SECTION, and that is
 * recorded rather than resolved. Its map (p29) is Saudi-only — Jeddah supplying
 * fourteen cities in the Kingdom — with no Bahrain, no Yemen and no expansion
 * list anywhere in the deck. The two lists below come from the older profile.
 * The client was shown the conflict and chose to keep the countries and add
 * flags, so the copy stands; if that ever flips, this section becomes a
 * Jeddah→KSA reach statement and the flags go with it.
 *
 * TWO GROUPS, DELIBERATELY DIFFERENT WEIGHTS. "Current markets" reads as ink
 * with a full-strength flag; "Future expansion" recedes to muted with the flag
 * held back, so a reader never mistakes an aspiration for a place STARK already
 * ships to. That distinction is the whole reason both lists can sit on one page
 * — and it is why the flags are NOT identical in treatment between the two.
 *
 * Lands after Clients ("who we build for") as "where we work", and takes the
 * `surface` role to keep Home's alternation: Clients is surface-2 and the
 * Turnkey band below is dark.
 */

/**
 * The markets, in reading order, with the flag each one renders.
 *
 * ⚠ THIS IS THE ONLY ORDERED LIST. The copy deck holds `markets.names` keyed by
 * the SAME two-letter code, so a country's flag and its name cannot come apart
 * — which is exactly what a pair of parallel arrays joined by index would
 * eventually do here. `facts.ts` carries two of those index joins and both have
 * a warning on them; this one did not need to exist, so it does not.
 *
 * The codes are ISO 3166-1 alpha-2, which is also the filename in
 * `public/flags/` (see the README there for provenance and why these are files
 * rather than emoji).
 */
const CURRENT = ["sa", "bh", "ye"] as const;
const FUTURE = ["ae", "kw", "qa", "lb", "sy", "om", "jo", "iq", "eg", "sd"] as const;

type Code = (typeof CURRENT)[number] | (typeof FUTURE)[number];

export async function Markets() {
  const t = await getTranslations("landing.markets");

  /**
   * Resolved key by key, NOT with `t.raw("names")`.
   *
   * next-intl types a key whose value is a plain OBJECT as a namespace rather
   * than a message, so `t.raw("names")` fails the typed-messages check even
   * though it would return the right thing at runtime. (Arrays are the
   * exception — `t.raw("pillars")` elsewhere is fine — which is why this is
   * easy to get wrong.)
   *
   * Reading each leaf instead keeps the check meaningful: a country whose name
   * is missing from the deck fails here rather than rendering `undefined`. The
   * `as never` is the same escape the gallery uses for a key that comes from
   * data — the KEY is computed, but the value it resolves to is still checked.
   */
  const names = Object.fromEntries(
    [...CURRENT, ...FUTURE].map((code) => [code, t(`names.${code}` as never)]),
  ) as Record<Code, string>;

  return (
    <Section surface="surface" id="markets">
      <Container>
        <SectionHeader
          eyebrow={<Eyebrow>{t("eyebrowLabel")}</Eyebrow>}
          heading={t("heading")}
          intro={t("sub")}
        />

        <div className="mt-[clamp(40px,5vw,64px)] grid gap-[clamp(28px,4vw,56px)] nav:grid-cols-2">
          <MarketGroup label={t("currentLabel")} codes={CURRENT} names={names} accent />
          <MarketGroup label={t("futureLabel")} codes={FUTURE} names={names} />
        </div>
      </Container>
    </Section>
  );
}

function MarketGroup({
  label,
  codes,
  names,
  accent = false,
}: {
  label: string;
  codes: readonly Code[];
  names: Record<Code, string>;
  accent?: boolean;
}) {
  return (
    <div className="border-t pt-5 [border-color:var(--color-line)]">
      <p
        className="font-mono text-eyebrow tracking-eyebrow text-[color:var(--color-ink-muted)]"
        style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
      >
        {label}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {codes.map((code, i) => (
          /*
            EACH CHIP REVEALS ON ITS OWN, staggered along the row — the client
            asked for the flags to be animated, and a group that fades in as one
            block is a fade, not an animation you can see. 55ms is short enough
            that ten future markets finish inside half a second rather than
            reading as a list loading.

            The animation is the shared `Reveal`, not a bespoke one: it carries
            the reduced-motion behaviour and the fail-safes that stop anything on
            this site being permanently invisible because an observer misfired.
            A hand-rolled flag animation would have had to re-earn all of that.
          */
          <Reveal
            as="li"
            key={code}
            y={14}
            delay={i * 0.055}
            className="inline-flex list-none items-center gap-2.5 rounded-full border px-3.5 py-1.5 text-body-sm [border-color:var(--color-line)]"
          >
            <span
              className="inline-flex items-center gap-2.5"
              style={{ color: accent ? "var(--color-ink)" : "var(--color-ink-muted)" }}
            >
              {/*
                A 4:3 flag in a 20x15 box with a hairline and a small radius.

                THE HAIRLINE IS NOT DECORATION. Four of these thirteen are
                white-edged (Bahrain, Qatar, Syria, Lebanon) and the page they
                sit on is off-white, so without a border the flag appears to lose
                its own edge and the shape stops reading as a flag at all.

                `aria-hidden`, and the country's NAME is the text beside it: a
                flag is an illustration of a label that is already there, so
                announcing it twice is noise. Decorative geometry never carries
                meaning alone on this site (DESIGN.md §5.3) and a flag is held to
                the same rule.
              */}
              <Image
                src={`/flags/${code}.svg`}
                alt=""
                aria-hidden
                width={20}
                height={15}
                className="h-[15px] w-[20px] shrink-0 rounded-[3px] border object-cover"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-ink) 18%, transparent)",
                  // Future markets are an aspiration, so their flags sit back
                  // with their text rather than being the brightest thing in a
                  // muted chip.
                  opacity: accent ? 1 : 0.55,
                }}
              />
              {names[code]}
            </span>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
