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
 * Desktop (≥ nav): two tiers — a thin utility strip (email + socials) on the
 * light grey surface, then the main bar (green logo, links, locale, mint CTA) on
 * white. Mobile (< nav): the utility strip is dropped and the bar collapses to
 * the mobile comp's proportions (green logo left; a 44px hamburger right that
 * swaps to an X), toggling a full-width dropdown panel that drops below the bar
 * (white, soft shadow, 17px rows divided by hairlines) — mirroring the comp's
 * `<details>` menu but carrying STARK's links + email/socials/CTA. Body scroll
 * locks while the panel is open.
 *
 * The comp's own nav extras (phone number, shopping-bag/cart badge, `dreamzy`
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
      <div className="hidden border-b border-[color:var(--dz-input-border)] bg-[color:var(--dz-bg)] text-[color:var(--dz-muted)] nav:block">
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
      <div className="relative bg-white">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-[22px] nav:h-[76px] nav:px-10">
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

          {/* Mobile: a 44px hamburger that swaps to an X while the panel is open. */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            className="-me-2.5 grid h-11 w-11 place-items-center text-[color:var(--dz-ink)] nav:hidden"
          >
            <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
            {open ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown panel — drops below the bar (comp behavior), carrying
            STARK links + locale/CTA + email/socials instead of Dreamzy's menu. */}
        {open && (
          <div className="absolute inset-x-0 top-full z-50 flex flex-col bg-white px-[22px] pb-6 pt-2.5 shadow-[0_22px_40px_rgba(0,0,0,0.14)] nav:hidden">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.key}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`border-b border-[#efefef] py-3.5 text-[17px] ${
                    active
                      ? "font-semibold text-[color:var(--dz-ink)]"
                      : "font-medium text-[color:var(--dz-muted)]"
                  }`}
                >
                  {t(l.key)}
                </Link>
              );
            })}
            <div className="flex items-center justify-between gap-4 pt-[18px]">
              <LocaleSwitcher className="!text-[color:var(--dz-nav-idle)] hover:!text-[color:var(--dz-teal)]" />
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--dz-green)] px-5 py-2.5 text-[14px] font-semibold text-[color:var(--dz-on-green)]"
              >
                {t("cta")}
              </Link>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#efefef] pt-5">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-[14px] text-[color:var(--dz-muted)] transition-colors hover:text-[color:var(--dz-teal)]"
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
        )}
      </div>
    </header>
  );
}
