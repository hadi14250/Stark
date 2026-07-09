import { z } from "zod";

/**
 * Shared contact-form contract — the SINGLE source of truth for fields and
 * their rules. Secret-free, so both the client (for rendering + HTML hints) and
 * the server action (for authoritative validation) import it.
 *
 * Fields + requiredness are locked in
 * `stark-website-clutter/phase-0.5-IA-and-content-lock.md §5.1`.
 *
 * Select values are STABLE CODES (e.g. "blue", "hotel"), never display text —
 * labels come from next-intl (`contact.options.*`), so Arabic labels can differ
 * freely and the schema/email stay locale-agnostic.
 */

/** Division-of-interest option codes (required select). */
export const DIVISIONS = [
  "woodworks",
  "blue",
  "siesta",
  "turnkey",
  "other",
] as const;
export type Division = (typeof DIVISIONS)[number];

/** Project-type option codes (optional select). */
export const PROJECT_TYPES = [
  "hotel",
  "resort",
  "villa",
  "restaurant",
  "residential",
  "retail",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

/**
 * An optional free-text field: allow empty string OR a bounded trimmed string.
 * Normalizes to "" when omitted so the email template has a consistent shape.
 */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v ?? "");

/**
 * The validation schema. Max lengths bound abuse and keep the payload far under
 * the Server Action 1 MB body cap. `division` is required; `projectType` allows
 * "" (the "no selection" state of the native <select>).
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: optionalText(160),
  email: z.string().trim().min(1).max(200).pipe(z.email()),
  phone: optionalText(40),
  division: z.enum(DIVISIONS),
  projectType: z
    .union([z.enum(PROJECT_TYPES), z.literal("")])
    .optional()
    .transform((v) => v ?? ""),
  message: z.string().trim().min(1).max(4000),
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Field metadata for the client to render inputs + native HTML hints without
 * duplicating the schema. `key` matches both the schema key and the
 * `contact.fields.<key>` message namespace.
 */
export type FieldKey = keyof ContactInput;

export interface FieldMeta {
  key: FieldKey;
  control: "input" | "textarea" | "select";
  type?: "text" | "email" | "tel";
  required: boolean;
  /** For selects: the option codes (labels resolved via next-intl). */
  options?: readonly string[];
  /** textarea rows / input autocomplete hint. */
  autoComplete?: string;
  rows?: number;
}

export const CONTACT_FIELDS: readonly FieldMeta[] = [
  { key: "name", control: "input", type: "text", required: true, autoComplete: "name" },
  { key: "company", control: "input", type: "text", required: false, autoComplete: "organization" },
  { key: "email", control: "input", type: "email", required: true, autoComplete: "email" },
  { key: "phone", control: "input", type: "tel", required: false, autoComplete: "tel" },
  { key: "division", control: "select", required: true, options: DIVISIONS },
  { key: "projectType", control: "select", required: false, options: PROJECT_TYPES },
  { key: "message", control: "textarea", required: true, rows: 5 },
] as const;

/** Stable, localizable validation error codes the server returns per field. */
export type FieldErrorCode = "required" | "invalidEmail";

/**
 * Map a failed parse into `{ field: code }`. Codes match `contact.states.*`
 * message keys, so the client localizes without ever receiving English from the
 * server. An empty/missing required value → "required"; a bad email → the
 * email-format issue is reported as "invalidEmail" unless the value is blank
 * (blank wins as "required").
 */
export function toFieldErrors(
  error: z.ZodError<ContactInput>,
): Partial<Record<FieldKey, FieldErrorCode>> {
  const out: Partial<Record<FieldKey, FieldErrorCode>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as FieldKey | undefined;
    if (!field || out[field]) continue; // first issue per field wins
    // A too-small / invalid-type issue on a required field reads as "required";
    // a format failure on a non-empty email reads as "invalidEmail".
    if (field === "email" && issue.code !== "too_small") {
      out[field] = "invalidEmail";
    } else {
      out[field] = "required";
    }
  }
  return out;
}
