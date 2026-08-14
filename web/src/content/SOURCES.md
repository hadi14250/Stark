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
| **SP29** | STARK Company Profile 2026 (polished) | 29 | The client's finished, designed profile. Supersedes SP / v3 where they differ. Same content, finalised: reverts mega-projects to **two** (p8), adds a geographic-reach map (p27: Bahrain, Yemen, regional expansion), lists eight sectors incl. Educational and Mixed-use (p11), a BLUE technologies page (p22), Interior Design + Shop Drawings as named services (p9), and confirms the domain `STARK.com.sa` on the back page (p28, which omits the phone). |
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
| ISO 9001, ISO 14001 and ISO 45001, as the "ISO CERTIFIED" mark | woodworks certifications | **SP2.4 p12** · ⚠ **PUBLISHED AT THE CLIENT'S INSTRUCTION — READ THIS BEFORE "FIXING" IT.** See below. |
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

### ⚠ The ISO block, and why it is on the site

For three rounds this audit held ISO 9001 and ISO 45001 OFF the site. The
certificates in the Trust Wood profile (p82) are real —
`QAIS-Q-KSA-TW-10.22.020` and `QAIS-OH-KSA-TW-10.22.012`, issued by QACS,
scope "wood & furniture products manufacturing, supply and installation" — and
**both expired 13.12.2025**. An expired certificate is the exact class of claim
this audit exists to remove, so the note here read "they go up the day a
renewal arrives."

**They are up, and no renewal has arrived.** The client's finished Company
Profile S.F 2.4 prints an ISO CERTIFIED mark on p12 covering 9001, 14001 and
45001, and asked for the site's certifications section to match that page. That
is their document and their claim to make; this entry exists so that it is a
decision on the record rather than a regression somebody discovers later.

Three things a future reader needs:

1. **ISO 14001 is the weakest of the three.** 9001 and 45001 are expired
   certificates; 14001 has **no certificate in any document supplied**, at any
   date. It is not lapsed, it is unevidenced.
2. **The renewals are an open item with the client**, not a formality somebody
   has already handled. Nothing on the site says "valid" or gives a date, which
   is the one mercy of publishing a logo rather than a certificate number.
3. **The FSC number and the Intertek wording are still the checkable part.**
   They survive as the caption under the logo grid precisely so the section is
   not reduced to marks anyone could paste. If the ISO block is ever pulled,
   that caption is what the section falls back to.

`facts.ts` carries the same warning on `isoQuality`, `isoEnvironment` and
`isoSafety`, and `facts.test.ts` fails if any of the three loses its caveat.

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
| ~~"Strategic Trust for Advanced and Reliable Knowledge (STARK)"~~ | `landing.about.paragraphs[0]` | ❌ **THIS ROW WAS WRONG. RETRACTED — see "The full name" below.** It is set in the company's own logo. |
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

---

## A correction to this audit

**The audit's own scope was stated wrong, and it missed real copy.**

This file previously rested on the claim that all user-visible text lives in
`src/messages/{en,ar}.json` and that a sweep of the components found no
hardcoded strings. The second half of that was false, and it was not a near
miss:

- `DetailOverlay` captioned its two info panels with the literal English
  strings **"Best time to visit"** and **"Must-do activities"** — headings from
  the travel demo this route was ported from. They rendered on every project
  overlay in BOTH locales, so an Arabic reader was told, in English, the best
  time to visit a mattress.
- The same component hardcoded English `aria-label`s on its prev / next / close
  controls, where only a screen-reader user would ever have met them.
- `cards.tsx` shipped `alt="Cuisine"` on one image in every project.

None of it was reachable from the message files, so key parity, the dash rule,
the Arabic-consistency tests and the numeric provenance guard were all green
throughout — they can only police text that made it into the deck. The route's
own field names (`bestTime`, `activities`) had been kept from the demo too,
which is how the captions read as intentional for three rounds of review.

