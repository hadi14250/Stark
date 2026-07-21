import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import { FACTS, HOME_STATS, CONTACT_EMAIL, type SourcedFact } from "./facts";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * ===========================================================================
 * THE PROVENANCE GUARD
 * ===========================================================================
 *
 * The site was audited against the client's five source documents and roughly
 * two thirds of the copy turned out to have no source. The audit is a snapshot;
 * this file is what makes it hold.
 *
 * The property: NO DIGIT MAY APPEAR IN USER-VISIBLE COPY UNLESS IT TRACES TO A
 * FACT WITH A NAMED DOCUMENT AND PAGE. Not "unless it is true" — a test cannot
 * know that — but unless somebody wrote down where it came from. That is the
 * check that would have caught every invented number the audit found, because
 * invented numbers are precisely the ones with nowhere to cite.
 *
 * It is deliberately narrow. Prose claims ("responsibly sourced hardwoods")
 * cannot be policed mechanically and are governed by SOURCES.md and review
 * instead. Numbers can be, and numbers are what a reader checks.
 */

/** Every leaf string in a message tree, with the key that holds it. */
function leafStrings(obj: unknown, prefix = ""): [string, string][] {
  if (typeof obj === "string") return [[prefix, obj]];
  if (obj === null || typeof obj !== "object") return [];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    leafStrings(v, prefix ? `${prefix}.${k}` : k),
  );
}

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";

/**
 * Pull the numeric tokens out of a string.
 *
 * The token boundaries are chosen so that compound figures split the way a
 * reader parses them rather than the way a naive `\d+` would:
 *
 *   "ISO 9001:2015"      -> 9001, 2015   (a standard and its edition, two facts)
 *   "BMC-COC-010074"     -> 010074       (leading zero preserved: it is an ID)
 *   "60,000 m²"          -> 60000        (separator stripped, so it matches 60000)
 *   "+10 mm / +5 mm"     -> 10, 5
 *
 * `B2B` and `B2C` are removed first. They are the one place a digit appears in
 * the current copy without being a quantity, and letting the scanner see them
 * would silently whitelist the token "2" for every other use on the site.
 */
function numericTokens(value: string): string[] {
  const normalised = value
    .replace(/\bB2[BC]\b/g, "")
    .replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC.indexOf(d)));
  return [...normalised.matchAll(/\d[\d,]*/g)].map((m) => m[0].replace(/,/g, ""));
}

/** Every token any registered fact authorises. */
const ALLOWED = new Set(
  Object.values(FACTS as Record<string, SourcedFact>).flatMap((f) =>
    numericTokens(String(f.value)),
  ),
);

describe("every number in the copy deck traces to a source", () => {
  for (const [locale, messages] of [
    ["en", en],
    ["ar", ar],
  ] as const) {
    it(`${locale}.json states no unsourced figure`, () => {
      const offenders: string[] = [];
      for (const [key, value] of leafStrings(messages)) {
        for (const token of numericTokens(value)) {
          if (!ALLOWED.has(token)) offenders.push(`${key}: "${value}" -> ${token}`);
        }
      }
      expect(
        offenders,
        [
          "Unsourced figures in the copy. Every number a reader can see must",
          "come from an entry in src/content/facts.ts naming its document and",
          "page. If this figure is real, add the fact. If it cannot be sourced,",
          "it does not ship: that is the rule the content audit was run to set.",
        ].join(" "),
      ).toEqual([]);
    });
  }
});

describe("the fact registry is usable as a citation", () => {
  it("names a document AND a page for every fact", () => {
    /**
     * "Company profile" is not a source — checking it would mean re-reading a
     * 108-page deck. A page reference makes verification a lookup, which is
     * the difference between a ledger somebody maintains and one they abandon.
     */
    const vague = Object.entries(FACTS as Record<string, SourcedFact>)
      .filter(([, f]) => !/\bp{1,2}\s?\.?\s?\d/i.test(f.source))
      .map(([id, f]) => `${id}: "${f.source}"`);
    expect(vague, "these sources cite no page number").toEqual([]);
  });

  it("keeps the contested founding year flagged", () => {
    /**
     * The client's own catalogue prints 1967 in English and 1968 in Arabic.
     * The number ships, but the caveat is the only record that a question is
     * outstanding, and a caveat is exactly the kind of thing that gets tidied
     * away by someone who assumes it was resolved. It was not.
     */
    expect(FACTS.established.caveat).toMatch(/1968/);
  });
});

describe("the home stat band reads from the ledger", () => {
  const turnkey = readFileSync(join(here, "../components/home/Turnkey.tsx"), "utf8");

  it("does not carry its own copy of the figures", () => {
    /**
     * THE FAILURE THIS CATCHES: someone needs a fifth stat, adds it inline
     * next to the import because that is where the JSX is, and the site gains
     * an uncited number that no test can see. These four sat outside the
     * audit for exactly that reason — they were in a component, not the copy
     * deck, so the sweep of the message files never touched them.
     */
    expect(turnkey).toMatch(/HOME_STATS/);
    expect(
      turnkey.match(/const STATS\s*=\s*\[/),
      "the stat figures are inline again; move them into facts.ts",
    ).toBeNull();
  });

  it("still supplies the four figures the labels describe", () => {
    // The labels live in the message files and are positional. Four labels,
    // four figures, or the band renders a stat with no number under it.
    const labels = (en.landing.stats.items as { label: string }[]).length;
    expect(HOME_STATS).toHaveLength(labels);
  });

  it("renders the year without a thousands separator", () => {
    // "1,967" is a quantity. "1967" is a date. The reader has nothing else to
    // go on, so the flag is the whole distinction.
    expect(FACTS.established.grouping).toBe(false);
    expect(FACTS.factoryArea.grouping).toBe(true);
  });
});

describe("the contact address is published once", () => {
  it("agrees between the structured data and the visible copy", () => {
    /**
     * It did not. The JSON-LD said `hello@stark-ksa.net` while the footer and
     * the contact panel said `info@stark.com.sa`, so the machine-readable
     * address — the one a search engine indexes and an assistant quotes — was
     * the one nobody had confirmed.
     */
    const jsonLd = readFileSync(join(here, "../components/seo/JsonLd.tsx"), "utf8");
    expect(jsonLd, "JsonLd must import the shared constant, not inline an address").toMatch(
      /CONTACT_EMAIL/,
    );
    expect(jsonLd.match(/["']\S+@\S+\.\w+["']/), "JsonLd still hardcodes an address").toBeNull();

    expect(en.footer.email).toBe(CONTACT_EMAIL);
    expect(ar.footer.email).toBe(CONTACT_EMAIL);
    expect(en.contact.details.email).toBe(CONTACT_EMAIL);
    expect(ar.contact.details.email).toBe(CONTACT_EMAIL);
  });
});
