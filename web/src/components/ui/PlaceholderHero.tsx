import { Container } from "./Container";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Phase-0 placeholder section. Proves the shell, tokens (semantic utilities),
 * i18n copy and one Reveal all work end-to-end. Real page content replaces
 * these in Phases 3–6. Consumes ONLY semantic tokens, so a wrapping
 * data-theme / data-brand recolors it with no edits.
 */
export function PlaceholderHero({
  eyebrow,
  heading,
  note,
}: {
  eyebrow: string;
  heading: string;
  note: string;
}) {
  return (
    <section className="bg-[color:var(--color-hero-bg)]">
      <Container className="flex min-h-[80dvh] flex-col justify-center py-32">
        <Reveal y={16}>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
            {eyebrow}
          </p>
        </Reveal>
        <Reveal y={28} delay={0.08}>
          <h1 className="mt-4 max-w-[16ch] font-display text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[color:var(--ink-green-strong)]">
            {heading}
          </h1>
        </Reveal>
        <Reveal y={20} delay={0.16}>
          <p className="mt-6 font-mono text-sm text-[color:var(--ink-green-muted)]">
            {note}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