Fixed, and pinned by `components/gallery/localisation.test.ts`, which fails on
any JSX sentence or hardcoded accessible name in that directory. **The lesson
generalises: a ported route is where untranslated copy hides, and message-file
coverage says nothing about it.**

## Mattress photography (added after the audit; siesta added later)

Both brands now ship with the manufacturer's own product photography, in
`public/mattresses/`, six shots per model, classified from the client's source
folders by aspect ratio and alpha. This is the first real article photography on
the site.

- **blue: nine models.** The eight 2026 models plus **Blue 2**, which the client
  sent as a `blue` photo folder. Blue 2 has photos only, **no `info` sheet**, so
  it carries no construction or warranty copy anywhere: it is shown by its
  pictures and its name, and the `blueModels` fact is 9.
- **siesta: sixteen models.** The client's `siesta` folder, one sub-folder per
  model, closed the gap this file used to flag. The mattresses page now has a
  siesta range band (all 16) and the brand duet shows a real siesta room instead
  of the old placeholder; the gallery's siesta sub-tab is its sixteen models, in
  the catalogue's order (5 Luxury, 8 Eco Range, 3 Hospitality, profile p26).

Two things it is still NOT:

- **Not projects.** They are catalogue models, and every overlay says so. The
  mattress division still has no documented project reference; the copy names a
  model and a construction and claims no client, site or completion.
- **Never crossed.** blue photography never appears under a siesta name or the
  reverse (`siestaShot` / `blueShot` are separate). A crossed shot would tell a
  hotel it was looking at the contract range.

Held back per the standing decision on health claims: PUROTEX+ allergen
percentages, INTENSE(TM)/cortisol and SKIN+(TM) carotenoid appear in five of the
blue sheets and none of it ships — Skin Care's gallery entry describes its cover
construction and explicitly declines the fabric's marketed benefit. siesta copy
is drawn from the profile's one-line-per-model constructions (p26); nothing is
invented for the models whose source is thin.

## The full name: an audit finding that was wrong

This audit deleted `Strategic Trust for Advanced and Reliable Knowledge` from
the About section and recorded, in the table above, that it was **"in no
document"** and that the site was "telling readers the company's name means
something the company has never said it means."

That was false, and the evidence was on every page of the site while the claim
was being written:

- **`public/brand/logo-lockup-white.png`** — the lockup rendered in the nav and
  the footer of every route — sets `STARK` over the line
  `STRATEGIC TRUST FOR ADVANCED AND RELIABLE KNOWLEDGE`.
- **Company profile v3 (2026), slide 1** spells the acronym out letter by
  letter: S Strategic · T Trust · A Advanced · R Reliability · K Knowledge.

**Why it was missed.** The audit's method was to read the five source documents
and grep the copy deck. Both are text. A PNG is neither, so an asset that had
been shipping in the header since the first commit was never in the search
space at all — and "I did not find it" was written down as "it does not exist."

**The cost.** The client had already told their own customer the name was on
the site. It was removed between that conversation and their next look at it.

**The rule this sets.** *Brand assets are source documents.* A logo, a lockup,
a favicon, artwork with type in it — anything the company has approved and put
its name on carries claims, and those claims count. Before recording any string
as unsourced, check `public/brand/` and the brand guidelines' artwork pages,
not only the prose.

The name is restored at `landing.about.paragraphs[0]` in both locales. In
Arabic it stays in Latin script and untranslated: the expansion only works as
an acronym in English, no document renders it in Arabic, and inventing an
Arabic version to make the sentence flow would be precisely the failure mode
this whole audit exists to prevent.

## The 29-page profile (SP29): the sweep

The client delivered a finished, designed 29-page company profile and asked for the site
to be walked page by page against it. The site was already built to the v3 comment deck
below, so most of SP29 was already live verbatim (vision and mission, the six-step
process, the wood capacity grid, product ranges, brand copy and taglines, the 31 logos).
The deltas that shipped:

