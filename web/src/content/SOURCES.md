# SOURCES — what this site claims, and what backs it

Every factual claim on stark's website, traced to the document and page it came from.

This file exists because a content audit found that roughly **two thirds of the site's copy
had no source**. It had been written to be *plausible for* STARK before anyone had read a
STARK document: invented project case studies, an invented QA procedure with invented
tolerances, eight invented client companies, invented material specifications. None of it was
marked as provisional, because prose has nowhere to put a citation.

`facts.ts` enforces the numeric half of this mechanically. This file covers the half a test
cannot reach — the prose claims.

**The rule: if it is not in here, it does not ship.**

---

## ⚠ Read this before changing anything

**STARK is one company made of two real Jeddah factories, and the 2026 company
profile states it outright (p3, COMPANY HISTORY).**

An earlier pass of this audit concluded the relationship was undocumented. That was
wrong, and the way it went wrong is worth knowing: it was read off the two FACTORY
profiles, neither of which contains the word "STARK" even once — they predate the
company. The brand-level document is where the relationship lives.

| Entity | Founded | Site | Makes | Says "STARK"? |
|---|---|---|---|---|
| **STARK** | **2026** | — | the company formed from the two below | — |
| **Saudi Light Industries Co. (SLIC)** | 1967/68 | Jeddah, Al-Fadl, Old Makkah Rd. 60,000 m², ~200 staff | foam and mattresses (**siesta**, **blue**); hotel-room fit-out since 2017 | **no — 0 occurrences** |
| **Trust Wood Factory for Wood Industries** | 2019 | Jeddah, 3rd Industrial City | woodworks, joinery, doors, hotel furniture | **no — 0 occurrences** |

Neither factory profile references the other; only the STARK profile references both.
The client has confirmed they are one group and authorised using all of it.

**1967 vs 2019 vs 2026 is not a contradiction.** Three real founding years for three
real entities: SLIC 1967, Trust Wood 2019, STARK 2026. An earlier pass of this audit
raised the first two as a fatal conflict and was wrong.

---

## The documents

| Code | Document | Pages | What it is good for |
|---|---|---|---|
| **SP** | STARK Company Profile 2026 | 20 | The authority for anything STARK-level. Company history and the group structure, the real vision and mission, 6 core services, manufacturing stats, sectors served, both mattress brands with full model lists, and the contact block. |
| **BG** | STARK Brand Guidelines | 53 | Identity only. **Zero business facts.** Prints the domain `stark-ksa.net`. |
| **TW** | Trust Wood Company Profile | 108 | ISO 9001, ISO 45001, FSC CoC, quality plan with tolerances, machinery list, 26 client marks, 3 named projects. |
| **SIESTA** | Siesta Catalogue 2026 | 60 | SLIC's history, 16 models in 3 ranges, layer construction per model, warranties, fire-resistant hospitality range. |
| **BLUE** | blue mattress dossier | 11 files | 8 products with base/firmness/height, 10-year warranty, 50-night trial, palette, Jeddah retail contact. |

---

## Numbers

Held in `facts.ts`, which is the authority. Repeated here so this file reads as a complete
ledger.

| Figure | On the site as | Belongs to | Source |
|---|---|---|---|
| 1967 | "Established" | SLIC | SIESTA p3 (EN), SP p2 · ⚠ SIESTA p2 (AR) says **1968** |
| 60,000 m² | "Manufacturing facility" | SLIC's Jeddah plant | SIESTA pp2–3 (both languages), SP p2 |
| 200+ | "Specialists" | SLIC's payroll | SIESTA pp2–3, SP p2 |
| 2 | "Mega-projects a year" | STARK | SP p5 |
| 2026 | About, company history | STARK | SP p3 |
| 15 · 6,000 m² | mattresses `credentials` | SLIC, at founding | SIESTA p3 |
| 1998 · 2017 | mattresses `credentials` | SLIC | SIESTA p3 |
| BMC-COC-010074 | woodworks certifications | Trust Wood | TW p83 |
| 10 / 5 / 3 / 2 mm · 100% | woodworks `standards` | Trust Wood quality plan | TW p103 |
| 6 × 12 m | woodworks `capabilities` | CORAL paint booth | TW p17, item 29 |
| 8 · 10 yr · 50 nights | blue chips | blue | product sheets; trial terms p1 |
| 16 · 3 ranges | siesta chips | siesta | SIESTA pp7, 29, 53 |
| 2022 · 2020 · CP04 | gallery references | approval documents | TW pp100–101 |
| +966 56 200 1435 · Kilo 16 | contact panel | STARK | SP p20 |

Trust Wood's own headcount (70 / 95 / 166 at different points in TW) is a **separate payroll**
and is deliberately not on the site — publishing both would invite the reader to add them.

---

## Prose claims

### Sourced — safe

