import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The marks the factory holds, as the company profile prints them (p12).
 *
 * ===========================================================================
 * WHAT THIS REPLACED, AND WHAT CHANGED ABOUT THE CLAIM
 * ===========================================================================
 *
 * Two bordered text entries: "FSC Chain of Custody" with its certificate
 * number, and "Fire-rated doors" with its Intertek wording. That was not a
 * design decision, it was the ONLY thing that could be published — the audit
 * held ISO 9001 and ISO 45001 back because the certificates on file expired
 * 13.12.2025, and there has never been an ISO 14001 certificate in any document
 * supplied.
 *
 * The client asked for this section to show the actual logos and to match p12,
 * which prints all seven marks including the ISO block. That is their document
 * and their claim; `facts.ts` carries the three standard numbers with the
 * expiry recorded on each, and SOURCES.md records that this is
 * client-directed rather than newly evidenced. Nobody should have to rediscover
 * that by reading a certificate PDF.
 *
 * THE TWO SENTENCES THAT USED TO BE THE SECTION ARE NOW ITS CAPTION. Swapping
 * text for logos would otherwise have thrown away the only CHECKABLE detail on
 * the page — a certificate number a specifier can look up beats a logo anyone
 * can paste — so the FSC number and the Intertek wording survive underneath.
 *
 * ===========================================================================
 * WHY THE LOGOS SIT ON A WHITE PLATE
 * ===========================================================================
 *
 * These are third-party trademarks with their own colour rules, and four of the
 * seven are multi-colour rasters with a white ground baked in. On the page's
 * cream they would each show a faint rectangle where their background failed to
 * match. A deliberate white card makes that a frame rather than a defect, and
 * it is also how p12 presents them.
 *
 * They are NOT run through `--image-filter`. Every other photograph on this
 * route is graded by the theme; grading a certification mark would alter a
 * trademark's colour, which is the one image on the site that must render as
 * its owner specifies.
 */

/** Filename stem in `public/certifications/`, which is also the message key. */
const RECOGNITION = ["awi", "leed", "saudi-made", "local-content"] as const;
const CERTIFICATIONS = ["fsc", "ifc", "iso"] as const;

type Mark = (typeof RECOGNITION)[number] | (typeof CERTIFICATIONS)[number];

export function Certifications({
  recognitionLabel,
  certificationsLabel,
  note,
  names,
}: {
  recognitionLabel: string;
  certificationsLabel: string;
  note: string;
  names: Record<Mark, string>;
}) {
  return (
    <div className="mt-[clamp(28px,3.5vw,44px)]">
      <div className="grid gap-[clamp(16px,2vw,24px)] nav:grid-cols-[1.35fr_1fr]">
        <MarkGroup label={recognitionLabel} marks={RECOGNITION} names={names} />
        <MarkGroup label={certificationsLabel} marks={CERTIFICATIONS} names={names} />
      </div>

      {/* The checkable half, kept. See the docblock. */}
      <Reveal y={16}>
        <p className="mt-[clamp(16px,2vw,22px)] max-w-[78ch] text-body-sm leading-body text-[color:var(--color-ink-muted)]">
          {note}
        </p>
      </Reveal>
    </div>
  );
}

function MarkGroup({
  label,
  marks,
  names,
}: {
  label: string;
  marks: readonly Mark[];
  names: Record<Mark, string>;
}) {
  return (
    <Reveal
      y={18}
      /* `bg-white` as a utility rather than an inline style: `Reveal` takes a
         className and deliberately does not take a `style`, because it already
         writes five custom properties there to drive the keyframe. */
      className="rounded-[var(--radius-card)] border bg-white p-[clamp(18px,2.2vw,28px)] [border-color:var(--color-line)]"
    >
      <p
        className="font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)]"
        style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
      >
        {label}
      </p>
      <ul className="mt-5 flex flex-wrap items-center gap-x-[clamp(20px,3vw,40px)] gap-y-[clamp(16px,2vw,26px)]">
        {marks.map((mark) => (
          <li key={mark} className="flex">
            {/*
              `alt` names the body, not the file. A screen-reader user gets
              "Architectural Woodwork Institute", which is the claim; "AWI logo"
              would describe the picture and withhold the point of it.

              Height-constrained rather than width-constrained: the seven marks
              range from a tall roundel (LEED) to a wide banner (ISO), and
              matching their WIDTHS would make the roundel enormous. Matching
              optical height is what makes a row of unrelated logos read as a
              set. `w-auto` lets each keep its own ratio.
            */}
            <Image
              src={`/certifications/${mark}.png`}
              alt={names[mark]}
              width={220}
              height={110}
              className="h-[clamp(38px,4.4vw,54px)] w-auto object-contain"
              sizes="220px"
            />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