| Change | SP29 | Note |
|---|---|---|
| Mega-projects `3` → `2` | p8 | The stat band now agrees with `landing.features` ("two mega-projects"); the v3 deck's 3 is superseded. `FACTS.megaProjects`. |
| Sectors `6` → `8` | p11 | Adds Educational and Mixed-use developments. `landing.about.paragraphs[0]` plus new `landing.about.sectors` chips. |
| Geographic reach (new) | p27 | Current markets: KSA all regions, Bahrain, Yemen. Future expansion: UAE, Kuwait, Qatar, Lebanon, Syria, Oman, Jordan, Iraq, Egypt, Sudan. New `landing.markets` + `Markets.tsx`. Typographic, not the map. |
| BLUE technologies (new) | p22 | Six construction technologies (Memory Foam, Natural Latex, Pocket Springs, Micro/Mini Pocket, TPE Support, Custom Comfort). `mattresses.models.tech`. **Health-claim tech held back:** PUROTEX+, INTENSE, COMBOCOOL, SKIN+ omitted per the standing decision. |
| Engineering services named | p9 | Design development, Technical office support, Shop drawings, Value engineering, Interior design, Project coordination. `landing.categories.engineeringServices`. |
| Domain **resolved** | p28 | Back page prints `info@stark.com.sa` and `STARK.com.sa`, closing the `stark-ksa.net` question in favour of `stark.com.sa`. `CONTACT_EMAIL`. |

⚠ **The back page omits the phone.** SP29 p28 shows only email, city and domain; the site
keeps `+966 56 200 1435` (still sourced to SP p20), at the client's request. See
`FACTS.contactPhone`.

**Kept, not changed:** the mattresses page still says SLIC was the Kingdom's "first" foam
factory (sourced to SIESTA p3); SP29 softens this to "one of the pioneering national
companies in foam manufacturing". The stronger claim has its own source, so it stays; the
softer wording is recorded here as a nuance only.

## Company profile v3 (2026): what changed

The client returned a commented deck after the round-3 review. It is the
authority for the following, and it OVERRIDES the earlier profile where they
disagree:

| Claim | Slide | Note |
|---|---|---|
| Vision and mission, EN and AR | 2 | Now verbatim from the client, both locales |
| `45+` years of experience | 6 | ⚠ See below |
| `60,000 m²` production and support facilities | 6 | Label changed from "manufacturing facility" |
| `200+` specialists | 6 | Unchanged |
| `3` mega-projects a year, SAR 100M annual value | 6 | **Was 2.** The SAR value is available and not yet printed |
| `500+` projects completed | 6 | New fifth stat |
| Six-step process | 6 | Design, Engineering, Value Engineering, Manufacturing, Quality Assurance, Delivery & Installation |
| Six wood product types | 14 | Replaces the substrate list |
| Woodworks annual capacity | 12 | 75M SAR, 1,500 hotel rooms, 30,000 doors, 90,000 m² wardrobes, 150,000 m² cladding, 35,000 LM kitchens |
| 60,000 mattresses a year | 15 | |
| BLUE and SIESTA brand copy | 16, 17 | siesta's tagline is finally correct: "You Deserve a Great Night" |
| 31 client logos | 10, 11 | Exported by the client themselves, which settles the permission question |

### ⚠ 45+ years against 1967

The deck states both and reconciles neither. Slide 1 tells the story from 1967
("over six decades"); slide 6 prints `45+ YEARS EXPERIENCE` as the headline
stat. Slide 1 shows where 45 comes from: the wood-industry family STARK
partnered with in 2026 has "more than 45 years of inherited expertise". So the
two figures measure different things, and a reader seeing `45+` above the fold
and "since 1967" below it has no way to know that.

Both ship. The client asked for `45+` in the stat band explicitly, and 1967 is
load-bearing for the SLIC heritage narrative on the About and Mattresses pages.
The contradiction is recorded on `FACTS.established.caveat` and on the client
question list. **It is not resolved, only disclosed.**

### The instruction that was dropped, and why

