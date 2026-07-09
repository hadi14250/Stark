import type { FieldKey, FieldErrorCode } from "@/lib/contact/schema";

/**
 * Contact-action state machine + initial value. This lives OUTSIDE the
 * `"use server"` file on purpose: a "use server" module may export only async
 * functions, so the non-function `initialContactState` value must be defined
 * here and imported by both the action and the client form.
 *
 * The server returns only stable CODES (never English) — the client maps them
 * to localized `contact.states.*` messages.
 */

/** Raw submitted string values, echoed back so a failed submit isn't retyped. */
export type ContactValues = Partial<Record<FieldKey, string>>;

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      /** Form-level failure. spam/rate-limit collapse to "error" on purpose. */
      formError?: "error";
      /** Per-field validation codes. */
      fieldErrors?: Partial<Record<FieldKey, FieldErrorCode>>;
      /** The values the user submitted, to repopulate the form. */
      values?: ContactValues;
    };

export const initialContactState: ContactState = { status: "idle" };
