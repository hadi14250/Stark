import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/motion/Reveal";

export type BrandPanel = {
  name: string;
  audience: string;
  /**
   * The brand's own promise, in the brand's own words.
   *
   * Both came from the client on profile v3: "Blue : Where dreams begin"
   * (slide 16) and "Siesta: You Deserve a Great Night" (slide 17). siesta's is
   * the one that matters — every earlier document dropped the "a" and printed
   * "You Deserve Great Night", so the site had been quoting a brand promise
   * that was not quite the brand's promise.
   *
   * ⚠ siesta's KEEPS ITS TITLE CASE AND TAKES NO FULL STOP, in both locales.
   * It is a registered line the client writes that way, not a sentence we are
   * setting; blue's reads as a phrase and is punctuated as one. The asymmetry
   * is in the source, so it is preserved rather than tidied.
   */
  tagline: string;
  body: string;
  points: string[];
  alt: string;
  image: string;
  /** Which `[data-brand]` subtree this panel opens. */
  brand: "blue" | "siesta";
};

/**
 * The two sub-brands as two full-height tinted panels, side by side.
 *
 * WHAT THIS REPLACED: two stacked photo-beside-text rows — the same layout as
 * Home's Divisions, as Woodworks' old capability bands, and as most of the rest
 * of the site. The two brands genuinely serve different buyers, and the whole
 * point of the section is that they are a PAIR you choose between. Stacked rows
 * say "here is one thing, and now here is another thing"; a duet says "these
 * two, pick".
 *
 * THE TINT IS WHERE THE SUB-BRAND COLOUR FINALLY GETS TO DO SOMETHING. Both
 * brand colours already existed as tokens and were used on a 56px rule and a
 * pill — the smallest possible expression of the only two colours on the site
 * that are not green or sand. As a wash over a photograph they carry the panel,
 * and because they sit under a gradient rather than behind text they never take
 * on a contrast obligation they would fail. Type on top is off-white
 * throughout, which is legible on both tints at the weights used here.
 *
 * `[data-brand]` stays scoped to the panel subtree and never touches page
 * chrome — that containment is the reason these colours are allowed on the
 * site at all.
 *
 * MOBILE STACKS AND DROPS THE HOVER. There is no hover on a phone and no room
 * for two full-height panels side by side; each becomes a full-width panel at
 * a reduced height, in reading order, with the same content and the same CTA.
 */
export function BrandDuet({ panels }: { panels: BrandPanel[] }) {
  return (
    <div className="mt-duet mt-[clamp(36px,5vw,72px)]">
      {panels.map((p, i) => (
        <Reveal key={p.name} delay={i * 0.1} className="flex flex-1">
          <article className="mt-panel w-full">
            {/* Photograph, then the brand wash over it. Both behind the copy. */}
            <div aria-hidden className="absolute inset-0 -z-20">
              <Photo
                src={p.image}
                alt=""
                height="100%"
                sizes="(max-width: 860px) 100vw, 50vw"
                className="h-full"
              />
            </div>
            {/* Scrim first (legibility), brand tint second (identity). Both
                sit under the copy; neither carries text. */}
            <span aria-hidden className="mt-panel-scrim" />
            {/*
              `data-brand` SITS ON THE TINT, not on the panel — the tightest
              containment available, and it has to be this tight.

              `[data-brand]` re-points `--color-accent`. With the attribute on
              the <article>, the panel's own `Pill variant="tan"` inherited it
              and rendered as a solid blue button on one panel and a solid
              purple one on the other: two CTAs for the same STARK conversation,
              looking like two different companies' websites side by side.
              Scoped to this one decorative span, the brand colour reaches its
              gradient and nothing else.
            */}
            <span aria-hidden data-brand={p.brand} className="mt-panel-tint" />

            <p
              className="font-mono text-[11px] tracking-eyebrow"
              style={{
                color: "rgb(250 245 239 / 0.72)",
                textTransform: "var(--eyebrow-transform)" as "uppercase",
              }}
            >
              {p.audience}
            </p>

            {/* The wordmark is set lowercase exactly as the brand is written —
                `blue mattress` and `siesta` are lowercase marks, and
                title-casing them here would be inventing a brand style. */}
            <h3
              className="mt-3 font-display text-h2 font-bold leading-h2 tracking-display"
              style={{ color: "var(--white-500)" }}
            >
              {p.name}
            </h3>

            {/* The promise sits between the mark and the explanation, which is
                where a tagline belongs: it is the short form of the paragraph
                below it. Set lighter and larger than the body so it reads as a
                line rather than as the paragraph's first sentence. */}
            <p
              className="mt-2 font-display text-lead font-light leading-lead"
              style={{ color: "rgb(250 245 239 / 0.92)" }}
            >
              {p.tagline}
            </p>

            {/*
              54ch, NOT 42ch. The client asked for the panel text to be wider
              and they were reading a real defect: the panel is half of a
              full-bleed row, so at 1440 it is about 570px of usable width and
              42ch was setting the paragraph in roughly 360 of them. A third of
              each panel was empty while the copy ran to five short lines.

              ⚠ WIDER MEASURE, NOT `flex-grow`. `mattresses.css:43-60` records
              that making these panels resize was a bug the client reported: the
              hover grew one panel and shrank the other, so pointing at siesta
              visibly moved blue. Widening the TEXT inside a fixed panel is the
              change that was asked for; widening the panel is the one that was
              already rejected.
            */}
            <p
              className="mt-3 max-w-[54ch] text-body leading-body"
              style={{ color: "rgb(250 245 239 / 0.86)" }}
            >
              {p.body}
            </p>

            <ul
              className="mt-5 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] tracking-eyebrow"
              style={{
                color: "rgb(250 245 239 / 0.7)",
                textTransform: "var(--eyebrow-transform)" as "uppercase",
              }}
            >
              {p.points.map((point, j) => (
                <li key={point} className="flex items-center gap-4">
                  {j > 0 && (
                    <span
                      aria-hidden
                      className="h-1 w-1 rounded-full"
                      style={{ background: "rgb(250 245 239 / 0.5)" }}
                    />
                  )}
                  {point}
                </li>
              ))}
            </ul>

            {/*
              ⚠ NO CTA ON EITHER PANEL. The client asked for both buttons off —
              blue's "Let's talk" and siesta's "Request a specification".

              What that costs, so it is a decision rather than an accident: this
              was the only place on the route where the two audiences could
              take DIFFERENT next steps, which is the distinction the whole
              section exists to draw (a family buying one bed, a hotel buying
              two hundred). Every remaining route to a conversation on this page
              is the shared one — the hero pill and the contact section — so a
              hospitality buyer and a retail buyer now arrive at the same form.

              The `cta` field is gone from `mattresses.brands.items` in both
              locales too. If it comes back, it comes back as `Pill variant="tan"`
              on both panels: sand, never the brand colour. Two differently
              coloured buttons made the pair look like two companies' websites
              side by side, which is the confusion the containment rule on the
              tint span exists to prevent.
            */}

            <span className="sr-only">{p.alt}</span>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
