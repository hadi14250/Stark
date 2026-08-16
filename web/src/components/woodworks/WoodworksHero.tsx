import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { Photo } from "@/components/ui/Photo";
import { WordsReveal, LineReveal } from "@/components/motion/WordsReveal";

/**
 * The Woodworks opener — a full-viewport dark hero, not a `PageOpener`.
 *
 * `PageOpener` is the shared page-top component and it is doing its job on
 * Mattresses; the problem here was that Woodworks and Home used it with almost
 * the same arguments, so the two pages opened identically and the visitor's
 * first impression was "I have seen this". This page needs to declare its own
 * register in the first screen, so it gets its own opener.
 *
 * THE COMPOSITION IS ONE IDEA: a standing rule, and everything hangs off it.
 *
 *   │ WOODWORKS
 *   │ Where materials
 *   │ become spaces              [ the photograph, bleeding off the end edge ]
 *   │ sub copy
 *   │ CTA  CTA
 *   │ 01 spec · 02 spec · 03 spec
 *
 * The rule is a real element rather than a border, because it draws itself in
 * on load — the page's first gesture is a vertical line arriving, which is the
 * gesture a workshop drawing starts with too.
 *
 * The photograph occupies the end 55% and runs off the inline-end edge on
 * purpose. A contained image with margin on both sides reads as an
 * illustration; one that leaves the frame reads as a window onto something
 * larger, which is the claim the page is making.
 *
 * SIZED IN `svh`, NOT `vh`. On mobile Safari `100vh` is the LARGE viewport —
 * the toolbar-collapsed height — so a `100vh` hero is taller than the screen
 * on arrival and pushes its own CTAs under the fold. `svh` is the small
 * viewport, which is what is actually visible when the page loads.
 */
export function WoodworksHero({
  eyebrow,
  line1,
  line2,
  sub,
  meta,
  image,
  imageAlt,
  ctaPrimary,
  ctaSecondary,
  scrollLabel,
}: {
  eyebrow: string;
  line1: string;
  line2: string;
  sub: string;
  meta: string[];
  image: string;
  imageAlt: string;
  ctaPrimary: string;
  ctaSecondary: string;
  scrollLabel: string;
}) {
  return (
    <section
      className="relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col justify-center overflow-hidden py-[clamp(48px,7vw,96px)]"
      style={{ background: "var(--color-surface)" }}
    >
      {/* ---- the photograph ----
          Absolute on desktop so the copy column can sit over its start edge;
          a plain block below `nav:` where there is no room to overlap. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 end-0 hidden w-[58%] nav:block"
      >
        <Photo
          src={image}
          alt=""
          height="100%"
          kenBurns
          priority
          sizes="60vw"
          className="h-full"
        />
        {/*
          The photograph is graded dark by the theme, then this carries it the
          rest of the way into the page. Without it the image's start edge is a
          hard vertical seam against the near-black surface — the whole point of
          bleeding an image off the frame is lost if the other edge announces
          itself. Opaque at the start, clear by 55%.
        */}
        <div className="ww-veil" />
      </div>

      <Container className="relative z-[1]">
        <div className="flex items-stretch gap-[clamp(18px,2.5vw,34px)]">
          {/* THE STANDING RULE. `reveal-line-y` draws it from the top on
              entry; the class is inert until the reveal lands, so a stalled
              observer leaves a visible line rather than no line. */}
          <span
            aria-hidden
            className="reveal-line-y is-revealed w-px flex-none self-stretch"
            style={{ background: "var(--color-accent)", opacity: 0.55 }}
          />

          <div className="flex max-w-[min(58ch,100%)] flex-col items-start gap-6 nav:max-w-[52%]">
            <LineReveal>
              <Eyebrow division="woodworks">{eyebrow}</Eyebrow>
            </LineReveal>

            {/*
              `clamp(40px, 5.2vw, 68px)` is PageOpener's own hero size, matched
              deliberately. The page's structure is what differentiates it —
              inventing a fourth heading scale would make the SITE incoherent
              to buy a difference the composition is already delivering. (The
              scale runs display/h2/h3/h4; there is no `h1` role, which is the
              reason this is a style rather than a class.)
            */}
            <h1
              className="font-display leading-display tracking-display text-[color:var(--color-ink)]"
              style={{ fontSize: "clamp(40px, 5.2vw, 68px)" }}
            >
              <WordsReveal as="span" text={line1} justify="flex-start" className="font-light" />
              {/*
                ⚠ THE SECOND LINE IS INK, NOT ACCENT, AND THAT IS A CONTRAST FIX
                RATHER THAN A PREFERENCE.

                It was `--color-accent` — sand — which on the near-black page
                this hero was designed for is a strong 8:1 and reads as the
                headline's emphasis. The page is cream now, and sand on
                `#FCF9EF` is 1.53:1. Not "a bit low": below the 3:1 floor for
                non-text marks, never mind the 4.5:1 for text, on the largest
                type on the route.

                The light/semibold pairing is what carried the two-line
                composition anyway; the colour was doing the smaller half of the
                job, and DESIGN.md §1.5 already rules that on light surfaces the
                affordance moves to weight rather than hue. Sand survives on this
                page as marks on their own — the standing rule, the ordinals —
                never as type.
              */}
              <WordsReveal
                as="span"
                text={line2}
                justify="flex-start"
                delay={0.12}
                className="font-semibold"
              />
            </h1>

            <LineReveal delay={0.26}>
              <p className="max-w-[46ch] text-body leading-body text-[color:var(--color-ink-body)]">
                {sub}
              </p>
            </LineReveal>

            <LineReveal delay={0.34}>
              <div className="flex flex-wrap items-center gap-3">
                <Pill variant="tan" href="/#contact">
                  {ctaPrimary}
                </Pill>
                <Pill variant="forest" href="/gallery?c=woodworks">
                  {ctaSecondary}
                </Pill>
              </div>
            </LineReveal>

            {/* Spec row — mono, numbered, hairline-separated. Qualitative
                only: these are capabilities, not figures. Nothing here is
                gated on F-facts because nothing here is a number. */}
            <LineReveal delay={0.42}>
              <ul className="mt-2 flex flex-wrap gap-x-[clamp(18px,2.4vw,36px)] gap-y-3">
                {meta.map((m, i) => (
                  <li key={m} className="flex items-baseline gap-2.5">
                    <span
                      className="font-mono text-[11px] tabular-nums"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
                      style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
                    >
                      {m}
                    </span>
                  </li>
                ))}
              </ul>
            </LineReveal>
          </div>
        </div>

        {/* Below `nav:` the photograph becomes a real block under the copy
            rather than disappearing — the hero is the only image above the
            fold and dropping it on a phone would leave a wall of type. */}
        <div className="mt-9 nav:hidden">
          <Photo
            src={image}
            alt={imageAlt}
            ratio="band"
            kenBurns
            priority
            sizes="100vw"
            className="rounded-[var(--radius-image)]"
          />
        </div>
      </Container>

      {/* Scroll cue. Decorative motion, real text for anyone who cannot see
          it move. */}
      <Container className="relative z-[1] mt-[clamp(28px,4vw,56px)]">
        <span
          className="inline-flex items-center gap-3 font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
          style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
        >
          <span aria-hidden className="ww-cue" />
          {scrollLabel}
        </span>
      </Container>
    </section>
  );
}
