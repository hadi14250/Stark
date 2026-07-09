import type { ReactNode } from "react";

/**
 * Label + control wrapper. Owns the accessibility wiring shared by every form
 * control: the `<label htmlFor>` association, the required marker, and the error
 * message node with a stable id the control points at via `aria-describedby`.
 *
 * The control is passed a render prop with the ids it must bind
 * (`id`, `aria-describedby`, `aria-invalid`), so the wiring can never drift.
 * Uses logical properties throughout so it mirrors correctly in RTL.
 */
export function Field({
  name,
  label,
  required = false,
  optionalHint,
  error,
  children,
}: {
  name: string;
  label: string;
  required?: boolean;
  /** Localized word appended to optional-field labels, e.g. "optional". */
  optionalHint?: string;
  /** Localized error message, or undefined when valid. */
  error?: string;
  children: (ids: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    "aria-required"?: boolean;
  }) => ReactNode;
}) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-[color:var(--color-ink)]"
      >
        {label}
        {required ? (
          <span className="text-[color:var(--color-error)]" aria-hidden="true">
            {" *"}
          </span>
        ) : optionalHint ? (
          <span className="ms-1 text-xs font-normal text-[color:var(--color-ink-muted)]">
            ({optionalHint})
          </span>
        ) : null}
      </label>

      {children({
        id,
        "aria-describedby": hasError ? errorId : undefined,
        "aria-invalid": hasError || undefined,
        "aria-required": required || undefined,
      })}

      {hasError ? (
        <p
          id={errorId}
          className="text-sm text-[color:var(--color-error)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Shared control classes so Input / Textarea / Select look identical. Logical
 * padding for RTL; the focus ring reads from the semantic field-ring token.
 */
export const controlClass =
  "w-full rounded-lg border bg-[color:var(--color-field-surface)] px-3.5 py-2.5 text-[color:var(--color-ink)] " +
  "border-[color:var(--color-field-border)] outline-none transition-[border-color,box-shadow] " +
  "placeholder:text-[color:var(--color-ink-muted)] " +
  "focus-visible:border-[color:var(--color-field-ring)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-field-ring)] " +
  "aria-[invalid=true]:border-[color:var(--color-error)] aria-[invalid=true]:ring-[color:var(--color-error)]";
