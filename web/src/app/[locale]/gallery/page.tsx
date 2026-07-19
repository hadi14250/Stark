import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { GalleryShell, type ShellCategory } from "@/components/gallery/GalleryShell";
import {
  CATEGORIES,
  PROJECTS,
  byCategory,
  findProject,
  isCategoryId,
  type CategoryId,
} from "@/lib/gallery/projects";
import { toSlide, type Translator } from "@/lib/gallery/toSlide";
import type { Slide } from "@/lib/gallery/types";
import "@/styles/gallery-stage.css";
import "@/styles/gallery-chrome.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/gallery">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "pages.gallery",
  });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternates("/gallery"),
  };
}

/**
 * The gallery.
 *
 * INITIAL STATE IS RESOLVED HERE, ON THE SERVER, not in a post-mount effect.
 * The obvious approach — render PROJECTS[0], then apply `?c=`/`?p=` in an
 * effect — looks harmless and is not: `AnimatePresence initial={false}`
 * suppresses only the FIRST render, so every shared deep link would open on
 * the wrong project and then play a full 1.2s push transition into the right
 * one. Wrong content, then a spurious animation, on every link anyone shares.
 * Reading searchParams here also means the correct project is in the HTML for
 * crawlers and for no-JS.
 *
 * Copy is resolved here too. `Project.keys` holds i18n keys; the stage renders
 * strings. Doing it server-side keeps `useTranslations` out of the client
 * stage and lets the memo inside PushSlider keep a stable identity.
 */
export default async function GalleryPage({
  params,
  searchParams,
}: PageProps<"/[locale]/gallery">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const sp = await searchParams;

  const t = await getTranslations("gallery");
  /**
   * next-intl types `t` to LITERAL message keys, which is exactly what you
   * want at a call site and exactly what you cannot have when the key comes
   * from data — `Project.keys.title` is a string decided in projects.ts. The
   * cast is confined to this one alias; every static lookup below still uses
   * the typed `t` and keeps its compile-time check.
   */
  const translator = t as unknown as Translator;

  // `?c=` and `?p=` are user-controlled: narrow, never trust.
  const rawCategory = Array.isArray(sp.c) ? sp.c[0] : sp.c;
  const rawProject = Array.isArray(sp.p) ? sp.p[0] : sp.p;

  const requested = findProject(rawProject);
  // A valid ?p= implies its own category, which beats a contradictory ?c=.
  const category: CategoryId = requested
    ? requested.category
    : isCategoryId(rawCategory)
      ? rawCategory
      : CATEGORIES[0];

  const inCategory = byCategory(category);
  // An invalid or cross-category ?p= falls back to the category's first
  // project rather than rendering nothing.
  const projectId = requested?.id ?? inCategory[0]?.id ?? PROJECTS[0].id;

  const slidesByCategory = Object.fromEntries(
    CATEGORIES.map((c) => [c, byCategory(c).map((p) => toSlide(p, translator))]),
  ) as Record<CategoryId, Slide[]>;

  const categories: ShellCategory[] = CATEGORIES.map((c) => ({
    id: c,
    label: translator(`categories.${c}`),
    projects: byCategory(c).map((p) => ({
      id: p.id,
      title: translator(p.keys.title),
      subtitle: translator(p.keys.subtitle),
    })),
  }));

  return (
    <div style={{ height: "calc(100svh - var(--header-h))" }}>
      <h1 className="sr-only">{t("heading")}</h1>
      <GalleryShell
        categories={categories}
        slidesByCategory={slidesByCategory}
        initialCategory={category}
        initialProjectId={projectId}
        labels={{
          panelTitle: t("panelTitle"),
          projects: t("projects"),
          close: t("close"),
          open: t("open"),
          empty: t("empty"),
          startProject: t("startProject"),
        }}
      />
    </div>
  );
}
