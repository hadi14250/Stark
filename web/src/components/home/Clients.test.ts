import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  CLIENT_ROWS,
  CLIENTS,
  SETS_PER_HALF,
  WIDEST_SUPPORTED_VIEWPORT,
  setWidth,
} from "@/components/landing/clients";

const here = dirname(fileURLToPath(import.meta.url));
const publicClients = join(here, "../../../public/clients");
const en = JSON.parse(readFileSync(join(here, "../../messages/en.json"), "utf8"));
const ar = JSON.parse(readFileSync(join(here, "../../messages/ar.json"), "utf8"));

describe("the ticker loops without a visible gap", () => {
  it("fills more than the widest supported viewport with half a track", () => {
    // This is the whole correctness condition for a -50% marquee. Half the
    // track must cover the viewport, or the end of every cycle drags an empty
    // stretch across the screen — which is what two copies of four logos did:
    // a ~970px half against a 1440px laptop, so a third of the row was blank
    // for part of every loop.
    for (const row of CLIENT_ROWS) {
      const half = setWidth(row) * SETS_PER_HALF;
      expect(half).toBeGreaterThan(WIDEST_SUPPORTED_VIEWPORT);
    }
  });

  it("splits the logos into two rows that share nothing", () => {
    const [a, b] = CLIENT_ROWS;
    const overlap = a.filter((logo) => b.some((other) => other.key === logo.key));
    // Two rows scrolling against each other showing the same logo twice reads
    // as padding rather than as a client list.
    expect(overlap).toEqual([]);
    expect(a.length + b.length).toBe(CLIENTS.length);
  });
});

describe("every logo is a real, described asset", () => {
  const files = new Set(readdirSync(publicClients));

  it("points at a file that exists", () => {
    for (const logo of CLIENTS) {
      expect(files.has(logo.src.replace("/clients/", ""))).toBe(true);
    }
  });

  it("declares the asset's true intrinsic size", () => {
    // next/image reserves space from these numbers. If they disagree with the
    // SVG's own viewBox the row shifts as the images load, which is exactly
    // the CLS the width/height props exist to prevent.
    for (const logo of CLIENTS) {
      const svg = readFileSync(join(publicClients, logo.src.replace("/clients/", "")), "utf8");
      const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      expect(viewBox, `${logo.key} has no viewBox`).toBeTruthy();
      expect(Number(viewBox![1])).toBe(logo.width);
      expect(Number(viewBox![2])).toBe(logo.height);
    }
  });

  it("has an accessible name in both locales", () => {
    for (const messages of [en, ar]) {
      const alts = messages.landing.clients.logos as { key: string; alt: string }[];
      for (const logo of CLIENTS) {
        const entry = alts.find((a) => a.key === logo.key);
        expect(entry, `${logo.key} missing alt`).toBeTruthy();
        expect(entry!.alt.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("the invented companies cannot come back", () => {
  /**
   * A client wall is a factual claim about who a company has worked for, and
   * for three rounds this one carried eight companies that do not exist. That
   * was never an unfinished placeholder; it was a false statement on the front
   * page, and it is the single worst thing the content audit found.
   *
   * The names are kept here as a blocklist rather than deleted with the files.
   * They are the exact shape of the mistake — plausible, well-drawn, correctly
   * sized marks that fill a row — and the next person short of a logo will
   * reach for something just like them.
   */
  const INVENTED = [
    "northvale",
    "atlas-group",
    "meridian",
    "kawkab",
    "summit-co",
    "halcyon",
    "vertex",
    "rawabi",
  ];

  it("has no invented company left in public/clients", () => {
    /**
     * WAS A DELIBERATE FAILURE (`it.fails`) while the wall carried eight
     * companies that did not exist. The content audit replaced them with real
     * references from the wood factory's own client wall, three of which are
     * corroborated by a second document, so the gate has done its job and now
     * asserts the property instead of waiting for it.
     *
     * It stays as a guard rather than being deleted: these files are the one
     * place on the site where adding an asset makes a factual claim about a
     * third party, and re-adding a convenient placeholder to fill a gap in the
     * row is exactly the mistake that would go unnoticed.
     */
    const files = readdirSync(publicClients).map((f) => f.replace(".svg", ""));
    expect(files.filter((f) => INVENTED.includes(f))).toEqual([]);
  });

  it("ships no mark the browser will refuse to parse", () => {
    /**
     * THE FAILURE THIS CATCHES, because it already happened: "NESMA &
     * PARTNERS" was written into an SVG with a raw ampersand. That is not
     * legal XML, so the browser dropped the whole document and rendered a
     * broken-image box in the middle of the client wall — on the section whose
     * entire job is to look credible.
     *
     * Nothing else would have caught it. The file exists, the manifest row is
     * correct, next/image reserves the right space, and every test passed. It
     * was visible only in a screenshot.
     */
    const bad: string[] = [];
    for (const file of readdirSync(publicClients)) {
      if (!file.endsWith(".svg")) continue;
      const svg = readFileSync(join(publicClients, file), "utf8");
      // Any `&` that is not the start of a character entity.
      if (/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/i.test(svg)) {
        bad.push(`${file}: unescaped ampersand`);
      }
      if (!/^<svg[\s>]/.test(svg.trim()) || !svg.trimEnd().endsWith("</svg>")) {
        bad.push(`${file}: not a well-formed svg document`);
      }
    }
    expect(bad).toEqual([]);
  });
});
