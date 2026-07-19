/**
 * Client logo manifest — the wall's single source of truth.
 *
 * TODO(F-content): EVERY LOGO HERE IS A PLACEHOLDER. These eight companies do
 * not exist; the marks were drawn for this build so the section could be
 * designed against realistic shapes (varied widths, mixed cap heights,
 * one-word and two-word lockups) instead of grey boxes.
 *
 * They MUST be replaced with real client logos before anything is shown to a
 * client or deployed to a public URL. A client wall is a factual claim about
 * who a company has worked for — shipping invented ones is not a placeholder,
 * it is a false statement on the front page. `Clients.test.ts` fails while any
 * file under public/clients/ is still one of these, so this cannot be
 * forgotten rather than decided.
 *
 * Adding a real one is a data change: drop the asset in public/clients/, add a
 * row here, add its `alt` to the `landing.clients.logos` message array. No
 * component edit — the row scales itself to whatever it is given.
 */

export type ClientLogo = {
  /** Path under public/. SVG preferred; a transparent PNG works too. */
  src: string;
  /** Intrinsic size, needed by next/image to reserve space without CLS. */
  width: number;
  height: number;
  /** Stable key into `landing.clients.logos` for the accessible name. */
  key: string;
};

/** @see the TODO above — placeholders, not real clients. */
export const PLACEHOLDER_CLIENTS: readonly ClientLogo[] = [
  { key: "northvale", src: "/clients/northvale.svg", width: 205, height: 48 },
  { key: "atlasGroup", src: "/clients/atlas-group.svg", width: 199, height: 48 },
  { key: "meridian", src: "/clients/meridian.svg", width: 185, height: 48 },
  { key: "kawkab", src: "/clients/kawkab.svg", width: 160, height: 48 },
  { key: "summitCo", src: "/clients/summit-co.svg", width: 186, height: 48 },
  { key: "halcyon", src: "/clients/halcyon.svg", width: 160, height: 48 },
  { key: "vertex", src: "/clients/vertex.svg", width: 164, height: 48 },
  { key: "rawabi", src: "/clients/rawabi.svg", width: 162, height: 48 },
] as const;

/**
 * Split into two rows that scroll against each other.
 *
 * Alternating rather than halving in place: taking every other logo means the
 * two rows are visibly different from the first frame, where two contiguous
 * halves would sit under each other looking like one list that wrapped.
 */
export const CLIENT_ROWS: readonly (readonly ClientLogo[])[] = [
  PLACEHOLDER_CLIENTS.filter((_, i) => i % 2 === 0),
  PLACEHOLDER_CLIENTS.filter((_, i) => i % 2 === 1),
] as const;

/**
 * How many times a row's logos repeat in HALF the ticker track.
 *
 * The seamless loop translates the track -50%, which is only seamless if half
 * the track is at least as wide as the viewport — otherwise the tail of the
 * cycle drags a visible empty gap across the screen. One set of four logos is
 * roughly 970px at desktop padding, so a single set per half breaks on
 * anything wider than a small laptop. Three gets a half-track near 2900px.
 *
 * `Clients.test.ts` recomputes this from the widths in the manifest against
 * WIDEST_SUPPORTED_VIEWPORT, so removing a logo or shrinking one cannot
 * silently reintroduce the gap.
 */
export const SETS_PER_HALF = 3;

/** The widest display the ticker must stay seamless on. */
export const WIDEST_SUPPORTED_VIEWPORT = 2560;

/** Rendered logo height, and the item padding, both at their desktop ceiling. */
export const LOGO_RENDER_HEIGHT = 34;
export const ITEM_PADDING_X = 60;

/** Width one repetition of a row occupies at desktop scale, in px. */
export function setWidth(row: readonly ClientLogo[]): number {
  return row.reduce(
    (total, logo) =>
      total + (logo.width * LOGO_RENDER_HEIGHT) / logo.height + ITEM_PADDING_X * 2,
    0,
  );
}
