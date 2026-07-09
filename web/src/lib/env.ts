import "server-only";
import { z } from "zod";

/**
 * Server-only, lazily-validated environment for the contact-form backend.
 *
 * Design goals (Phase 2):
 * - The form is fully buildable and testable locally with ZERO configuration:
 *   when `RESEND_API_KEY` is absent, `send-lead.ts` logs the lead to the server
 *   console instead of sending email. So every var here has a safe dev default
 *   or is optional — validation never throws in local dev.
 * - Secrets live here and are read server-side at call time; they never enter a
 *   client bundle (guarded by `import "server-only"`).
 * - No heavy env library — zod (already a dependency) validates a small schema.
 *
 * ⚠ F6 (unconfirmed facts): CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL default to
 * placeholders. Production requires the client's real inbox and a domain
 * verified in Resend (SPF/DKIM). See stark-content-facts-to-confirm.
 */
const envSchema = z
  .object({
    /** Resend API key. Absent → console-log transport (safe local dev). */
    RESEND_API_KEY: z.string().min(1).optional(),

    /** Where lead emails are delivered. Placeholder until F6 confirmed. */
    CONTACT_TO_EMAIL: z.email().default("hello@stark-ksa.net"),

    /**
     * Verified sending identity. Dev fallback is Resend's shared onboarding
     * sender, which works without a verified domain for testing.
     */
    CONTACT_FROM_EMAIL: z.email().default("onboarding@resend.dev"),

    /** Cloudflare Turnstile — all-or-nothing; blank on both = feature disabled. */
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    TURNSTILE_SECRET: z.string().optional(),
  })
  .refine(
    (v) =>
      Boolean(v.NEXT_PUBLIC_TURNSTILE_SITE_KEY) ===
      Boolean(v.TURNSTILE_SECRET),
    {
      message:
        "Turnstile requires BOTH NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET, or neither.",
      path: ["TURNSTILE_SECRET"],
    },
  );

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/**
 * Parse + cache the environment on first use. Throws a readable error only if a
 * provided value is malformed (e.g. a non-email CONTACT_TO_EMAIL) — a missing
 * optional var is fine.
 */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid contact-form environment:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** True when a real Resend key is configured (else we log to the console). */
export function hasResend(): boolean {
  return Boolean(getEnv().RESEND_API_KEY);
}

/** True when both Turnstile keys are present (else the check is a no-op). */
export function hasTurnstile(): boolean {
  const env = getEnv();
  return Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET);
}
