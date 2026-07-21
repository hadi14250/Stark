/**
 * THE NUMBER LEDGER — every figure this site states, and where it came from.
 *
 * ===========================================================================
 * WHY THIS FILE EXISTS
 * ===========================================================================
 *
 * A content audit against the client's own documents found that roughly two
 * thirds of the site's copy had no source. It had been written to be PLAUSIBLE
 * for STARK before anyone had read a STARK document — invented project case
 * studies, an invented QA procedure, invented client logos, invented material
 * specifications. None of it was flagged as provisional in the copy itself,
 * because prose has nowhere to put a citation.
 *
 * Numbers are the sharpest edge of that problem. A vague sentence about
 * craftsmanship is a claim nobody can check; "60,000 m²" is a claim a reader
 * can and will check, and if it is wrong the whole page becomes suspect. So
 * every number on this site now has to pass through here, and this type will
 * not let one exist without naming the document and page it came from.
 *
 * The rule is enforced, not aspirational: `facts.test.ts` scans both message
 * files and fails on any digit that is not traceable to an entry below. That
 * is what stops the copy quietly re-growing invented facts the next time
 * someone needs a stat to fill a layout.
 *
 * ===========================================================================
 * THE ONE THING TO UNDERSTAND BEFORE EDITING
 * ===========================================================================
 *
 * STARK is a holding brand over TWO REAL JEDDAH FACTORIES, and the documents
 * do not say so anywhere:
 *
 *   Saudi Light Industries Co. (SLIC)   founded 1967/68, 60,000 m², ~200 staff
 *                                       foam and mattresses (siesta, blue)
 *   Trust Wood Factory                  founded 2019, 3rd Industrial City
 *                                       joinery, doors, hotel furniture
 *
 * Neither factory's own profile contains the word "STARK" even once. The
 * headline statistics in STARK's company profile are SLIC's, lifted verbatim.
 *
 * This matters because it retires an alarm that looked fatal: 1967 against
 * 2019 is not a contradiction, it is two founding dates for two different
 * companies. Anyone re-auditing this site will hit that apparent conflict and
 * reach for the delete key, so it is written down here rather than left to be
 * rediscovered.
 *
 * See `SOURCES.md` in this directory for the full claim-by-claim ledger,
 * including the non-numeric claims this file cannot police.
 */

/**
 * A figure that appears somewhere a reader can see it.
 *
 * `source` is required and is the entire point of the type. "Company profile"
 * is not an acceptable value; it has to name the document AND the page, so
 * that checking a number is a lookup rather than a re-read of five PDFs.
 */
export type SourcedFact = {
  /**
   * The figure as stated. A string when the figure is an identifier rather
   * than a quantity (certificate numbers, standard numbers), because leading
   * zeros and internal punctuation are part of those.
   */
  readonly value: number | string;
  /** Which document, which page. Both, always. */
  readonly source: string;
  /** What is still open with the client about this figure, if anything. */
  readonly caveat?: string;
};

/** A fact rendered in the home page's count-up band. */
export type StatFact = SourcedFact & {
  readonly value: number;
  /** Rendered immediately after the figure. */
  readonly suffix?: string;
  /**
   * Thousands separators. OFF for years, and that distinction is load-bearing:
   * "1,967" is a quantity and "1967" is a date, and the separator is the only
   * thing telling the reader which one they are looking at.
   */
  readonly grouping?: boolean;
};

/**
 * Every number on the site. Adding copy that contains a digit means adding an
 * entry here first — the guard will fail the build otherwise.
 */
