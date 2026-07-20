// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect, afterEach } from "vitest";
import { renderWithIntl as render, screen, cleanup } from "@/test/render";
import { Field } from "./Field";
import { Input } from "./Input";

const here = dirname(fileURLToPath(import.meta.url));

// The suite runs with `globals: false`, so Testing Library's automatic
// afterEach cleanup is never registered — without this, each render stacks
// another copy of the field in document.body and `getByLabelText` resolves
// against the FIRST one, i.e. the previous test's markup.
afterEach(cleanup);

/**
 * Floating labels are the pattern most often shipped with no label at all.
 *
 * The lookalike is placeholder-as-label: it looks identical when the field is
 * empty, needs no extra markup, and is broken — a placeholder is not an
 * accessible name, it disappears the moment typing starts, and a screen reader
 * gets nothing once the field holds a value. The difference between the correct
 * version and that one is invisible in a screenshot, which is exactly why it
 * needs a test rather than a code review.
 */

describe("a floating label is still a real label", () => {
  it("associates the label with its control by id", () => {
    render(
      <Field name="email" label="Email">
        {(ids) => <Input {...ids} name="email" placeholder="you@company.com" />}
      </Field>,
    );
    // getByLabelText resolves through the accessibility tree, so this passes
    // only if the association actually exists — not merely if the text is on
    // screen next to the input.
    expect(screen.getByLabelText("Email")).toBeDefined();
  });

  it("keeps the association when the field is in an error state", () => {
    render(
      <Field name="email" label="Email" error="Please enter a valid email address.">
        {(ids) => <Input {...ids} name="email" placeholder="you@company.com" />}
      </Field>,
    );
    const control = screen.getByLabelText("Email");
    expect(control.getAttribute("aria-invalid")).toBe("true");
    // The message must be REACHABLE from the control, not just rendered near it.
    const describedBy = control.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toContain(
      "valid email",
    );
  });

  it("marks a required field on the control, not only visually", () => {
    render(
      <Field name="name" label="Name" required>
        {(ids) => <Input {...ids} name="name" placeholder=" " />}
      </Field>,
    );
    expect(screen.getByLabelText(/Name/).getAttribute("aria-required")).toBe("true");
  });
});

describe("the float mechanism cannot silently break", () => {
  const form = readFileSync(join(here, "../contact/ContactForm.tsx"), "utf8");
  const css = readFileSync(join(here, "../../styles/field.css"), "utf8");

  it("never hands a text control an undefined placeholder", () => {
    /**
     * THE FAILURE THIS CATCHES: the label position is driven by
     * `:placeholder-shown`, and a control with no placeholder ATTRIBUTE never
     * matches it — so its label sits permanently in the floated position above
     * an empty box, which reads as a rendering fault. `fieldPlaceholder` has to
     * return a string for every key, falling back to a single space for fields
     * with no useful example. A `| undefined` return type is the regression.
     */
    expect(form).toMatch(/function fieldPlaceholder\([\s\S]*?\): string \{/);
    expect(form).toMatch(/const NO_PLACEHOLDER = " ";/);
  });

  it("floats the label for selects, which cannot match :placeholder-shown", () => {
    // `:placeholder-shown` is undefined for <select>. Without the explicit
    // opt-in the label would sit on top of the chosen option.
    expect(form).toMatch(/labelFloated=\{f\.control === "select"\}/);
    expect(css).toMatch(/\.field-label--floated/);
  });

  it("hides the placeholder until the field is focused", () => {
    // The placeholder is real copy. Shown at the same time as the label it
    // says the same thing twice, so it appears only while filling the field —
    // and it must stay a present-but-transparent attribute, never removed,
    // because removing it is what breaks the selector above.
    expect(css).toMatch(/\.field-control::placeholder\s*\{[^}]*color:\s*transparent/);
    expect(css).toMatch(/\.field-control:focus::placeholder/);
  });
});
