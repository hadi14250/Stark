import { Photo } from "@/components/ui/Photo";
import { PentagonClip } from "@/components/brand/geometry";

/**
 * The About photo cluster: the pentagon and a rectangular card trading places
 * around each other.
 *
 * FOUR VERSIONS. The reasons are worth keeping, because three of them are
 * mistakes that are easy to walk back into.
 *
 * 1. A static square tucked behind the pentagon's bottom corner, desktop-only.
 *    Read as a mistake — two photos that failed to line up — and did not exist
 *    on a phone at all.
 * 2. A card scrubbed along a diagonal by scroll position. Better composition,
 *    but the client's note was blunt and correct: the rotation should not
 *    depend on scrolling. A thing that only moves while you turn the wheel is
 *    a scrubber, not an orbit.
 * 3. A continuous slow orbit, 40s a revolution. This looked BROKEN. Two
 *    separate reasons, and both are instructive: the travel was far too slow to
 *    register at a glance (the client's word was "stuck"), and the radius was
 *    set in percent — which in a transform means percent of the ELEMENT'S OWN
 *    width, not the container's. 7% of a card that is a third of the cluster is
 *    about nine pixels. It genuinely was barely moving.
 * 4. This. Rest, a fast swap, rest, swap back — the shape the client asked for.
 *
 * THE CYCLE IS 10s: four seconds still, one second to trade places, four
 * seconds still, one second back. The stillness is not padding; it is what
 * makes the movement read as a gesture rather than as drift. A viewer who looks
 * up at the wrong moment sees a composition, and a viewer watching sees it
 * rearrange itself in a second.
 *
 * PURE CSS, AND A SERVER COMPONENT. The scroll-driven version was a client
 * component holding a `useScroll`, a `useSpring` and six `useTransform`s,
 * including an interpolated `box-shadow` — which forces a repaint every frame
 * rather than riding the compositor. On a page that already carries parallax
 * bands, two ticker drifts and a pinned scroll scrub, that was real weight for
 * an effect nobody had asked to be scroll-linked. Two keyframes on `transform`
 * and one on `z-index` cost the main thread nothing, and the whole thing left
 * the JavaScript bundle.
 *
 * THE GEOMETRY, so the radii can be changed safely. Everything below is in
 * percent of the CLUSTER's width; the `--orbit-r` values are converted to
 * percent of each element's own width, which is what a transform expects.
 *
 *     pentagon   84% wide, centred     arm 7% of cluster  → 8.3% of its width
 *     card       34% wide, centred     arm 26% of cluster → 76% of its width
 *
 * The furthest either travels from the centre is the card at 26 + 17 (its own
 * half-width) = 43% of the cluster — inside the 50% edge, so nothing swings
 * past the page on a narrow window. The scroll version did exactly that, 41px
 * into a horizontal scrollbar at 768px.
 *
 * They start 180° apart (`--orbit-a0`), which is what makes them read as
 * orbiting EACH OTHER rather than as two things independently going round.
 *
 * REDUCED MOTION stops both animations. They rest at their `from` pose — card
 * low and to the end side, pentagon slightly the other way, overlapping — which
 * is a composition someone chose rather than the corner of an animation.
 */
export function AboutCluster({
  pentagon,
  card,
}: {
  pentagon: { src: string; alt: string };
  card: { src: string; alt: string };
}) {
  return (
    <div className="relative">
      {/* The pentagon stays IN FLOW: it is what gives the cluster its height,
          so the section does not collapse. Only the inner div transforms. */}
      <div className="relative z-[1] mx-auto w-[84%]">
        <div className="animate-orbit-swap [--orbit-a0:180deg] [--orbit-r:8.3%] motion-reduce:animate-none">
          <PentagonClip
            variant="photo"
            ringColor="var(--color-surface-2)"
            style={{ boxShadow: "var(--shadow-pentagon)" }}
          >
            <Photo src={pentagon.src} alt={pentagon.alt} ratio="pentagon" />
          </PentagonClip>
        </div>
      </div>

      {/*
        TWO NESTED DIVS, and the split is load-bearing. The outer one centres
        the card on the cluster's midpoint and carries the z-index animation;
        the inner one carries the orbit. They cannot be merged: centring is a
        transform (`-translate-x-1/2`) and so is the orbit, and one element can
        only have one `transform` — the animation would silently overwrite the
        centring and the card would sit in the corner.
      */}
      <div className="absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2 animate-orbit-z motion-reduce:animate-none motion-reduce:z-[3]">
        <div
          className="animate-orbit-swap [--orbit-a0:0deg] [--orbit-r:76%] [--orbit-tilt:5deg] motion-reduce:animate-none"
          style={{
            // A 6px flat frame: the card reads as a print laid on the page
            // rather than a second window cut into it, which is what makes the
            // overlap look intentional instead of like two photos colliding.
            padding: 6,
            background: "var(--white-500)",
            borderRadius: "var(--radius-image)",
            boxShadow: "0 22px 50px rgb(12 26 19 / 0.24)",
          }}
        >
          <Photo src={card.src} alt={card.alt} ratio="square" />
        </div>
      </div>
    </div>
  );
}
