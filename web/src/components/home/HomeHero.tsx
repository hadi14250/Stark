import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Pill } from "@/components/ui/Pill";
import { Photo } from "@/components/ui/Photo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BladeField } from "@/components/brand/geometry";
import { Reveal } from "@/components/motion/Reveal";
import { landingImages } from "@/components/landing/assets";
import { ScrollCue } from "@/components/landing/ScrollCue";

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
 * The entrance is STAGED, not uniform: eyebrow, each display line, rule, sub,
 * actions — ~90ms apart, each with a little scale and blur so the type resolves
 * into place instead of sliding in.
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
          <Reveal y={14}>
            <Eyebrow className="!text-[color:var(--sand-500)]">{t("eyebrow")}</Eyebrow>
          </Reveal>

          {/* One h1, two lines, one weight pair. Tighter leading than the token
              default so the pair reads as a single statement. */}
          <h1
            className="font-display tracking-display text-[color:var(--white-500)]"
            style={{ fontSize: "clamp(44px, 7vw, 96px)", lineHeight: 0.98 }}
          >
            <Reveal as="span" className="block" y={38} scale={0.97} blur={6} delay={0.09}>
              <span className="block font-light">{t("line1")}</span>
            </Reveal>
            <Reveal as="span" className="block" y={38} scale={0.97} blur={6} delay={0.18}>
              <span className="block font-semibold">{t("line2")}</span>
            </Reveal>
          </h1>

          <Reveal y={0} delay={0.3}>
            <hr className="h-0.5 w-20 border-0" style={{ background: "var(--sand-500)" }} />
          </Reveal>

          <Reveal y={22} delay={0.36}>
            <p className="max-w-[54ch] text-lead leading-lead text-[color:var(--green-200)]">
              {t("sub")}
            </p>
          </Reveal>

          <Reveal y={22} delay={0.44}>
            <div className="mt-2 flex flex-wrap justify-center gap-3.5">
              <Pill variant="tan" href="/#contact">
                {t("cta")}
              </Pill>
              {/* The "forest" pill would vanish into this ground, so the
                  secondary action is an outline in the light ink instead. */}
              <a
                href="/gallery"
                className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-medium text-[color:var(--white-500)] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[rgb(250_245_239/0.1)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                style={{ borderColor: "rgb(250 245 239 / 0.34)" }}
              >
                {t("ctaSecondary")}
              </a>
            </div>
          </Reveal>
        </div>
      </Container>

      <div className="absolute inset-x-0 bottom-0 z-[2] flex translate-y-1/2 justify-center">
        <ScrollCue targetId="about" label={t("scrollCue")} />
      </div>
    </section>
  );
}