| Claim | Where | Source |
|---|---|---|
| Woodworks and mattresses as the two divisions | throughout | SP pp2, 4 |
| blue = B2C, siesta = B2B | footer, contact, mattresses | SP p6; BLUE; SIESTA |
| Design → manufacture → deliver → install under one contract | `landing.turnkey`, home hero | SP p4 "WHY STARK": integrated solutions design-to-install |
| Hospitality focus (hotels, resorts, villas, restaurants) | landing, woodworks | SP p5 |
| Made-to-measure / high customisation | `landing.turnkey.features[1]` | SP p4 |
| Jeddah, Saudi Arabia | footer, contact, JSON-LD | SP; TW; SIESTA — all three factories are Jeddah |

### Sourced — now live

Material that replaced invented copy in steps 2–6. Listed so each replacement is checkable.

| Claim | Destined for | Source |
|---|---|---|
| ISO 9001:2015 (QAIS-Q-KSA-TW-10.22.020), ISO 45001:2018 (QAIS-OH-KSA-TW-10.22.012), QACS, scope "wood & furniture products manufacturing, supply and installation" | **NOT PUBLISHED** | TW p82 · ⚠ **both expired 13.12.2025.** Held back deliberately: an expired certificate is the class of claim this audit exists to remove. They go up the day a renewal arrives. |
| FSC Chain of Custody **BMC-COC-010074**, BMC Assurance, registered 22-01-2024, **expires 21-01-2029** | woodworks certifications | TW p83 · ⚠ **system is "Transfer"**: certified output requires certified input. Never claim all our wood is FSC-certified. |
| Intertek-certified fire-rated door manufacture, on cores from Halspan, Warm Springs and Ramkor (Intertek SpecID 61199 / 61212 / 61218) | woodworks certifications | TW p84 |
| Quality Plan TW-QP-01; tolerances cutting +10 mm, sizing +5 mm, molding +3 mm, gluing +2 mm, painting +2 mm; 100% inspection | woodworks `standards` | TW |
| BIESSE (Rover A CNC, Active Edge, Selco WNT 630), SCM, Weinig, CEFLA finishing line, CORAL 6×12 m water-wash paint booth | woodworks `capabilities` | TW |
| FSC product categories: doors and frames, windows, stairs, wall cladding, cabinets, custom furniture, beds, wardrobes, worktops | woodworks `materials` | TW (the certificate's own scope) |
| Four-block mattress construction: top quilted layers / core / comfort layers / bottom quilted layers | mattresses `engineering` | SIESTA (all 16 models) |
| Foam manufacturing since 1967 (15 staff, 6,000 m², Madinah Road); re-equipped 1998 with Italian and German technology; hotel rooms from 2017 | mattresses `credentials` | SIESTA p3 · ⚠ **the two documents disagree on strength**: SIESTA says "the first foam factory in the Kingdom", SP p3 says "one of Saudi Arabia's pioneering sponge manufacturers". The site uses the softer, newer, brand-level wording. |
| Fire-resistant fabric across all three hospitality models (cotton 370 G on COMFORT, striped jacquard 150 G on STANDARD and SLEEP) | mattresses `credentials` | SIESTA pp55, 57, 59 |
| ~~Cigarette test on the hospitality range~~ | **DROPPED** | ⚠ **Not in the catalogue.** An earlier note claimed it; going to cite it found nothing. Fire-resistant fabric is what is printed and what ships. Never write BS 7177 or EN 597-1. |
| blue: 8 models, 10-year warranty, 50-night trial | mattresses `brands` | BLUE |
| siesta: 16 models, 3 ranges, warranties to 10 years | mattresses `brands` | SIESTA |
| Mataf Extension (Saudi Binladin Group / Dar Al-Handasah, approved as noted 22-09-2022); King Salman Park CP04 Royal Arts Complex (MBL / Parsons / Faithful+Gould / WSP, approved as noted 12-Sep-2022); NGHA Specialized Hospitals (Nesma & Partners / Dar Al-Handasah, approved except as noted 24-08-2020) | gallery | TW pp100–101 · ⚠ **approved submittals and prequalifications, NOT certified completions** — copy says "approved supplier for" and "prequalified", never "we delivered" |
| Real vision and mission | `landing.about.pillars` | SP p2, near-verbatim |
| STARK formed 2026 from SLIC and Trust Wood | `landing.about` | SP p3 |
| Eight client references: Saudi Binladin Group, Nesma & Partners, Modern Building Leaders, Red Sea Development, El Seif, Alshaya, depa, acciona | `landing/clients.ts` | TW p38 · first three corroborated by TW pp100–101 |

### Unsourced but acceptable — opinion, not fact

Claims about *approach*. Nothing here is checkable, so nothing here can be wrong; but none of
it is the client's own words either, and it should be read back to them.

`landing.turnkey.*` (the four-suppliers argument, "stage-gated checks") · `landing.about
.paragraphs[2]` · `landing.marquee.words[3]` · `landing.categories.*` · `landing.clients.sub`

### Unsourced and must not ship

| Claim | Where | Why |
|---|---|---|
| Six project case studies — titles, headlines, scope/delivery/materials, 4-row spec tables | `gallery.*`, `lib/gallery/projects.ts` | Fabricated end to end |
| Eight client companies — Northvale, Atlas Group, Meridian, Kawkab, Summit Co., Halcyon, Vertex, Rawabi | `landing/clients.ts` | Invented companies |
| Woodworks `standards` | `woodworks.standards` | Reads as a documented QA procedure; was invented outright. **Highest-risk block on the site.** |
| Woodworks `capabilities`, `materials` | woodworks | Invented specifications |
| Mattresses `engineering`, `credentials` | mattresses | Invented |
| `landing.process` — incl. "responsibly sourced solid hardwoods" | home | A sustainability claim STARK never made. Ironically **provable** via TW's FSC certificate, so it is rewritten rather than cut. |
| "Strategic Trust for Advanced and Reliable Knowledge (STARK)" | `landing.about.paragraphs[0]` | **In no document.** The site opened by telling readers the company's name means something the company has never said it means. |
| Vision "a trusted regional leader in hospitality solutions"; the matching mission | `landing.about.pillars` | Not the company's. The real vision is industrial and national and does not mention hospitality. |
| Prices, bed sizes | anywhere | **Neither exists in any source document.** |
| blue's health claims — cortisol/electrons, carotenoid ×10, allergen percentages | mattresses | Client decision: hard specs only. None of it ships. |

---

## Defects in the client's own documents

Report these; do not silently paper over them.

- **SIESTA contradicts itself on the founding year: 1968 (AR) vs 1967 (EN).** Site shows 1967.
- GLORIA: Bonnell spring listed as 1,9 mm (EN) and 2,4 mm (AR) on the same line.
- PERFECTION: comfort layer 25 (EN) vs 30 (AR); the detail page says Bonnell, the spec sheet
  says Pocket. MOON: 15 (EN) vs 20 (AR).
- PRESTIGE is described as an "independent Bonnell Spring system" — Bonnell springs are
  interconnected by definition.
- blue's Retro declares Bonnell springs but its pillow-top block describes a pocket-sprung
  build; spring counts conflict (2000 vs 600–3000); six of eight firmness graphics disagree
  with their own text; Sky and Luna's INTENSE™ block names the wrong product.
- blue gives two customer-care numbers: `0565 597 838` and `0562001434`.
- blue's logo exists as `mattress` (singular, per the identity guide) and `mattresses`
  (plural, with an ® the guide never authorises). **The site uses the singular — correct.**
- SIESTA's master tagline is printed **"YOU DESERVE GREAT NIGHT"** on every page, missing an
  "a". SP p24 prints it correctly with the "a". If it goes on the site, SP's version is the
  one to use.
- **The wood experience is stated three different ways**: SP p3 says the Haidar family has
  50+ years, TW p5 says the team has 45 years, and TW p100's prequalification form says "more
  than 30 years". The site states no number, deliberately.
- SP p3 says "more than six decades" of SLIC expertise. 1967 to 2026 is 59 years.
- The quality plan (TW p103) numbers its stages 01–04 then 06–10. There is no stage 05.
- **The two documents disagree on how strong SLIC's claim is**: SIESTA p3 says "the first foam
  factory in the Kingdom", SP p3 says "one of Saudi Arabia's pioneering sponge manufacturers".
  The site uses the softer, newer, brand-level wording.
- **SP's back page and BG both print `stark-ksa.net`**, and SP publishes
  `Sales@stark-ksa.net`. The site shows `info@stark.com.sa`, given verbally on the round-2
  call. See open question 3 — this one decides where enquiries land.

---

## Open with the client

Ordered by what it costs to get wrong.

1. **Which email is real** — `info@stark.com.sa` (verbal, round-2 call, currently on the site)
   or `Sales@stark-ksa.net` (printed on SP p20, and BG pp21/44 sets the same domain)? Two
   documents against one conversation. **Getting this wrong loses every enquiry, silently.**
2. **Client logo permission.** Eight names from Trust Wood's client wall are now on STARK's
   home page as typographic wordmarks. Naming a reference is ordinary; reproducing their
   trademarked artwork is not, and that is deliberately not done yet. Confirm both.
3. **Project photography.** Three real projects are named — Mataf Extension, King Salman Park,
   NGHA — and every photograph under them is still generic landing imagery. A pinned failing
   test holds this. **Real photographs, or the pictures come off.**
4. **ISO 9001 and ISO 45001 expired 13.12.2025** — renewed? They are held off the site until a
   renewal exists rather than shipped with a hedge.
5. **1967 or 1968?** Their own catalogue says both. The site shows 1967.
6. **Is the phone right?** SP p20 gives `+966 56 200 1435`; blue's care line is `0562001434`,
   one digit away. Probably a consecutive block, but a wrong number fails silently.
7. **Does blue's Pure latex carry the 10-year warranty?** Seven of eight product sheets state
   it; Pure latex leaves the field blank, and the site's chip implies the whole range.
8. **Real social handles.** The footer links are still `#`, and the JSON-LD `sameAs` is empty.
