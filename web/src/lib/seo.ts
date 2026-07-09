import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/** Production base URL — override via env in Vercel; localhost fallback for dev. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Build the hreflang alternates map for a given path (path WITHOUT locale
 * prefix, e.g. "" for home, "/woodworks"). Includes each locale plus x-default.
 */
export function alternates(path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `/${locale}${path}`;
  }
  languages["x-default"] = `/${routing.defaultLocale}${path}`;
  return {
    canonical: `/${routing.defaultLocale}${path}`,
    languages,
  };
}
