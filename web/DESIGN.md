# STARK — Design System

One system, four pages. This document is the contract; `src/styles/tokens.css`
is the implementation. Where they disagree, the CSS is right and this file is a
bug.

The problem this system exists to solve: the site had three unrelated design
languages — `/` in Stark greens, `/woodworks` a dark/tan furniture template,
`/mattresses` a light/mint mattress template — and both division pages opted
out of the shared chrome entirely. The client rejected it.

---

## 1. Colour

### 1.1 The palette is official, and it had to be recovered from pixels

The values below are the brand book's own palette (p.22), sampled from the PDF
at 300dpi. This was necessary because `brand-guidelines.txt` — the extraction
everyone had been working from — **drops every colour page**; pages 21–26 come
out blank. As a result the prototypes had been built on eyeballed near-misses:

| Prototype used | Official | Off by |
|---|---|---|
| `#1C3C2D` | `#1C3D2E` brand green | 1–2 per channel |
| `#F3EFE6` | `#FAF5EF` off-white | 7–9 per channel |
| `#DBC9AC` | `#DBCAAD` sand | 1 per channel |

Individually invisible; collectively the reason nothing quite matched the
printed collateral. Official wins everywhere now.

### 1.2 Tier 1 — the 6 × 4 grid

**Scale convention: higher number = darker**, in every column.

| | 500 (base) | 400 | 300 | 200 |
|---|---|---|---|---|
| **Brand Green** | `#1C3D2E` | `#496357` | `#8D9D96` | `#BAC4BF` |
| **Neutral** | `#1D1D1B` | `#4A4A48` | `#8D8D8C` | `#BABABA` |
| **Sage** | `#679B83` | `#85AF9B` | `#B2CCC0` | `#D1E0D9` |
| **Warm Gray** | `#B0B6AA` | `#BFC4BB` | `#D7DAD4` | `#E7E8E5` |
| **Off-White** | `#FAF5EF` | `#FBF7F2` | `#FCF9F6` | `#FDFBFA` |
| **Sand** | `#DBCAAD` | `#E2D4BD` | `#ECE4D5` | `#F4EEE6` |

Two of those columns are greys. That matters: the graphite direction for
Woodworks is **brand-sanctioned, not invented** — Neutral and Warm Gray are
official ramps, so a factory page in greys is using the palette as published.

**Extensions (ours, not official).** The book stops at one brand green; the
nav/footer/panel ladder needs three steps below it. Never present these to the
client as brand values: `--green-700 #142C21`, `--green-800 #11271C`,
`--green-900 #0C1A13`, `--green-panel #16271E`.

**Sub-brands.** `--brand-blue #0E5C8D` (blue mattress · B2C retail) and
`--brand-siesta #5C2482` (siesta · B2B hospitality) are contained to their own
subtrees via `[data-brand]`. They are never site chrome.

### 1.3 Tier 2 — semantic roles

Components consume **only** these. Sixteen roles, and every one gets a value in
every theme — leaving one unassigned is how a theme leaks. (The first draft
left `--color-line` and `--color-field-*` out, so hairlines and form borders
stayed green on the graphite page.)

`--color-surface` · `-surface-2` · `-ink` · `-ink-body` · `-ink-muted` ·
`-accent` · `-accent-2` · `-interactive` · `-hero-bg` · `-nav-bg` ·
`-footer-bg` · `-panel` · `-line` · `-error` · `-field-surface` ·
`-field-border` · `-field-ring`

### 1.4 Contrast — every pair, computed

Enforced by `src/styles/contrast.test.ts`, which fails the build below 4.5:1 on
any text role. This is not decorative: the pre-redesign `--ink-cream-muted
#6E7C70` was **3.83:1 on the page background — a live WCAG failure on the
deployed site**, found by this test on its first run.

