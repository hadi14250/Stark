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
 *   - `buyset` — an ENGLISH "Buy a set … Dreamzy … Save up to $300 / Shop now"
 *     card is baked into the photo. Our real STARK overlay card covers it in EN
 *     (both left-aligned) but NOT in AR (our card mirrors to the right, exposing
 *     the baked English card on the left).
 *   - `testimonial` — a "Lorem ipsum … John Doe" card + stars are baked in (same
 *     EN-covers / AR-exposes behaviour).
 *   - `avatar` — a stock face, not a real STARK customer.
 * None are watermarked, so the page renders correctly — but every image MUST be
 * swapped for real STARK product photography (clean, no baked text) + a real
 * customer avatar before a public launch. That is a one-file change here; the
 * buy-set + testimonial overlay copy is real HTML and survives the swap.
 */

const base = "/mattresses";

export const bedImages = {
  /** Hero — full-bleed bedroom scene. */
  hero: `${base}/hero-bedroom.png`,
  /** Mattress product block (bleeds right). */
  mattress: `${base}/product-mattress.png`,
  /** Pillow product block (contained, image left). */
  pillow: `${base}/product-pillow.png`,
  /** Comforter product block (bleeds right). */
  comforter: `${base}/product-comforter.png`,
  /** "Buy a set" — full-bleed lifestyle scene, white card overlaid. */
  buyset: `${base}/buyset-photo.png`,
  /** Testimonial — full-bleed customer scene, teal card overlaid. */
  testimonial: `${base}/testimonial-photo.png`,
  /** Testimonial avatar (56px circle). ⚠ stock face — replace before launch. */
  avatar: `${base}/avatar-john.png`,
} as const;
