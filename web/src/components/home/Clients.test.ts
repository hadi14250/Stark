import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  CLIENT_ROWS,
  PLACEHOLDER_CLIENTS,
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
    expect(a.length + b.length).toBe(PLACEHOLDER_CLIENTS.length);
  });
});

describe("every logo is a real, described asset", () => {
  const files = new Set(readdirSync(publicClients));

  it("points at a file that exists", () => {
    for (const logo of PLACEHOLDER_CLIENTS) {
      expect(files.has(logo.src.replace("/clients/", ""))).toBe(true);
    }
  });

  it("declares the asset's true intrinsic size", () => {
    // next/image reserves space from these numbers. If they disagree with the
    // SVG's own viewBox the row shifts as the images load, which is exactly
    // the CLS the width/height props exist to prevent.
    for (const logo of PLACEHOLDER_CLIENTS) {
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
      for (const logo of PLACEHOLDER_CLIENTS) {
        const entry = alts.find((a) => a.key === logo.key);
        expect(entry, `${logo.key} missing alt`).toBeTruthy();
        expect(entry!.alt.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("the placeholders cannot be shipped by accident", () => {
  /**
   * A client wall is a factual claim about who a company has worked for.
   * These eight do not exist, so leaving them on a live site is not an
   * unfinished placeholder — it is a false statement on the front page.
   *
   * This test FAILS ON PURPOSE while they are still in place. When the real
   * logos land, delete the invented names from this list and it goes green.
   * That makes shipping them a decision someone has to make rather than
   * something that slips through because nobody looked at the section again.
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

  it.fails("has had its invented logos replaced with real clients", () => {
    const files = readdirSync(publicClients).map((f) => f.replace(".svg", ""));
    expect(files.filter((f) => INVENTED.includes(f))).toEqual([]);
  });
});
