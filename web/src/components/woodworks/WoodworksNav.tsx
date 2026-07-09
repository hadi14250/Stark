"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { EnvelopeIcon, SocialLinks, type SocialKey } from "@/components/ui/SocialLinks";
import logoWhite from "../../../public/brand/logo-horizontal-white.png";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/woodworks", key: "woodworks" },
  { href: "/mattresses", key: "mattresses" },
  { href: "/gallery", key: "gallery" },
] as const;

const SOCIAL_KEYS: readonly SocialKey[] = ["facebook", "instagram", "youtube", "x"];

/**
 * The STARK site nav — same structure, links, logo, locale switcher and
 * "Start a project" CTA as the shared `Nav`, but restyled to the dark Element
 * palette (charcoal + tan) so it fits the Woodworks page. It renders INSIDE the
 * page's `data-theme="element"` wrapper (the shared green Nav is suppressed for
 * this segment by SiteChrome), which is why navigating Stark → Woodworks keeps
 * the same nav content while the colors + style change.
 *
 * Two tiers: a thin utility strip (email + socials) on the darker panel surface,
 * then the main bar (logo, links, locale, tan CTA) on the page charcoal. Below
 * the `nav` (860px) breakpoint a burger toggles a full-screen overlay; body
 * scroll locks while open.
 */
export function WoodworksNav() {
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
        scrolled ? "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)]" : ""
      }`}
    >
      {/* Utility strip — desktop only. */}
      <div className="bg-[color:var(--el-surface-panel)] text-[color:var(--el-text-body)]">
        <div className="mx-auto flex h-10 max-w-[1200px] items-center justify-between px-5 nav:px-[clamp(24px,5vw,72px)]">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 text-[11px] transition-colors hover:text-[color:var(--el-accent)] nav:text-xs"
          >
            <EnvelopeIcon width={15} height={15} />
            <span>{email}</span>
          </a>
          <SocialLinks
            labels={socialLabels}
            size={14}
            className="nav:[&_svg]:h-[15px] nav:[&_svg]:w-[15px]"
            linkClassName="!text-[color:var(--el-text-muted)] hover:!text-[color:var(--el-accent)]"
          />
        </div>
      </div>

      {/* Main nav bar. */}
      <div className="bg-[color:var(--el-bg)]">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 nav:h-[76px] nav:px-[clamp(24px,5vw,72px)]">
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
                  className={`text-sm uppercase tracking-[1.4px] transition-colors hover:text-[color:var(--el-accent)] ${
                    active
                      ? "font-semibold text-[color:var(--el-text-strong)]"
                      : "text-[color:var(--el-text-nav-idle)]"
                  }`}
                >
                  {t(l.key)}
                </Link>
              );
            })}
            <LocaleSwitcher className="text-[color:var(--el-text-nav-idle)] hover:!text-[color:var(--el-accent)]" />
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--el-accent)] px-5 py-2 text-sm font-medium text-[color:var(--el-bg)] transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
            >
              {t("cta")}
            </a>
          </nav>

          {/* Mobile cluster: CTA + burger. */}
          <div className="flex items-center gap-3 nav:hidden">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--el-accent)] px-4 py-2 text-[12.5px] font-medium text-[color:var(--el-bg)]"
            >
              {t("cta")}
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t("closeMenu") : t("openMenu")}
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center rounded-md border border-[rgba(240,244,248,0.14)] text-[color:var(--el-text-body)]"
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
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 top-[104px] z-40 bg-[color:var(--el-bg)]/97 backdrop-blur-lg nav:hidden">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-10">
            {LINKS.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                className="font-display text-3xl font-bold text-[color:var(--el-text-strong)]"
              >
                {t(l.key)}
              </Link>
            ))}
            <div className="mt-4 flex items-center gap-6">
              <LocaleSwitcher className="text-[color:var(--el-text-nav-idle)] hover:!text-[color:var(--el-accent)]" />
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--el-accent)] px-5 py-2 text-sm font-medium text-[color:var(--el-bg)]"
              >
                {t("cta")}
              </a>
            </div>
            <div className="mt-6 flex items-center gap-6 border-t border-[rgba(240,244,248,0.12)] pt-6">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-sm text-[color:var(--el-text-body)] transition-colors hover:text-[color:var(--el-accent)]"
              >
                <EnvelopeIcon width={16} height={16} />
                <span>{email}</span>
              </a>
              <SocialLinks
                labels={socialLabels}
                size={16}
                linkClassName="!text-[color:var(--el-text-muted)] hover:!text-[color:var(--el-accent)]"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
