import "server-only";
import { getEnv, hasResend } from "@/lib/env";
import type { ContactInput } from "./schema";

/**
 * Lead transport. Sends the submission as an email via Resend when
 * `RESEND_API_KEY` is set; otherwise logs the full validated payload to the
 * server console so the whole flow is testable locally with no account.
 *
 * `resend` is lazy-imported so the app boots even if the dep is missing, and so
 * the SDK never loads on the console-only path. Reply-To is the submitter's
 * email, so staff can reply directly from their inbox.
 */

/** Staff-facing (English) labels for the option codes, for the email body. */
const DIVISION_LABELS: Record<string, string> = {
  woodworks: "Woodworks",
  blue: "blue mattress (B2C)",
  siesta: "siesta mattresses (B2B)",
  turnkey: "Turnkey",
  other: "Other",
};
const PROJECT_TYPE_LABELS: Record<string, string> = {
  hotel: "Hotel",
  resort: "Resort",
  villa: "Villa",
  restaurant: "Restaurant",
  residential: "Residential",
  retail: "Retail",
};

export interface SendLeadResult {
  ok: boolean;
  /** Transport id — Resend message id, or "dev-console" on the fallback path. */
  id: string;
}

/** Minimal HTML escape for user-supplied values placed in the email body. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string): string {
  const safe = value.trim() === "" ? "—" : esc(value).replace(/\n/g, "<br>");
  return `<tr>
    <td style="padding:6px 12px;vertical-align:top;color:#6e7c70;font:600 13px/1.4 sans-serif;white-space:nowrap">${label}</td>
    <td style="padding:6px 12px;vertical-align:top;color:#1c3c2d;font:400 14px/1.5 sans-serif">${safe}</td>
  </tr>`;
}

/** Build the plain-but-clean lead notification email HTML. */
function renderEmail(data: ContactInput, locale: string): string {
  const division = DIVISION_LABELS[data.division] ?? data.division;
  const projectType = data.projectType
    ? (PROJECT_TYPE_LABELS[data.projectType] ?? data.projectType)
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f3efe6;padding:24px">
    <table role="presentation" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ece7da">
      <tr><td style="background:#1c3c2d;padding:20px 24px;color:#f3efe6;font:700 18px/1.3 sans-serif">
        New project enquiry — STARK
      </td></tr>
      <tr><td style="padding:16px 12px">
        <table role="presentation" style="width:100%;border-collapse:collapse">
          ${row("Name", data.name)}
          ${row("Company", data.company)}
          ${row("Email", data.email)}
          ${row("Phone", data.phone)}
          ${row("Division", division)}
          ${row("Project type", projectType)}
          ${row("Message", data.message)}
          ${row("Locale", locale)}
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

export async function sendLead(
  data: ContactInput,
  locale: string,
): Promise<SendLeadResult> {
  // Console fallback — no Resend key configured (safe local dev).
  if (!hasResend()) {
    console.info("[contact] lead (console transport — no RESEND_API_KEY):", {
      ...data,
      locale,
    });
    return { ok: true, id: "dev-console" };
  }

  const env = getEnv();
  const { Resend } = await import("resend");
  const resend = new Resend(env.RESEND_API_KEY);

  const { data: sent, error } = await resend.emails.send({
    from: env.CONTACT_FROM_EMAIL,
    to: env.CONTACT_TO_EMAIL,
    replyTo: data.email,
    subject: `New enquiry — ${data.name}${data.company ? ` (${data.company})` : ""}`,
    html: renderEmail(data, locale),
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return { ok: false, id: "" };
  }
  return { ok: true, id: sent?.id ?? "" };
}
