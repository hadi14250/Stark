import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MarkGlyph } from "@/components/brand/geometry";
import { Reveal } from "@/components/motion/Reveal";
import { LineReveal } from "@/components/motion/WordsReveal";
import { landingImages } from "@/components/landing/assets";
import { AboutCluster } from "./AboutCluster";

type Pillar = { title: string; body: string };

/**
 * About — the positioning statement, then Vision and Mission, beside a
 * pentagon photo cluster.
 *
 * The heading is the brand book's own line ("STARK is more than a
 * manufacturer"), not a generic "About us". A section that opens with "About
 * Us" has spent its most valuable line saying nothing.
 *
 * The photo cluster is ONE G1 pair, overlapped — the per-page budget allows two
 * pairs and Capabilities already spends three across its bands, so this stays
 * a single pentagon plus a small offset square rather than a second pair.
 */
export async function About() {
  const t = await getTranslations("landing.about");
  const paragraphs = t.raw("paragraphs") as string[];
  const collageAlt = t.raw("collageAlt") as string[];
  const pillars = t.raw("pillars") as Pillar[];

  return (
    <Section surface="surface" id="about" className="scroll-mt-[var(--header-h)]">
      <Container>
        <div className="grid items-center gap-[clamp(36px,6vw,80px)] nav:grid-cols-[1.05fr_1fr]">
          <Reveal x={-24}>
            <div className="flex flex-col items-start gap-5">
              <Eyebrow>{t("eyebrowLabel")}</Eyebrow>

              <h2 className="max-w-[16ch] font-display text-h2 font-bold leading-h2 tracking-display text-[color:var(--color-ink)]">
                {t("heading")}
              </h2>

              {/* Two paragraphs, not three. The third repeated the first with
                  different nouns, which is how a positioning statement stops
                  landing.

                  Each gets its own LineReveal rather than the column fading as
                  one block — the client asked for "more animation … for vision
                  and mission and text", and a paragraph that arrives after the
                  heading reads as the section assembling itself. */}
              <div className="flex max-w-[68ch] flex-col gap-4 text-body leading-body text-[color:var(--color-ink-body)]">
                {paragraphs.slice(0, 2).map((p, i) => (
                  <LineReveal key={i} delay={0.1 + i * 0.1}>
                    <p>{p}</p>
                  </LineReveal>
                ))}
              </div>

              {/*
                VISION AND MISSION ARE THE COMPANY'S OWN NOW. The two statements
                here were placeholders I wrote in Phase 3 and nobody had ever
                approved; the company profile (p.2) carries real ones. Inventing
                a mission statement for a real manufacturer and leaving it on a
                live page was the worst piece of invented copy on the site.

                They stagger in one after the other, each with its rule drawing
                across first, so the pair reads as two arriving rather than as a
                block appearing.
              */}
              <dl className="mt-2 grid w-full gap-5 nav:grid-cols-2">
                {pillars.map((p, i) => (
                  /* The Reveal IS the <div> grouping the dt/dd pair — a <dl>
                     may contain <div>s wrapping term/description groups, so
                     adding a second nested wrapper just to animate would put
                     invalid markup inside a definition list. */
                  <Reveal
                    key={p.title}
                    y={26}
                    delay={0.28 + i * 0.12}
                    className="h-full border-t pt-4 [border-color:var(--color-line)]"
                  >
                    <dt className="flex items-center gap-2.5 font-display text-h4 font-semibold text-[color:var(--color-ink)]">
                      <MarkGlyph division="stark" size={20} color="var(--color-accent)" />
                      {p.title}
                    </dt>
                    <dd className="mt-1.5 text-body-sm leading-body text-[color:var(--color-ink-body)]">
                      {p.body}
                    </dd>
                  </Reveal>
                ))}
              </dl>
            </div>
          </Reveal>

          {/*
            THE CLUSTER SLIDES IN FROM THE END SIDE, like every other
            photograph on this page.

            It was `x={24}`, a 24px nudge under a 40px vertical lift — which is
            to say it read as a fade, and next to the capability bands wiping in
            beside it the section looked like the one place the images just
            appeared. The client asked for it to arrive like the others. 96px
            with a slight scale and blur is a slide you can actually see, and
            `y=0` keeps it purely horizontal so it reads as coming in from the
            side rather than drifting up diagonally.

            The travel is MIRRORED FOR RTL by reveal.css, not here, so the
            cluster always enters from the outside edge of the reading
            direction. The orbit inside it is unaffected: this transforms the
            wrapper, the orbit transforms two elements further down, and one
            element never carries both.
          */}
          <Reveal x={96} y={0} scale={0.97} blur={3} delay={0.12}>
            <AboutCluster
              pentagon={{ src: landingImages.collage[0], alt: collageAlt[0] }}
              card={{ src: landingImages.collage[1], alt: collageAlt[1] }}
            />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
