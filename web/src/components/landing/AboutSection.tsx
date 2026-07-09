import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { landingImages } from "./assets";

/**
 * About Stark — design §7. Heading + 3 paragraphs on the start side, a
 * 3-image collage on the end side (tall image + two stacked). Collage images
 * carry the design's 6px cream ring (box-shadow) and 50px radius.
 *
 * RTL: the two columns swap via source order + logical grid; the collage grid
 * areas are symmetric enough that a normal 2-col grid mirrors correctly.
 * `<Reveal x>` offsets auto-mirror by direction.
 */
export async function AboutSection() {
  const t = await getTranslations("landing.about");
  const paragraphs = t.raw("paragraphs") as string[];
  const collageAlt = t.raw("collageAlt") as string[];
  const ring = "shadow-[0_0_0_6px_var(--cream)]";

  return (
    <section id="about" className="scroll-mt-[132px] bg-[color:var(--color-surface)] py-[52px] nav:py-28">
      <Container>
        <div className="grid items-center gap-8 nav:grid-cols-2 nav:gap-16">
          {/* Text column */}
          <Reveal x={-24}>
            <h2 className="font-display text-[36px] font-bold leading-none tracking-[-0.02em] text-[color:var(--color-ink)] nav:text-[clamp(2.25rem,5vw,3.5rem)] nav:leading-[1.05]">
              {t("heading")}
            </h2>
            <div className="mt-4 space-y-4 text-[15px] leading-[26px] text-[color:var(--color-ink-body)] nav:mt-6 nav:text-base nav:leading-[1.9]">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>

          {/* Mobile collage: 1 tall + 2 stacked (flex). */}
          <Reveal x={24} delay={0.1} className="nav:hidden">
            <div className="flex gap-3">
              <div className={`relative h-[230px] flex-[1.3] overflow-hidden rounded-[36px] ${ring}`}>
                <Image
                  src={landingImages.collage[0]}
                  alt={collageAlt[0]}
                  fill
                  sizes="55vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3">
                {[1, 2].map((n) => (
                  <div key={n} className={`relative flex-1 overflow-hidden rounded-[28px] ${ring}`}>
                    <Image
                      src={landingImages.collage[n]}
                      alt={collageAlt[n]}
                      fill
                      sizes="40vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Desktop collage column */}
          <Reveal x={24} delay={0.1} className="hidden nav:block">
            <div className="grid grid-cols-2 grid-rows-[repeat(5,minmax(0,1fr))] gap-5">
              {/* tall left */}
              <div
                className={`relative col-start-1 row-span-5 row-start-1 mt-8 overflow-hidden rounded-[40px] ${ring}`}
              >
                <div className="relative aspect-[291/479]">
                  <Image
                    src={landingImages.collage[0]}
                    alt={collageAlt[0]}
                    fill
                    sizes="(max-width: 860px) 45vw, 290px"
                    className="object-cover"
                  />
                </div>
              </div>
              {/* top right */}
              <div
                className={`relative col-start-2 row-span-2 row-start-1 overflow-hidden rounded-[40px] ${ring}`}
              >
                <div className="relative aspect-[236/210]">
                  <Image
                    src={landingImages.collage[1]}
                    alt={collageAlt[1]}
                    fill
                    sizes="(max-width: 860px) 45vw, 236px"
                    className="object-cover"
                  />
                </div>
              </div>
              {/* bottom right (wider, overlaps toward left) */}
              <div
                className={`relative col-start-1 col-end-3 row-span-2 row-start-4 ms-auto w-[85%] overflow-hidden rounded-[40px] ${ring}`}
              >
                <div className="relative aspect-[312/210]">
                  <Image
                    src={landingImages.collage[2]}
                    alt={collageAlt[2]}
                    fill
                    sizes="(max-width: 860px) 70vw, 312px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
