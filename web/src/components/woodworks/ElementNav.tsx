"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ElementMark } from "./icons";

const LINK_KEYS = ["home", "about", "shop", "blog", "contact"] as const;

/**
 * Element nav — reproduced from the handoff.
 *
 * - Desktop (≥nav 860px): a transparent bar with right-aligned uppercase links
 *   over the hero; "Home" is active (strong, weight 600). Hover widens tracking
 *   and brightens. Rendered inside the hero region (the logo lives in the hero
 *   card, not here).
 * - Mobile (<nav): a top bar with the Element logo (emblem + wordmark) on the
 *   lead side and a hamburger on the trailing side; tapping expands a panel of
 *   the five links and rotates the button 90°.
 *
 * Links are in-page anchors (`#`) — the mockup has no real Shop/Blog routes.
 */
export function ElementNav() {
  const t = useTranslations("element.nav");
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar (hidden on desktop). */}
      <div className="relative z-20 flex items-center justify-between px-6 py-[18px] nav:hidden">
        <a href="#top" className="flex items-center gap-2.5 text-[color:var(--el-text-strong)]">
          <ElementMark className="h-6 w-6" />
          <span className="font-display text-[21px] font-bold tracking-[0.4px]">
            {t("brand")}
          </span>
        </a>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          className={`flex h-9 w-9 flex-col items-center justify-center gap-[5px] transition-transform duration-300 ${
            open ? "rotate-90" : ""
          }`}
        >
          <span className="h-0.5 w-5 rounded-sm bg-[color:var(--el-text-strong)]" />
          <span className="h-0.5 w-5 rounded-sm bg-[color:var(--el-text-strong)]" />
          <span className="h-0.5 w-5 rounded-sm bg-[color:var(--el-text-strong)]" />
        </button>
      </div>

      {/* Mobile dropdown panel. */}
      <div
        className={`relative z-20 overflow-hidden bg-[color:var(--el-surface-panel)] transition-[max-height,opacity] duration-[450ms] ease-out nav:hidden ${
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-6 pb-3.5 pt-1">
          {LINK_KEYS.map((key, i) => (
            <a
              key={key}
              href="#top"
              onClick={() => setOpen(false)}
              className={`border-b border-[rgba(240,244,248,0.07)] py-[13px] text-sm uppercase tracking-[1.8px] last:border-0 ${
                i === 0
                  ? "font-semibold text-[color:var(--el-text-strong)]"
                  : "text-[color:var(--el-text-body)]"
              }`}
            >
              {t(key)}
            </a>
          ))}
        </div>
      </div>

      {/* Desktop right-aligned links over the hero. */}
      <nav className="pointer-events-none absolute inset-x-0 top-[43px] z-[6] hidden justify-end gap-9 px-[85px] nav:flex">
        {LINK_KEYS.map((key, i) => (
          <a
            key={key}
            href="#top"
            className={`pointer-events-auto whitespace-nowrap text-[14.5px] uppercase tracking-[1.6px] transition-[color,letter-spacing] duration-300 hover:tracking-[2.4px] hover:text-[color:var(--el-text-strong)] ${
              i === 0
                ? "font-semibold text-[color:var(--el-text-strong)]"
                : "font-normal text-[color:var(--el-text-nav-idle)]"
            }`}
          >
            {t(key)}
          </a>
        ))}
      </nav>
    </>
  );
}
