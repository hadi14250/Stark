"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("states");

  useEffect(() => {
    // Surface the error for observability; wire to a logger later.
    console.error(error);
  }, [error]);

  return (
    <Container className="grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[color:var(--color-ink)]">
          {t("errorTitle")}
        </h1>
        <p className="mt-3 text-[color:var(--color-ink-body)]">
          {t("errorBody")}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-[color:var(--green-forest)] transition-transform hover:-translate-y-0.5"
        >
          {t("errorCta")}
        </button>
      </div>
    </Container>
  );
}
