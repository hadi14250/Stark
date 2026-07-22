import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { GalleryShell, type ShellDivision } from "@/components/gallery/GalleryShell";
import {
  DIVISIONS,
  SUB_CATEGORY_IDS,
  PROJECTS,
  bySubCategory,
  divisionOf,
  findProject,
  isDivisionId,
  isSubCategoryId,
  subsOf,
  type DivisionId,
  type SubCategoryId,
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

  // `?c=`, `?s=` and `?p=` are user-controlled: narrow, never trust.
  const rawDivision = Array.isArray(sp.c) ? sp.c[0] : sp.c;
  const rawSub = Array.isArray(sp.s) ? sp.s[0] : sp.s;
  const rawProject = Array.isArray(sp.p) ? sp.p[0] : sp.p;

  /**
   * THE SPECIFIC PARAMETER WINS, because it implies the general ones.
   *
   * A project belongs to exactly one sub-category, which belongs to exactly one
   * division, so a valid `?p=` settles all three levels on its own and beats a
   * contradictory `?c=` or `?s=`. Likewise a valid `?s=` settles the division.
   * Resolving in that order is what makes a shared deep link land on the thing
   * it names rather than on whatever the other two parameters happened to say.
   *
   * ⚠ EVERY STEP DOWN RE-DERIVES RATHER THAN TRUSTING. `?c=woodworks&s=blue` is
   * a well-formed pair of individually-valid values that cannot coexist, and it
   * is one hand-edited URL away at any time. Checking that the sub-category is
   * actually in the division — rather than assuming it — is what keeps that
   * from seating the shell on an empty stage.
   */
  const requested = findProject(rawProject);

  const sub: SubCategoryId = requested
    ? requested.subCategory
    : isSubCategoryId(rawSub)
      ? rawSub
      : isDivisionId(rawDivision)
        ? (subsOf(rawDivision)[0] ?? SUB_CATEGORY_IDS[0])
        : SUB_CATEGORY_IDS[0];

  const division: DivisionId = divisionOf(sub) ?? DIVISIONS[0];

  // An invalid or cross-sub `?p=` falls back to the sub-category's first entry
  // rather than rendering nothing.
  const projectId = requested?.id ?? bySubCategory(sub)[0]?.id ?? PROJECTS[0].id;

  const slidesBySub = Object.fromEntries(
    SUB_CATEGORY_IDS.map((s) => [s, bySubCategory(s).map((p) => toSlide(p, translator))]),
  ) as Record<SubCategoryId, Slide[]>;

  const divisions: ShellDivision[] = DIVISIONS.map((d) => ({
    id: d,
    label: translator(`categories.${d}`),
    subs: subsOf(d).map((s) => ({
      id: s,
      label: translator(`subCategories.${s}`),
      projects: bySubCategory(s).map((p) => ({
        id: p.id,
        title: translator(p.keys.title),
        subtitle: translator(p.keys.subtitle),
      })),
    })),
  }));

  return (
    <div style={{ height: "calc(100svh - var(--header-h))" }}>
      <h1 className="sr-only">{t("heading")}</h1>
      <GalleryShell
        divisions={divisions}
        slidesBySub={slidesBySub}
        initialDivision={division}
        initialSub={sub}
        initialProjectId={projectId}
        labels={{
          selectedWork: t("selectedWork"),
          divisions: t("divisions"),
          subCategories: t("subCategoriesLabel"),
          projects: t("projects"),
          empty: t("empty"),
          startProject: t("startProject"),
        }}
      />
    </div>
  );
}
