import { Container } from "@/components/ui/Container";
import { Pill } from "@/components/ui/Pill";
import { Photo } from "@/components/ui/Photo";
import { ParallaxImage } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { WordsReveal, LineReveal } from "@/components/motion/WordsReveal";

/* ============================================================================
   PRODUCTS — a horizontal scroll-snap strip.
   ========================================================================= */

/**
 * Six product types as a strip you push sideways, rather than a 3x2 grid of
 * definition-list rows.
 *
 * WAS `MaterialsStrip`, AND THE RENAME IS THE POINT. It used to carry six
 * SUBSTRATES — solid wood, MDF, veneer, HPL and so on. Profile v3 slide 14
 * replaced that content with six things the division actually SELLS (doors,
 * cladding, joinery, kitchens, outdoor structures, retail stands), because the
 * client's note on slide 12 asks to "move away from generic talk and focus
 * more on the sector". A list of board types is a supplier's answer to "what
 * do you make"; a list of products is the client's.
 *
 * The substrates were not deleted — see `SubstrateList` directly below, which
 * is where they went and why.
 *
 * The grid was not wrong, it was just the fourth stacked full-width block in a
 * row — by the time a visitor reached it the page had stopped changing shape.
 * A strip changes the AXIS of the page, which is the cheapest way to wake a
 * scroll up, and it happens to suit the content: products are a range you look
 * along, not a hierarchy you read down.
 *
 * Native `overflow-x` + `scroll-snap`, no carousel script. It swipes on touch,
 * scrolls on a trackpad, tabs on a keyboard (the cards are focusable because
 * they contain focusable content — see below), and with no JavaScript at all it
 * is still a row you can push. A JS carousel would give up every one of those.
 *
 * The strip breaks out of the Container to the viewport edge deliberately: a
 * strip that stops at the text column reads as a widget sitting in the page,
 * whereas one that runs off the edge reads as the page continuing sideways —
 * and it makes the fact that there is more to the right self-evident without a
 * chevron pointing at it.
 */
