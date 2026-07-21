import { getTranslations } from "next-intl/server";
import { MarkGlyph } from "@/components/brand/geometry";

/**
 * Marquee ribbon — a sand full-bleed band of infinitely-scrolling watchwords.
 *
 * WAS DRIVEN BY GSAP. It is CSS now, and that is a bundle decision rather than
 * a style one: GSAP + ScrollTrigger is ~44KB gzipped, this was its only
 * consumer in the whole site, and it was landing in a SHARED chunk — so
 * /woodworks, /mattresses and /gallery were each downloading an animation
 * engine to render one band on the home page.
 *
 * The CSS does everything the tween did:
 *   travel      `--animate-marquee` translates -50% * var(--dir), so the two
 *               identical copies loop seamlessly and RTL scrolls the other way
 *   hover pause `animation-play-state: paused` on hover
 *   reduced     `motion-reduce:animate-none` plus the global duration
 *               neutraliser — the ribbon simply sits still and stays readable
 *
 * WHAT CHANGED IN THE POLISH ROUND. It was one repeated string in one weight,
 * set at body-adjacent size, and it read as a coloured div with words in it.
 * Four things make it a designed band instead, and each is doing a job:
 *
 *   alternation   phrases run solid, hollow, solid, hollow. A single weight
 *                 repeating gives the eye nothing to measure travel against;
 *                 alternating gives it a beat, and the band visibly MOVES
 *                 rather than merely being long. (`.outline-type` carries the
 *                 Arabic fallback — see outline-type.css, cursive takes weight
 *                 rather than wireframe.)
 *   scale         type roughly doubles and the band grows with it. At the old
 *                 size the words were competing with the section headings
 *                 above and below; at this one the band is clearly a rule
 *                 between sections rather than a third voice.
 *   separator     the pentagon itself, slowly rotating, instead of a "✦" from
 *                 whatever font happened to resolve. The mark is the one
 *                 ornament this site is entitled to use.
 *   (drift        a fourth device, scroll-linked travel layered on the loop,
 *                 was removed in review round 2. See the note at the markup.)
 *
 * A PURE SERVER COMPONENT AGAIN, now that the drift wrapper is gone: the loop,
 * the type and the glyphs are all static markup and this ships no client JS.
 */
export async function Marquee() {
  const t = await getTranslations("landing.marquee");
  const words = t.raw("words") as string[];

  /**
   * One full pass of the watchwords.
   *
   * Rendered TWICE with the pair travelling -50%, which is what makes the loop
   * seamless. Only the first copy is real content; the second is scenery, so
   * it is hidden from assistive tech and the section carries the label.
   *
   * Alternation is by absolute position in the phrase list, not by position
   * within a copy, so the solid/hollow rhythm continues across the seam
   * instead of doubling up on two solids where the copies meet. That requires
   * an EVEN number of phrases — with an odd count the seam would put two
   * matching phrases side by side. Four today; the guard is in Marquee.test.ts
   * rather than in a comment nobody reads.
   */
  const pass = (copy: number) => (
    <span
      key={copy}
      aria-hidden={copy === 1}
      className="flex flex-none items-center whitespace-nowrap"
    >
      {words.map((word, i) => (
        <span key={`${copy}-${i}`} className="flex flex-none items-center">
          <span
            className={`px-[clamp(16px,2.2vw,38px)] font-display text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-none ${
              i % 2 === 1 ? "outline-type" : "text-[color:var(--color-ink)]"
            }`}
            style={{ ["--outline-w" as string]: "clamp(1px, 0.12vw, 1.75px)" }}
          >
            {word}
          </span>
          {/* Sized in `em` so it tracks the type through the clamp. `size`
              still passes a sane px fallback and clears MarkGlyph's
              legibility floor; the inline width is what actually applies. */}
          <MarkGlyph
            division="stark"
            size={28}
            color="var(--color-ink)"
            className="animate-spin-slow motion-reduce:animate-none"
            style={{ width: "0.44em", height: "auto", opacity: 0.55 }}
          />
        </span>
      ))}
    </span>
  );

  return (
    <section
      aria-label={t("label")}
      className="group flex h-[clamp(120px,14vw,168px)] w-full items-center overflow-hidden border-y bg-[color:var(--color-accent)]"
      // Hairlines top and bottom. Without them the band's colour just stops,
      // which reads as a gap in the page; with them it reads as a set band.
      // Mixed from ink rather than --color-line, which is tuned for the light
      // surfaces either side of this and disappears on sand.
      style={{ borderColor: "color-mix(in srgb, var(--color-ink) 16%, transparent)" }}
    >
      {/*
        NO SCROLL DRIFT. The band was wrapped in ScrollDrift so that scrolling
        dragged it on top of its own loop. The client's note was to keep the
        band and drop that: "keep the yellow section that slides words, without
        the scroll animation." Two travel sources on one strip made the speed
        read as inconsistent rather than as depth, and on a trackpad it looked
        like the loop was stuttering. The CSS loop alone is the whole effect
        now. ScrollDrift stays in the codebase — Clients still uses it.

        `w-max` is load-bearing: the loop translates the track -50%, which is
        only half its CONTENT if the track sizes to its content. Left at the
        default block width it would size to the viewport instead and the seam
        would land in the middle of a phrase.
      */}
      <div className="flex w-max flex-none flex-nowrap whitespace-nowrap animate-marquee will-change-transform group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[0, 1].map(pass)}
      </div>
    </section>
  );
}
