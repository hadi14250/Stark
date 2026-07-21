import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const brand = join(here, "../../../public/brand");

/** PNG IHDR colour type: 8-byte signature + 4 length + 4 "IHDR" + 4 w + 4 h + 1 depth. */
function pngColourType(file: string): number {
  const buf = readFileSync(file);
  expect(buf.subarray(1, 4).toString("ascii"), `${file} is not a PNG`).toBe("PNG");
  return buf[25];
}

const HAS_ALPHA = new Set([4, 6]); // 4 = grey+alpha, 6 = RGBA

describe("the site chrome carries the logo, not a picture of the logo", () => {
  /**
   * WHAT SHIPPED, and what this stops coming back.
   *
   * Nav and Footer both used `logo-horizontal-white.png` — a 660x420 export
   * with the brand's mid-green (#1C3D2E) baked in as an opaque background. The
   * nav bar is a DIFFERENT green (--color-nav-bg, #142c21), so the asset read
   * as a lighter-green rectangle floating on a darker-green bar, with the white
   * mark inside it. Three greens where the design has one surface.
   *
   * Nothing caught it. The file existed, the import resolved, next/image
   * reserved the right box and every test passed; it was only ever visible by
   * looking at the page. So the property is pinned here instead.
   */
  it("uses a lockup with real transparency", () => {
    expect(HAS_ALPHA.has(pngColourType(join(brand, "logo-lockup-white.png")))).toBe(true);
  });

  it("keeps the plated export out of the whole app", () => {
    // Scanned across src/ rather than over Nav and Footer alone: those two are
    // where it went wrong, but the asset is still on disk (it is the master the
    // transparent lockup was cut from) and the next component to want a logo
    // can reach for it just as easily.
    const offenders = readdirSync(join(here, "../.."), { recursive: true, encoding: "utf8" })
      .filter((f) => /\.(tsx?|css)$/.test(f) && !/\.test\.tsx?$/.test(f)) // this file names the asset
      .filter((f) => /logo-horizontal-\w+\.png/.test(readFileSync(join(here, "../..", f), "utf8")));
    expect(offenders, "these import a logo export with a background plate baked in").toEqual([]);
  });

  it("renders the lockup at or above the brand book's 80px floor", () => {
    /**
     * Brand guidelines p11, "Minimum Logo Scaling": 80px is the smallest the
     * horizontal lockup may be drawn, because below that the second line of the
     * mark stops resolving. The nav shipped it at 44px — 45% of the floor —
     * which is why the tagline read as a grey smudge.
     *
     * The heights below are converted through the asset's own aspect ratio
     * rather than hard-coded, so re-exporting the lockup at a different crop
     * cannot silently push the rendered width back under the minimum.
     */
    const buf = readFileSync(join(brand, "logo-lockup-white.png"));
    const ratio = buf.readUInt32BE(16) / buf.readUInt32BE(20); // IHDR width / height

    for (const file of ["Nav.tsx", "Footer.tsx"]) {
      const src = readFileSync(join(here, file), "utf8");

      // Read the height off the LOCKUP's own className, not off the file at
      // large — Nav's burger is `h-11 w-11` and its bars are `h-16`/`h-10`, so
      // a file-wide scan for `h-N` would happily "find" a compliant size that
      // belongs to some other element entirely.
      const image = src.match(/<Image[^>]*?src=\{logoLockup\}[\s\S]*?\/>/);
      expect(image, `${file} does not render the lockup`).not.toBeNull();
      const className = image![0].match(/className="([^"]+)"/);
      expect(className, `${file}'s lockup has no className to size it`).not.toBeNull();

      const heights = [...className![1].matchAll(/(?:^|:)h-(\d+)\b/g)].map((m) => Number(m[1]) * 4);
      expect(heights.length, `${file}'s lockup is not sized by an h-N class`).toBeGreaterThan(0);

      for (const h of heights) {
        expect(
          Math.round(h * ratio),
          `${file} draws the lockup at ${Math.round(h * ratio)}px, under the 80px floor`,
        ).toBeGreaterThanOrEqual(80);
      }
    }
  });
});
