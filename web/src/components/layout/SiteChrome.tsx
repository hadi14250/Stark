"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { Preloader } from "@/components/motion/Preloader";
import { RouteCurtain } from "@/components/motion/RouteCurtain";
import { EntranceProvider } from "@/components/motion/EntranceGate";
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
 *
 * The preloader and the page's entrance animations are COORDINATED through
 * EntranceProvider. Without that they fight: the curtain is opaque and
 * full-screen, so the hero's staged reveal used to play underneath it and be
 * over before anyone saw it. The gate holds every <Reveal> until the curtain
 * finishes lifting, and can only ever delay motion — never prevent it.
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
        {/* The gallery gets the route curtain too — it is the page you most
            often leave, and a curtain that appears on three routes out of four
            reads as a bug rather than as a restraint. It does NOT get the
            Preloader: that one is for a real page load, and this branch is
            reached by the same layout the other branch is. */}
        <RouteCurtain />
        <Nav />
        <main className="flex-1 pt-[var(--header-h)]">{children}</main>
      </>
    );
  }

  return (
    <EntranceProvider>
      <LogoDefs />
      <Preloader />
      {/* Same mark, same beat, the other entrance. Preloader cannot cover a
          route change from here — this component never remounts between
          routes, which is exactly why it can host a curtain that does. */}
      <RouteCurtain />
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
    </EntranceProvider>
  );
}
