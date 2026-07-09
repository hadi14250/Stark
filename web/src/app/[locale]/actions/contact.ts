"use server";

import { headers } from "next/headers";
import { contactSchema, toFieldErrors } from "@/lib/contact/schema";
import {
  HONEYPOT_FIELD,
  STARTED_AT_FIELD,
  isHoneypotTripped,
  isTooFast,
} from "@/lib/contact/spam";
import { checkRateLimit } from "@/lib/contact/rate-limit";
import { verifyTurnstile } from "@/lib/contact/turnstile";
import { sendLead } from "@/lib/contact/send-lead";
import type { ContactState } from "./contact-state";

/** Best-effort client IP for the rate-limit key. */
async function clientKey(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * Contact-form Server Action. Signature is `(prevState, formData)` per
 * `useActionState`. Ordering matters: cheap silent bot checks first, then
 * rate-limit, then (optional) Turnstile, then validation, then send.
 */
export async function submitContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // 1. Honeypot — a filled hidden field means a bot. Return a FAKE success so
  //    the bot gets no signal; never send an email.
  if (isHoneypotTripped(formData.get(HONEYPOT_FIELD))) {
    return { status: "success" };
  }

  // 2. Timing gate — implausibly fast fills are bots. Fails open for no-JS.
  if (isTooFast(formData.get(STARTED_AT_FIELD), Date.now())) {
    return { status: "success" };
  }

  // 3. Rate limit per IP (generic error — don't reveal the limiter to bots).
  const { ok: withinLimit } = checkRateLimit(await clientKey());
  if (!withinLimit) {
    return { status: "error", formError: "error" };
  }

  // 4. Turnstile — no-op unless both keys are configured.
  const captchaOk = await verifyTurnstile(formData.get("cf-turnstile-response"));
  if (!captchaOk) {
    return { status: "error", formError: "error" };
  }

  // 5. Authoritative validation (server is the source of truth).
  const raw = {
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    division: String(formData.get("division") ?? ""),
    projectType: String(formData.get("projectType") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    // Echo raw values back so the user doesn't retype a valid submission.
    return {
      status: "error",
      fieldErrors: toFieldErrors(parsed.error),
      values: raw,
    };
  }

  // 6. Send (Resend, or console fallback in dev).
  const locale = String(formData.get("locale") ?? "en");
  const sent = await sendLead(parsed.data, locale);
  if (!sent.ok) {
    return { status: "error", formError: "error", values: raw };
  }

  return { status: "success" };
}
