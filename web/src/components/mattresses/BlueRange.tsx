import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/motion/Reveal";
import { BLUE_MODELS, BLUE_MODEL_NAMES, mattressImages } from "./assets";

/**
 * blue's eight models, as eight cards.
 *
 * WHY THIS SECTION EXISTS: the client's note on this route was that it "lacks a
 * lot of pictures". They were right in a way that was worse than it sounded —
 * the page was using THREE photographs while forty-eight real product shots of
 * their own products sat unused in the repository. The division whose whole
 * subject is a physical object you look at before you buy was the least
 * illustrated page on the site.
 *
 * NAMES ONLY. NO PER-MODEL COPY, AND THAT IS DELIBERATE.
 *
 * Each of these eight has a 2026 product sheet full of quotable material, and
 * almost none of it can ship. Three sheets carry health claims — allergen
 * reduction percentages, a cortisol claim, a carotenoid claim — which the
 * client and I already agreed never go on the site, because a mattress is not a
 * medical device and a percentage in a sales sheet is not a clinical result.
 * Writing a paragraph per model would mean either repeating those claims or
 * inventing eight bland substitutes for them, and inventing copy is the exact
 * failure this project has spent three rounds undoing.
 *
 * So the band shows what is true and checkable: this is the range, these are
 * its names, this is what each one looks like. A reader who wants more asks,
 * which is what the CTA on the panel above is for.
 *
 * ⚠ blue ONLY, AND THE PAGE SAYS SO. There is no siesta photography, so a
 * "range" band that quietly showed only one brand's products under a neutral
 * heading would read as the whole catalogue. The heading names blue and the
 * note under the grid names the gap.
 */
type Tech = { name: string; body: string };

export function BlueRange({
  alt,
  note,
  techLabel,
  techItems,
}: {
  alt: string;
  note: string;
  techLabel: string;
  techItems: Tech[];
}) {
  return (
    <>
      <ul className="mt-[clamp(32px,4vw,60px)] grid grid-cols-2 gap-[clamp(12px,1.6vw,24px)] nav:grid-cols-4">
        {BLUE_MODELS.map((model, i) => {
          const name = BLUE_MODEL_NAMES[model];
          return (
            /* Stagger by COLUMN, not by index. A flat `i * 0.06` runs the last
               card almost half a second behind the first, and on a two-column
               phone layout that reads as the grid loading rather than as a
               reveal. Modulo the widest column count keeps the wave short at
               every breakpoint. */
            <Reveal key={model} delay={(i % 4) * 0.06} className="h-full">
              <li className="mt-model h-full list-none">
                <Photo
                  src={mattressImages.rangeShot(model)}
                  /* The name is in the heading below, so a screen reader would
                     otherwise hear it twice in a row. The template says what
                     the picture shows; the <p> says what the product is. */
                  alt={alt.replace("{name}", name)}
                  /*
                    `band`, not `square`. These are cut-outs rendered
                    `contain`, so the card's aspect ratio decides how much of
                    it the product can fill, and every one of the eight is a
                    wide, flat object photographed from a low angle. In a
                    square card each mattress filled about a third of the
                    frame and the other two thirds were empty ivory, eight
                    times over: the band read as very sparse rather than very
                    airy.
                  */
                  ratio="band"
                  sizes="(max-width: 860px) 45vw, 22vw"
                />
                <p className="mt-model-name">{name}</p>
              </li>
            </Reveal>
          );
        })}
      </ul>

      {/*
        BUILT WITH: blue's construction technologies (profile p22). Names and
        neutral one-line descriptions only. The trademarked health-claim
        technologies on the same profile page — PUROTEX+ (allergen), INTENSE
        (relaxation), COMBOCOOL (cooling) and SKIN+ — are deliberately omitted,
        per the standing decision that a mattress is not a medical device and a
        sales-sheet percentage is not a clinical result. See the docblock above
        and SOURCES.md.
      */}
      {techItems.length > 0 && (
        <div className="mt-[clamp(32px,4vw,56px)]">
          <p
            className="text-center font-mono text-eyebrow tracking-eyebrow text-[color:var(--color-ink-muted)]"
            style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
          >
            {techLabel}
          </p>
          <ul className="mt-[clamp(16px,2vw,28px)] grid grid-cols-2 gap-[clamp(10px,1.4vw,18px)] nav:grid-cols-3">
            {techItems.map((item, i) => (
              <Reveal
                as="li"
                key={item.name}
                delay={(i % 3) * 0.06}
                className="h-full list-none rounded-[var(--radius-card)] border p-[clamp(16px,1.6vw,22px)] text-start [border-color:var(--color-line)]"
              >
                <p className="font-display text-[clamp(15px,1.3vw,18px)] font-semibold text-[color:var(--color-ink)]">
                  {item.name}
                </p>
                <p className="mt-1.5 text-body-sm leading-body text-[color:var(--color-ink-body)]">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      )}

      {/* Centred, because this page's section headers are: the mattresses
          theme sets `--align-axis: center` in both locales, and a note
          hard-left under a centred heading and a full-width grid reads as a
          stray caption rather than as the section's footnote. */}
      <p className="mx-auto mt-[clamp(16px,2vw,24px)] max-w-[60ch] text-center text-body-sm leading-body text-[color:var(--color-ink-muted)]">
        {note}
      </p>
    </>
  );
}
