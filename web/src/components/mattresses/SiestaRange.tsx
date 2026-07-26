import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/motion/Reveal";
import { SIESTA_MODELS, SIESTA_MODEL_NAMES, siestaImages } from "./assets";

/**
 * siesta's sixteen models, as sixteen cards — the same treatment as BlueRange.
 *
 * WHY THIS EXISTS: for months siesta was the brand with no photography, shown as
 * a range rather than as products, with an on-page note saying so. The client's
 * own note asked why its types were absent. They have now supplied the
 * photography, so the honest answer is finally the built one: the whole
 * collection, by name, in the profile's category order (Luxury, then Eco Range,
 * then Hospitality).
 *
 * NAMES ONLY, LIKE BLUE, AND FOR THE SAME REASON. The user's instruction was
 * "just like the blue is on the website now" — photograph and name, no per-model
 * paragraph. The construction detail lives in the gallery, where each model has
 * its own slide; here the band is the range at a glance. `alt` is a `{name}`
 * template so the sentence is translated and the proper noun is not.
 */
export function SiestaRange({ alt }: { alt: string }) {
  return (
    <ul className="mt-[clamp(32px,4vw,60px)] grid grid-cols-2 gap-[clamp(12px,1.6vw,24px)] nav:grid-cols-4">
      {SIESTA_MODELS.map((model, i) => {
        const name = SIESTA_MODEL_NAMES[model];
        return (
          /* Stagger by COLUMN, not index — same rationale as BlueRange: a flat
             per-index delay reads as the grid loading rather than as a reveal. */
          <Reveal key={model} delay={(i % 4) * 0.06} className="h-full">
            <li className="mt-model h-full list-none">
              <Photo
                src={siestaImages.rangeShot(model)}
                alt={alt.replace("{name}", name)}
                ratio="band"
                sizes="(max-width: 860px) 45vw, 22vw"
              />
              <p className="mt-model-name">{name}</p>
            </li>
          </Reveal>
        );
      })}
    </ul>
  );
}