Deck slide 16 asks to mention retail showrooms and online sales. No document
gives a showroom address, a city list or a store URL, so there is nothing to
state. It is on the client question list rather than on the page.

## The client wall: 31 real logos (slides 10-11)

The wall carried eight WORDMARKS — each client's name set in type rather than
their own artwork — because reproducing a third party's trademark on someone
else's website needs that third party's permission, and nobody had confirmed
STARK had it. The v3 export settles that: STARK sent the marks themselves, for
this purpose. The wordmark SVGs are deleted and the real artwork ships.

Provenance for each of the 31 is the same one line — *STARK company profile v3
(2026) slides 10-11, exported by the client as `Client logos/`* — so they are
not tabulated individually here. What is worth writing down is the three places
this differs from a straight import.

### ⚠ Two references were dropped

**Alshaya Group** and **Depa** were on the old wall, sourced from the wood
factory's own client wall (Trust Wood profile p38). Neither appears in the v3
export. They are real references and this is a deletion, not a correction — if
they belong on the wall they need artwork from the client like the other 31.
On the question list.

### ⚠ Mövenpick is included, and could be the wrong artwork

The old wall deliberately excluded Mövenpick: the mark on the factory's wall
was the ICE CREAM company, with "THE ART OF SWISS ICE CREAM" printed under it,
and on a page about hospitality manufacturing every visitor would read that as
the hotel group.

The v3 export's Mövenpick is 78px wide. Its sub-line is roughly three pixels of
type and does not resolve at 16x, so it cannot be told apart from the hotel
lockup by looking. The RELATIONSHIP is the client's own claim and is not in
question; what cannot be verified is whether this is the right lockup for it.
Included, and on the question list.

### The marks are processed, and what that does and does not mean

The sources are PowerPoint screenshot crops: 60-214px wide, every one on an
opaque plate, one reversed out of black, ink density varying seven-fold across
the set. The build script (`scratchpad/logos31/build.py`) keys off the plates,
scales each mark to a constant optical weight inside a fixed-height canvas, and
lifts the very lightest so they do not ghost out when the wall greyscales them.

That is levels, scaling and sharpening. **Nothing is redrawn and no detail is
invented** — several of these marks are genuinely low-resolution and look it on
close inspection, which is the honest outcome. Higher-resolution logo files
from the client would improve the wall and nothing else will.

---

## Woodworks: the product range and the capacity band (slides 12, 14)

Profile v3 supplied both, and both replaced copy that was written before anyone
had a wood-division document to write from.

### "Built like a factory, finished like a workshop" is gone

The client rejected the phrase without saying why, and the reason is on slide 12
in the annotation column: *"since we've entered the wood sector, we'd like to
move away from generic talk and focus more on the sector."* The line was a
rhetorical flourish that could have introduced any manufacturer of anything.

It was replaced with the client's own heading for that slide — **"From design
intent to crafted execution."** — rather than a new invention. A newly written
aphorism would have been the same mistake in different words.

A byte-identical duplicate of the old string sat at `woodworks.chapters.heading`
and reached no call site. Deleted with the original.

### The substrate list was demoted, not deleted

Slide 14's six product types (Doors & Panels, Interior Cladding, Furniture &
Joinery, Kitchens/Wardrobes/Vanities, Outdoor Wooden Structures, Retail Stands
& Podiums) took the section the substrates used to occupy.

The substrates — solid wood, wood panel, MDF, veneer, HPL, chipboard, with a
line each on where each is used — **stayed on the page** as a spec footnote
under the product strip (`woodworks.substrates`). They are the most checkable
copy on that page: a specifier reads them and learns something they can hold the
factory to. Deleting sourced detail to make room for marketing is the trade this
ledger exists to refuse.

The FSC chain-of-custody sentence moved with them, and had to. Attached to the
product cards it would have been claiming certification for finished goods,
which is not what a chain-of-custody certificate covers.

