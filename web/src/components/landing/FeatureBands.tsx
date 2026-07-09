import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { landingImages } from "./assets";

type BandItem = { title: string; body: string; alt: string };

/**
 * One feature band: a large rounded image + a title/body block, sides
 * alternating by index. Image slides in from its edge (`<Reveal x>`, auto
 * RTL-mirrored). On mobile the band stacks (image over text).
 *
 * `onDark` picks cream/muted text (bands 1–2, over the diagonal) vs
 * forest/body text (band 3, on cream).
 */
function FeatureBand({
  item,
  image,
  imageStart,
  onDark,
}: {
  item: BandItem;
  image: string;
  imageStart: boolean;
  onDark: boolean;
}) {
  const heading = onDark
    ? "text-[color:var(--ink-green-strong)]"
    : "text-[color:var(--color-ink)]";
  const body = onDark
    ? "text-[color:var(--ink-green-body)]"
    : "text-[color:var(--color-ink-body)]";

  const img = (
    <Reveal x={imageStart ? -32 : 32} className={imageStart ? "nav:order-1" : "nav:order-2"}>
      <div className="relative aspect-[550/460] w-full overflow-hidden rounded-[80px] shadow-[0_0_0_6px_var(--cream)] nav:rounded-[150px]">
        <Image
          src={image}
          alt={item.alt}
          fill
          sizes="(max-width: 860px) 90vw, 550px"
          className="object-cover"
        />
      </div>
    </Reveal>
  );

  const text = (
    <Reveal
      y={24}
      delay={0.08}
      className={`flex flex-col justify-center ${imageStart ? "nav:order-2" : "nav:order-1"}`}
    >
      <h3 className={`font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em] ${heading}`}>
        {item.title}
      </h3>
      <p className={`mt-5 max-w-[46ch] text-base leading-[1.9] ${body}`}>
        {item.body}
      </p>
    </Reveal>
  );

  return (
    <div className="grid items-center gap-8 nav:grid-cols-2 nav:gap-16">
      {img}
      {text}
    </div>
  );
}

/**
 * Feature bands — design §8. Three capability bands. Bands 1–2 sit on a dark
 * diagonal forest shape (angled top + bottom edges via clip-path), band 3 on
 * the cream page. Content maps to the three Stark capabilities.
 *
 * RTL: the diagonal shape is mirrored by scaling its clip container on
 * `[dir=rtl]`, and the alternating image/text sides mirror because the grid
 * is direction-aware (logical order). The trickiest RTL area — verify visually.
 */
export async function FeatureBands() {
  const t = await getTranslations("landing.features");
  const items = t.raw("items") as BandItem[];

  return (
    <section className="overflow-x-clip bg-[color:var(--color-surface)]">
      {/* Dark diagonal container: bands 1 & 2. Angled top and bottom edges. */}
      <div className="relative rtl:-scale-x-100">
        <div
          className="bg-[color:var(--green-deep-2)] [clip-path:polygon(0_5vw,100%_0,100%_100%,0_calc(100%-5vw))]"
        >
          {/* Un-mirror the inner content so text/images read normally in RTL. */}
          <div className="rtl:-scale-x-100">
            <Container className="flex flex-col gap-16 py-24 nav:gap-24 nav:py-32">
              <FeatureBand item={items[0]} image={landingImages.bands[0]} imageStart onDark />
              <FeatureBand item={items[1]} image={landingImages.bands[1]} imageStart={false} onDark />
            </Container>
          </div>
        </div>
      </div>

      {/* Band 3 on cream. */}
      <Container className="py-20 nav:py-28">
        <FeatureBand item={items[2]} image={landingImages.bands[2]} imageStart onDark={false} />
      </Container>
    </section>
  );
}
