import { describe, it, expect } from "vitest";
import en from "./en.json";
import ar from "./ar.json";

/** Flatten a nested message object to dotted leaf-key paths. */
function keyPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return [prefix];
  }
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("message parity: en.json and ar.json share the same key tree", () => {
  const enKeys = keyPaths(en).sort();
  const arKeys = keyPaths(ar).sort();

  it("has identical key sets (no drift between locales)", () => {
    expect(arKeys).toEqual(enKeys);
  });

  it("includes the contact namespace in both locales", () => {
    expect(enKeys).toContain("contact.states.success");
    expect(arKeys).toContain("contact.states.success");
    expect(enKeys).toContain("contact.options.division.blue");
    expect(arKeys).toContain("contact.options.division.blue");
  });
});
