import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { PlaceholderHero } from "@/components/ui/PlaceholderHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/mattresses">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "pages.mattresses",
  });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternates("/mattresses"),
  };
}

export default async function MattressesPage({
  params,
}: PageProps<"/[locale]/mattresses">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("pages.mattresses");
  const nav = await getTranslations("nav");
  const footer = await getTranslations("footer");

  return (
    <div data-theme="mattresses">
      <PlaceholderHero
        eyebrow={nav("mattresses")}
        heading={t("heading")}
        note={t("placeholder")}
      />

      {/* Contained sub-brand cards — data-brand recolors --color-accent ONLY
          within each card's subtree, proving sub-brand colors stay scoped.
          data-brand is on the SAME element that consumes `border-accent`/
          `text-accent`, so the containment is real. */}
      <section className="bg-[color:var(--color-surface)]">
        <Container className="grid gap-6 py-20 nav:grid-cols-2">
          <Reveal x={-32}>
            <div
              data-brand="blue"
              className="rounded-md border-t-4 border-accent bg-[color:var(--color-surface-2)] p-8"
            >
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
                {footer("blue")}
              </p>
              <p className="mt-3 text-[color:var(--color-ink-body)]">
                Contained accent = blue. Retail.
              </p>
            </div>
          </Reveal>
          <Reveal x={32} delay={0.08}>
            <div
              data-brand="siesta"
              className="rounded-md border-t-4 border-accent bg-[color:var(--color-surface-2)] p-8"
            >
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">
                {footer("siesta")}
              </p>
              <p className="mt-3 text-[color:var(--color-ink-body)]">
                Contained accent = siesta purple. Hospitality.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
