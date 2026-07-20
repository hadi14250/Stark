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
import { LogoLoader } from "@/components/motion/LogoLoader";
import { LineReveal } from "@/components/motion/WordsReveal";

/**
 * The interactive contact form. Server-side validation is authoritative
 * (`submitContact`); this component renders fields from the shared metadata,
 * localizes labels/options/errors via next-intl, and manages accessible
 * feedback.
 *
 * The presentation this file's docblock used to defer has landed: floating
 * labels, hairline fields and the pentagon-completes success panel. Every bit
 * of it is presentation — the validation, error wiring, focus management, spam
 * gate and reset behaviour are untouched, which was the point of deferring it.
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
  /**
   * Called HERE, unconditionally, and not inline in the JSX below.
   *
   * The success branch returns early, and this used to be invoked inline as
   * the hidden input's `ref` prop — which sits after that return. On the
   * render where the submit succeeds, the hook count changes and React's hook
   * ordering breaks. Calling a hook in a prop position reads as an ordinary
   * value, which is exactly how one ends up behind a conditional unnoticed.
   */
  const startedAtRef = useStartedAt();

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
        labelFloated={f.control === "select"}
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

  if (succeeded) {
    /**
     * THE PENTAGON COMPLETES. Five blades fly together into a whole mark, once,
     * and stay whole — the brand's own gesture for "the parts became one
     * thing", spent at the one moment on the site where something is actually
     * finished. Looping it would say "still working" underneath copy that says
     * the message was sent.
     *
     * The live region moves in here rather than staying below a form that is no
     * longer rendered, and keeps `role="status"` + `tabIndex={-1}` so the
     * existing focus-management effect can still reach it. The animation is
     * decorative; the announcement is the text.
     */
    return (
      <div
        id={statusId}
        role="status"
        aria-live="polite"
        tabIndex={-1}
        data-form-status="success"
        className="flex min-h-[320px] flex-col items-center justify-center gap-6 text-center"
      >
        <LogoLoader variant="assemble" size={92} color="var(--color-accent)" once />
        <p className="max-w-[32ch] font-display text-h3 font-semibold leading-h3 tracking-display text-[color:var(--color-ink)]">
          {t("states.success")}
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-6" noValidate>
      {/* Locale for the lead email + honeypot + timing gate (hidden). */}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name={STARTED_AT_FIELD} value="" ref={startedAtRef} />
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

      {/*
        The fields arrive in sequence rather than all at once — 60ms apart, so
        the card resolves top to bottom. `LineReveal` carries the shared
        fail-safe, so a viewport observer that never fires cannot leave the form
        invisible; see useRevealPlay.ts for why that is not hypothetical here.
      */}
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {CONTACT_FIELDS.slice(0, 6).map((f, i) => (
          <LineReveal key={f.key} delay={i * 0.06}>
            {renderControl(f)}
          </LineReveal>
        ))}
      </div>
      {/* Message spans full width */}
      <LineReveal delay={0.36}>{renderControl(CONTACT_FIELDS[6])}</LineReveal>

      <LineReveal delay={0.42}>
        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton label={t("states.submit")} pendingLabel={t("states.sending")} />

          {/* Live region for the form-level error. Success is not announced
              here — it replaces the whole form with the panel above, which
              carries its own status node. */}
          <p
            id={statusId}
            role="status"
            aria-live="polite"
            tabIndex={-1}
            data-form-status={formError ? "error" : undefined}
            className={
              formError ? "text-sm font-medium text-[color:var(--color-error)]" : "sr-only"
            }
          >
            {formError ? t("states.error") : ""}
          </p>
        </div>
      </LineReveal>
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
 * Resolve a field's placeholder message. Explicit literal keys keep next-intl's
 * typed-messages check happy (a computed `fields.${key}.placeholder` would
 * include select keys that have no placeholder message).
 *
 * NEVER RETURNS UNDEFINED FOR A TEXT CONTROL. The floating label is driven by
 * `:placeholder-shown` (see field.css), which a control with no placeholder
 * attribute can never match — its label would sit permanently floated above an
 * empty field, which looks like a rendering fault. A single space is a present
 * placeholder that shows nothing, so a field with no useful example still gets
 * correct label behaviour.
 */
const NO_PLACEHOLDER = " ";

function fieldPlaceholder(
  t: ReturnType<typeof useTranslations<"contact">>,
  key: string,
): string {
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
      return NO_PLACEHOLDER;
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
