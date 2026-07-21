import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SocialLinks, type SocialKey } from "@/components/ui/SocialLinks";
import logoWhite from "../../../public/brand/logo-horizontal-white.png";

const SOCIAL_KEYS: readonly SocialKey[] = ["facebook", "instagram", "youtube", "x"];

/**
 * Site footer on the darkest green surface (--color-footer-bg), matching the
 * design handoff. 4-column grid (brand / divisions / company / contact) that
 * collapses to 2 columns below the `nav` (860px) breakpoint, a social row, a
 * hairline rule, and a legal bar. Real Stark content (phone gated on F6).
 */
export function Footer() {
  const t = useTranslations("footer");
  const tSocial = useTranslations("landing.social");
  const year = 2026; // Date.now() is unavailable in this environment; bump yearly or wire at runtime.

  const socialLabels = Object.fromEntries(
    SOCIAL_KEYS.map((k) => [k, tSocial(k)]),
  ) as Record<SocialKey, string>;

  return (
    <footer className="bg-[color:var(--color-footer-bg)] text-[color:var(--ink-green-body)]">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 nav:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 nav:col-span-1">
            <Image src={logoWhite} alt="STARK" width={47} height={30} />
            <p className="mt-5 max-w-[28ch] font-display text-xl font-light text-[color:var(--ink-green-strong)]">
              {t("tagline")}
            </p>
            <SocialLinks labels={socialLabels} size={18} className="mt-6" />
          </div>

          {/* Divisions */}
          <div>
            <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-[color:var(--ink-green-muted)]">
              {t("divisions")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/woodworks" className="hover:text-accent">
                  {t("woodworks")}
                </Link>
              </li>
              <li>
                <Link href="/mattresses" className="hover:text-accent">
                  {t("mattresses")}
                </Link>
              </li>
              <li className="text-[color:var(--ink-green-muted)]">{t("blue")}</li>
              <li className="text-[color:var(--ink-green-muted)]">
                {t("siesta")}
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-[color:var(--ink-green-muted)]">
              {t("company")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/gallery" className="hover:text-accent">
                  {t("gallery")}
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-accent">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-[color:var(--ink-green-muted)]">
              {t("contact")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`mailto:${t("email")}`} className="hover:text-accent">
                  {t("email")}
                </a>
              </li>
              <li className="text-[color:var(--ink-green-muted)]">
                {t("location")}
              </li>
            </ul>
          </div>
        </div>

        {/* Legal bar.
            The sand "SAUDI BASED POWER." sign-off used to sit at the end of
            this row. The client asked for it off the site entirely, here and
            on the hero, so the bar carries the copyright alone. */}
        <div className="mt-14 flex flex-col gap-3 border-t border-[color:var(--color-line)] pt-6 text-xs text-[color:var(--ink-green-muted)] nav:flex-row nav:items-center nav:justify-between">
          <span>
            © {year} STARK. {t("rights")}
          </span>
        </div>
      </Container>
    </footer>
  );
}
