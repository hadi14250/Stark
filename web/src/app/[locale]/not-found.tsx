import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

export default async function NotFound() {
  const t = await getTranslations("states");
  return (
    <Container className="grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="font-mono text-sm uppercase tracking-eyebrow text-accent">
          404
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-[color:var(--color-ink)]">
          {t("notFoundTitle")}
        </h1>
        <p className="mt-3 text-[color:var(--color-ink-body)]">
          {t("notFoundBody")}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-[color:var(--green-forest)] transition-transform hover:-translate-y-0.5"
        >
          {t("notFoundCta")}
        </Link>
      </div>
    </Container>
  );
}