"Specialized wooden doors (FR, NFR, Acoustic)" is the client's own annotation
under slide 14 and is spelled out in the Doors & Panels body.

### ⚠ 150,000 m² cladding vs 40,000 m² of closet cladding

The slide-12 annotation lists both and does not say whether the second is part
of the first or additional to it. **Both ship, as two separate line items,
because that is exactly how the client wrote them** — and the band prints no
total, so the page asserts nothing about the relationship either way. If they
turn out to be nested, the fix is to merge two rows, not to change a number.
On the question list. Caveats are recorded on both facts.

### ⚠ Capacity is not output, and the copy says so

Every figure in that band is a ceiling the division is equipped to reach, not a
volume it has produced. `woodworks.capacity.sub` states this in as many words.
That sentence is load-bearing: without it the band reads as a record of last
year, which is a claim no document supports.

### ⚠ The certification logos on slide 13 were NOT added

Slide 13 is a sheet of marks — Vision 2030, FSC, Local Content, MODON, Saudi
Made, AWI, USGBC LEED, IFC, Intertek — and the slide-12 annotation asks for
"the ISO, sustainability and fire-resistance logos" to be placed.

None of them went on the site, and this is the one place in this round where a
direct client instruction was not carried out. A certification mark is a factual
claim that a named body has audited and certified this company. The evidence on
hand is a logo pasted into a slide, which is not that. The standards section
already prints only what is evidenced (FSC, with its certificate number) and
deliberately omits the two ISO certificates the factory holds because they
**expired on 13.12.2025**.

Placing a LEED or Intertek badge on that basis would be the invented-fact
failure this ledger exists to prevent, with legal exposure attached. What is
needed per mark: the certificate, its number, its holder and its expiry. On the
question list.

### ⚠ The product photographs do not show the products

All six product cards use recoloured domestic-interior stock. Card 05 shows an
indoor room under "Outdoor Wooden Structures". The order was reassigned to the
least-bad mapping available and documented at
`landingImages.woodworks.products`, but no reordering fixes it — there is no
photograph of a door, wall cladding, an outdoor structure or a retail podium
anywhere in the set. Treat as a launch blocker.

## Mattresses: two brands in their own words, and one offer withdrawn (slides 15, 16, 17)

Profile v3 gives the mattress division three slides where it previously had a
catalogue and a folder of product sheets. Slide 15 is the division; 16 is blue;
17 is siesta. Between them they supply the copy this page had been paraphrasing,
plus two corrections and one deletion.

### The 50-night trial was removed, and the fact was deleted rather than caveated

Slide 16's own artwork strikes the clause through mid-sentence, and the comment
column says it plainly: *"الغاء فترة التجربة 50 يوم والابقاء على الضمان"* — cancel
the 50-day trial, keep the warranty.

The trial-terms document is real and still says what it always said. What changed
is the offer, not the paperwork, so the question was whether to leave
`blueTrialNights` in the ledger with a caveat. It was **deleted**, with a
tombstone comment in its place explaining why and warning against re-adding it
from the source document. The reason is mechanical: every registered fact
whitelists its digits for the whole copy deck, so an entry nobody consumes stops
being a citation and becomes a hole — a future "50 showrooms" would have passed
the provenance guard on the authority of a withdrawn trial offer.

⚠ **The instruction had two sites, and the second one is invisible from this
page.** Besides the brand panel, the trial was an overlay spec on the gallery's
Pure Latex slide (`gallery.bluePureLatex.overlaySpecs`). Anyone applying this
change by looking at the mattresses route would have shipped half of it.

### siesta's warranty is a ceiling and must keep its "up to"

Slide 17 states *"warranties of up to 10 years on selected models"*, which agrees
with the catalogue's own grading: 10 years on SENSICE, 5 on COMFORT, 3 on
STANDARD, 1 on SLEEP. `siestaWarrantyMaxYears` is registered separately from
`blueWarrantyYears` even though both are 10, because they are different claims
about different products from different documents, and the existing note on
blue's entry says the two brands must never share one warranty number.

