/**
 * Test environment shims.
 *
 * ONE THING ONLY, and it is a jsdom gap rather than a product concern: jsdom
 * does not implement `window.matchMedia`. Every real browser does, and every
 * server render skips it via an explicit snapshot, so guarding for its absence
 * inside `useMediaQuery` would be production code apologising for a test
 * environment. It belongs here.
 *
 * The default answer is `false` — no query matches. That is the same
 * conservative default `useMediaQuery` gives the server, so a component under
 * test renders its base variant unless the test says otherwise. A test that
 * needs a query to match stubs `window.matchMedia` itself (see
 * GalleryShell.test.tsx), and its stub wins because it is installed later.
 *
 * Deliberately does NOT register a global `afterEach(cleanup)`. Files here opt
 * into cleanup explicitly, and adding it globally would silently change the
 * behaviour of any test that currently relies on the DOM persisting.
 */
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
