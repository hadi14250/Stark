import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import type { Locale } from "@/i18n/routing";

/**
 * Render helper for component tests.
 *
 * Any Stark component that links somewhere reaches next-intl's `Link`, which
 * calls `getLocale()` and throws outside a provider — so a bare
 * `render(<Pill href="…" />)` fails with a stack trace that points at React
 * internals rather than at the missing context. Everything goes through here
 * instead.
 *
 * Real `en.json` is used rather than a stub so a test can't pass against
 * message keys that don't exist.
 */
export function renderWithIntl(
  ui: ReactElement,
  { locale = "en", ...options }: RenderOptions & { locale?: Locale } = {},
): RenderResult {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={en}>
        {children}
      </NextIntlClientProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