`facts.test.ts` now fails if either locale loses the qualifier. Two words in the
middle of a sentence is exactly what a copy edit removes for tightness, and
removing them promises a decade on a mattress that carries twelve months.

### 60,000 is an output, not a capacity, and the wording is deliberate

Slide 15's annotation reads *"60,000 مرتبة في السنة"* — sixty thousand mattresses
in the year. There is no word for capacity, ability or equipment anywhere in the
line, unlike slide 12's wood figures, which are explicitly annotated as what the
division is *equipped* to produce.

So the woodworks page says "Annual production capacity" and this page says
"Mattresses a year", and the difference between them is invisible to anyone who
has not read both slides. It looks exactly like an inconsistency somebody should
tidy up. `facts.test.ts` fails if this label ever acquires the word "capacity" in
either locale, because tidying it would turn a production figure into a bigger
claim about the same factory.

### Retail and distribution are mentioned. Online sales is not.

The client asked twice: slide 15 for *"نقاط بيع التجزئة"* and *"نقاط التوزيع
المنتشرين في المملكة"*, slide 16 for *"معارض تجارية"* and *"البيع اون لاين"*.

Retail points, distribution partners and direct project supply are now stated in
the credentials band. They are claims about *how* the company sells, they need no
destination, and they name no address — which matters, because **no showroom
address exists in any document supplied**.

**Online sales was left out.** There is no store URL anywhere in the five source
documents. A site that says "buy online" with nothing to click is a worse answer
to the request than not answering it yet. Needs a URL, then it ships.

### The first factory keeps its size and loses its street

`credentials.items[0]` said the plant was "on Madinah Road" and that the company
"works today from the Al Fadel district on Old Makkah Road". The client asked for
both to go. What survives is what the Siesta catalogue p3 supports and the client
did not object to: a first foam factory, 15 people, 6,000 m², foam mattresses and
pillows.

### Photography: one real gain, one placeholder replaced, one gap unchanged

- **The range band is real.** Eight product cut-outs of blue's eight 2026 models,
  from the client's own folders. The page previously used three photographs while
  forty-eight sat unused — the client's note was that it "lacks a lot of
  pictures".
- **No per-model copy ships with them.** Three of the eight product sheets carry
  health claims (allergen-reduction percentages, cortisol, carotenoid) which do
  not go on the site. Writing a paragraph per model would mean repeating those or
  inventing eight substitutes, so the band carries names and photographs only.
- **siesta stopped borrowing the woodworks hero.** Its panel was pointed at a file
  byte-identical to the photograph that opens the woodworks route, so one image
  did two unrelated jobs and siesta's was being illustrated by a living room with
  no bed in it. It now has a hotel bedroom with no legible mattress brand — which
  is the point, since a blue product under siesta's name would tell a hotel buyer
  it was looking at the contract range.

⚠ **TODO(F-content): there is still no siesta photography.** The range band says
so on the page rather than leaving a reader to assume eight models is the whole
catalogue. Real siesta shots remain a client dependency.

### An alt-text bug that shipped and was caught by grep

`models.alt` is a template with a `{name}` hole. next-intl reads `{name}` as an
ICU argument, so `t("models.alt")` did not return the template — it failed and
emitted the KEY, and all eight images rendered `alt="mattresses.models.alt"`.

It type-checked, it rendered, the pictures looked right, and no test failed,
because alt text is the one string on a page that nobody sighted ever sees. The
only people affected were the ones who could not check it themselves. Found by
curling the HTML and grepping for a dot-separated key; now guarded by
`BlueRange.test.tsx`, which asserts no rendered alt can look like a message key.

Use `t.raw` for any string containing braces that are not ICU arguments.

---

## The process becomes six steps, in the client's own words (slide 6)

Slide 6 carries a header, "Core Manufacturing Services :", and then a single
arrow chain:

> Design → Engineering → Value Engineering → Manufacturing → Quality Assurance
> → Delivery & Installation

