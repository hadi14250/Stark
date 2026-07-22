/**
 * Client reference manifest — the wall's single source of truth.
 *
 * ALL 31 ARE REAL, AND ARE THE CLIENT'S OWN ARTWORK. They come from the folder
 * of logos STARK exported for this purpose alongside company profile v3, where
 * the same set appears across slides 10 and 11 as "CLIENTS & PARTNERS". That
 * export settles the two things that had this section on placeholders for four
 * rounds:
 *
 *   PERMISSION. The wall used to carry eight WORDMARKS — each client's name set
 *   in type rather than their trademarked artwork — because reproducing a third
 *   party's logo needs their permission and nobody had confirmed STARK had it.
 *   Exporting the marks and asking for them to go on the site is that
 *   confirmation. The wordmark SVGs are deleted; this is the real thing now.
 *
 *   WHO THE CLIENTS ARE. The eight were assembled from the wood factory's own
 *   client wall and cross-checked against project submittals. These 31 are
 *   simply what STARK says its client list is.
 *
 * ⚠ TWO REFERENCES WERE DROPPED and it was not an oversight: ALSHAYA GROUP and
 * DEPA were on the old wall (Trust Wood profile p38) and are absent from the
 * client's v3 export. They are real references, so this is worth a question
 * rather than a silent deletion — if they belong on the wall, they need artwork
 * from the client like the other 31.
 *
 * ⚠ MOVENPICK IS INCLUDED, WITH A CAVEAT. The old wall deliberately left it out
 * because the mark on the factory's wall was the ICE CREAM company, not the
 * hotel group. The v3 export's mark is 78px wide and its sub-line resolves to
 * roughly three pixels of type, which is not enough to tell the two lockups
 * apart even at 16x. The relationship is the client's own claim and it stays;
 * what cannot be verified is whether this is the right artwork for it. If it is
 * the ice-cream lockup, STARK needs to send the hotel one.
 *
 * THE ASSETS ARE PROCESSED, NOT RAW. The sources are PowerPoint screenshot
 * crops: 60-214px wide, all on opaque plates, one reversed out of black, and
 * with ink density varying seven-fold across the set. The build script is kept
 * at scratchpad/logos31/build.py and its header explains each pass. The two
 * decisions that matter to anyone reading THIS file:
 *
 *   1. OPTICAL SIZE IS BAKED INTO THE ASSET. Every canvas is exactly 96px tall
 *      and the mark inside it is scaled so the set balances — a square crest
 *      fills more of its canvas than a long wordmark does, because at equal
 *      rendered height a crest would otherwise look half the weight of the
 *      wordmark beside it. The component keeps one rule ("render everything at
 *      the same height") and the judgement lives in the pixels, where it can be
 *      seen. This is why every `height` below is 96 and only `width` varies.
 *   2. THEY ARE TRANSPARENT PNGs. The plates are keyed off, so the marks sit on
 *      the sand surface rather than in white boxes.
 *
 * Adding a real one is a data change: run the build script over the new source,
 * add a row here, add its `alt` to the `landing.clients.logos` message array in
 * BOTH locales. No component edit — the row scales itself to whatever it gets.
 */

export type ClientLogo = {
  /** Path under public/. Transparent PNG, 96px tall — see the note above. */
  src: string;
  /** Intrinsic size, needed by next/image to reserve space without CLS. */
  width: number;
  height: number;
  /** Stable key into `landing.clients.logos` for the accessible name. */
  key: string;
};

/**
 * ORDER IS DELIBERATE, not alphabetical.
 *
 * `CLIENT_ROWS` splits this list by alternating index, so position here decides
 * which row a mark lands in and what each row opens with. The list is arranged
 * so both rows begin on marks a visitor will recognise instantly and so the
 * hotel operators do not all end up stacked in one row — 12 of the 31 are hotel
 * brands, and sorted any other way they clump.
 */
