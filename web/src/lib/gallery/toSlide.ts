import type { Slide, SlideId, Activity } from "./types";
import { THEMES, type Project } from "./projects";

/**
 * The boundary between Stark's data model and the ported stage.
 *
 * `Project` is nested and named for what things ARE. `Slide` is flat and named
 * for the travel demo the engine was written against — `blossom` is the large
 * centre portrait, `cuisineImage` is a small square, and the transition engine
 * reads those field names DIRECTLY (`transitions/core.ts:148-159` does
 * `hero: (s) => s.heroImage`). Renaming them would mean editing the engine at
 * nine coupled sites for no user-visible gain.
 *
 * So the cells are renamed in MEANING here and nowhere else. This function is
 * the only place in the codebase that knows "blossom" means "feature", and it
 * is what makes adding a project a data change rather than a code change.
 *
 * It also RESOLVES i18n KEYS TO STRINGS. `Project.keys.title` is a key;
 * `cards.tsx` renders `slide.city` as a string. Resolution happens on the
 * server (gallery/page.tsx), which keeps `useTranslations` out of the client
 * stage and lets the `useMemo` in PushSlider keep a stable identity.
 */

/** Minimal shape of next-intl's `t`, so this file needs no next-intl import. */
export type Translator = {
  (key: string): string;
  raw: (key: string) => unknown;
};

export function toSlide(p: Project, t: Translator): Slide {
  // The overlay spec list is authored as an array of {label, value} pairs.
  // Defensive: a malformed/missing key must not throw during SSR and take the
  // whole route down — an empty spec list degrades to a shorter overlay.
  const rawSpecs = t.raw(p.keys.overlaySpecs);
  const specs: Activity[] = Array.isArray(rawSpecs)
    ? (rawSpecs as { label?: string; value?: string }[]).map((s) => ({
        title: String(s?.label ?? ""),
        desc: String(s?.value ?? ""),
      }))
    : [];

  return {
    // `SlideId` is the travel demo's three-way union. The cast is safe and
    // deliberate: every consumer that CARED about the union (the editor's
    // config store, keyed by SlideId) was left behind in the port, so the type
    // is now just an opaque key. Widening it would mean editing lib/types.ts,
    // which the handoff owns and we want to keep diffable against it.
    id: p.id as SlideId,
    theme: THEMES[p.theme],

    // hero card
    city: t(p.keys.title),
    subtitle: t(p.keys.subtitle),
    heroImage: p.cells.hero,

    // intro text card
    headline: t(p.keys.headline),
    paragraph: t(p.keys.paragraph),
    ctaLabel: t("cta"),

    // image slots — the rename happens here, and only here
    introImage: p.cells.intro,
    portraitA: p.cells.portraitA,
    blossom: p.cells.feature,
    portraitB: p.cells.portraitB,

    // the three small info cards. Labels come from messages now — see types.ts.
    exploreLabel: t("labels.scope"),
    stayLabel: t("labels.delivery"),
    cuisineLabel: t("labels.materials"),
    exploreLine: t(p.keys.scope),
    stayLine: t(p.keys.delivery),
    cuisineLine: t(p.keys.materials),
    cuisineImage: p.cells.detail,

    overlay: {
      eyebrow: t("overlayEyebrow"),
      title: t(p.keys.overlayTitle),
      bestTime: t(p.keys.overlaySummary),
      activities: specs,
      ctaLabel: t("overlayCta"),
      bg: p.overlayBg,
    },
  };
}
