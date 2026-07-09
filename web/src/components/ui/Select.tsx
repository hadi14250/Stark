import type { ComponentPropsWithoutRef } from "react";
import { controlClass } from "./Field";

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Native <select> styled with the shared control class. Native (not a custom
 * widget) so it is accessible and works without JS. A leading placeholder
 * option renders when no value is chosen; for optional selects it is a valid
 * empty choice, for required selects the browser blocks empty submission.
 */
export function Select({
  options,
  placeholder,
  required,
  defaultValue = "",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"select"> & {
  options: readonly SelectOption[];
  placeholder: string;
}) {
  return (
    <select
      {...props}
      required={required}
      defaultValue={defaultValue}
      className={`${controlClass} ${className}`}
    >
      <option value="" disabled={required}>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