Six titles, in that order, and nothing else. No bodies, no numbers, no
descriptions. The titles are therefore quoted; **the bodies below them are
written, not sourced**, and each clause was kept to something already evidenced
elsewhere in this file: the written quality plan with stated tolerances (TW),
installation by STARK's own teams and finishing on automated lines in its own
factories (both already live and unchallenged). No digit appears in any of the
six bodies, deliberately, because slide 6 supplies none for the chain and a
number here would need a `facts.ts` entry it cannot have.

### What was replaced, and the one claim that moved

The four steps this displaces were **Design, Source, Make, Install**. All four
titles are gone, not extended, because the client's chain is a replacement
rather than an addition.

⚠ **"Source" as a stage no longer exists on the home page.** Its body carried
the FSC chain-of-custody sentence, which is a real, certificated claim
(BMC-COC-010074) and not something to lose quietly. It was checked before the
step was removed: FSC survives twice on the woodworks route, in
`woodworks.materials.sub` and as a certification label, which is where the
certificate actually applies — it is Trust Wood's, not a group-wide mark. So
the claim did not leave the site, it stopped being made in the one place it was
least anchored. Nothing else in the four old bodies was unique to them.

### Why six steps made the animation more correct rather than less

The mark has six parts: five blades closing around a core (brand book p.8). The
four-step version could not consume them one-to-one, so it carried a separate
`CLOSING_PARTS` array that fired `#lg-b5` and `#lg-core` together on the last
step — two parts landing at once because four does not divide six, not because
anything happened there. The client's chain has exactly six stages. Every step
now completes exactly one part and the core lands on Delivery & Installation,
which is the step at which the parts genuinely become a whole.

`CLOSING_PARTS` is deleted. A new test asserts the step count and the part count
are equal in both locales, because adding a seventh step is otherwise a silent
failure: the extra step would scrub with no part of its own, and TypeScript
cannot see it, since the steps come out of a JSON file.

### The height budget, which broke on laptops rather than phones

This list lives in a pinned, `overflow-hidden` stage, so anything that does not
fit is cut off with no scrollbar and no error. The risk was known and written
into the component: *"if a title is ever added, re-do this arithmetic — do not
assume it still fits."* Two were added.

Two things the measurement found that the arithmetic did not:

1. **The stage is 563px at 390x667, not the 603px the comment claimed.** `svh`
   is the *small* viewport height, not the device's CSS pixel height. The
   four-step version had been living inside 40px less than its own docblock
   said, and fit anyway, which is exactly why nobody noticed.
2. **The clipping appeared on laptops, not phones.** Everyone expected 390x667
   to be the failure point. After the mobile end was paid for, the phone was
   clean at every width and **1366x768, 1280x720, 1440x800 and 1024x640 all cut
   the last step**, because desktop also renders the intro paragraph and sized
   these titles off `vw` alone. A wide, short window has plenty of the axis the
   type was measured against and none of the axis it needs.

The fix for (2) is the one the mark in this same section already uses:
`min(vw, svh, px)`, so the type shrinks on whichever axis is scarce. Spacing was
trimmed at the desktop end before type was, on the grounds that 123px of margin
and gaps costs a reader nothing to give back, where six visibly smaller titles
does.

⚠ **Do not trust the table in the docblock over the harness.** Scratchpad
`p5.mjs` walks the scrub to every step at four viewports in both locales and
reports the deepest *painted* pixel against the stage's bottom edge. It has to
skip collapsed accordion bodies explicitly: a closed step's `<p>` keeps its full
natural rect and is merely clipped by an `overflow-hidden` child, so measuring
it reports a page that is visibly fine as overflowing by 43px.

---

## The gallery becomes three levels (slides 8 and 14)

The client's gallery note asks for three tabs, and `landing.gallery.sub` now
names them in their order: **WOODWORKS, FURNITURE and MATTRESSES**. Under each,
the browsable level is what the factory makes.

