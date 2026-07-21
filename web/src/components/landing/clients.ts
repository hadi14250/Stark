/**
 * Client reference manifest — the wall's single source of truth.
 *
 * These eight are real. They come from the wood factory's own client wall
 * (Trust Wood profile p38, 25 marks), and the first three are corroborated by
 * a second document: Saudi Binladin Group appears on the Mataf Extension
 * submittal, Nesma & Partners on the National Guard hospitals submittal, and
 * Modern Building Leaders on the King Salman Park prequalification. They
 * replace eight invented companies -- Northvale, Atlas Group, Meridian,
 * Kawkab, Summit Co., Halcyon, Vertex, Rawabi -- that did not exist.
 *
 * THE SELECTION IS CONTRACTORS AND DEVELOPERS ONLY, and that is deliberate.
 * The factory's wall also carries Hilton, Fairmont, St Regis and Swissotel,
 * where it is not clear from any document whether the relationship was with
 * the operator or with a project that happened to carry the flag. A
 * manufacturer's client wall of contractors reads consistently and asserts
 * nothing it cannot support.
 *
 * MOVENPICK IS DELIBERATELY ABSENT. The mark on the factory's wall is the
 * ice-cream company ("THE ART OF SWISS ICE CREAM" is printed under it), not
 * Movenpick Hotels & Resorts. On a page about hospitality manufacturing, that
 * logo would be read as the hotel group by every single visitor.
 *
 * ⚠ THESE ARE WORDMARKS, NOT THE CLIENTS' LOGOS. Each asset sets the company
 * NAME in type. Reproducing a company's actual trademarked artwork on a third
 * party's website is a separate act that needs their permission, and that
 * permission is still outstanding (SOURCES.md, open question 5). Naming a
 * reference is ordinary practice and the client publishes these names in their
 * own profile; copying the artwork is not, so it waits.
 *
 * Adding a real one is a data change: drop the asset in public/clients/, add a
 * row here, add its `alt` to the `landing.clients.logos` message array. No
 * component edit -- the row scales itself to whatever it is given.
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

export const CLIENTS: readonly ClientLogo[] = [
  { key: "saudiBinladinGroup", src: "/clients/saudi-binladin-group.svg", width: 266, height: 48 },
  { key: "nesmaPartners", src: "/clients/nesma-partners.svg", width: 230, height: 48 },
  { key: "modernBuildingLeaders", src: "/clients/modern-building-leaders.svg", width: 267, height: 48 },
  { key: "redSeaDevelopment", src: "/clients/red-sea-development.svg", width: 267, height: 48 },
  { key: "elSeif", src: "/clients/el-seif.svg", width: 139, height: 48 },
  { key: "alshayaGroup", src: "/clients/alshaya-group.svg", width: 202, height: 48 },
  { key: "depa", src: "/clients/depa.svg", width: 97, height: 48 },
  { key: "acciona", src: "/clients/acciona.svg", width: 133, height: 48 },
] as const;

/**
 * Split into two rows that scroll against each other.
 *
 * Alternating rather than halving in place: taking every other logo means the
 * two rows are visibly different from the first frame, where two contiguous
 * halves would sit under each other looking like one list that wrapped.
 */
export const CLIENT_ROWS: readonly (readonly ClientLogo[])[] = [
  CLIENTS.filter((_, i) => i % 2 === 0),
  CLIENTS.filter((_, i) => i % 2 === 1),
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

/**
 * Rendered logo height, and the item padding, both at their desktop ceiling.
 *
 * 34 → 44px in the polish round. At 34px against a 55% opacity these read as
 * grey smudges on the sand surface rather than as marks anyone could identify,
 * which defeats the only purpose a client wall has. The row heights grow with
 * them; the loop arithmetic below is recomputed from these numbers, so the
 * change cannot silently open a gap in the ticker.
 */
export const LOGO_RENDER_HEIGHT = 44;
export const ITEM_PADDING_X = 60;

/** Width one repetition of a row occupies at desktop scale, in px. */
export function setWidth(row: readonly ClientLogo[]): number {
  return row.reduce(
    (total, logo) =>
      total + (logo.width * LOGO_RENDER_HEIGHT) / logo.height + ITEM_PADDING_X * 2,
    0,
  );
}
