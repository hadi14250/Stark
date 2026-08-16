# Country flags

Thirteen national flags, one per market named in the "Where we work" section
(`src/components/home/Markets.tsx`).

## Why files and not emoji

The obvious way to put a flag next to a country name is the regional-indicator
emoji (🇸🇦). It is one character, needs no asset, and scales with the type — and
it renders as two grey letter-boxes on Windows, in every browser, because
Windows ships no emoji flag glyphs. For a Saudi B2B audience that is a large
share of the traffic seeing "SA" in a box where the flag should be.

## Provenance

Copied verbatim from [`flag-icons`](https://github.com/lipis/flag-icons)
(MIT, © Panayiotis Lipiridis), 4x3 set. Regenerate with:

    pnpm add -D flag-icons
    for c in sa bh ye ae kw qa lb sy om jo iq eg sd; do
      cp node_modules/flag-icons/flags/4x3/$c.svg public/flags/$c.svg
    done
    pnpm remove flag-icons

The package is not a dependency — these thirteen files are, and they are static.

⚠ `sy.svg` is the CURRENT Syrian flag (green/white/black with three red stars),
not the pre-2024 one. Worth a client confirmation, as with any flag on a page
that names a country as a future market.
