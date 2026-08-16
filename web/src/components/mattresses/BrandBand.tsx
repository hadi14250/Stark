import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";

/**
 * A full-bleed band in one sub-brand's own colours, with its wordmark at the
 * head.
 *
 * ===========================================================================
 * WHY THIS EXISTS
 * ===========================================================================
 *
 * The client's note on the two range sections was that they did not look like
 * they belonged to the brands whose products they show: "it doesn't appear that
 * it's visually for the blue mattress, make it in a way that appears that this
 * belongs to blue". They were right, and the reason is structural rather than
 * cosmetic — both bands were the shared section shell, on the page's ivory,
 * with the brand's name in the heading and nothing else of the brand anywhere.
 * The only thing distinguishing blue's range from siesta's was the word "blue".
 *
 * So each range gets a band in its own colour, running edge to edge, with the
 * manufacturer's own wordmark at the top of it. A reader scrolling past sees
 * two clearly different territories without reading a heading, which is the
 * test the client was applying.
 *
 * ===========================================================================
 * `data-brand` STAYS ON THE DECORATIVE LAYERS. THIS IS THE IMPORTANT PART.
 * ===========================================================================
 *
 * `[data-brand]` re-points `--color-accent` (tokens.css). Put it on the SECTION
 * and everything inside inherits it — which is how the brand duet once shipped
 * a solid blue button on one panel and a solid purple one on the other, two
 * CTAs for the same STARK conversation looking like two different companies'
 * websites side by side. BrandDuet solved that by scoping the attribute to a
 * single decorative span, and the same rule applies here with more surface
 * area to get it wrong on.
 *
 * So the attribute goes on the two painted layers and nowhere else. Anything
 * the reader can interact with inherits STARK's accent, as it should — these
 * are STARK's products, sold under STARK's contract.
 *
 * ===========================================================================
 * THE WORDMARK IS ON A LIGHT PLATE, AND THAT IS NOT LAZINESS
 * ===========================================================================
 *
 * Both marks are fixed-colour trademarks: blue's is navy over sky, siesta's is
 * purple with an orange rule. Knocking either out to white would be altering
 * someone else's mark, and blue's navy on a navy band would simply disappear.
 * A light plate is how a brand supplies its logo for use on colour, and it is
 * what the profile does on pp22 and 25.
 */
export function BrandBand({
  brand,
  logoAlt,
  eyebrow,
  heading,
  intro,
  children,
}: {
  brand: "blue" | "siesta";
  /** The brand's name, as the mark's accessible text. */
  logoAlt: string;
  eyebrow: string;
  heading: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section
      /*
        `data-surface="dark"` IS WHAT LETS THE SHARED COMPONENTS RENDER IN HERE.

        The children are the same range grids the page used on its ivory: their
        titles read `--color-ink`, their hairlines `--color-line`, their cards
        mix from `--color-accent`. Dropped onto a saturated navy band unchanged,
        every one of those resolves from the LIGHT theme — dark green type on
        dark blue, invisible hairlines, the exact failure the contact card's
        `[data-surface="light"]` reset was built to avoid, in reverse.

        Declaring the surface re-points all of it at once, which is the mechanism
        Turnkey's dark slab already uses. It also re-points `--color-accent` to
        sand, deliberately: a pill in here is STARK asking for the conversation,
        not the sub-brand, and it must not pick up the band's colour.

        The two painted spans below set `data-brand` on THEMSELVES, so their own
        declaration wins for their own gradient while everything else in the
        subtree keeps the dark roles. That is the containment rule from both
        directions at once.

        The band paints itself rather than taking a `Section` surface: it is
        full-bleed colour, so it sits outside the page's surface alternation
        entirely. The sections either side of it are what alternate.
      */
      data-surface="dark"
      className="mt-brand-band relative isolate overflow-hidden"
    >
      {/* The ground. Both painted layers carry `data-brand`; nothing else does. */}
      <span aria-hidden data-brand={brand} className="mt-brand-ground" />
      <span aria-hidden data-brand={brand} className="mt-brand-glow" />

      <Container className="relative z-[1] py-[clamp(56px,7vw,104px)]">
        <Reveal y={20}>
          <div className="mt-brand-head">
            <span className="mt-brand-plate">
              <Image
                src={`/brands/${brand}.png`}
                alt={logoAlt}
                width={260}
                height={130}
                className="h-[clamp(34px,4vw,50px)] w-auto object-contain"
                sizes="260px"
              />
            </span>
            <span
              className="font-mono text-eyebrow tracking-eyebrow text-[color:var(--color-ink-muted)]"
              style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
            >
              {eyebrow}
            </span>
          </div>
        </Reveal>

        <Reveal y={24} delay={0.08}>
          <h2 className="mt-[clamp(20px,2.6vw,32px)] max-w-[20ch] font-display text-h2 font-bold leading-h2 tracking-display text-[color:var(--color-ink)]">
            {heading}
          </h2>
        </Reveal>

        <Reveal y={20} delay={0.14}>
          <p className="mt-4 max-w-[70ch] text-lead leading-lead text-[color:var(--color-ink-body)]">
            {intro}
          </p>
        </Reveal>

        {children}
      </Container>
    </section>
  );
}
