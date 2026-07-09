/**
 * Woodworks ("Element") image manifest — semantic keys → public paths.
 *
 * Files live in `web/public/woodworks/` under their original handoff names
 * (already meaningful, unlike the landing's hashes). This is the ONE place that
 * maps them to meaning; alt text lives in the `element` messages namespace.
 *
 * ⚠ WATERMARKED PLACEHOLDERS — `barkLog`, `barkRight`, and `branch` are stock
 * images with visible watermarks baked into the pixels (PNGTREE / Vecteezy).
 * They are the design's DECORATIVE bark/branch/driftwood bleeds, gated behind
 * the `showTextures` flag so they can be turned off. They MUST be swapped for
 * licensed art before a real public launch — a one-file change here.
 * TODO(assets): replace barkLog / barkRight / branch with licensed textures.
 *
 * The product photos (chair/bed/floor/thumbs) and `barkLeft` are clean.
 */

const base = "/woodworks";

export const woodImages = {
  /** Furniture category photo (rustic reclaimed-wood chair). */
  chair: `${base}/chair.png`,
  /** Features category photo (live-edge headboard). */
  bed: `${base}/bed.png`,
  /** Flooring category photo (reclaimed plank floor). */
  floor: `${base}/floor.png`,

  /** Hero thumbnails — [live-edge table, rustic vanity, modern vanity]. */
  thumbs: [
    `${base}/thumb-table.png`,
    `${base}/thumb-vanity-rustic.png`,
    `${base}/thumb-vanity-modern.png`,
  ] as const,

  /** Hero dead-branch that grows + sways. ⚠ faint watermark remnant. */
  branch: `${base}/branch-clean.png`,
  /** Bark texture bleeds. ⚠ barkLog + barkRight are watermarked stock. */
  barkLog: `${base}/bark-log.png`,
  barkRight: `${base}/bark-right.webp`,
  barkLeft: `${base}/bark-left.webp`,
} as const;
