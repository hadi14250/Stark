import type { ReactNode } from "react";
import { Container } from "./Container";
import { Photo } from "./Photo";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The opening block of a division page.
 *
 * Uses `display` at a reduced clamp rather than a distinct `h1` role — the
 * first draft's h1 and h2 were the same family at the same weight 5–13% apart,
 * which is indistinguishable below 900px. One display role, two sizes.
 *
 * `axis` is passed explicitly rather than read from `--align-axis` because a
 * page opener is where the theme's alignment is DECLARED, and the two variants
 * are structurally different rather than just differently aligned:
 *
 *   start   a standing rule the copy hangs off, photo bleeding off the end
 *           edge. Reads as a spec sheet. (Woodworks)
 *   center  a symmetric column over a full-bleed band. Reads as a brochure.
 *           (Mattresses, Home)
 */
export function PageOpener({
  axis,
  eyebrow,
  line1,
  line2,
  sub,
  meta,
  actions,
  image,
  imageAlt,
}: {
  axis: "start" | "center";
  eyebrow: ReactNode;
  line1: string;
  line2?: string;
  sub: string;
  /** Qualitative capability strip. Never numbers that are not confirmed. */
  meta?: string[];
  actions?: ReactNode;
  image: string;
  imageAlt: string;
}) {
  const copy = (
    <div
      className={`flex flex-col gap-6 ${axis === "start" ? "items-start" : "items-center text-center"}`}
    >
      <Reveal y={16}>{eyebrow}</Reveal>

      <Reveal y={24} delay={0.08}>
        <h1
          className="max-w-[14ch] font-display leading-display tracking-display text-[color:var(--color-ink)]"
          style={{ fontSize: "clamp(40px, 5.2vw, 68px)" }}
        >
          <span className="block font-light">{line1}</span>
          {line2 && <span className="block font-semibold">{line2}</span>}
        </h1>
      </Reveal>

      <Reveal y={20} delay={0.16}>
        <p className="max-w-[54ch] text-lead leading-lead text-[color:var(--color-ink-body)]">
          {sub}
        </p>
      </Reveal>

      {meta && meta.length > 0 && (
        <Reveal y={16} delay={0.24}>
          <ul
            className={`flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] tracking-eyebrow text-[color:var(--color-ink-muted)] ${axis === "center" ? "justify-center" : ""}`}
            style={{ textTransform: "var(--eyebrow-transform)" as "uppercase" }}
          >
            {meta.map((m, i) => (
              <li key={m} className="flex items-center gap-5">
                {i > 0 && (
                  <span
                    aria-hidden
                    className="h-1 w-1 rounded-full"
                    style={{ background: "var(--color-accent)" }}
                  />
                )}
                {m}
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {actions && (
        <Reveal y={20} delay={0.3}>
          <div className={`flex flex-wrap gap-3.5 ${axis === "center" ? "justify-center" : ""}`}>
            {actions}
          </div>
        </Reveal>
      )}
    </div>
  );

  if (axis === "center") {
    return (
      <section className="relative" style={{ background: "var(--color-surface)" }}>
        <Container>
          <div className="pt-[clamp(48px,7vw,88px)] pb-[clamp(40px,6vw,72px)]">{copy}</div>
        </Container>
        <Photo src={image} alt={imageAlt} ratio="band" kenBurns priority sizes="100vw" className="max-h-[58vh]" />
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--color-surface)" }}>
      <Container>
        <div className="grid items-center gap-[clamp(32px,5vw,64px)] py-[clamp(44px,6vw,80px)] nav:grid-cols-[1fr_0.95fr]">
          {/* The standing rule. 2px in the accent for its first 64px, then the
              hairline — at 1px in --color-line it read as an accident rather
              than a structure (A0c). */}
          <div className="relative ps-8">
            <span
              aria-hidden
              className="absolute bottom-1 top-1 w-0.5"
              style={{
                insetInlineStart: 0,
                background:
                  "linear-gradient(to bottom, var(--color-accent) 0 64px, var(--color-line) 64px 100%)",
              }}
            />
            {copy}
          </div>

          <Reveal x={24} delay={0.12}>
            {/* Bleeds off the end edge — a spec-sheet page does not frame its
                photograph, it runs it to the margin. */}
            <div
              className="overflow-hidden rounded-s-[var(--radius-card)]"
              style={{ marginInlineEnd: "calc(-1 * var(--gutter))", boxShadow: "var(--shadow-card)" }}
            >
              <Photo src={image} alt={imageAlt} ratio="portrait" priority sizes="(max-width: 860px) 100vw, 46vw" />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
