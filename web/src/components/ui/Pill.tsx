import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "tan" | "forest";

const base =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

/**
 * Variant styling — consumes ONLY semantic tokens.
 * - tan:    accent fill, forest text (nav and section "Let's talk").
 * - forest: forest fill, cream text (hero "Let's talk", "View More").
 */
const variants: Record<Variant, string> = {
  tan: "bg-accent text-[color:var(--green-forest)] hover:bg-[color:var(--color-accent-2)]",
  forest:
    "bg-[color:var(--color-hero-bg)] text-[color:var(--ink-green-strong)] hover:bg-[color:var(--green-deep-1)]",
};

type PillCommon = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

type PillAsLink = PillCommon & {
  /** Internal route (via next-intl Link) or hash target. Renders an anchor/Link. */
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className">;

type PillAsButton = PillCommon & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"button">, "className">;

/**
 * The reusable Stark pill (rounded CTA). One source for every pill:
 * nav CTA, hero CTA, "View More", form submit-adjacent actions. With `href`
 * it renders a locale-aware <Link> (or a plain <a> for pure hashes); without,
 * a <button>. Styling is token-only so it recolors with the theme.
 */
export function Pill(props: PillAsLink): React.JSX.Element;
export function Pill(props: PillAsButton): React.JSX.Element;
export function Pill({
  variant = "tan",
  children,
  className = "",
  href,
  ...rest
}: PillAsLink | PillAsButton) {
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href !== undefined) {
    // Pure in-page hashes (e.g. "#contact") use a plain anchor; everything else
    // routes through next-intl's Link so the locale prefix is preserved.
    if (href.startsWith("#")) {
      return (
        <a href={href} className={cls} {...(rest as ComponentPropsWithoutRef<"a">)}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...(rest as Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className">)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...(rest as ComponentPropsWithoutRef<"button">)}>
      {children}
    </button>
  );
}
