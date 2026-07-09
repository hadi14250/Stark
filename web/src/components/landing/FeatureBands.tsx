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
 * Design's dark-block edge as a normalized SVG clip path (objectBoundingBox, so
 * it scales to any width/height). Derived from the handoff's two SVG paths
 * (`design_handoff_..._animated/index.html:107–108`): a curved-shoulder wedge
 * over a 1366×794 top half + its 180°-rotated copy for the bottom half, unioned
 * over the full 1366×1588 region and divided by (1366, 1588).
 *
 * The Bézier `C` on each subpath is the load-bearing bit — it's the SOFT ROUNDED
 * SHOULDER where the steep slope eases into the flat edge. A `polygon()` can't
 * express that curve, which is why the earlier polygon clip read as a hard
 * straight slash. The two subpaths meet exactly at y=0.5 so they fill as one.
 */
const FEATURE_BAND_CLIP =
  "M 0.15478 0.14497 C 0.16025 0.13242 0.17305 0.1233 0.18841 0.12101 L 1 0 L 1 0.5 L 0 0.5 Z " +
  "M 0.84522 0.85503 C 0.83975 0.86758 0.82695 0.8767 0.81159 0.87899 L 0 1 L 0 0.5 L 1 0.5 Z";

/**
 * Feature bands — three capability bands. Bands 1–2 sit on a dark forest block;
 * band 3 on the cream page. Content maps to the three Stark capabilities.
 *
 * Responsive shape: mobile = a simple angled TOP edge (polygon) + vertical
 * stacks; desktop = the design's curved-shoulder wedge top AND bottom (the
 * `FEATURE_BAND_CLIP` SVG path) + 2-col grid.
 *
 * RTL: the dark block mirrors via `rtl:-scale-x-100` with an inner un-mirror so
 * content stays upright; the clip path mirrors with the wrapper so the curved
 * shoulder lands on the correct side. Alternating sides mirror via grid order.
 */
export async function FeatureBands() {
  const t = await getTranslations("landing.features");
  const items = t.raw("items") as BandItem[];

  return (
    <section className="overflow-x-clip bg-[color:var(--color-surface)]">
      {/* Inline clip-path definition (objectBoundingBox → scales to the block). */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <clipPath id="feature-band-clip" clipPathUnits="objectBoundingBox">
            <path d={FEATURE_BAND_CLIP} />
          </clipPath>
        </defs>
      </svg>

      {/* Dark block: bands 1 & 2. Mobile = simple top-angled polygon; desktop =
          the design's curved-shoulder SVG clip. */}
      <div className="relative rtl:-scale-x-100">
        <div className="bg-[color:var(--green-deep-2)] [clip-path:polygon(0_34px,100%_0,100%_100%,0_100%)] nav:[clip-path:url(#feature-band-clip)]">
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
