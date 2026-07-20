import type { ComponentPropsWithoutRef } from "react";
import { controlClass } from "./Field";

/** Multiline textarea styled with the shared control class. */
export function Textarea({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      {...props}
      className={`${controlClass} ${className}`}
    />
  );
}
