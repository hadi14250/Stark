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
 * `B2B` and `B2C` are removed first. They are one place a digit appears in the
 * copy without being a quantity, and letting the scanner see them would silently
 * whitelist the token "2" for every other use on the site.
 *
 * `Blue 1` and `Blue 2` are removed for the SAME reason, not a weaker one. They
 * are blue's model wordmarks — proper nouns the manufacturer prints on the
 * mattress, exactly like a product called "Series 3". The digit is part of a
 * NAME, not a measurement, so it has no document and page to cite any more than
 * "B2B" does. Stripping it keeps the guard pointed at quantities (where an
 * unsourced number is a false claim) instead of flagging a product's own name.
 * The strip is deliberately exact — `Blue 1`/`Blue 2`, not `Blue \d+` — so a
 * future "Blue 10" cannot smuggle an unrelated "10" past the scanner. Both
 * locales keep these two names in Latin, so one pattern covers en and ar.
 */
function numericTokens(value: string): string[] {
  const normalised = value
    .replace(/\bB2[BC]\b/g, "")
    .replace(/\bBlue [12]\b/g, "")
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
  it("names a retrievable location for every fact", () => {
    /**
     * "Company profile" is not a source — checking it would mean re-reading a
     * 108-page deck. The citation has to make verification a LOOKUP, which is
     * the difference between a ledger somebody maintains and one they abandon.
     *
     * Three forms of locator are accepted, because the sources genuinely come
     * in three shapes:
     *
     *   p3 / pp2-3    a page, for the PDFs
     *   slide 6       a slide, for the PowerPoint company profile — the deck
     *                 is not paginated and its slide numbers ARE how the
     *                 client refers to it on calls ("page 14 has the wood
     *                 sections"), so a page number here would be a fiction
     *   info.docx     a file name, for blue's product data, which is one
     *                 document per model rather than one paginated book
     *
     * "Somewhere in that document" remains unacceptable in all three.
     */
    const locatable = /\bpp?\.?\s?\d|\bslide\s?\d|\.\w{3,5}\b/i;
    const vague = Object.entries(FACTS as Record<string, SourcedFact>)
      .filter(([, f]) => !locatable.test(f.source))
      .map(([id, f]) => `${id}: "${f.source}"`);
    expect(vague, "these sources cite neither a page nor a file").toEqual([]);
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

  it("supplies exactly as many figures as there are labels", () => {
    // The labels live in the message files and are joined to the figures BY
    // INDEX. One label too few and the last column renders a number with no
    // caption; one too many and a caption sits under nothing.
    //
    // This can only check the COUNT. It cannot check that "500+" still has
    // "Projects completed" under it rather than "Specialists" — reordering
    // HOME_STATS relabels every column and every test here stays green. See
    // the ordering warning on HOME_STATS itself.
    const labels = (en.landing.stats.items as { label: string }[]).length;
    expect(HOME_STATS).toHaveLength(labels);

    // Both locales, or the Arabic band is the one that renders wrong.
    expect((ar.landing.stats.items as { label: string }[]).length).toBe(labels);
  });

  /**
   * ⚠ "supplies a unit and a label for every capacity figure" WAS HERE.
   *
   * It guarded the woodworks annual-capacity band's index join — the nastiest
   * one on the site, because that array carried a label AND a unit, so a length
   * mismatch slid the units along by one and printed "30,000 m²" under "Doors"
   * with "90,000" bare under "Wardrobes". Both look completely intentional; the
   * page would have been quietly stating a false specification.
   *
   * The client removed the band, the seven facts behind it went with it (see
   * the tombstone in facts.ts), and a test asserting on a section that no
   * longer exists is not a weaker guard, it is a failing one.
   *
   * If the band ever returns, this test returns with it — and it should, first,
   * before the copy.
   */

  it("keeps every ISO standard number traceable, expiry and all", () => {
    /**
     * THE THREE NUMBERS THE AUDIT SPENT THREE ROUNDS KEEPING OFF THE SITE.
     *
     * ISO 9001 and 45001 are on certificates that EXPIRED 13.12.2025, and no
     * ISO 14001 certificate exists in any document the client has supplied.
     * They are published now because the client's own finished profile prints
     * them on p12 and they asked for the section to match it — which is their
     * call to make, and is exactly the kind of decision that gets silently
     * re-litigated a year later by someone who finds an expired PDF.
     *
     * So the guard is not "don't publish these". It is: if they are published,
     * each one carries a caveat saying what is actually behind it. The
     * provenance guard above already forces a SOURCE; this forces the part a
     * source line cannot express.
     */
    for (const key of ["isoQuality", "isoEnvironment", "isoSafety"] as const) {
      const fact = FACTS[key] as SourcedFact;
      expect(fact.source, `${key} must name a document and page`).toMatch(/p\d+/);
      expect(
        fact.caveat,
        `${key} is published on the client's instruction and must say so`,
      ).toMatch(/CLIENT INSTRUCTION/);
    }
  });

  it("keeps the mattress output figure phrased as output, not capacity", () => {
    /**
     * THE FAILURE THIS CATCHES: somebody tidies the two divisions into
     * consistency.
     *
     * Woodworks says "Annual production capacity" because slide 12's annotation
     * is explicitly about what the plant is EQUIPPED to make. Slide 15 says
     * "60,000 مرتبة في السنة" and nothing else — no word for capacity, ability
     * or equipment. So one page states a ceiling and the other states an
     * output, the wording differs on purpose, and the difference is invisible
     * to anyone who has not read both slides. It looks exactly like an
     * inconsistency somebody should fix.
     *
     * Fixing it upgrades a production figure into a capacity claim, which is a
     * bigger number about the same factory without a bigger factory.
     */
    for (const [locale, messages] of [["en", en], ["ar", ar]] as const) {
      const label = (messages.mattresses.credentials.output as { label: string }).label;
      expect(label, `${locale}: the mattress figure must not be labelled a capacity`).not.toMatch(
        /capacity|الطاقة/i,
      );
    }
  });

  it("states siesta's warranty as a ceiling, never as a flat number", () => {
    /**
     * "Up to 10 years" is the only honest summary of a catalogue that grades
     * the warranty by range: 10 on SENSICE, 5 on COMFORT, 3 on STANDARD, 1 on
     * SLEEP. Drop the qualifier and the site promises a decade on a mattress
     * that carries twelve months.
     *
     * The qualifier is two words in the middle of a sentence, which is exactly
     * the kind of thing a copy edit removes for tightness.
     */
    const en10 = en.mattresses.brands.items[1].body;
    expect(en10, "siesta's warranty lost its 'up to'").toMatch(/up to 10 years/i);
    expect(
      ar.mattresses.brands.items[1].body,
      "siesta's Arabic warranty lost its 'يصل إلى'",
    ).toMatch(/يصل إلى 10/);
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
