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
 * ARABIC CONSISTENCY.
 *
 * The Arabic file has never contained an invented fact — it was translated
 * from approved English — but the content audit found four defects that a
 * key-parity check cannot see, because both locales had the key and both had a
 * string. Only reading the Arabic finds them.
 *
 * They are pinned here because the reviewers who can spot them are the ones
 * least likely to be looking at this file, and every one of these regressions
 * would ship silently.
 */
describe("arabic consistency", () => {
  const arLeaves = leafStrings(ar);
  const enLeaves = leafStrings(en);

  it("spells siesta one way", () => {
    // The brand's own 2026 catalogue writes سيستا throughout. The site had
    // سييستا in the footer, the page description and the contact options, and
    // سيستا in body copy — two spellings of a brand name in one file.
    const offenders = arLeaves
      .filter(([, v]) => v.includes("سييستا"))
      .map(([k, v]) => `${k}: ${v}`);
    expect(offenders, "سييستا should be سيستا").toEqual([]);
  });

  it("renders turnkey one way", () => {
    /**
     * "Turnkey" had five Arabic renderings across the site: تسليم المفتاح,
     * تسليم مفتاح, تسليم متكامل, حلول متكاملة and التنفيذ المتكامل. To an
     * Arabic reader that is not a house style, it is five different offerings.
     * تسليم المفتاح is the standard term in Saudi construction.
     */
    const banned = ["تسليم متكامل", "التنفيذ المتكامل"];
    const offenders = arLeaves
      .filter(([, v]) => banned.some((b) => v.includes(b)))
      .map(([k, v]) => `${k}: ${v}`);
    expect(offenders, "use تسليم المفتاح").toEqual([]);
  });

  it("keeps the in-house claim in the Arabic", () => {
    /**
     * "In-house finishing" was translated as تشطيب داخلي, which reads as
     * "INTERIOR finishing". The whole claim — that finishing happens in our
     * own factory instead of at a subcontractor — was gone, and had been
     * replaced by a different and much weaker claim about what kind of
     * finishing it is. The English sells the capability; the Arabic sold a
     * category.
     */
    const meta = (ar as { woodworks: { hero: { meta: string[] } } }).woodworks.hero.meta;
    expect(meta.join(" ")).toMatch(/مصنعنا|داخل المصنع/);
    expect(meta, "تشطيب داخلي means interior finishing, not in-house").not.toContain(
      "تشطيب داخلي",
    );
  });

  it("gives one English string one Arabic translation", () => {
    /**
     * "Built like a factory, finished like a workshop." had two different
     * Arabic versions on the SAME page, one scroll apart. Nobody reading only
     * English could see it.
     */
    const byEnglish = new Map<string, Set<string>>();
    const arByKey = new Map(arLeaves);
    for (const [key, value] of enLeaves) {
      const arValue = arByKey.get(key);
      if (!arValue) continue;
      if (!byEnglish.has(value)) byEnglish.set(value, new Set());
      byEnglish.get(value)!.add(arValue);
    }
    const offenders = [...byEnglish.entries()]
      .filter(([, translations]) => translations.size > 1)
      .map(([english, t]) => `"${english}" -> ${[...t].join(" | ")}`);
    expect(offenders).toEqual([]);
  });
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
