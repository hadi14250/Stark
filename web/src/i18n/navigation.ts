import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation. Use these instead of next/link + next/navigation so
 * the current locale prefix is preserved automatically. The LocaleSwitcher uses
 * `usePathname` (returns the pathname WITHOUT the locale prefix) + `Link` with an
 * explicit `locale` prop to keep the user on the same page when switching.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
