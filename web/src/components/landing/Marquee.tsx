import { getTranslations } from "next-intl/server";

/**
 * Marquee ribbon — a sand full-bleed band of infinitely-scrolling watchwords.
 *
 * WAS DRIVEN BY GSAP. It is CSS now, and that is a bundle decision rather than
 * a style one: GSAP + ScrollTrigger is ~44KB gzipped, this was its only
 * consumer in the whole site, and it was landing in a SHARED chunk — so
 * /woodworks, /mattresses and /gallery were each downloading an animation
 * engine to render one band on the home page. (The plan chose GSAP for
 * scroll-driven set-pieces, and ScrollTrigger genuinely is the right tool for
 * those; none of them survived into the built pages. Carrying the library for
 * a marquee is not defensible.)
 *
 * The CSS does everything the tween did:
 *   travel      `--animate-marquee` translates -50% * var(--dir), so the two
 *               identical copies loop seamlessly and RTL scrolls the other way
 *   hover pause `animation-play-state: paused` on hover
 *   reduced     `motion-reduce:animate-none` plus the global duration
 *               neutraliser — the ribbon simply sits still and stays readable
 *
 * It is also now a SERVER component: no client JS at all where there used to
 * be a 44KB dependency and a tween ref.
 */
export async function Marquee() {
  const t = await getTranslations("landing.marquee");
  const words = t.raw("words") as string[];
  const sequence = words.join(" ✦ ");

  return (
    <section
      aria-label={t("label")}
      className="group flex h-[104px] w-full items-center overflow-hidden bg-[color:var(--color-accent)] nav:h-[130px]"
    >
      <div className="flex flex-none flex-nowrap whitespace-nowrap animate-marquee will-change-transform group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {/* Two identical copies → -50% travel loops seamlessly. */}
        {[0, 1].map((n) => (
          <span
            key={n}
            aria-hidden={n === 1}
            className="whitespace-nowrap px-8 font-display text-[clamp(1.5rem,3.5vw,2.75rem)] font-medium text-[color:var(--color-ink)]"
          >
            {sequence}
            {" ✦ "}
          </span>
        ))}
      </div>
    </section>
  );
}
