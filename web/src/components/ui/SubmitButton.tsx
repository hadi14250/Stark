"use client";

import { useFormStatus } from "react-dom";

/**
 * Form submit button. Reads pending state from the enclosing <form> via
 * `useFormStatus`, so it swaps its label to the localized "sending…" copy and
 * disables while the Server Action runs. Reuses the tan pill style established
 * in the nav CTA.
 */
export function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-[color:var(--green-forest)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
