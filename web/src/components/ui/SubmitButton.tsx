"use client";

import { useFormStatus } from "react-dom";
import { LogoLoader } from "@/components/motion/LogoLoader";

/**
 * Form submit button. Reads pending state from the enclosing <form> via
 * `useFormStatus`, so it swaps its label to the localized "sending…" copy and
 * disables while the Server Action runs. Reuses the tan pill style established
 * in the nav CTA.
 *
 * THE PENDING STATE IS THE MARK, not a spinner. Every waiting state on this
 * site is the pentagon — the preloader, and now this — so the brand does the
 * waiting rather than a generic circle borrowed from a component library. It is
 * `aria-hidden` and purely decorative: `aria-busy` plus the swapped label is
 * what actually announces the state, so nothing depends on the animation
 * running.
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
      className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-[color:var(--green-forest)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {pending && (
        <LogoLoader variant="pulse" size={18} color="var(--green-forest)" speed={0.8} />
      )}

      {pending ? pendingLabel : label}

      {/* The arrow nudges on hover. Mirrored under RTL, where "forward" is the
          other way. */}
      {!pending && (
        <span
          aria-hidden
          className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none rtl:group-hover:-translate-x-1"
        >
          →
        </span>
      )}
    </button>
  );
}
