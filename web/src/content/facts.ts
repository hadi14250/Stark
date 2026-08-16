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
   * ⚠ WENT 2 → 3 → 2 → 3, AND THIS IS THE FOURTH DOCUMENT TO STATE IT.
   *
   * The v3 comment deck raised it to three a year; the 29-page profile reverted
   * to two (p8); the new Company Profile S.F 2.4 prints "3/yr MEGA-PROJECTS
   * DELIVERED" in the stat band on p7, and the client asked for three
   * explicitly in the same review. Three it is.
   *
   * ⚠ AND THE COPY MOVED WITH IT. `landing.features.items[1]` reads "Capable of
   * three mega-projects per year" in both locales. Those two have contradicted
   * each other once already — the band counted to 3 while the sentence said two
   * — so they are changed together or not at all.
   *
   * ⚠ THE LABEL IS A RATE, NOT A TOTAL. The profile writes "3/yr" above
   * "MEGA-PROJECTS DELIVERED"; the site has no per-unit suffix that survives
   * translation ("/yr" is English), so the rate is carried by the LABEL —
   * "Mega-projects a year" / "مشاريع ضخمة سنوياً". Relabelling this to
   * "Mega-projects delivered" without adding the rate back would turn a yearly
   * throughput into a claim that STARK has completed three projects in total,
   * which is a far weaker and quite different statement.
   */
  megaProjects: {
    value: 3,
    grouping: false,
    source: "STARK Company Profile S.F 2.4 (2026) p7 (MANUFACTURING & FACILITY)",
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

  /**
   * ⚠ `projectsCompleted` (500+) WAS HERE AND WAS DELIBERATELY REMOVED.
   *
   * The new Company Profile S.F 2.4 states the headline band as FOUR figures
   * (p7: +45 years, 60,000 m², +200 specialists, 3/yr mega-projects). "500+
   * projects completed" was on v3 slide 6 and does not survive into the new
   * deck, and the client chose to match p7 rather than keep it.
   *
   * IT IS DELETED RATHER THAN LEFT UNUSED, for the reason `blueTrialNights`
   * records below: a fact nobody consumes still whitelists its digits for the
   * entire copy deck, so some unrelated future "500 m² showroom" would sail
   * through the provenance guard on the authority of a retired stat. An entry
   * with no consumer is not a citation, it is a hole.
   *
   * The figure was never disproved — if the client wants it back, it is v3
   * slide 6 and this comment is the trail.
   *
   * Dropping to four also fixed a layout problem the five-column band caused:
   * see the note on the grid in Turnkey.tsx.
   */

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
      "One digit from blue's customer-care line (0562001434). Most likely a consecutive block rather than a typo, but worth one confirmation since a wrong number fails silently. NOTE: the newer 29-page profile's back page (p28) prints only email, city and STARK.com.sa and OMITS the phone, so this stays sourced to the earlier back page; the client asked to keep it live regardless.",
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

  /**
   * ===========================================================================
   * THE THREE ISO STANDARD NUMBERS — PUBLISHED AT THE CLIENT'S INSTRUCTION
   * ===========================================================================
   *
   * These are here because the provenance guard would not let the copy ship
   * without them, and that is the guard working exactly as intended: it forced
   * this note to be written before the digits could appear on a page.
   *
   * ⚠ READ THE CAVEAT BEFORE TREATING THESE AS SETTLED. The certificates on
   * file for two of the three are EXPIRED, and the third has no certificate on
   * file at all:
   *
   *   ISO 9001:2015   QAIS-Q-KSA-TW-10.22.020   expired 13.12.2025
   *   ISO 45001:2018  QAIS-OH-KSA-TW-10.22.012  expired 13.12.2025
   *   ISO 14001       no certificate in any document supplied
   *
   * The site deliberately withheld all of this for three rounds — an expired
   * certificate is the exact class of claim the content audit exists to remove,
   * and SOURCES.md recorded them as "NOT PUBLISHED … they go up the day a
   * renewal arrives".
   *
   * They are published now because the client's own finished Company Profile
   * S.F 2.4 prints the ISO CERTIFIED block on p12 and the client asked for the
   * site's certifications section to match that page. It is their document and
   * their claim to make; what this entry does is make sure nobody later reads
   * it as an oversight, and that the renewal is a named open item rather than a
   * thing everyone assumed somebody else had checked.
   *
   * The `source` is the profile, NOT the certificates — because the profile is
   * genuinely what backs the claim on the site today.
   */
  isoQuality: {
    value: 9001,
    source: "STARK Company Profile S.F 2.4 (2026) p12 (Certifications)",
    caveat:
      "PUBLISHED AT CLIENT INSTRUCTION. Trust Wood's certificate QAIS-Q-KSA-TW-10.22.020 (TW p82) EXPIRED 13.12.2025. Renewal outstanding.",
  },
  isoEnvironment: {
    value: 14001,
    source: "STARK Company Profile S.F 2.4 (2026) p12 (Certifications)",
    caveat:
      "PUBLISHED AT CLIENT INSTRUCTION. No ISO 14001 certificate appears in ANY document supplied — this one is not expired, it is unevidenced. The weakest of the three.",
  },
  isoSafety: {
    value: 45001,
    source: "STARK Company Profile S.F 2.4 (2026) p12 (Certifications)",
    caveat:
      "PUBLISHED AT CLIENT INSTRUCTION. Trust Wood's certificate QAIS-OH-KSA-TW-10.22.012 (TW p82) EXPIRED 13.12.2025. Renewal outstanding.",
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

  /**
   * ⚠ THE SEVEN WOOD-DIVISION CAPACITY FACTS WERE HERE AND ARE GONE.
   *
   * `capacityAnnualSar` (75M SAR), `capacityHotelRooms` (1,500),
   * `capacityDoors` (30,000), `capacityWardrobes` (90,000),
   * `capacityCladding` (150,000 m2), `capacityKitchens` (35,000 LM) and
   * `capacityClosetCladding` (40,000 m2), plus the `WOODWORKS_CAPACITY` array
   * that ordered them.
   *
   * The client asked for the whole annual-capacity band off the woodworks page
   * ("the 75M SAR remove the entire section too with the numbers like 1500"),
   * and these seven had exactly one consumer between them.
   *
   * THEY ARE DELETED RATHER THAN LEFT UNUSED, and that is the rule this file
   * exists to enforce rather than a tidy-up: a fact nobody renders still
   * whitelists its digits for the ENTIRE copy deck, so an unrelated future
   * "30,000 m2 of showroom" would sail through the provenance guard on the
   * authority of a capacity annotation nothing displays. An entry with no
   * consumer is not a citation, it is a hole. Same reasoning as the
   * `blueTrialNights` tombstone below.
   *
   * They were never disproved. All seven came off ONE annotation block — the
   * right-hand column the client added to slide 12 of profile v3 — so if the
   * band ever returns, that slide is where they are, and the open question
   * about whether the 40,000 m2 of closet cladding is a subset of the 150,000
   * m2 of cladding is still open.
   */

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
      "Stated on 7 of the now-9 product sheets. Pure latex leaves the warranty field blank, and Blue 2 arrived as photography with no sheet at all; neither carries the 10-year claim on the site, so this figure is not read as covering the whole range.",
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

  /**
   * ⚠ `blueTrialNights` (50) WAS HERE AND WAS DELIBERATELY REMOVED. Do not
   * re-add it from the source document, which is still in the client folder
   * and still says what it always said.
   *
   * The client withdrew the offer: profile v3 slide 16, comment column,
   * "الغاء فترة التجربة 50 يوم والابقاء على الضمان" — cancel the 50-day trial,
   * keep the warranty. Their own slide strikes the clause through mid-sentence.
   *
   * THE FACT WAS TRUE AND IS STILL TRUE OF THE DOCUMENT; it is the OFFER that
   * no longer stands. That distinction is why this tombstone exists rather
   * than a caveat on a live entry: a fact left in the registry keeps the token
   * "50" whitelisted for the whole copy deck, so some unrelated future "50
   * showrooms" would sail through the provenance guard on the authority of a
   * trial-terms PDF. An entry nobody consumes is not a citation, it is a hole.
   *
   * Removing it also deleted the only other place the trial appeared, which
   * was NOT the brand panel everybody remembers: `gallery.bluePureLatex`
   * carried "50 nights at home" as an overlay spec. One instruction, two
   * sites, and the second one is invisible from the mattresses route.
   */

  /** Models in each catalogue. siesta: 5 luxury + 8 economic + 3 hospitality. */
  siestaModels: {
    value: 16,
    source: "Siesta catalogue 2026 pp7-59 (model pages)",
  },
  blueModels: {
    value: 9,
    source:
      "blue dossier, Products/*/info 2026.docx (Blue 1, Comfy zone, Loft, Luna, Pure latex, Retro, Skin care, Sky) + the client's `blue` photo folder, which adds Blue 2 (photos only, no sheet)",
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

  /**
   * The mattress division's annual output, from the client's own annotation.
   *
   * ⚠ READ THE UNIT DIFFERENTLY FROM THE WOOD DIVISION'S. `capacityAnnualSar`
   * and its siblings are a CEILING — what the wood plant is equipped to make.
   * This one is written "60,000 مرتبة في السنة", sixty thousand mattresses in
   * the year, with no word for capacity, ability or equipment anywhere in the
   * line. The copy therefore says "a year", not "capacity", and the two pages
   * deliberately do not use the same phrasing for what look like the same kind
   * of number. If the client later confirms this is also a ceiling, the copy
   * changes, not this entry.
   */
  mattressesPerYear: {
    value: 60000,
    grouping: true,
    source: "STARK company profile v3 (2026) slide 15 (client annotation column)",
  },

  /**
   * siesta's warranty ceiling, now confirmed by the client twice over.
   *
   * ⚠ IT IS A CEILING AND MUST NEVER LOSE ITS "UP TO". The catalogue grades it
   * by range: 10 years on SENSICE, 5 on COMFORT, 3 on STANDARD, 1 on SLEEP.
   * Slide 17 states it as "warranties of up to 10 years on SELECTED models",
   * which agrees. Dropping the qualifier turns a top-of-range figure into a
   * promise about a one-year mattress.
   *
   * It shares the value 10 with `blueWarrantyYears` and is a SEPARATE ENTRY
   * anyway, because they are separate claims from separate documents about
   * separate products, and the note on `blueWarrantyYears` says the two brands
   * must never share one warranty number. Deduplicating these to save a line
   * would erase exactly the distinction that warning exists to protect.
   */
  siestaWarrantyMaxYears: {
    value: 10,
    source: "STARK company profile v3 (2026) slide 17 (Trusted Quality); Siesta catalogue 2026 p7",
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
 * FOUR AGAIN, AND IT IS THE NEW PROFILE'S OWN BAND. This was v3 slide 6's five
 * (which had itself replaced a four-stat band opening on `1967 / ESTABLISHED`);
 * Company Profile S.F 2.4 p7 prints four, left to right, exactly as listed
 * below, and the client asked to match it. `projectsCompleted` is the one that
 * went — see its tombstone above.
 */
export const HOME_STATS: readonly StatFact[] = [
  FACTS.yearsExperience,
  FACTS.factoryArea,
  FACTS.specialists,
  FACTS.megaProjects,
];

/**
 * ⚠ `WOODWORKS_CAPACITY` WAS HERE AND WENT WITH THE SECTION IT FED.
 *
 * It ordered the six volume figures for the wood division's annual-capacity
 * band, joined by index to the units and labels in the message files — an index
 * contract with a warning on it, because reordering the array alone could print
 * "30,000 m²" under "Doors".
 *
 * The client asked for that band removed. See the tombstone on the seven
 * capacity facts above for what the figures were and where they came from.
 *
 * `HOME_STATS` is now the only index join left in this file, which is a small
 * mercy: it is the one with the mildest failure mode (a relabelled column, not
 * a wrong unit).
 */

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
 * ✓ RESOLVED by the new STARK Company Profile (2026): its back page (p28)
 * prints `info@stark.com.sa` and the domain `STARK.com.sa`, the one a
 * human-approved brand-level document publishes. `stark-ksa.net` was a
 * designer's artwork pattern and does not win. The constant already held the
 * right value; this note records that the open question is now closed.
 */
export const CONTACT_EMAIL = "info@stark.com.sa";

/** Jeddah, Saudi Arabia. The only location any document states for either factory. */
export const CONTACT_LOCALITY = "Jeddah";
export const CONTACT_COUNTRY = "SA";
