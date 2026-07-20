import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Pill } from "@/components/ui/Pill";
import { Photo } from "@/components/ui/Photo";
import { WordsReveal, LineReveal } from "@/components/motion/WordsReveal";

/**
 * A full-viewport photograph with the headline lying on it.
 *
 * WHAT THIS REPLACED: `PageOpener` with a 16:9 band under it — about 56% of the
 * first screen was centred text on white, and the photograph arrived as a
 * letterboxed strip below the fold's midpoint. The client's note was that the
 * page felt like Home reordered, and the hero was most of the reason: two pages
 * opening with the same component, the same centred column and the same
 * proportions do not feel different no matter what colour the ink is.
 *
 * A mattress page's job in its first screen is to make somebody want to lie
 * down. That is photography's job, not typography's, so the photograph gets the
 * screen and the words sit on it.
 *
 * ONE CTA, not two. The old hero offered "Talk to us" and "See our work" at
 * equal weight over a section whose content is two brands with their own CTAs
 * 600px below. Two competing primaries at the top of a page is how you get
 * neither pressed.
 *
 * SIZED IN `svh`. `100vh` on mobile Safari is the toolbar-collapsed height, so
 * a `100vh` hero is taller than the screen on arrival and buries its own CTA.
 */
export function MattressHero({
  eyebrow,
  line1,
  line2,
  sub,
  cta,
  image,
  imageAlt,
}: {
  eyebrow: string;
  line1: string;
  line2: string;
  sub: string;
  cta: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col justify-end overflow-hidden">
      {/* The photograph fills the section; the veil below guarantees the copy a
          readable field whatever replaces it. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <Photo
          src={image}
          alt=""
          height="100%"
          kenBurns
          priority
          sizes="100vw"
          className="h-full"
        />
        <div className="mt-hero-veil" />
      </div>

      {/*
        The alt text lives on a visually-hidden element rather than on the
        decorative copy above. The photograph IS content here — it is the
        section's subject — but it is also a background for the headline, and
        an <img alt> that is announced immediately before a heading saying
        something similar is noise. This way the description is available and
        the reading order stays sensible.
      */}
      <span className="sr-only">{imageAlt}</span>

      <Container className="pb-[clamp(48px,8vw,104px)] pt-[clamp(120px,20vh,220px)]">
        <div className="flex flex-col items-center gap-6 text-center">
          <LineReveal>
            <Eyebrow division="mattresses">{eyebrow}</Eyebrow>
          </LineReveal>

          <h1
            className="font-display leading-display tracking-display text-[color:var(--color-ink)]"
            style={{ fontSize: "clamp(40px, 5.2vw, 68px)" }}
          >
            <WordsReveal as="span" text={line1} className="font-light" />
            <WordsReveal as="span" text={line2} delay={0.12} className="font-semibold" />
          </h1>

          <LineReveal delay={0.24}>
            <p className="max-w-[54ch] text-lead leading-lead text-[color:var(--color-ink-body)]">
              {sub}
            </p>
          </LineReveal>

          <LineReveal delay={0.32}>
            <Pill variant="tan" href="/#contact">
              {cta}
            </Pill>
          </LineReveal>
        </div>
      </Container>
    </section>
  );
}