export const CLIENTS: readonly ClientLogo[] = [
  { key: "saudi-binladin-group", src: "/clients/saudi-binladin-group.png", width: 92, height: 96 },
  { key: "hilton", src: "/clients/hilton.png", width: 73, height: 96 },
  { key: "nesma-partners", src: "/clients/nesma-partners.png", width: 111, height: 96 },
  { key: "intercontinental", src: "/clients/intercontinental.png", width: 137, height: 96 },
  { key: "el-seif", src: "/clients/el-seif.png", width: 91, height: 96 },
  { key: "novotel", src: "/clients/novotel.png", width: 131, height: 96 },
  { key: "red-sea", src: "/clients/red-sea.png", width: 126, height: 96 },
  { key: "ramada", src: "/clients/ramada.png", width: 118, height: 96 },
  { key: "acciona", src: "/clients/acciona.png", width: 103, height: 96 },
  { key: "four-points-by-sheraton", src: "/clients/four-points-by-sheraton.png", width: 82, height: 96 },
  { key: "rolaco", src: "/clients/rolaco.png", width: 65, height: 96 },
  { key: "swissotel", src: "/clients/swissotel.png", width: 134, height: 96 },
  { key: "mbl", src: "/clients/mbl.png", width: 82, height: 96 },
  { key: "movenpick", src: "/clients/movenpick.png", width: 151, height: 96 },
  { key: "kayan", src: "/clients/kayan.png", width: 90, height: 96 },
  { key: "shaza", src: "/clients/shaza.png", width: 127, height: 96 },
  { key: "macc", src: "/clients/macc.png", width: 89, height: 96 },
  { key: "elaf", src: "/clients/elaf.png", width: 75, height: 96 },
  { key: "unec", src: "/clients/unec.png", width: 71, height: 96 },
  { key: "sands-hotel-and-spa", src: "/clients/sands-hotel-and-spa.png", width: 65, height: 96 },
  { key: "awan", src: "/clients/awan.png", width: 94, height: 96 },
  { key: "casablanca", src: "/clients/casablanca.png", width: 81, height: 96 },
  { key: "unidecor", src: "/clients/unidecor.png", width: 104, height: 96 },
  { key: "touq-balad-hotel", src: "/clients/touq-balad-hotel.png", width: 91, height: 96 },
  { key: "sbcm", src: "/clients/sbcm.png", width: 83, height: 96 },
  { key: "digital-city", src: "/clients/digital-city.png", width: 88, height: 96 },
  { key: "jabal-edsas", src: "/clients/jabal-edsas.png", width: 102, height: 96 },
  { key: "bmc", src: "/clients/bmc.png", width: 82, height: 96 },
  { key: "menabev", src: "/clients/menabev.png", width: 84, height: 96 },
  { key: "al-adwani-general-hospital", src: "/clients/al-adwani-general-hospital.png", width: 109, height: 96 },
  { key: "royal-saudi-naval-forces", src: "/clients/royal-saudi-naval-forces.png", width: 63, height: 96 },
] as const;

/**
 * Split into two rows that scroll against each other.
 *
 * Alternating rather than halving in place: taking every other logo means the
 * two rows are visibly different from the first frame, where two contiguous
 * halves would sit under each other looking like one list that wrapped. With an
 * odd count the first row gets the extra mark.
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
 * cycle drags a visible empty gap across the screen.
 *
 * WAS 3, FOR EIGHT LOGOS. One set of four was roughly 970px, so a half-track
 * needed three sets to clear a wide display. With 31 logos a single set is
 * already ~2.4-2.7k, so the same guarantee costs two sets instead of three —
 * and that matters, because this number multiplies the DOM: each step of it
 * adds ~62 `<img>` elements across the two rows for a band that is decoration.
 *
 * IT CANNOT GO TO 1, and the margin is the interesting part. The two rows come
 * to ~5.1k combined, so even split perfectly evenly neither half would clear
 * 2560 on its own — the set is about 100px short of the wide-display ceiling.
 * `Clients.test.ts` recomputes this from the widths in the manifest, so
 * dropping a logo cannot silently reintroduce the gap.
 */
export const SETS_PER_HALF = 2;

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
 *
 * NOTE that 44px is the height of the CANVAS, not of the mark: every asset is a
 * 96px-tall canvas with the mark optically sized inside it, so the ink renders
 * shorter than 44px by a different amount per logo. That is the point — see the
 * manifest docblock.
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
