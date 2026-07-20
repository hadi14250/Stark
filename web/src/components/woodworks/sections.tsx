import { Container } from "@/components/ui/Container";
import { Pill } from "@/components/ui/Pill";
import { Photo } from "@/components/ui/Photo";
import { ParallaxImage } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { WordsReveal, LineReveal } from "@/components/motion/WordsReveal";

/* ============================================================================
   MATERIALS — a horizontal scroll-snap strip.
   ========================================================================= */

/**
 * Six materials as a strip you push sideways, rather than a 3x2 grid of
 * definition-list rows.
 *
 * The grid was not wrong, it was just the fourth stacked full-width block in a
 * row — by the time a visitor reached it the page had stopped changing shape.
 * A strip changes the AXIS of the page, which is the cheapest way to wake a
 * scroll up, and it happens to suit the content: materials are a sample set you
 * look along, not a hierarchy you read down.
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
export function MaterialsStrip({
  items,
  images,
  alt,
}: {
  items: { label: string; body: string }[];
  images: readonly string[];
  /** One alt for the set — these are material swatches, not distinct scenes. */
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