| Theme | Pair | Foreground | Background | Ratio | |
|---|---|---|---|---:|---|
| Home | ink on surface | `green-500` #1C3D2E | `white-500` #FAF5EF | 11.03:1 | **AAA** |
| Home | ink-body on surface | `green-400` #496357 | `white-500` #FAF5EF | 6.04:1 | AA |
| Home | ink-muted on surface | `green-400` #496357 | `white-500` #FAF5EF | 6.04:1 | AA |
| Home | ink on surface-2 | `green-500` #1C3D2E | `sand-200` #F4EEE6 | 10.37:1 | **AAA** |
| Home | ink-body on surface-2 | `green-400` #496357 | `sand-200` #F4EEE6 | 5.68:1 | AA |
| Woodworks | ink on surface | `neutral-500` #1D1D1B | `white-500` #FAF5EF | 15.57:1 | **AAA** |
| Woodworks | ink-body on surface | `neutral-400` #4A4A48 | `white-500` #FAF5EF | 8.19:1 | **AAA** |
| Woodworks | ink on surface-2 | `neutral-500` #1D1D1B | `warm-200` #E7E8E5 | 13.73:1 | **AAA** |
| Woodworks | ink-body on surface-2 | `neutral-400` #4A4A48 | `warm-200` #E7E8E5 | 7.22:1 | **AAA** |
| Mattresses | ink on surface-2 | `green-500` #1C3D2E | `white-300` #FCF9F6 | 11.40:1 | **AAA** |
| Mattresses | ink-body on surface-2 | `green-400` #496357 | `white-300` #FCF9F6 | 6.25:1 | AA |
| Dark | ink on surface | `white-500` #FAF5EF | `green-900` #0C1A13 | 16.52:1 | **AAA** |
| Dark | ink-body on surface-2 | `green-200` #BAC4BF | `green-800` #11271C | 8.82:1 | **AAA** |
| Dark | ink-muted on surface-2 | `green-300` #8D9D96 | `green-800` #11271C | 5.56:1 | AA |
| Dark | interactive (sage) on surface-2 | `sage-500` #679B83 | `green-800` #11271C | 4.95:1 | AA |
| Any | ink on accent fill on accent | `green-500` #1C3D2E | `sand-500` #DBCAAD | 7.44:1 | **AAA** |
| Any | accent on footer on footer | `sand-500` #DBCAAD | `green-900` #0C1A13 | 11.14:1 | **AAA** |
| Any | ink on nav on nav | `white-500` #FAF5EF | `green-700` #142C21 | 13.72:1 | **AAA** |
| Any | ink on sage fill on sage-300 fill | `green-500` #1C3D2E | `sage-300` #B2CCC0 | 7.00:1 | AA |

Sage, for the record — why it is not the interactive colour on light:

| Use | Ratio | Needs | |
|---|---:|---:|---|
| sage-500 text on off-white | 2.94:1 | 4.5:1 | **FAILS** |
| sage-500 border/ring on off-white | 2.94:1 | 3.0:1 | **FAILS** |
| sage-500 text on green-800 | 4.95:1 | 4.5:1 | PASSES |
| green-500 ink on a sage-300 fill | 7.00:1 | 4.5:1 | PASSES |

### 1.5 Sage has a job, and it is not the obvious one

Sage is an official column that the first draft imported and never assigned —
which guarantees arbitrary use later. It was given the *interactive* role
(link hover, success, active states), and then the contrast maths killed that
on light surfaces. The rule that survives:

- **On dark surfaces** — sage is the interactive colour. 4.95:1 on `green-800`.
- **On light surfaces** — sage may be a **fill** at the 300 step with
  `green-500` ink on it (7.0:1). It may **not** be a link, a border, a focus
  ring, or any mark: at 2.94:1 it fails the 3:1 non-text floor too.
- On light surfaces `--color-interactive` is the ink green instead, with the
  affordance carried by an underline or a sand marker rather than by hue.

---

## 2. Type

