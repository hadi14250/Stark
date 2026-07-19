// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderWithIntl as render, screen } from "@/test/render";
import { Pill } from "@/components/ui/Pill";

/**
 * Proves the component-test setup actually works end to end — jsdom, the
 * `@/*` alias, JSX, and @testing-library together — rather than leaving it
 * installed-but-unverified until Phase E needs it under time pressure.
 *
 * Pill is the subject because it is the simplest component that exercises all
 * four: it is aliased, it renders JSX, it branches on props, and it has both a
 * button and an anchor form.
 */
describe("component test infrastructure", () => {
  it("renders a Pill as a button", () => {
    render(<Pill>Start a project</Pill>);
    const el = screen.getByRole("button", { name: "Start a project" });
    expect(el.tagName).toBe("BUTTON");
  });

  it("renders a Pill as an anchor when given href", () => {
    render(<Pill href="/gallery">View work</Pill>);
    const el = screen.getByRole("link", { name: "View work" });
    expect(el.getAttribute("href")).toContain("/gallery");
  });
});
