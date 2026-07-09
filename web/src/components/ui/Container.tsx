import type { ReactNode, ElementType } from "react";

/**
 * Centered content container with fluid horizontal padding
 * (clamp(24px, 5vw, 72px)) and a max measure. Uses logical padding so it is
 * RTL-safe automatically.
 */
export function Container({
  children,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return (
    <Tag
      className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] ${className}`}
    >
      {children}
    </Tag>
  );
}