Sora (display) · Roboto (body) · Roboto Mono (eyebrow) · IBM Plex Sans Arabic
(all Arabic). Brand book hierarchy: Sora 32 Bold / Sora 21 SemiBold / Roboto 16
Medium / Roboto 15 Regular.

**Seven roles, not eight.** The first draft had an `h1` and an `h2` that were
the same role twice — same family, same weight, 5–13% apart, indistinguishable
below 900px. `h1` is gone; page openers use `display` at a reduced clamp.

| Token | Size | Weight | Use |
|---|---|---|---|
| `--text-display` | `clamp(48px, 6.4vw, 88px)` | Sora 300 + 600 pair | Hero, page openers |
| `--text-h2` | `clamp(28px, 3.8vw, 46px)` | Sora 700 | Section headings |
| `--text-h3` | `clamp(23px, 2.3vw, 31px)` | Sora 700 | Capability / panel titles |
| `--text-h4` | `clamp(18px, 1.6vw, 22px)` | Sora 600 | Card titles |
| `--text-lead` | `clamp(17px, 1.4vw, 19px)` / 1.75 | Roboto 400 | Hero sub, section intros |
| `--text-body` | 16px / 1.85 | Roboto 400 | Body |
| `--text-body-sm` | 14px / 1.75 | Roboto 400 | Card body, captions |
| `--text-eyebrow` | 12px, `.3em`, upper | Roboto Mono | Section eyebrows |

`h2`'s mobile floor is 28px, not 32 — 32 shouted next to a 72px section gap.

### 2.1 Arabic is a typography problem, not a font swap

Two things in the first draft were defects rather than infelicities, and both
only show up rendered:

1. **`letter-spacing` fragments Arabic.** Arabic letterforms connect; tracking
   pulls a word apart into loose glyphs. Every tracking token is zeroed under
   `[lang="ar"]`.
2. **`text-transform: uppercase` is a silent no-op.** The eyebrow's only
   differentiators were tracking and caps, so under Arabic it would have
   rendered as unstyled 12px body text.

With both unavailable the Arabic eyebrow gets a **native treatment** — weight,
accent colour, and a 24px sand rule. Sizes and leading also move: Plex Arabic
reads smaller than Sora at equal px, and Arabic ascenders plus diacritic stacks
need more line box (verified on **مُنفَّذة**, whose shadda+fatha stack collides
with the line above at `1.04`). Under `[lang="ar"]`: eyebrow 14px, body-sm
15px, display leading 1.35, h2 leading 1.3.

---

## 3. Space & shape

8px rhythm. `--space-section: clamp(72px, 9vw, 110px)`, multiplied by
`--density` per theme. Container 1180px (`--container-wide` 1440) with a 32px
gutter.

**Three radii, not six.** `999` pill · `24` card/panel · `12` image/input/icon.
The first draft had `28` and `32`, and `14`/`16`/`18` — imperceptible
differences that produce inconsistency rather than variety.

**Four shadows, none pure black on the brand shape.** The pentagon is the
mark's core element and the brand's Don'ts include "no drop shadow" on the
lockup, so every shadow is tinted with the brand green:
`--shadow-pentagon` · `--shadow-card` · `--shadow-panel` · `--shadow-nav`.

---

## 4. Per-page differentiation — four axes

Colour alone is not enough. Varying eight roles while holding spacing, type,
components and motion constant reads as *one template recoloured*, which is the
exact failure this redesign exists to fix. All four axes are token overrides on
the same `[data-theme]` mechanism — **zero new components**.

| Axis | Home | Woodworks | Mattresses |
|---|---|---|---|
| Ink ramp | green | neutral (graphite) | green |
| `--color-surface-2` | `sand-200` | `warm-200` | `white-300` |
| `--color-panel` | `green-800` | `neutral-400` | `green-800` |
| `--align-axis` | centred, symmetric | hard-left + standing rule | centred, band rhythm |
| `--density` | 1.0 | 0.8 (spec-sheet) | 1.15 (airy) |
| `--image-filter` | mixed, poster | close-crop, contrast | wide, high-key |

