import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CLIENT_ROWS, SETS_PER_HALF, type ClientLogo } from "@/components/landing/clients";

/**
 * The client wall — two rows of logos scrolling against each other.
 *
 * A SERVER COMPONENT WITH NO CLIENT JS, like the word marquee it sits a page
 * away from. An infinite ticker is one transform on a loop; doing it in React
 * would mean shipping a component, a ref and a rAF to reproduce what four CSS
 * declarations already do, on a section that is pure decoration until the real
 * logos arrive.
 *
 * HOW THE SEAMLESS LOOP WORKS: each row renders its logos SIX times and
 * travels -50%, so at the moment the animation restarts, the fourth copy is
 * sitting exactly where the first began and the jump is invisible. The gaps
 * live on the items as horizontal padding rather than as a `gap` on the track,
 * which is what keeps the seam gap identical to every other gap — a `gap`
 * would leave a double space where the copies meet, and that pulse is the
 * giveaway that makes a ticker look cheap.
 *
 * SIX, NOT TWO, AND THE NUMBER IS LOad-BEARING. Half the track has to be at
 * least as wide as the viewport, or the tail of the loop drags an empty gap
 * across the screen. Four logos at these widths make a set about 970px wide;
 * with two copies, half the track is 970px and any viewport past that — every
 * laptop — shows a hole for part of every cycle. Three sets per half is about
 * 2900px, which covers a 2560px display with room over. `Clients.test.ts`
 * does this arithmetic from the manifest, so adding or removing logos cannot
 * quietly reintroduce the gap.
 *
 * TWO ROWS, OPPOSITE DIRECTIONS, DIFFERENT SPEEDS (52s and 64s). Same speed
 * would let the rows beat against each other into a visible repeating pattern;
 * coprime-ish durations keep the composition changing for minutes.
 *
 * THE LOGOS ARE GREYED AND HELD AT 55%, lifting to full on hover. This is the
 * one treatment that makes a wall of mixed-source logos cohere: real client
 * assets arrive in clashing brand colours at clashing weights, and left alone
 * they fight both each other and the page. It is a no-op on the current
 * monochrome placeholders, which is deliberate — the treatment is in place
 * BEFORE the messy real ones land, rather than being discovered afterwards.
 *
 * REDUCED MOTION stops the travel (`motion-reduce:animate-none`). The rows
 * then sit still, showing the first several logos of each — every logo is
 * still reachable in the DOM and to a screen reader, and the section reads as
 * a static logo wall, which is a perfectly good version of this section.
 */
export async function Clients() {
  const t = await getTranslations("landing.clients");
  // An ARRAY of {key, alt} rather than a keyed object, matching how every
  // other repeated block in these messages is modelled — and because
  // next-intl's typed `raw()` accepts arrays but not nested key maps.
  const alts = Object.fromEntries(
    (t.raw("logos") as { key: string; alt: string }[]).map((l) => [l.key, l.alt]),
  );

  return (
    <Section surface="surface-2" id="clients" className="overflow-hidden">
      <Container>
        <SectionHeader
          eyebrow={<Eyebrow>{t("eyebrow")}</Eyebrow>}
          heading={t("heading")}
          intro={t("sub")}
        />
      </Container>

      {/* Full-bleed, outside the Container: a ticker that stops at the text
          measure reads as a widget sitting on the page. Running edge to edge
          is what makes it read as a band. */}
      <div
        className="group relative mt-[clamp(40px,5vw,64px)] flex flex-col gap-[clamp(20px,2.5vw,34px)]"
        // Fades both ends so logos dissolve instead of being guillotined by the
        // viewport edge. Symmetric, so it needs no RTL variant.
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
        }}
      >
        {CLIENT_ROWS.map((row, i) => (
          <LogoRow key={i} logos={row} alts={alts} reverse={i % 2 === 1} />
        ))}
      </div>
    </Section>
  );
}

function LogoRow({
  logos,
  alts,
  reverse,
}: {
  logos: readonly ClientLogo[];
  alts: Record<string, string>;
  reverse: boolean;
}) {
  return (
    <div
      className={`flex w-max flex-none will-change-transform group-hover:[animation-play-state:paused] motion-reduce:animate-none ${
        reverse ? "animate-logos-alt" : "animate-logos"
      }`}
    >
      {Array.from({ length: SETS_PER_HALF * 2 }, (_, copy) => (
        <div key={copy} className="flex shrink-0 items-center">
          {logos.map((logo) => (
            <div key={logo.key} className="px-[clamp(24px,3.5vw,60px)]">
              <Image
                src={logo.src}
                // Only the first set is real content; the other five exist to
                // fill the track and make the loop seamless. Without hiding
                // them, every client is announced six times.
                alt={copy === 0 ? (alts[logo.key] ?? "") : ""}
                aria-hidden={copy !== 0}
                width={logo.width}
                height={logo.height}
                className="h-[clamp(26px,2.6vw,34px)] w-auto opacity-55 grayscale transition-[opacity,filter] duration-500 hover:opacity-100 hover:grayscale-0 motion-reduce:transition-none"
                // Decorative-scale asset that is on screen immediately below
                // the fold; letting it lazy-load produces a row of holes.
                loading="eager"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
