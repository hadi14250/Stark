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
 * STARK IS ONE COMPANY MADE OF TWO REAL JEDDAH FACTORIES:
 *
 *   Saudi Light Industries Co. (SLIC)   founded 1967/68, 60,000 m², ~200 staff
 *                                       foam and mattresses (siesta, blue)
 *   Trust Wood Factory                  founded 2019, 3rd Industrial City
 *                                       joinery, doors, hotel furniture
 *   STARK                               formed 2026 from the two
 *
 * The 2026 company profile states this outright (p3, COMPANY HISTORY) — which
 * corrected an earlier conclusion of this audit. Working from the two factory
 * profiles alone it looked undocumented, because neither of them contains the
 * word "STARK" even once; they predate the company. The brand-level document
 * is where the relationship lives.
 *
 * This is what dissolves an alarm that looked fatal: 1967 against 2019 is not
 * a contradiction, it is two founding dates for two different factories, and
 * 2026 is the third. Anyone re-auditing this site will hit that apparent
 * conflict and reach for the delete key, so it is written down here rather
 * than left to be rediscovered.
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
    caveat:
      "TWO OPEN QUESTIONS ON ONE NUMBER. (1) Siesta catalogue p2 (AR) says 1968. (2) Profile v3 slide 1 tells the story from 1967 as 'over six decades', while slide 6 states the headline stat as '45+ years experience' - which is the WOOD family's inherited expertise, not SLIC's age. Both now appear on the site: 45+ in the stat band (the client asked for it explicitly) and 1967 in the About and Mattresses narrative. Client must rule which represents the company.",
  },

  /**
   * SLIC's Jeddah plant on Old Makkah Road, not the Trust Wood site.
   *
   * The suffix carries a NON-BREAKING space on purpose. In the home stat band
   * the figure sits in a `clamp(30px,4vw,54px)` display face inside one column
   * of five, and with an ordinary space "60,000 m²" breaks after the comma so
   * the unit drops to its own line under the number. The client reported that
   * exact wrap. A nbsp is the fix that survives every column width rather than
   * one that happens to hold at the viewport it was checked at.
   */
  factoryArea: {
    value: 60000,
    // The nbsp is written as an escape, not typed. A literal one is invisible
    // in a diff, so the next person to touch this line would "tidy" it back to
    // an ordinary space without ever seeing what they had changed.
    suffix: "\u00A0m²",
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

  /**
   * ⚠ WAS 2. Profile v3 raises it to three a year, and adds an annual value of
   * SAR 100M that the site does not currently print.
   */
  megaProjects: {
    value: 3,
    grouping: false,
    source: "STARK company profile v3 (2026) slide 6",
  },

  /**
   * Years of experience, as the client's own headline stat.
   *
   * ⚠ THIS IS NOT THE COMPANY'S AGE. Slide 1 attributes it to the wood-industry
   * family STARK partnered with in 2026: "more than 45 years of inherited
   * expertise in the wood industry". SLIC has been making foam since 1967,
   * which is nearly six decades, so the two figures describe different things
   * and the deck prints both without reconciling them. See `established`.
   */
  yearsExperience: {
    value: 45,
    suffix: "+",
    grouping: false,
    source: "STARK company profile v3 (2026) slide 6; attributed on slide 1",
    caveat:
      "Reads as the company's age beside a story that starts in 1967. The client asked for it in the stat band regardless. Not resolved, only recorded.",
  },

  /** Completed projects to date. */
  projectsCompleted: {
    value: 500,
    suffix: "+",
    grouping: true,
    source: "STARK company profile v3 (2026) slide 6",
  },

  /**
   * The year STARK itself came into existence, as the integration of Saudi
   * Light Industries and Trust Wood.
   *
   * This is the fact that dissolves the whole 1967/2019/2026 tangle: three
   * real founding years for three real entities. 1967 is SLIC's, 2019 is Trust
   * Wood's, and 2026 is STARK's own.
   */
  starkFormed: {
    value: 2026,
    source: "STARK company profile 2026 p3 (COMPANY HISTORY)",
  },

  /** The phone number on the profile's back page. */
  contactPhone: {
    value: "+966 56 200 1435",
    source: "STARK company profile 2026 p20 (back page)",
    caveat:
      "One digit from blue's customer-care line (0562001434). Most likely a consecutive block rather than a typo, but worth one confirmation since a wrong number fails silently.",
  },

  /** Kilo 16 on Old Makkah Road, the address the profile publishes. */
  contactAddressKilo: {
    value: 16,
    source: "STARK company profile 2026 p20 (back page)",
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

  // ── Gallery references ─────────────────────────────────────────────────
  // Dates on the approval documents themselves. They matter: an approval is a
  // dated event, and a reference with no date invites the reader to assume it
  // is current.

  /** Mataf Extension material submittal, and the King Salman Park prequalification. */
  matafApprovalYear: {
    value: 2022,
    source:
      "Trust Wood profile p100 (SBG submittal 1109-00-AR-MT-060000-W-00-03, approved 22-09-2022; KSP-MBL-RAC-COM-ARC-PQD-0195, 11-Sep-2022)",
  },

  /** NGHA vendor submittal SHR1-SAR-NAP-00121. */
  nghaApprovalYear: {
    value: 2020,
    source: "Trust Wood profile p101 (NGHA submittal SHR1-SAR-NAP-00121, 24-08-2020)",
  },

  /** The King Salman Park work package the factory was prequalified for. */
  royalArtsPackage: {
    value: "CP04",
    source: "Trust Wood profile p100 (Project: CP04 - Royal Arts Complex)",
  },

  /** Saudi Vision 2030, which the company profile positions the group against. */
  visionYear: {
    value: 2030,
    source: "STARK company profile 2026 p3 (COMPANY HISTORY)",
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

  /**
   * Pure Latex's core material.
   *
   * ⚠ THE ONE blue MODEL WITH NO WARRANTY ON ITS SHEET (see blueWarrantyYears),
   * so its gallery entry leads on certificates instead. Do not add "10-year
   * warranty" to Pure Latex to make it match the other two.
   */
  latexOrganicPurity: {
    value: 100,
    source: "blue dossier, Products/Pure latex/Pure latex info 2026.docx (LATEX)",
    caveat: "Stated as 100% natural organic latex. The sheet does not say which component is measured.",
  },

  /**
   * Pure Latex's textile certificate. Kept as a string, not a number: "Class
   * 01" is an identifier and the leading zero is part of it.
   */
  oekoTexClass: {
    value: "Standard 100 Class 01",
    source: "blue dossier, Products/Pure latex/Pure latex info 2026.docx (LATEX)",
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
 * the most quotable numbers on the site outside every check that governs
 * the copy deck — the message files were audited and these were not, purely
 * because of which file they happened to live in.
 *
 * The labels stay in the message files, because they are translated and these
 * are not.
 *
 * ⚠ ORDER IS THE CONTRACT. The labels are joined to these figures BY INDEX
 * from `landing.stats.items` in the message files, so reordering this array
 * silently relabels every column rather than failing. `facts.test.ts` can only
 * check that the two lists are the same LENGTH; it cannot check that "500+"
 * still has "Projects completed" under it. Reorder both or neither.
 *
 * This is profile v3 slide 6, left to right, and it replaced a four-stat band
 * that opened with `1967 / ESTABLISHED`.
 */
export const HOME_STATS: readonly StatFact[] = [
  FACTS.yearsExperience,
  FACTS.factoryArea,
  FACTS.specialists,
  FACTS.megaProjects,
  FACTS.projectsCompleted,
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