A factory page should feel like a spec sheet; a mattress page should feel like
rest. **The A0c comps found the alignment axis does more perceptual work than
the entire ink-ramp swap** — Home is centred and symmetric, Woodworks hangs off
a standing vertical rule, and that single difference is what reads.

Shared on purpose (the through-line): `--color-surface`, `--color-accent`, the
nav, the footer, the type scale, every component, and the motion language.

**Panel weight.** `--neutral-500` at panel scale read as a hole punched in the
page. Woodworks' panel is the `400` step — same graphite intent, a weight the
layout can hold.

---

## 5. Brand geometry

The mark is structural material, and it is the device that makes four
differently-coloured pages read as one brand.

### 5.1 The five blades already mean something

Brand book p.8: the logo is *"formed from five abstract 'S' elements, each
representing a core part of STARK's ecosystem"*, orbiting a centre that is
*"STARK as the core of all operations."* `DIVISION_ELEMENT` fixes the mapping:

| Element | Meaning |
|---|---|
| `#lg-core` | STARK itself — hub, turnkey, company-level slots |
| `#lg-b1` | Woodworks |
| `#lg-b2` | Interior Fit-outs |
| `#lg-b3` | Furniture |
| `#lg-b4` | Mattresses |
| `#lg-b5` | Turnkey Execution |

**Be honest about what this buys.** Users will not decode it — the five blades
are rotations of one wedge around a shared centre, which is what makes the mark
cohere and exactly what makes them indistinguishable at icon scale. This is not
a communication system. It is an **authoring constraint**: nobody on the build
ever picks a blade arbitrarily.

### 5.2 Four techniques

| | Technique | Component | Where |
|---|---|---|---|
| **G1** | Clip — pentagon silhouette, photo or panel | `PentagonClip` | Hero-adjacent, capability bands. Never small cards |
| **G2** | Field — large blades bleeding off edges | `BladeField` | Background layer, ambient **or** structural, never both |
| **G3** | Texture — mark behind content | `MarkTexture` | 4–8% opacity, behind content only |
| **G4** | Glyph — one element at icon scale | `MarkGlyph` | Eyebrows, section markers, division cards |
| — | Trace — the real logo strokes itself in | `LogoTrace` | Preloader + route curtain only |

### 5.3 Governance

1. **Countable per-page budget**: max 1 G2 field, 2 G1 pairs, 2 G3 instances.
   A reviewer checks this by counting, not by taste.
2. **Weight rule**: G2 is ambient *or* structural per page, never mixed.
3. Decorative geometry is always `aria-hidden` + `pointer-events: none`, never
   the sole carrier of meaning, never between text and its background.
4. **The lockup is inviolable; derived geometry is a separate layer.** The
   Don'ts govern the logo presenting *as* the logo; the book itself sanctions
   derived usage (p.26). A derived shape never appears near a real lockup at
   similar size and colour. The lockup lives in nav, footer and preloader only.
5. **G4 does not replace functional icons.** Contact rows and spec grids need
   *identification* — an abstract rotated wedge cannot say "phone".

### 5.4 What the comps corrected

- **G3 tile failed.** A 300px repeating pattern at 4% read as *wallpaper*
  competing with the copy. One large mark bleeding off an edge recedes properly.
  Prefer `variant="mark"` over `variant="tile"` on light surfaces.
- **G1 pentagons must overlap, not stack.** Two of the same silhouette in a
  column, pointing the same way, read as repetition and leave a void.
- **The photo ring needs a colour the section does not use.** `warm-300` on
  `warm-200` was invisible.
- **G4 at eyebrow scale is weaker than assumed.** A single blade at 14px reads
  as a stray mark, not a division signature. Give it room or leave it out.

---

## 6. Motion

