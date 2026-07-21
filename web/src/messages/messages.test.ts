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

/** Every leaf string in a message tree, with the key that holds it. */
function leafStrings(obj: unknown, prefix = ""): [string, string][] {
  if (typeof obj === "string") return [[prefix, obj]];
  if (obj === null || typeof obj !== "object") return [];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    leafStrings(v, prefix ? `${prefix}.${k}` : k),
  );
}

const ALL: [string, [string, string][]][] = [
  ["en", leafStrings(en)],
  ["ar", leafStrings(ar)],
];

/**
 * NO DASHES AS PUNCTUATION, in either locale.
 *
 * The client asked for every em-dash to become a comma, colon or full stop —
 * they read the site aloud on a call and the dashes kept stopping them. This
 * is the whole copy deck, both locales, so it cannot be held in anyone's head.
 *
 * HYPHENS ARE NOT IN SCOPE and must not be. `Saudi-based`, `end-to-end`,
 * `made-to-measure` and `first-off` are compound words, not punctuation;
 * stripping the hyphen out of those breaks the English rather than tidying it.
 * Only the em-dash (—) and en-dash (–) are banned.
 */
describe("no dash punctuation in the copy deck", () => {
  for (const [locale, entries] of ALL) {
    it(`${locale}.json contains no em-dash or en-dash`, () => {
      const offenders = entries
        .filter(([, v]) => v.includes("—") || v.includes("–"))
        .map(([k, v]) => `${k}: ${v}`);
      expect(offenders).toEqual([]);
    });
  }
});

/**
 * The brand name is an all-caps wordmark. It shipped as "Stark" in two places
 * — a body paragraph and an aria-label — which is the kind of thing nobody
 * notices until the client does.
 */
describe("brand name casing", () => {
  it("en.json never writes the wordmark as 'Stark'", () => {
    const offenders = leafStrings(en)
      .filter(([, v]) => /\bStark\b/.test(v))
      .map(([k, v]) => `${k}: ${v}`);
    expect(offenders).toEqual([]);
  });
});
