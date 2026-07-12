/**
 * Mattresses ("Dreamzy") image manifest — semantic keys → public paths.
 *
 * Files live in `web/public/mattresses/` under their original handoff names.
 * This is the ONE place that maps them to meaning; alt text lives in the
 * `dreamzy` messages namespace.
 *
 * ⚠ TODO(assets) — LAUNCH-VISIBLE: these are the handoff's placeholder photos,
 * and several have DREAMZY / English marketing baked into the pixels:
 *   - `hero` — the mattress has "dreamzy" printed on it, and a "DREAMZY REVIEWS"
 *     tab is burned into the top-left (our real "STARK REVIEWS" tab renders over
 *     the band, but the baked one still peeks out on the photo).
 *   - `buyset` (DESKTOP only) — an ENGLISH "Buy a set … Dreamzy … Save up to $300
 *     / Shop now" card is baked into the photo. Our real STARK overlay card covers
 *     it in EN (both left-aligned) but NOT in AR (our card mirrors to the right,
 *     exposing the baked English card on the left).
 *   - `testimonial` (DESKTOP only) — a "Lorem ipsum … John Doe" card + stars are
 *     baked in (same EN-covers / AR-exposes behaviour).
 *   - `avatar` — a stock face, not a real STARK customer.
 * None are watermarked, so the page renders correctly — but every image MUST be
 * swapped for real STARK product photography (clean, no baked text) + a real
 * customer avatar before a public launch. That is a one-file change here; the
 * buy-set + testimonial overlay copy is real HTML and survives the swap.
 *
 * MOBILE crops (`buysetMobile` / `testimonialMobile`) are the handoff's
 * mobile-only card-FREE photos — clean scenes with no baked promo/testimonial
 * card (on mobile the card is real HTML stacked beneath the photo). So the
 * AR "exposed baked English card" problem does NOT exist at mobile width; only
 * the desktop `buyset` / `testimonial` photos carry it. They still bake "dreamzy"
 * elsewhere in the scene and remain placeholders to replace, but they are safe in
 * both locales.
 */

const base = "/mattresses";

export const bedImages = {
  /** Hero — full-bleed bedroom scene (shared desktop + mobile). */
  hero: `${base}/hero-bedroom.png`,
  /** Mattress product block (bleeds right on desktop, photo-on-top on mobile). */
  mattress: `${base}/product-mattress.png`,
  /** Pillow product block (contained, image left; photo-on-top on mobile). */
  pillow: `${base}/product-pillow.png`,
  /** Comforter product block (bleeds right on desktop, photo-on-top on mobile). */
  comforter: `${base}/product-comforter.png`,
  /** "Buy a set" — full-bleed lifestyle scene, white card overlaid (DESKTOP). */
  buyset: `${base}/buyset-photo.png`,
  /** "Buy a set" — mobile card-FREE crop; card stacks beneath (no baked text). */
  buysetMobile: `${base}/buyset-mobile.png`,
  /** Testimonial — full-bleed customer scene, teal card overlaid (DESKTOP). */
  testimonial: `${base}/testimonial-photo.png`,
  /** Testimonial — mobile card-FREE crop; card stacks beneath (no baked text). */
  testimonialMobile: `${base}/testimonial-mobile.png`,
  /** Testimonial avatar (56px circle). ⚠ stock face — replace before launch. */
  avatar: `${base}/avatar-john.png`,
} as const;
