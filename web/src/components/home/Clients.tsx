import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ScrollDrift } from "@/components/motion/ScrollDrift";
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
 * HOW THE SEAMLESS LOOP WORKS: each row renders its logos `SETS_PER_HALF * 2`
 * times and travels -50%, so at the moment the animation restarts, the copy
 * halfway along is sitting exactly where the first began and the jump is
 * invisible. The gaps live on the items as horizontal padding rather than as a
 * `gap` on the track, which is what keeps the seam gap identical to every other
 * gap — a `gap` would leave a double space where the copies meet, and that
 * pulse is the giveaway that makes a ticker look cheap.
 *
 * THE COPY COUNT IS LOAD-BEARING. Half the track has to be at least as wide as
 * the viewport, or the tail of the loop drags an empty gap across the screen.
 * It was six copies when the wall held eight logos, because a set of four was
 * only ~970px and any laptop showed a hole for part of every cycle. With 31
 * logos a set is ~2.5k, so it is four copies now — see the arithmetic on
 * SETS_PER_HALF in clients.ts, which `Clients.test.ts` recomputes from the
 * manifest so adding or removing logos cannot quietly reintroduce the gap.
 *
 * TWO ROWS, OPPOSITE DIRECTIONS, DIFFERENT SPEEDS (52s and 64s). Same speed
 * would let the rows beat against each other into a visible repeating pattern;
 * coprime-ish durations keep the composition changing for minutes.
 *
 * THE LOGOS ARE GREYED AND HELD AT 70%, lifting to full on hover. This is the
 * one treatment that makes a wall of mixed-source logos cohere: real client
 * assets arrive in clashing brand colours at clashing weights, and left alone
 * they fight both each other and the page. It used to be a no-op, because the
 * placeholders were monochrome wordmarks — the treatment was put in place
 * BEFORE the messy real ones landed rather than being discovered afterwards.
 * The 31 real marks have now landed and it is doing its job: gold script,
 * teal, navy and full-colour crests all read as one wall.
 *
 * The other half of that cohering job is NOT here — it is in the assets. Each
 * mark is optically sized inside a fixed-height canvas by the build script, so
 * this component can keep a single rule (everything renders at one height) and
 * still have a square crest and a long wordmark balance. See clients.ts.
 *
 * It was 55% at a 34px render height, which together made the marks
 * unreadable — a wall of grey smudges argues against the company rather than
 * for it. Both moved up in the polish round (see clients.ts for the geometry
 * that follows from the height change).
 *
 * THE ROWS SHEAR AS YOU SCROLL. Each is wrapped in a ScrollDrift with the
 * opposite sign, so scrolling pulls them apart and back together on top of
 * their own opposing loops. It is the same band language as the watchword
 * marquee a few sections up, which is deliberate: these are the two full-bleed
 * ticker bands on the page and they should read as a matched pair.
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
        className="relative mt-[clamp(40px,5vw,64px)] flex flex-col gap-[clamp(20px,2.5vw,34px)] border-y py-[clamp(18px,2.2vw,30px)]"
        // Hairlines top and bottom, matching the watchword marquee: they are
        // what make a full-bleed strip read as a band rather than as content
        // that happens to run off the edge.
        style={{
          borderColor: "var(--color-line)",
          // Fades both ends so logos dissolve instead of being guillotined by
          // the viewport edge. Symmetric, so it needs no RTL variant.
          maskImage:
            "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
        }}
      >
        {CLIENT_ROWS.map((row, i) => (
          // Opposite drift per row — see the docblock. Modest amounts: these
          // are already travelling on their own loops and a large drift would
          // read as the two effects fighting rather than compounding.
          <ScrollDrift key={i} amount={i % 2 === 0 ? 3.5 : -3.5}>
            <LogoRow logos={row} alts={alts} reverse={i % 2 === 1} />
          </ScrollDrift>
        ))}
      </div>
    </Section>
  );
}

/**
 * One travelling row.
 *
 * NO HOVER PAUSE, as of review round 2. The rows used to stop while the pointer
 * was anywhere over the band, on the reasoning that a reader might want to hold
 * a logo still and look at it. In practice the band runs edge to edge, so the
 * pointer rests on it while you are reading the section ABOVE — and the ticker
 * kept freezing for no reason the reader could connect to anything they had
 * done. The client asked for it to keep moving. Nothing in here is interactive,
 * so a pause was not protecting anything.
 */
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
      className={`flex w-max flex-none will-change-transform motion-reduce:animate-none ${
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
                // Ceiling matches LOGO_RENDER_HEIGHT in clients.ts, which is
                // what the loop-width arithmetic is computed from — they move
                // together or the ticker opens a gap.
                className="h-[clamp(38px,4.4vw,60px)] w-auto opacity-70 grayscale transition-[opacity,filter] duration-500 hover:opacity-100 hover:grayscale-0 motion-reduce:transition-none"
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
