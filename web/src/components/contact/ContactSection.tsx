import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SocialLinks, type SocialKey } from "@/components/ui/SocialLinks";
import { MarkTexture } from "@/components/brand/geometry";
import { WordsReveal, LineReveal } from "@/components/motion/WordsReveal";
import { ContactForm } from "./ContactForm";

/**
 * The contact section — the site's single contact surface, mounted on the
 * Landing page (`#contact`, the target of every "Let's talk" CTA).
 *
 * WHAT WAS HERE: a plain two-column band. A heading, three label/value pairs,
 * and seven bordered inputs. It was the only section on the site that used no
 * design-system shell at all — its own padding instead of `--space-section`,
 * no eyebrow, no motion, no geometry — and its own comment admitted the
 * presentation had been deferred until a design arrived. It read as a form
 * bolted to the end of a designed page, because that is what it was.
 *
 * WHAT IT IS NOW: one composition rather than two columns. A dark green panel
 * carries the invitation and the direct-contact routes; the form sits on a
 * raised light card that OVERLAPS it. The overlap is the whole idea — two flat
 * columns side by side are a layout, whereas one plane lifted off another is a
 * composition, and it costs a negative margin. It also puts the section's
 * lightest surface next to its darkest, which is the contrast this page ends
 * on.
 *
 * MOBILE DROPS THE OVERLAP, deliberately. There is no room for a card to hang
 * off the edge of a 390px screen, and forcing it produces a horizontal scroll
 * bar. The panel stacks above the card, the fields go full width, and the
 * floating labels behave identically — the composition simplifies, the
 * behaviour does not change.
 */
export async function ContactSection() {
  const t = await getTranslations("contact");
  const social = await getTranslations("landing.social");

  const socialLabels: Record<SocialKey, string> = {
    facebook: social("facebook"),
    instagram: social("instagram"),
    youtube: social("youtube"),
    x: social("x"),
  };

  return (
    <Section
      surface="surface"
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-[132px] overflow-hidden"
    >
      <Container>
        <div className="grid items-start gap-0 nav:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* ---------------------------------------------------------------
              The dark panel. Carries the invitation and every way to reach a
              person that is not this form — because a contact section whose
              only route is a form is a contact section that fails whenever the
              form does.
             --------------------------------------------------------------- */}
          <div
            className="relative isolate overflow-hidden rounded-[var(--radius-card)] p-[clamp(28px,4vw,52px)] nav:pb-[clamp(96px,10vw,140px)]"
            style={{ background: "var(--green-900)" }}
          >
            {/* Sand glow, then the mark at texture weight. Both fixed values
                rather than theme roles: this panel is dark on every theme the
                section can appear under, so a role that re-points would take
                the contrast with it. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(80% 60% at 15% 0%, rgb(219 202 173 / 0.14), transparent 70%)",
              }}
            />
            <MarkTexture
              variant="mark"
              color="var(--white-500)"
              opacity={0.05}
              size={420}
              style={{ bottom: "-140px", insetInlineEnd: "-120px" }}
            />

            <div className="flex flex-col items-start gap-5">
              <LineReveal>
                <Eyebrow>{t("eyebrow")}</Eyebrow>
              </LineReveal>

              <WordsReveal
                text={t("heading")}
                as="h2"
                id="contact-heading"
                justify="flex-start"
                delay={0.08}
                className="font-display text-h2 font-bold leading-h2 tracking-display"
                style={{ color: "var(--white-500)" }}
              />

              {/* The sub-line that used to sit here ("Tell us about your
                  project and we'll get back to you.") is gone at the client's
                  request. It was restating the form directly beneath it. */}
            </div>

            <dl className="mt-[clamp(28px,4vw,44px)] flex flex-col">
              <ContactRow label={t("fields.email.label")} value={t("details.email")} href={`mailto:${t("details.email")}`} />
              {t("details.phone") ? (
                <ContactRow label={t("fields.phone.label")} value={t("details.phone")} href={`tel:${t("details.phone")}`} />
              ) : null}
              <ContactRow label={t("locationLabel")} value={t("details.location")} />
            </dl>

            <div className="mt-8">
              <SocialLinks labels={socialLabels} size={16} />
            </div>
          </div>

          {/* ---------------------------------------------------------------
              The form card. `-mt-*` on mobile is zero and the overlap is
              horizontal on desktop: the card pulls back over the panel's end
              edge, and up, so the two planes interlock instead of abutting.
             --------------------------------------------------------------- */}
          {/*
            `data-surface="light"` is load-bearing, not decoration. The card's
            background is a FIXED off-white on every theme, but `--color-ink`
            is not fixed — on the dark Woodworks page it resolves to off-white
            too, which would render the entire form as invisible text on an
            invisible card. The attribute re-points the ink, line and field
            roles for this subtree only; axis and density stay the page's.
          */}
          <div
            data-surface="light"
            className="relative z-[1] -mt-8 rounded-[var(--radius-card)] p-[clamp(24px,3.4vw,44px)] nav:mt-[clamp(56px,7vw,96px)] nav:ms-[-48px]"
            style={{
              background: "var(--white-500)",
              boxShadow: "var(--shadow-panel)",
            }}
          >
            <ContactForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/**
 * One route to a person, as a ruled row.
 *
 * The hairline-between-rows treatment rather than a boxed list, so this matches
 * the Turnkey ledger and the Woodworks standards table — the site has one way
 * of setting out a list of facts and this is it.
 */
function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div
      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t py-4"
      style={{ borderColor: "rgb(250 245 239 / 0.14)" }}
    >
      <dt
        className="font-mono text-[11px] tracking-eyebrow"
        style={{
          color: "rgb(250 245 239 / 0.55)",
          textTransform: "var(--eyebrow-transform)" as "uppercase",
        }}
      >
        {label}
      </dt>
      <dd className="text-body" style={{ color: "var(--white-500)" }}>
        {href ? (
          <a
            href={href}
            className="transition-colors hover:text-[color:var(--color-accent)]"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
