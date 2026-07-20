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
 *
 * ITS LABEL DOES NOT FLOAT ON FILL, because `:placeholder-shown` — the whole
 * mechanism, see field.css — is not defined for `<select>`. There is no
 * selector that says "this select is on its placeholder option" without
 * `:has()` plus a `:checked` probe, and building the label position on that
 * would make an accessible name depend on a fragile selector. The label is
 * floated from the start instead, which is also just true: a select always
 * displays something, so there is never a moment when the floated position
 * would overlap an empty field. Callers pass `labelFloated` on the Field.
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
