import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "./ContactForm";

/**
 * The contact section — the site's single contact surface, mounted on the
 * Landing page (`#contact`, the target of every "Start a project" CTA).
 *
 * This is a self-contained island: it survives the Phase-3 Landing rebuild, and
 * the later Landing design handoff swaps its visual shell (and adds the
 * "pentagon-completes" success set-piece) without touching the form logic.
 */
export async function ContactSection() {
  const t = await getTranslations("contact");
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-[132px] bg-[color:var(--color-surface)] py-20 sm:py-28"
    >
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <h2
            id="contact-heading"
            className="font-display text-3xl font-light text-[color:var(--color-ink)] sm:text-4xl"
          >
            {t("heading")}
          </h2>
          <p className="mt-4 max-w-md text-[color:var(--color-ink-body)]">
            {t("sub")}
          </p>

          <dl className="mt-8 space-y-3 text-sm text-[color:var(--color-ink-body)]">
            <ContactDetail label={t("fields.email.label")} value={t("details.email")} href={`mailto:${t("details.email")}`} />
            {t("details.phone") ? (
              <ContactDetail label={t("fields.phone.label")} value={t("details.phone")} href={`tel:${t("details.phone")}`} />
            ) : null}
            <ContactDetail label="—" value={t("details.location")} />
          </dl>
        </div>

        <ContactForm />
      </Container>
    </section>
  );
}

/** One label/value pair in the direct-contact list. */
function ContactDetail({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex gap-3">
      <dt className="min-w-16 font-medium text-[color:var(--color-ink)]">
        {label}
      </dt>
      <dd>
        {href ? (
          <a href={href} className="transition-colors hover:text-[color:var(--color-accent-2)]">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
