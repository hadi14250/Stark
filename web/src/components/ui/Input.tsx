import type { ComponentPropsWithoutRef } from "react";
import { controlClass } from "./Field";

/** Text/email/tel input styled with the shared control class. */
export function Input({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return <input {...props} className={`${controlClass} ${className}`} />;
}
