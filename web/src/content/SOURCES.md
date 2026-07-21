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

**STARK is a holding brand over two real Jeddah factories, and no document says so.**

| Entity | Founded | Site | Makes | Says "STARK"? |
|---|---|---|---|---|
| **STARK** | — | — | the brand, the profile, this website | — |
| **Saudi Light Industries Co. (SLIC)** | 1967/68 | Jeddah, Al-Fadl, Old Makkah Rd. 60,000 m², ~200 staff | foam and mattresses (**siesta**, **blue**); hotel-room fit-out since 2017 | **no — 0 occurrences** |
| **Trust Wood Factory for Wood Industries** | 2019 | Jeddah, 3rd Industrial City | woodworks, joinery, doors, hotel furniture | **no — 0 occurrences** |

None of the three documents references either of the others. The client has confirmed they
are one group and authorised using all of it on STARK's site.

Two consequences that keep catching people:

1. **1967 vs 2019 is not a contradiction.** It is SLIC's founding against Trust Wood's. An
   earlier pass of this audit raised it as a fatal conflict and was wrong.
2. **If STARK's client asks for proof of the relationship, the group structure is the
   answer — no document we hold states it.**

---

## The documents

| Code | Document | Pages | What it is good for |
|---|---|---|---|
| **SP** | STARK Company Profile | 6 | STARK-level positioning. Vision, mission, 6 services, 3 capabilities, 4 stats, 2 sub-brands. |
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
| 2 | "Mega-projects a year" | STARK | SP p2 |

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

### Sourced, pending steps 2–6 of the audit

Real material that replaces invented copy. Listed so the replacement is checkable.

| Claim | Destined for | Source |
|---|---|---|
| ISO 9001:2015, ISO 45001:2018 (QACS; scope "wood & furniture products manufacturing, supply and installation") | woodworks certifications band | TW · ⚠ **both expired 13.12.2025 — confirm renewal before publishing** |
| FSC Chain of Custody **BMC-COC-010074** | woodworks | TW |
| Intertek-certified fire-rated door manufacture | woodworks | TW |
| Quality Plan TW-QP-01; tolerances cutting +10 mm, sizing +5 mm, molding +3 mm, gluing +2 mm, painting +2 mm; 100% inspection | woodworks `standards` | TW |
| BIESSE (Rover A CNC, Active Edge, Selco WNT 630), SCM, Weinig, CEFLA finishing line, CORAL 6×12 m water-wash paint booth | woodworks `capabilities` | TW |
| FSC product categories: doors and frames, windows, stairs, wall cladding, cabinets, custom furniture, beds, wardrobes, worktops | woodworks `materials` | TW (the certificate's own scope) |
| Four-block mattress construction: top quilted layers / core / comfort layers / bottom quilted layers | mattresses `engineering` | SIESTA (all 16 models) |
| First foam and mattress factory in the Kingdom; re-equipped 1998 with Italian and German technology; 2017 assembly line | mattresses `credentials` | SIESTA pp2–3 |
| Fire-resistant fabric and a cigarette test on the hospitality range | mattresses | SIESTA · ⚠ **no standard number is cited** — say "cigarette-test rated", never BS 7177 or EN 597-1 |
| blue: 8 models, 10-year warranty, 50-night trial | mattresses `brands` | BLUE |
| siesta: 16 models, 3 ranges, warranties to 10 years | mattresses `brands` | SIESTA |
| Mataf Extension (Saudi Binladin Group / Dar Al-Handasah); King Salman Park CP04 Royal Arts Complex (MBL); NGHA Specialized Hospitals (Nesma & Partners) | gallery | TW pp100–101 · ⚠ **approved submittals and prequalifications, NOT certified completions** — copy must say "approved supplier for", never "we delivered" |

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
  "a". If it ever goes on the site it must be fixed or omitted, never reproduced.

---

## Open with the client

1. **1967 or 1968?** Their own catalogue says both.
2. **ISO 9001 and ISO 45001 expired 13.12.2025** — renewed? The certifications band is gated
   on this.
3. **Which email domain** — `stark.com.sa` (given verbally on the round-2 call, and what the
   site uses) or `stark-ksa.net` (printed in BG pp21, 44, and matching `slic-ksa.net` /
   `siesta.sa`)?
4. **The cigarette test** — to which standard? BS 7177 and EN 597-1 are both plausible and we
   may not guess.
5. **Client logo permission** — is Trust Wood's client wall cleared for use on STARK's site?
6. **Real social handles**, and blue's correct customer-care number.
