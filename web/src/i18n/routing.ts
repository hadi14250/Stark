import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for locales — consumed by proxy, navigation, request,
 * the [locale] layout, sitemap and metadata so they can never drift.
 */
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
