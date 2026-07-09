"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Pill } from "@/components/ui/Pill";
import { EnvelopeIcon, SocialLinks, type SocialKey } from "@/components/ui/SocialLinks";
import { LocaleSwitcher } from "./LocaleSwitcher";
import logoWhite from "../../../public/brand/logo-horizontal-white.png";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/woodworks", key: "woodworks" },
  { href: "/mattresses", key: "mattresses" },
  { href: "/gallery", key: "gallery" },
] as const;

const SOCIAL_KEYS: readonly SocialKey[] = ["facebook", "instagram", "youtube", "x"];

/**
 * Sticky header, two-tier green (design handoff): a thin utility strip
 * (email + social) on forest, then the main nav bar on the darker nav-bg. Both
 * are always opaque — the design's hero sits BELOW a solid bar (not behind a
 * transparent one), so there is no transparent→blur condense; we only add a
 * soft shadow after 30px of scroll.
 *
 * Desktop nav + utility strip show above the custom `nav` breakpoint (860px);
 * below it a burger toggles a full-screen overlay. Body scroll locks while open.
 */
export function Nav() {
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const tSocial = useTranslations("landing.social");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const socialLabels = Object.fromEntries(
    SOCIAL_KEYS.map((k) => [k, tSocial(k)]),
  ) as Record<SocialKey, string>;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu when navigation actually changes the path (ref guard avoids
  // a synchronous setState in the effect body on the initial render).
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const email = tFooter("email");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-shadow duration-500 ${
        scrolled ? "shadow-[0_10px_30px_-12px_rgba(12,26,19,0.5)]" : ""
      }`}
    >
      {/* Utility strip — desktop only (mobile keeps a compact header). */}
      <div className="hidden bg-[color:var(--green-forest)] text-[color:var(--ink-green-strong)] nav:block">
        <Container className="flex h-10 items-center justify-between">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 text-xs transition-colors hover:text-accent"
          >
            <EnvelopeIcon width={16} height={16} />
            <span>{email}</span>
          </a>
          <SocialLinks labels={socialLabels} size={15} />
        </Container>
      </div>

      {/* Main nav bar. */}
      <div className="bg-[color:var(--color-nav-bg)]">
        <Container className="flex h-[76px] items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" aria-label="STARK">
            <Image src={logoWhite} alt="STARK" width={44} height={28} priority />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 nav:flex">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.key}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-sm transition-colors hover:text-accent ${
                    active
                      ? "font-semibold text-[color:var(--ink-green-strong)]"
                      : "text-[color:var(--ink-green-body)]"
                  }`}
                >
                  {t(l.key)}
                </Link>
              );
            })}
            <LocaleSwitcher className="text-[color:var(--ink-green-body)]" />
            <Pill variant="tan" href="/#contact" className="px-5 py-2">
              {t("cta")}
            </Pill>
          </nav>

          {/* Burger (mobile only) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center rounded-md border border-[color:var(--color-line)] text-[color:var(--ink-green-body)] nav:hidden"
          >
            <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
            <div className="flex flex-col gap-1.5">
              <span
                className={`block h-px w-5 bg-current transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
              />
              <span
                className={`block h-px w-5 bg-current transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
              />
            </div>
          </button>
        </Container>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 top-[76px] z-40 bg-[color:var(--color-nav-bg)]/97 backdrop-blur-lg nav:hidden">
          <Container className="flex flex-col gap-6 py-10">
            {LINKS.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                className="font-display text-3xl font-light text-[color:var(--ink-green-strong)]"
              >
                {t(l.key)}
              </Link>
            ))}
            <div className="mt-4 flex items-center gap-6">
              <LocaleSwitcher className="text-[color:var(--ink-green-body)]" />
              <Pill variant="tan" href="/#contact" className="px-5 py-2">
                {t("cta")}
              </Pill>
            </div>
            <div className="mt-6 flex items-center gap-6 border-t border-[color:var(--color-line)] pt-6">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-sm text-[color:var(--ink-green-body)] transition-colors hover:text-accent"
              >
                <EnvelopeIcon width={16} height={16} />
                <span>{email}</span>
              </a>
              <SocialLinks labels={socialLabels} size={16} />
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
