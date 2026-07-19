"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Preloader } from "@/components/motion/Preloader";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { LogoDefs } from "@/components/brand/LogoDefs";

/**
 * The shared site shell: Stark Nav + Footer, the fixed-header offset, the
 * scroll-progress bar, the once-per-session preloader, and the one <LogoDefs />
 * every page's brand geometry references.
 *
 * THIS FILE USED TO BE THE PROBLEM. It carried a STANDALONE_SEGMENTS opt-out
 * that let /woodworks and /mattresses render with no Stark chrome at all, each
 * supplying its own nav and footer from a different design template. That is
 * why the site read as three unrelated websites, which is what the client
 * rejected. Every route now shares this shell — no exceptions, and no mechanism
 * to add one.
 *
 * The gallery is the single special case, and it is a LAYOUT difference rather
 * than a chrome one: the stage sizes itself to the viewport, so the page must
 * not add its own vertical rhythm or a footer beneath it.
 */
const FULL_BLEED_SEGMENTS = new Set(["gallery"]);

export function SiteChrome({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const fullBleed = segment !== null && FULL_BLEED_SEGMENTS.has(segment);

  if (fullBleed) {
    // Same Nav, no Footer, no section rhythm — the stage owns what is left of
    // the viewport and must not sit above a scrolling document.
    return (
      <>
        <LogoDefs />
        <Nav />
        <main className="flex-1 pt-[var(--header-h)]">{children}</main>
      </>
    );
  }

  return (
    <>
      <LogoDefs />
      <Preloader />
      <ScrollProgress />
      <Nav />
      {/* Offset the fixed header. The height comes from --header-h (tokens.css)
          rather than a literal so the gallery stage, which sizes itself as
          `100svh - var(--header-h)`, can never disagree with this padding.
          overflow-x-clip contains decorative bleed (diagonal bands, collage) without
          affecting vertical scroll or the fixed header (which sits outside <main>). */}
      <main className="flex-1 overflow-x-clip pt-[var(--header-h)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
