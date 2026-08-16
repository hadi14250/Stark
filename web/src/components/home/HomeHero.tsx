import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Pill } from "@/components/ui/Pill";
import { Photo } from "@/components/ui/Photo";
import { BladeField } from "@/components/brand/geometry";
import { Reveal } from "@/components/motion/Reveal";
import { WordsReveal } from "@/components/motion/WordsReveal";
import { landingImages } from "@/components/landing/assets";
import { ScrollCue } from "@/components/landing/ScrollCue";
import { Link } from "@/i18n/navigation";

/**
 * Home hero.
 *
 * REBUILT. The first version was centred type on an empty off-white field with
 * the photograph parked in a separate band below it, and it read as a template:
 * four centred elements separated by enormous dead vertical gaps, and a G2
 * blade field at 12% sand ON off-white — which is to say invisible, so the
 * brand geometry was costing DOM and delivering nothing.
 *
 * This one puts the photograph IN the hero as its ground, under a scrim, with
 * the type over it. Three things follow:
 *
 *   - the geometry finally reads. Sand blades at 22% over a dark ground are
 *     actually visible, which is the entire point of having them.
 *   - the type is off-white on green — the brand's own primary pairing at
 *     16.5:1 — instead of green on cream at arm's length.
 *   - it is capped to the viewport, so the composition is seen at once rather
 *     than the headline and the photograph being two separate scrolls.
 *
 * The entrance is STAGED, not uniform: each display line word by word, then
 * rule, sub, sub2, actions. Round 2 pushed the staging further at the client's
 * request ("more animation on the hero, especially the text") and dropped the
 * sand eyebrow that used to lead it.
 */
export async function HomeHero() {
  const t = await getTranslations("landing.hero");

  return (
    <section
      className="relative isolate flex items-center overflow-hidden"
      style={{
        minHeight: "clamp(560px, calc(100svh - var(--header-h)), 860px)",
        background: "var(--green-900)",
      }}
    >
      {/* Ground: the photograph, slowly drifting. */}
      <div className="absolute inset-0 -z-20">
        <Photo
          src={landingImages.hero}
          alt={t("alt")}
          height="100%"
          kenBurns
          priority
          sizes="100vw"
          className="h-full w-full"
        />
      </div>

      {/* Scrim — a gradient, not a flat wash, so the type sits on the darkest
          part while the photograph stays legible lower down. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgb(12 26 19 / 0.88) 0%, rgb(12 26 19 / 0.70) 45%, rgb(12 26 19 / 0.84) 100%)",
        }}
      />

      {/* G2 — at a weight that is actually visible, now that it is over a dark
          ground rather than lost on off-white. */}
      <BladeField
        weight="structural"
        color="rgb(219 202 173 / 0.22)"
        blades={[
          { element: "interiors", width: 460, top: "-90px", start: "-140px", float: 11 },
          { element: "woodworks", width: 520, bottom: "-160px", end: "-160px", float: 13 },
        ]}
      />

      <Container className="relative z-[1]">
        <div className="flex flex-col items-center gap-6 py-[clamp(40px,6vh,80px)] text-center">
          {/*
            NO EYEBROW. "Saudi Based Power." sat here in sand above the
            headline; the client asked for it to come off both here and the
            footer. The headline now opens the page, which is the stronger
            arrangement anyway — the tagline was competing with it for the
            first line of the site.
          */}

          {/*
            ONE H1, TWO LINES, WORD BY WORD.
            Each line was a single block that translated 38px and faded, which
            is the least legible motion there is: nothing inside the block moves
            relative to anything else, so it reads as a slow paint rather than
            as an entrance. The client asked for "more animation on the hero,
            especially the text" — so the words now rise out of their own masks
            in sequence, and the second line is offset behind the first.
          */}
          {/*
            SMALLER THAN THE DISPLAY TOKEN, DELIBERATELY, AND SMALLER AGAIN NOW.

            It ran to `clamp(44px, 7vw, 96px)` — above `--text-display`'s own
            ceiling of 88px — which on a 1440 screen put a two-line headline
            across nearly the full container and left the sub-copy and the CTAs
            fighting for what was left of the fold. The client asked for it to
            come down. At 72px the same two lines still open the page and the
            whole composition (rule, two sub lines, two actions, scroll cue) now
            fits the viewport cap above without the hero scrolling.
          */}
          <h1
            className="font-display tracking-display text-[color:var(--white-500)]"
            style={{ fontSize: "clamp(36px, 5.2vw, 72px)", lineHeight: 1 }}
          >
            <WordsReveal
              as="span"
              text={t("line1")}
              justify="center"
              delay={0.06}
              className="font-light"
            />
            <WordsReveal
              as="span"
              text={t("line2")}
              justify="center"
              delay={0.28}
              className="font-semibold"
            />
          </h1>

          <Reveal y={0} delay={0.5}>
            <hr className="h-0.5 w-20 border-0" style={{ background: "var(--sand-500)" }} />
          </Reveal>

          {/*
            TWO SENTENCES, TWO LINES, NO DASH.
            It was one sentence joined by an em-dash and capped at 54ch, so it
            wrapped into three or four short lines with the dash stranded at a
            line end. The client asked for each half on its own line and the
            dash gone. `text-balance` is deliberately NOT used here — these are
            two deliberate lines, not one paragraph to be evened out — and the
            measure is wide enough that each holds a single line down to about
            700px. Below that they wrap, which no amount of CSS can prevent at
            this type size on a 390px screen.
          */}
          <div className="flex max-w-[68ch] flex-col gap-1.5 text-lead leading-lead text-[color:var(--green-200)]">
            <Reveal y={22} delay={0.56}>
              <p>{t("sub")}</p>
            </Reveal>
            <Reveal y={22} delay={0.64}>
              <p>{t("sub2")}</p>
            </Reveal>
          </div>

          <Reveal y={22} delay={0.74}>
            <div className="mt-2 flex flex-wrap justify-center gap-3.5">
              <Pill variant="tan" href="/#contact">
                {t("cta")}
              </Pill>
              {/*
                The "forest" pill would vanish into this ground, so the
                secondary action is an outline in the light ink instead.

                A LOCALE-AWARE <Link>, NOT A BARE <a>. It was a raw anchor,
                which meant "View our work" did a full document navigation: it
                dropped the locale prefix (so an Arabic reader landed on the
                English gallery via a middleware redirect) and it remounted
                SiteChrome, which replays the preloader curtain. That was
                already wrong and the longer 2.4s curtain in this round made it
                properly annoying — clicking the hero's own link put a loading
                screen in front of you.
              */}
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-medium text-[color:var(--white-500)] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[rgb(250_245_239/0.1)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                style={{ borderColor: "rgb(250 245 239 / 0.34)" }}
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>

      {/*
        THE CUE SITS INSIDE THE HERO NOW, not straddling its bottom edge.

        It was `bottom-0 translate-y-1/2`, so half the circle hung below the
        section onto the band beneath — a device inherited from the torn-paper
        seam this hero no longer has. Without that seam it read as an element
        that had slipped off the composition, which is the "put the arrow more
        up" note. Fully inside, with air under it, it reads as part of the hero.
      */}
      <div className="absolute inset-x-0 bottom-[clamp(16px,3.5vh,44px)] z-[2] flex justify-center">
        <ScrollCue targetId="about" label={t("scrollCue")} />
      </div>
    </section>
  );
}
