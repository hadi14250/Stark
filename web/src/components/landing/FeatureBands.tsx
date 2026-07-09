import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { landingImages } from "./assets";

type BandItem = { title: string; body: string; alt: string };

/**
 * One feature band: a large rounded image + a title/body block. On mobile it's
 * a vertical stack (image h220 over text); on desktop a 2-col grid with sides
 * alternating by index. Image slides in from its edge (`<Reveal x>`, auto
 * RTL-mirrored).
 *
 * `onDark` picks cream/muted text (bands 1–2, over the dark block) vs
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
      <div className="relative h-[220px] w-full overflow-hidden rounded-[44px] shadow-[0_0_0_5px_var(--cream)] nav:aspect-[550/460] nav:h-auto nav:rounded-[150px] nav:shadow-[0_0_0_6px_var(--cream)]">
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
      <h3 className={`font-display text-[27px] font-bold leading-[1.08] tracking-[-0.02em] nav:text-[clamp(1.75rem,3.5vw,2.75rem)] nav:leading-[1.1] ${heading}`}>
        {item.title}
      </h3>
      <p className={`mt-3 max-w-[46ch] text-[15px] leading-[26px] nav:mt-5 nav:text-base nav:leading-[1.9] ${body}`}>
        {item.body}
      </p>
    </Reveal>
  );

  return (
    <div className="grid items-center gap-5 nav:grid-cols-2 nav:gap-16">
      {img}
      {text}
    </div>
  );
}

/**
 * Feature bands — three capability bands. Bands 1–2 sit on a dark forest block;
 * band 3 on the cream page. Content maps to the three Stark capabilities.
 *
 * Responsive shape: mobile = the handoff's angled TOP edge only + vertical
 * stacks; desktop = the full top+bottom diagonal + 2-col grid.
 *
 * RTL: the dark block mirrors via `rtl:-scale-x-100` with an inner un-mirror so
 * content stays upright; alternating sides mirror via logical grid order.
 */
export async function FeatureBands() {
  const t = await getTranslations("landing.features");
  const items = t.raw("items") as BandItem[];

  return (
    <section className="overflow-x-clip bg-[color:var(--color-surface)]">
      {/* Dark block: bands 1 & 2. Mobile = top-angled edge; desktop = diagonal. */}
      <div className="relative rtl:-scale-x-100">
        <div className="bg-[color:var(--green-deep-2)] [clip-path:polygon(0_34px,100%_0,100%_100%,0_100%)] nav:[clip-path:polygon(0_5vw,100%_0,100%_100%,0_calc(100%-5vw))]">
          {/* Un-mirror the inner content so text/images read normally in RTL. */}
          <div className="rtl:-scale-x-100">
            <Container className="flex flex-col gap-[52px] pt-[74px] pb-14 nav:gap-24 nav:py-32">
              <FeatureBand item={items[0]} image={landingImages.bands[0]} imageStart onDark />
              <FeatureBand item={items[1]} image={landingImages.bands[1]} imageStart={false} onDark />
            </Container>
          </div>
        </div>
      </div>

      {/* Band 3 on cream. */}
      <Container className="py-[52px] nav:py-28">
        <FeatureBand item={items[2]} image={landingImages.bands[2]} imageStart onDark={false} />
      </Container>
    </section>
  );
}