### 6.1 Three libraries, all already installed

- **Framer Motion 12** — component reveals, `AnimatePresence`, and the gallery
  transition engine (whose effects are framer-native `TargetAndTransition`
  producers, so this one is non-negotiable).
- **GSAP 3 + ScrollTrigger** — scroll set-pieces: blade parallax, process line,
  marquee, scroll progress, count-ups.
- **Lenis** — smooth scroll, on `gsap.ticker` with `lagSmoothing(0)`, single RAF.

**Why GSAP rather than porting the prototype's scroll loop:** the prototype
reads `getBoundingClientRect()` on the element it translates, so the realised
parallax factor is `f/(1+f)`, not `f`. ScrollTrigger measures against a
transform-independent baseline, batches reads and writes, and handles RTL.

**Boundary rule** (`Reveal.tsx:31`): Framer owns component reveals, GSAP owns
scroll set-pieces. Never both on the same element or property.

### 6.2 The language

```
Durations   instant .15s · fast .25s · base .45s · reveal .85s · curtain .6s
Easing      standard cubic-bezier(.2,.8,.2,1)   reveals, fades
            zoom     cubic-bezier(.16,1,.3,1)   image zoom, card lift
            curtain  cubic-bezier(.76,0,.24,1)  preloader, route transitions
            line     cubic-bezier(.7,0,.2,1)    line draws
Stagger     cards 70ms · process 110ms · hero 120ms
Distance    y-sm 18 · y 24 · y-lg 30 · x 28
Ambient     marquee 30s · Ken Burns 18s · glow 7s · spin 26s · float 6–11s
```

The route curtain is **.6s, not 1.15s**. Three internal navigations on a
four-page site should not each cost over a second. The ceremony argument
justifies the preloader once per session; it does not justify a tax on every
click.

### 6.3 Reduced motion — three layers

1. `Providers` sets Framer `reducedMotion="user"` → every `Reveal`/`motion` inert.
2. `useGsap` no-ops its setup → every scroll set-piece skipped.
3. `tokens.css` sets `--motion-scale: 0` and neutralises animation/transition
   duration globally — the safety net for anything that slipped past 1 and 2.

Plus: preloader and route curtain skipped, Lenis not instantiated, gallery
transition forced to `crossfade`.

### 6.4 Fail-safes

Every observer-driven state gets a timeout that snaps to its final value with
`transition: none` — reveals, counters and line draws at 1500ms, hero intro at
`base + 1600ms`. **Content must never be invisible**, whatever the observer does.

---

## 7. The layering contract

Tailwind 4 emits everything into `@layer theme, base, components, utilities`,
and this has bitten the build three separate times. The rules:

1. **`tokens.css` is unlayered on purpose.** Unlayered declarations outrank
   every layered rule regardless of specificity, which is what lets Tier 3 beat
   component CSS. The consequence: **every Tier-3 theme block must live in
   `tokens.css`.** A theme block written in `@layer components` elsewhere
   silently loses no matter how specific it is.
2. **The gallery stylesheet is scoped and lives in its own layer after
   `utilities`.** Its `.grid` collides by name with Tailwind's `.grid` utility;
   scoping alone does not fix that, because layer order beats specificity. See
   `src/styles/gallery-stage.css`.
3. **Never import an unlayered third-party reset.** The gallery handoff's
   `globals.css` had one, and imported as-is it killed every spacing utility on
   all four routes and blacked out the page background.

---

## 8. Verification

- `pnpm test` — token parity, token consumers, contrast floors, component render.
- `pnpm build` — must pass. Vercel needs Root Directory `web` **and** Framework
  `Next.js` (framework `None` → all-404s).
- `/specimen` — the palette with live ratios, the type scale in EN and AR side
  by side, the geometry techniques with the division legend.
- Reduced motion via `browser_emulate_media` on every route.
- Grep `TODO(F-facts)` / `TODO(F-content)` before any client demo.
