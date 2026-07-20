import type { ReactNode } from "react";

/**
 * Label + control wrapper. Owns the accessibility wiring shared by every form
 * control: the `<label htmlFor>` association, the required marker, and the error
 * message node with a stable id the control points at via `aria-describedby`.
 *
 * The control is passed a render prop with the ids it must bind
 * (`id`, `aria-describedby`, `aria-invalid`), so the wiring can never drift.
 * Uses logical properties throughout so it mirrors correctly in RTL.
 *
 * THE LABEL FLOATS, AND IT IS STILL A REAL `<label htmlFor>`. That distinction
 * is the entire accessibility argument for this pattern over the
 * placeholder-as-label version it superficially resembles: a placeholder is not
 * an accessible name, it vanishes the moment typing starts, and it tells a
 * screen reader nothing once the field holds a value. Here the label is a
 * genuine labelling element that happens to be moved by a CSS transform —
 * nothing is announced differently, and the association survives autofill,
 * no-JS and pre-hydration render alike.
 *
 * The label comes AFTER the control in DOM order so the CSS can reach it with a
 * sibling combinator (`:focus ~ .field-label`) instead of `:has()`. Markup
 * order does not affect the association, which is by id.
 */
export function Field({
  name,
  label,
  required = false,
  optionalHint,
  error,
  /**
   * Selects never match `:placeholder-shown`, so their label cannot float on
   * fill — it is floated from the start. See field.css.
   */
  labelFloated = false,
  children,
}: {
  name: string;
  label: string;
  required?: boolean;
  /** Localized word appended to optional-field labels, e.g. "optional". */
  optionalHint?: string;
  /** Localized error message, or undefined when valid. */
  error?: string;
  labelFloated?: boolean;
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
    <div className="flex flex-col">
      <span className="field-shell">
        {children({
          id,
          "aria-describedby": hasError ? errorId : undefined,
          "aria-invalid": hasError || undefined,
          "aria-required": required || undefined,
        })}

        <label
          htmlFor={id}
          className={`field-label text-body-sm ${labelFloated ? "field-label--floated" : ""}`}
        >
          {label}
          {required ? (
            <span className="text-[color:var(--color-error)]" aria-hidden="true">
              {" *"}
            </span>
          ) : optionalHint ? (
            <span className="ms-1 text-xs font-normal">({optionalHint})</span>
          ) : null}
        </label>

        <span aria-hidden className="field-line" />
      </span>

      {hasError ? (
        <p id={errorId} className="mt-1.5 text-sm text-[color:var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Shared control classes so Input / Textarea / Select look identical.
 *
 * The box, the border and the focus ring are gone: a field is now a
 * transparent well with a single bottom hairline that thickens and turns sage
 * on focus (see field.css). Seven bordered rectangles stacked in a grid is
 * exactly the "looks like a default form" this section was criticised for, and
 * it was also the only part of the site not built from the hairline language
 * every other section uses.
 */
export const controlClass = "field-control text-body";
