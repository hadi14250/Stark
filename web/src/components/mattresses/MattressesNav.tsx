"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { EnvelopeIcon, SocialLinks, type SocialKey } from "@/components/ui/SocialLinks";
import logoGreen from "../../../public/brand/logo-horizontal-green.png";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/woodworks", key: "woodworks" },
  { href: "/mattresses", key: "mattresses" },
  { href: "/gallery", key: "gallery" },
] as const;

const SOCIAL_KEYS: readonly SocialKey[] = ["facebook", "instagram", "youtube", "x"];

/**
 * The STARK site nav — same structure, links, logo, locale switcher and
 * "Start a project" CTA as the shared `Nav`, but restyled to the light Dreamzy
 * palette (white bar, mint/teal accents) so it fits the Mattresses page. It
 * renders INSIDE the page's `data-theme="dreamzy"` wrapper (the shared green Nav
 * is suppressed for this segment by SiteChrome), which is why navigating
 * Stark → Mattresses keeps the same nav content while the colors + style change.
 *
 * Two tiers: a thin utility strip (email + socials) on the light grey surface,
 * then the main bar (green logo, links, locale, mint CTA) on white. Below the
 * `nav` (860px) breakpoint a burger toggles a full-screen overlay; body scroll
 * locks while open.
 *
 * The comp's own nav extras (phone number, shopping-bag badge, `dreamzy`
 * wordmark, Sleep System / About us links) are intentionally dropped — this is
 * the Stark nav wearing Dreamzy colors.
 */
export function MattressesNav() {
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

  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

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
        scrolled ? "shadow-[0_10px_30px_-14px_rgba(32,42,53,0.28)]" : ""
      }`}
    >
      {/* Utility strip — desktop only. */}
      <div className="border-b border-[color:var(--dz-input-border)] bg-[color:var(--dz-bg)] text-[color:var(--dz-muted)]">
        <div className="mx-auto flex h-10 max-w-[1280px] items-center justify-between px-6 nav:px-10">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 text-[11px] transition-colors hover:text-[color:var(--dz-teal)] nav:text-xs"
          >
            <EnvelopeIcon width={15} height={15} />
            <span>{email}</span>
          </a>
          <SocialLinks
            labels={socialLabels}
            size={14}
            className="nav:[&_svg]:h-[15px] nav:[&_svg]:w-[15px]"
            linkClassName="!text-[color:var(--dz-nav-idle)] hover:!text-[color:var(--dz-teal)]"
          />
        </div>
      </div>

      {/* Main nav bar. */}
      <div className="bg-white">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 nav:h-[76px] nav:px-10">
          <Link href="/" className="flex items-center gap-3" aria-label="STARK">
            <Image src={logoGreen} alt="STARK" width={116} height={30} priority className="h-[26px] w-auto nav:h-[30px]" />
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
                  className={`text-sm transition-colors hover:text-[color:var(--dz-nav-hover)] ${
                    active
                      ? "font-semibold text-[color:var(--dz-ink)]"
                      : "font-medium text-[color:var(--dz-nav-idle)]"
                  }`}
                >
                  {t(l.key)}
                </Link>
              );
            })}
            <LocaleSwitcher className="!text-[color:var(--dz-nav-idle)] hover:!text-[color:var(--dz-teal)]" />
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--dz-green)] px-5 py-2 text-sm font-semibold text-[color:var(--dz-on-green)] shadow-[0_10px_24px_rgba(93,227,176,0.32)] transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
            >
              {t("cta")}
            </Link>
          </nav>

          {/* Mobile cluster: CTA + burger. */}
          <div className="flex items-center gap-3 nav:hidden">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--dz-green)] px-4 py-2 text-[12.5px] font-semibold text-[color:var(--dz-on-green)]"
            >
              {t("cta")}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t("closeMenu") : t("openMenu")}
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center rounded-md border border-[color:var(--dz-input-border)] text-[color:var(--dz-ink)]"
            >
              <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
              <div className="flex flex-col gap-1.5">
                <span
                  className={`block h-0.5 w-5 bg-current transition-transform ${open ? "translate-y-[4px] rotate-45" : ""}`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current transition-transform ${open ? "-translate-y-[4px] -rotate-45" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 top-[104px] z-40 bg-white/98 backdrop-blur-lg nav:hidden">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-10">
            {LINKS.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                className="font-display text-3xl font-bold text-[color:var(--dz-ink)]"
              >
                {t(l.key)}
              </Link>
            ))}
            <div className="mt-4 flex items-center gap-6">
              <LocaleSwitcher className="!text-[color:var(--dz-nav-idle)] hover:!text-[color:var(--dz-teal)]" />
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--dz-green)] px-5 py-2 text-sm font-semibold text-[color:var(--dz-on-green)]"
              >
                {t("cta")}
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-6 border-t border-[color:var(--dz-input-border)] pt-6">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-sm text-[color:var(--dz-muted)] transition-colors hover:text-[color:var(--dz-teal)]"
              >
                <EnvelopeIcon width={16} height={16} />
                <span>{email}</span>
              </a>
              <SocialLinks
                labels={socialLabels}
                size={16}
                linkClassName="!text-[color:var(--dz-nav-idle)] hover:!text-[color:var(--dz-teal)]"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