⚠ **Furniture is a GALLERY tab, not a company sector, and the two must not be
conflated.** Slide 8's "three main sectors" are **Custom Wood Works**,
**Mattresses** and **Engineering & Technical Services**, and it files *"loose
furniture"* **inside** custom wood works. So the divisions section keeps
following slide 8, and nothing in the gallery's taxonomy should be copied back
into it. The gallery split is a browsing structure the client asked for on that
page specifically.

**The middle level is slide 14, verbatim**, less one type promoted upward:
Doors & Panels · Interior Cladding · Kitchens, Wardrobes & Vanities · Outdoor
Wooden Structures · Retail Stands & Podiums, with **Furniture & Joinery** lifted
out to become the Furniture tab and split into **Loose Furniture** (slide 8's
own term) and **Fixed Joinery** (slide 14's). Mattresses keeps exactly two:
blue and siesta.

### The three real references were filed by their own submittals' words

This is the part that could most easily have become an invented claim, so the
rule was: a project goes where the source document's scope language puts it, and
nowhere else.

| Reference | The document's own scope wording | Filed under |
|---|---|---|
| Mataf Extension | "Interior wood work, **door architrave**" | Woodworks ▸ Doors & Panels |
| King Salman Park CP04 | "**Joinery** and fit-out scope" | Furniture ▸ Fixed Joinery |
| NGHA Specialized Hospitals | "**Millworks**, architectural discipline" | Furniture ▸ Fixed Joinery |

Millwork and joinery are the same trade under two regional names (it is what the
AWI on slide 13 certifies), so NGHA lands there by the document's own term rather
than by resemblance. **None of the copy changed**: all three still say "approved
supplier for" and "prequalified", never "delivered". The sub-category is a filing
decision, and it was made to match the paperwork rather than to fill a tab.

### Seven entries are capabilities, not projects

Five product types have no documented project reference at all, so the structure
could only be built by adding entries that describe **what the factory makes**:
five woodworks types, Loose Furniture, and a siesta range entry. Their copy comes
from slide 14's product descriptions and slide 8's sector copy.

Not one of them names a client, a site, a date or a completion. Each subtitle
says "Product range" in as many words and each overlay summary states outright
that the entry describes a manufacturing capability rather than a delivered job.
That framing is load-bearing: it is what stops a stock photograph under
"Interior Cladding" from reading as cladding STARK installed somewhere.

**siesta is a range, not models, and its pictures are rooms, not products.** blue
has the manufacturer's own product photography and named constructions; siesta
has one paragraph on slide 13 and nothing else. Putting a blue product shot under
siesta's name would misstate the contract range to a hotel buyer, which is the
same failure flagged when the two brands shared one photograph in the duet.

### ⚠ The photography gate was raised, 18 cells to 60

`projects.test.ts` holds a deliberately failing gate on filler imagery, and its
note said "it must never go up". It went up, so the argument is recorded here as
well as there: seven new entries at six cells each is 42, on top of the 18 that
were already filler.

The 42 are a **less** dangerous kind than the 18. Generic photography captioned
"Mataf Extension" reads as a photograph *of* the Mataf Extension; the same
photograph under "Interior Cladding, product range" overstates far less. But it
still fails, and it should: every one of the 60 is a room somebody else
photographed. The two halves need different things to close, and both are open:

1. **Project photography** for the three named references.
2. **Product photography** for the seven capability entries, without which the
   gallery is a structure rather than a portfolio.

### For the client

- **The blue-room stock photograph under Loose Furniture** is a domestic
  interior with a wall painting, a toy and a houseplant. It is filler like the
  rest, but it reads worse than the rest, and it is the first thing a visitor to
  the Furniture tab sees after the hero. Real furniture photography retires it.
- **Nine sub-tabs is the client's structure, not a proposal.** Five of the nine
  currently hold a single capability entry each. That is honest, but it is thin,
  and it is thin in a way only real work photographs will fix.
