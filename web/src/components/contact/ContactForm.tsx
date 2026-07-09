"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { submitContact } from "@/app/[locale]/actions/contact";
import { initialContactState } from "@/app/[locale]/actions/contact-state";
import { CONTACT_FIELDS, type FieldMeta } from "@/lib/contact/schema";
import { HONEYPOT_FIELD, STARTED_AT_FIELD } from "@/lib/contact/spam";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { SubmitButton } from "@/components/ui/SubmitButton";

/**
 * The interactive contact form. Server-side validation is authoritative
 * (`submitContact`); this component renders fields from the shared metadata,
 * localizes labels/options/errors via next-intl, and manages accessible
 * feedback. It carries NO bespoke visual motion — the "pentagon-completes"
 * success set-piece and floating labels land later when the Landing design
 * handoff arrives, swapping only presentation, not this logic.
 */
export function ContactForm() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [state, formAction] = useActionState(
    submitContact,
    initialContactState,
  );

  const formRef = useRef<HTMLFormElement>(null);
  const statusId = useId();

  const fieldErrors =
    state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const formError = state.status === "error" ? state.formError : undefined;
  const succeeded = state.status === "success";

  // On a failed submit, move focus to the first invalid control so keyboard and
  // screen-reader users are taken straight to what needs fixing.
  useEffect(() => {
    if (state.status !== "error") return;
    const firstBadKey = CONTACT_FIELDS.find((f) => fieldErrors[f.key])?.key;
    const el = firstBadKey
      ? formRef.current?.querySelector<HTMLElement>(`#contact-${firstBadKey}`)
      : formRef.current?.querySelector<HTMLElement>('[data-form-status="error"]');
    el?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // After a successful submit, clear the fields so the form is ready for reuse.
  useEffect(() => {
    if (succeeded) formRef.current?.reset();
  }, [succeeded]);

  const values = state.status === "error" ? (state.values ?? {}) : {};

  function renderControl(f: FieldMeta) {
    const label = t(`fields.${f.key}.label`);
    const code = fieldErrors[f.key];
    const error = code ? t(`states.${code}`) : undefined;
    // Only text/textarea fields carry a placeholder message; selects don't.
    const placeholder = fieldPlaceholder(t, f.key);
    const defaultValue = values[f.key] ?? "";

    return (
      // Key by the echoed value so an uncontrolled control remounts (and picks
      // up its new defaultValue) only when the repopulated value changes.
      <Field
        key={`${f.key}:${defaultValue}`}
        name={f.key}
        label={label}
        required={f.required}
        optionalHint={!f.required ? t("optionalHint") : undefined}
        error={error}
      >
        {(ids) => {
          if (f.control === "textarea") {
            return (
              <Textarea
                {...ids}
                name={f.key}
                rows={f.rows}
                required={f.required}
                placeholder={placeholder}
                defaultValue={defaultValue}
              />
            );
          }
          if (f.control === "select") {
            return (
              <Select
                {...ids}
                name={f.key}
                required={f.required}
                placeholder={t("placeholders.select")}
                defaultValue={defaultValue}
                options={(f.options ?? []).map((code) => ({
                  value: code,
                  label: optionLabel(t, f.key, code),
                }))}
              />
            );
          }
          return (
            <Input
              {...ids}
              name={f.key}
              type={f.type}
              required={f.required}
              autoComplete={f.autoComplete}
              placeholder={placeholder}
              defaultValue={defaultValue}
            />
          );
        }}
      </Field>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5" noValidate>
      {/* Locale for the lead email + honeypot + timing gate (hidden). */}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name={STARTED_AT_FIELD} value="" ref={useStartedAt()} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`contact-${HONEYPOT_FIELD}`}>Do not fill this field</label>
        <input
          id={`contact-${HONEYPOT_FIELD}`}
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {renderControl(CONTACT_FIELDS[0])}
        {renderControl(CONTACT_FIELDS[1])}
        {renderControl(CONTACT_FIELDS[2])}
        {renderControl(CONTACT_FIELDS[3])}
        {renderControl(CONTACT_FIELDS[4])}
        {renderControl(CONTACT_FIELDS[5])}
      </div>
      {/* Message spans full width */}
      {renderControl(CONTACT_FIELDS[6])}

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton label={t("states.submit")} pendingLabel={t("states.sending")} />

        {/* Live region: one node announces success OR form-level error. */}
        <p
          id={statusId}
          role="status"
          aria-live="polite"
          tabIndex={-1}
          data-form-status={succeeded ? "success" : formError ? "error" : undefined}
          className={
            succeeded
              ? "text-sm font-medium text-[color:var(--color-ink)]"
              : formError
                ? "text-sm font-medium text-[color:var(--color-error)]"
                : "sr-only"
          }
        >
          {succeeded
            ? t("states.success")
            : formError
              ? t("states.error")
              : ""}
        </p>
      </div>
    </form>
  );
}

/**
 * Resolve a localized option label for the two select fields. Explicit literal
 * key prefixes satisfy next-intl's typed-messages check (a computed
 * `options.${key}.${code}` would span field keys that have no option messages).
 */
function optionLabel(
  t: ReturnType<typeof useTranslations<"contact">>,
  field: string,
  code: string,
): string {
  if (field === "division") return t(`options.division.${code}` as never);
  if (field === "projectType") return t(`options.projectType.${code}` as never);
  return code;
}

/**
 * Resolve a field's placeholder message. Only text-ish fields have one; selects
 * return undefined. Explicit literal keys keep next-intl's typed-messages check
 * happy (a computed `fields.${key}.placeholder` would include select keys that
 * have no placeholder message).
 */
function fieldPlaceholder(
  t: ReturnType<typeof useTranslations<"contact">>,
  key: string,
): string | undefined {
  switch (key) {
    case "name":
      return t("fields.name.placeholder");
    case "company":
      return t("fields.company.placeholder");
    case "email":
      return t("fields.email.placeholder");
    case "phone":
      return t("fields.phone.placeholder");
    case "message":
      return t("fields.message.placeholder");
    default:
      return undefined;
  }
}

/**
 * Stamp the submit-timing field on mount. Kept in an effect so SSR emits an
 * empty value (no hydration mismatch); if JS never runs, the field stays empty
 * and the server's timing check fails open — the form still works without JS.
 */
function useStartedAt() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.value = String(Date.now());
  }, []);
  return ref;
}