export const FACTS = {
  /**
   * SLIC's founding, not STARK's and not Trust Wood's.
   *
   * ⚠ THE CLIENT'S OWN CATALOGUE DISAGREES WITH ITSELF: the English pages say
   * 1967 and the Arabic pages say 1968, in the same document. The site shows
   * 1967 because that is what the STARK company profile carried into the
   * brand-level material, but this is an open question, not a settled one.
   */
  established: {
    value: 1967,
    grouping: false,
    source: "Siesta catalogue 2026 p3 (EN); STARK company profile p2",
    caveat: "Siesta catalogue p2 (AR) says 1968. Client must rule.",
  },

  /** SLIC's Jeddah plant on Old Makkah Road, not the Trust Wood site. */
  factoryArea: {
    value: 60000,
    suffix: " m²",
    grouping: true,
    source: "Siesta catalogue 2026 pp2-3 (both languages); STARK company profile p2",
  },

  /** SLIC's payroll. Trust Wood's headcount is separate and is not on the site. */
  specialists: {
    value: 200,
    suffix: "+",
    grouping: true,
    source: "Siesta catalogue 2026 pp2-3 (both languages); STARK company profile p2",
  },

  megaProjects: {
    value: 2,
    grouping: false,
    source: "STARK company profile p2 (stat row under WHO WE ARE)",
  },

  // ── Woodworks ──────────────────────────────────────────────────────────
  // The certificate held by Trust Wood, the group's Jeddah joinery factory.

  /**
   * FSC Chain of Custody, issued by BMC Assurance under FSC-STD-40-004 V-3-1
   * and FSC-STD-50-001 V-2-1. Registered 22-01-2024, expires 21-01-2029 — so
   * unlike the ISO pair it is CURRENT, which is why this one is on the site.
   *
   * ⚠ THE SYSTEM IS "TRANSFER", AND THAT LIMITS THE CLAIM. Transfer means
   * certified output requires certified input; it does not mean everything
   * leaving the factory is FSC-certified. Copy may say the factory holds chain
   * of custody and can supply certified material. It may NOT say "our wood is
   * FSC-certified" as a blanket statement.
   */
  fscCertificate: {
    value: "BMC-COC-010074",
    source: "Trust Wood profile p83 (BMC certificate of registration)",
  },

  /**
   * The machining allowances in the factory's quality plan, stage by stage.
   * Cut oversize, then size, then mould: the numbers descend because each
   * stage takes the component closer to final, which is why they are worded
   * as allowances rather than as a finished tolerance. "+10 mm tolerance" on a
   * delivered component would read as sloppy to a specifier; it is not what
   * the document means.
   */
  toleranceCutting: {
    value: 10,
    source: "Trust Wood profile p103 (Quality Plan TW-QP-01, line 03)",
  },
  toleranceSizing: {
    value: 5,
    source: "Trust Wood profile p103 (Quality Plan TW-QP-01, line 04)",
  },
  toleranceMolding: {
    value: 3,
    source: "Trust Wood profile p103 (Quality Plan TW-QP-01, line 06)",
  },
  toleranceGluingPainting: {
    value: 2,
    source: "Trust Wood profile p103 (Quality Plan TW-QP-01, lines 07 and 08)",
  },

  /** Inspection frequency on nine of the ten quality-plan stages. */
  inspectionFrequency: {
    value: 100,
    source: "Trust Wood profile p103 (Quality Plan TW-QP-01, Frequency column)",
  },

  /** CORAL pressurised water-wash spray booth, 6 x 12 m. */
  paintBoothWidth: {
    value: 6,
    source: "Trust Wood profile p17 (machine list after expansion, item 29)",
  },
  paintBoothLength: {
    value: 12,
    source: "Trust Wood profile p17 (machine list after expansion, item 29)",
  },

  // ── Mattresses ─────────────────────────────────────────────────────────

  /**
   * blue's warranty. Stated per product in the 2026 product sheets.
   *
   * ⚠ SIESTA'S WARRANTIES ARE DIFFERENT AND SHORTER — 10 years on SENSICE but
   * 5 on COMFORT, 3 on STANDARD, 1 on SLEEP. "Up to 10 years" is the only
   * honest way to state the range across that catalogue, and the two brands
   * must never share one warranty number.
   */
  blueWarrantyYears: {
    value: 10,
    source: "blue dossier, Products/Luna/Luna info 2026.docx (الضمان)",
    caveat:
      "Stated on 7 of the 8 product sheets. Pure latex leaves the warranty field blank; confirm it is also 10 years before this is read as covering the whole range.",
  },

  /** blue's home trial. Its own terms document, on SLIC letterhead. */
  blueTrialNights: {
    value: 50,
    source: "blue mattress 50-Night Trial Terms p1",
  },

  /** Models in each catalogue. siesta: 5 luxury + 8 economic + 3 hospitality. */
  siestaModels: {
    value: 16,
    source: "Siesta catalogue 2026 pp7-59 (model pages)",
  },
  blueModels: {
    value: 8,
    source:
      "blue dossier, Products/*/info 2026.docx (Blue 1, Comfy zone, Loft, Luna, Pure latex, Retro, Skin care, Sky)",
  },

  /** siesta's three ranges: Luxury, Economic, Hospitality. */
  siestaRanges: {
    value: 3,
    source: "Siesta catalogue 2026 pp7, 29, 53 (range title pages)",
  },

  /** SLIC's founding headcount and first factory, before the Old Makkah Road move. */
  slicFoundingStaff: {
    value: 15,
    source: "Siesta catalogue 2026 p3 (EN, ABOUT US)",
  },
  slicFoundingArea: {
    value: 6000,
    source: "Siesta catalogue 2026 p3 (EN, ABOUT US)",
  },
  slicReequipYear: {
    value: 1998,
    source: "Siesta catalogue 2026 p3 (EN, ABOUT US)",
  },
  slicHotelRoomsYear: {
    value: 2017,
    source: "Siesta catalogue 2026 p3 (EN, ABOUT US)",
  },
} as const satisfies Record<string, SourcedFact | StatFact>;

/**
 * The home page's count-up band, in reading order.
 *
 * These used to be a bare array of literals inside `Turnkey.tsx`, which put
 * the four most quotable numbers on the site outside every check that governs
 * the copy deck — the message files were audited and these were not, purely
 * because of which file they happened to live in.
 *
 * The labels stay in the message files, because they are translated and these
 * are not.
 */
export const HOME_STATS: readonly StatFact[] = [
  FACTS.established,
  FACTS.factoryArea,
  FACTS.specialists,
  FACTS.megaProjects,
];

/**
 * The single contact address for the whole site.
 *
 * IT WAS PUBLISHED TWO WAYS. Visible copy said `info@stark.com.sa` while the
 * JSON-LD in the same page's <head> said `hello@stark-ksa.net` — so the
 * machine-readable version, which is what a search engine actually indexes and
 * what an assistant would quote back to a customer, disagreed with the version
 * on screen.
 *
 * `info@stark.com.sa` wins because it is the only one a human confirmed: the
 * client gave it on the round-2 review call. `stark-ksa.net` appears in the
 * brand guidelines (pp21, 44) and matches the sister companies' pattern
 * (`slic-ksa.net`, `siesta.sa`), which is suggestive but is a designer's
 * artwork, not a statement that the mailbox exists.
 *
 * ⚠ STILL OPEN: which domain is real. Both are plausible and they cannot both
 * be the inbox. Everything that prints an address now reads this constant, so
 * settling it is a one-line change instead of a hunt.
 */
export const CONTACT_EMAIL = "info@stark.com.sa";

/** Jeddah, Saudi Arabia. The only location any document states for either factory. */
export const CONTACT_LOCALITY = "Jeddah";
export const CONTACT_COUNTRY = "SA";
