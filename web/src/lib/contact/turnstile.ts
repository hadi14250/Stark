import "server-only";
import { getEnv, hasTurnstile } from "@/lib/env";

/**
 * Cloudflare Turnstile server-side verification — scaffolded but INERT until the
 * client provides both keys (see env.ts / .env.example). When disabled it is a
 * no-op that returns `true`, so the form works today; enabling it later needs
 * only the env vars, no code change.
 */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Turnstile token. Returns `true` when the feature is disabled
 * (no keys) or the token is valid; `false` only when the feature is enabled and
 * the token is missing or rejected. Fails CLOSED when enabled (a network error
 * on the siteverify call is treated as a failed verification).
 */
export async function verifyTurnstile(
  token: FormDataEntryValue | null,
): Promise<boolean> {
  if (!hasTurnstile()) return true; // feature off → pass through

  if (typeof token !== "string" || token.trim() === "") return false;

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: getEnv().TURNSTILE_SECRET!,
        response: token,
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false; // fail closed when the check is active
  }
}
