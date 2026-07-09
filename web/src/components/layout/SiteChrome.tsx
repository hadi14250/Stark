"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

/**
 * The shared site shell (green Stark Nav + Footer + the fixed-header top
 * padding). Wraps the page's children — EXCEPT on "standalone" segments, which
 * supply their own chrome and render full-bleed with no Stark Nav/Footer and no
 * top padding.
 *
 * Route groups can't remove a parent layout in the App Router (a nested group
 * shares it; only multiple root layouts escape it — a whole-app refactor). So
 * the opt-out is done here, by reading the active child segment one level below
 * the locale layout: `/woodworks` (the "Element" page) renders bare; every
 * other route keeps today's chrome, byte-for-byte.
 */
const STANDALONE_SEGMENTS = new Set(["woodworks"]);

export function SiteChrome({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const standalone = segment !== null && STANDALONE_SEGMENTS.has(segment);

  if (standalone) {
    // No Nav/Footer, no header offset — the page owns the full viewport.
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Nav />
      {/* Offset the fixed header: utility strip (40) + bar (64 mobile / 76 desktop).
          overflow-x-clip contains decorative bleed (diagonal bands, collage) without
          affecting vertical scroll or the fixed header (which sits outside <main>). */}
      <main className="flex-1 overflow-x-clip pt-[104px] nav:pt-[116px]">
        {children}
      </main>
      <Footer />
    </>
  );
}