export function ProductStrip({
  items,
  images,
  alt,
}: {
  items: { label: string; body: string }[];
  images: readonly string[];
  /**
   * ONE alt for the whole set, and it is deliberately vague.
   *
   * IT USED TO SAY "Timber, panel and finish samples." — which was false, and
   * had been false since before this rename: the six files are furnished ROOM
   * photographs, not swatches, so the alt described pictures that were never
   * there. That is worse than a placeholder image, because a sighted reader
   * can see the mismatch and correct for it while a screen-reader user is
   * simply told something untrue.
   *
   * So it now says what is actually in the frame and nothing more. It
   * deliberately does NOT name the product from the caption: a shared alt
   * reading "a fire-rated door" would state, to exactly the readers who cannot
   * check, that the factory's own work is on screen.
   *
   * TODO(F-content): the real fix is six product photographs — see the mapping
   * note on `landingImages.woodworks.products`, where card 05 currently shows
   * an indoor room under "Outdoor Wooden Structures".
   */
  alt: string;
}) {
  return (
    <div className="ww-strip mt-[clamp(28px,4vw,52px)]">
      {items.map((m, i) => (
        <Reveal key={m.label} delay={Math.min(i, 3) * 0.06} className="ww-card">
          <figure className="flex h-full flex-col">
            <Photo
              src={images[i % images.length]}
              alt={alt}
              ratio="square"
              sizes="(max-width: 860px) 60vw, 300px"
              className="rounded-[var(--radius-image)]"
            />
            <figcaption className="mt-4 flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--color-line)" }}>
              <span className="flex items-baseline gap-2.5">
                <span
                  className="font-mono text-[11px] tabular-nums"
                  style={{ color: "var(--color-accent)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-h4 font-semibold text-[color:var(--color-ink)]">
                  {m.label}
                </span>
              </span>
              <span className="text-body-sm leading-body text-[color:var(--color-ink-body)]">
                {m.body}
              </span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

/* ============================================================================
   SUBSTRATES — the spec footnote under the product strip.
   ========================================================================= */

/**
 * The six board types the products are made from, demoted but not deleted.
 *
 * WHY THIS EXISTS AT ALL. Slide 14 took the section these used to occupy. The
 * obvious move was to drop them, and it was the wrong one: "solid wood, MDF,
 * veneer, HPL, chipboard, wood panel" with a line each on where each is used
 * is the most CHECKABLE copy on this page. A specifier reading it learns
 * something they can hold the factory to. That is worth more than the space it
 * costs, and deleting sourced detail to make room for marketing is the exact
 * trade this project exists to refuse.
 *
 * SO IT IS SUBORDINATE RATHER THAN GONE: no eyebrow, no h2, no photographs,
 * smaller type, muted ink, sitting under the strip inside the same section. It
 * reads as the spec footnote to the product range, which is what it is — you
 * buy a door, the substrate is how the door is built.
 *
 * THE FSC SENTENCE CAME WITH IT, and had to. It says "every substrate sits
 * inside our chain-of-custody scope" — attached to the product cards it would
 * have been claiming certification for finished goods, which is not what a
 * chain-of-custody certificate covers. It belongs to this list specifically.
 */
export function SubstrateList({
  label,
  sub,
  items,
}: {
  label: string;
  sub: string;
  items: { label: string; body: string }[];
}) {
  return (
    <Reveal y={18}>
      <div
        className="mt-[clamp(36px,4.5vw,64px)] border-t pt-[clamp(20px,2.5vw,32px)]"
        style={{ borderColor: "var(--color-line)" }}
      >
        <p
          className="font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
          style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
        >
          {label}
        </p>
        <p className="mt-3 max-w-[64ch] text-body-sm leading-body text-[color:var(--color-ink-body)]">
          {sub}
        </p>

        {/* A definition list, because that is literally what it is: a term and
            what the term is for. Three columns at width so six short entries
            do not become a tall stack competing with the strip above. */}
        <dl className="mt-[clamp(20px,2.5vw,30px)] grid gap-x-[clamp(20px,3vw,44px)] gap-y-4 nav:grid-cols-3">
          {items.map((m) => (
            <div key={m.label}>
              <dt className="font-display text-body font-semibold text-[color:var(--color-ink)]">
                {m.label}
              </dt>
              <dd className="mt-1 text-body-sm leading-body text-[color:var(--color-ink-muted)]">
                {m.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Reveal>
  );
}

/* ============================================================================
   CAPACITY — the annual output band.
   ========================================================================= */

/**
 * What the wood division can produce in a year, from profile v3 slide 12.
 *
 * THE HEADLINE IS SEPARATED FROM THE GRID ON PURPOSE. 75M SAR is money and the
 * other six are volumes; dropped into one grid the riyal figure reads as a
 * seventh quantity with a missing unit. The slide separates them too.
 *
 * THE FIGURES COME FROM `WOODWORKS_CAPACITY`, THE UNITS AND LABELS FROM THE
 * MESSAGE FILES, joined by index. That split is not fussiness: "m²" is the
 * same in both locales but "LM" and "M SAR" are not, so a unit baked into
 * facts.ts would have printed English abbreviations inside Arabic type. Facts
 * are facts in any language; their units are copy.
 *
 * `grouping` travels with each figure rather than being assumed, because the
 * count-up formats through `Intl.NumberFormat` and 75 must not become "75" in
 * a band where 150,000 is "150,000" — the separator is what tells a reader
 * which of those is a quantity.
 */
export function CapacityBand({
  locale,
  headline,
  headlineValue,
  headlineGrouping,
  stats,
  items,
}: {
  locale: string;
  headline: { unit: string; label: string };
  headlineValue: number;
  headlineGrouping?: boolean;
  stats: readonly { value: number; grouping?: boolean }[];
  items: { unit: string; label: string }[];
}) {
  return (
    <>
      <Reveal y={22}>
        <div
          className="mt-[clamp(32px,4vw,56px)] border-t pt-[clamp(20px,2.5vw,30px)]"
          style={{ borderColor: "var(--color-accent)" }}
        >
          <p className="font-display text-[clamp(38px,6vw,84px)] font-bold leading-[1.02] tracking-display text-[color:var(--color-ink)]">
            <CountUp
              to={headlineValue}
              suffix={headline.unit}
              grouping={headlineGrouping}
              locale={locale}
            />
          </p>
          <p
            className="mt-2 font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
            style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
          >
            {headline.label}
          </p>
        </div>
      </Reveal>

      {/* Two columns on a phone rather than one: these are short figures, and
          a six-row single column of numbers reads as a receipt. */}
      <dl className="mt-[clamp(28px,3.5vw,48px)] grid grid-cols-2 gap-x-[clamp(20px,3vw,44px)] gap-y-[clamp(24px,3vw,36px)] nav:grid-cols-3">
        {stats.map((stat, i) => (
          <Reveal
            key={items[i]?.label ?? i}
            y={22}
            delay={Math.min(i, 3) * 0.07}
            className="border-t pt-4 [border-color:var(--color-line)]"
          >
            <dt className="sr-only">{items[i]?.label}</dt>
            <dd>
              <CountUp
                to={stat.value}
                suffix={items[i]?.unit}
                grouping={stat.grouping}
                locale={locale}
                className="block font-display text-[clamp(24px,2.4vw,38px)] font-bold leading-[1.05] tracking-display text-[color:var(--color-ink)]"
              />
              <span
                className="mt-2 block font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
                style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
              >
                {items[i]?.label}
              </span>
            </dd>
          </Reveal>
        ))}
      </dl>
    </>
  );
}

/* ============================================================================
   SERVICES — a mono list with plus markers.
   ========================================================================= */

/**
 * The four services as a ruled two-column list instead of a four-cell card
 * grid.
 *
 * Cards imply four separate things you might buy. The copy says the opposite —
 * "four services, one contract" — so a list under one rule states the offer the
 * words are making, and the page gets a quiet block between two loud ones.
 *
 * The plus marker is the only ornament, and it is the same plus the gallery
 * rail used to navigate with. There it was a control that looked like
 * decoration, which is why it was removed; here it is decoration that looks
 * like decoration, which is fine.
 */
export function ServicesList({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ul className="mt-[clamp(28px,4vw,52px)] grid gap-x-[clamp(28px,4vw,64px)] nav:grid-cols-2">
      {items.map((s, i) => (
        <li key={s.title}>
          <Reveal delay={(i % 2) * 0.08}>
            <div className="flex gap-4 border-t py-[clamp(18px,2.4vw,28px)]" style={{ borderColor: "var(--color-line)" }}>
              <span
                aria-hidden
                className="flex-none font-mono text-[13px] leading-none"
                style={{ color: "var(--color-accent)", marginTop: "0.35em" }}
              >
                +
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-h4 font-semibold text-[color:var(--color-ink)]">
                  {s.title}
                </h3>
                <p className="mt-2 text-body-sm leading-body text-[color:var(--color-ink-body)]">
                  {s.body}
                </p>
              </div>
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

/* ============================================================================
   PROJECTS — a full-bleed band with the CTA over it.
   ========================================================================= */

/**
 * The page's last image, at full width, with the invitation on top of it.
 *
 * This replaced a `SectionHeader` and a pill sitting on an empty surface —
 * three lines of text and a button, closing a page about manufacturing with
 * nothing to look at. A page that has just spent four sections claiming it can
 * make things should end by showing one.
 *
 * The parallax is `ParallaxImage`, which oversizes the photograph inside a
 * fixed frame rather than moving the frame — so the band's height never changes
 * and the sections either side of it do not shift while it travels.
 */
export function ProjectsBand({
  eyebrow,
  heading,
  sub,
  cta,
  image,
  alt,
}: {
  eyebrow: React.ReactNode;
  heading: string;
  sub: string;
  cta: string;
  image: string;
  alt: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <ParallaxImage amount={9} className="absolute inset-0 -z-10">
        <Photo
          src={image}
          alt={alt}
          height="100%"
          sizes="100vw"
          className="h-full"
        />
      </ParallaxImage>

      {/* The scrim is not optional: this is the one place on the page where
          type sits directly on a photograph, and the photograph is a
          client-replaceable placeholder. A fixed dark wash means whatever
          replaces it cannot take the headline's contrast down with it. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgb(20 20 18 / 0.92) 0%, rgb(20 20 18 / 0.72) 45%, rgb(20 20 18 / 0.5) 100%)",
        }}
      />

      <Container>
        <div className="flex flex-col items-start gap-5 py-[clamp(72px,11vw,168px)]">
          <LineReveal>{eyebrow}</LineReveal>
          <WordsReveal
            as="h2"
            text={heading}
            justify="flex-start"
            delay={0.08}
            className="max-w-[18ch] font-display text-h2 font-bold leading-h2 tracking-display"
            style={{ color: "var(--white-500)" }}
          />
          <LineReveal delay={0.2}>
            <p className="max-w-[46ch] text-body leading-body" style={{ color: "rgb(250 245 239 / 0.8)" }}>
              {sub}
            </p>
          </LineReveal>
          <LineReveal delay={0.28}>
            <Pill variant="tan" href="/gallery?c=woodworks">
              {cta}
            </Pill>
          </LineReveal>
        </div>
      </Container>
    </section>
  );
}
