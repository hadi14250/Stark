import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { GalleryShell, type ShellDivision } from "@/components/gallery/GalleryShell";
import {
  DIVISIONS,
  IMAGES,
  SUB_CATEGORY_IDS,
  divisionOf,
  isDivisionId,
  isSubCategoryId,
  subsOf,
  type DivisionId,
  type SubCategoryId,
} from "@/lib/gallery/images";
import "@/styles/gallery-chrome.css";
import "@/styles/gallery-stage.css";

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
 * WHERE THE OLD `?p=` LINKS LAND.
 *
 * The project level is gone, so a shared link carrying `?p=mataf-extension`
 * addresses something that no longer exists. It must not 404 and it must not
 * silently drop the reader on Loose Furniture: the honest resolution is the
 * sub-category that project used to live in.
 *
 * Only the ids that were ever public are listed. Two of the old sub-category
 * ids were renamed to match the profile's p15 wording (`doors-panels` → `doors`,
 * `interior-cladding` → `cladding`) and the whole `furniture` division folded
 * into woodworks, so the old `?s=` values need the same treatment — that is the
 * second map below.
 */
const LEGACY_PROJECT_SUB: Record<string, SubCategoryId> = {
  "mataf-extension": "doors",
  "king-salman-park": "built-in-joinery",
  "ngha-hospitals": "built-in-joinery",
  "specialized-doors": "doors",
  "interior-cladding": "cladding",
  "kitchens-wardrobes": "kitchens-wardrobes",
  "outdoor-structures": "outdoor-structures",
  "retail-stands": "retail-stands",
  "loose-furniture": "loose-furniture",
};

const LEGACY_SUB: Record<string, SubCategoryId> = {
  "doors-panels": "doors",
  "interior-cladding": "cladding",
  "fixed-joinery": "built-in-joinery",
};

/** `?c=furniture` was a top-level tab and is now a sub-category of woodworks. */
const LEGACY_DIVISION_SUB: Record<string, SubCategoryId> = {
  furniture: "loose-furniture",
};

/**
 * The gallery: pictures, in two levels of grouping.
 *
 * INITIAL STATE IS RESOLVED HERE, ON THE SERVER. Reading `searchParams` in the
 * component and applying them in an effect would render the wrong sub-category
 * first and then swap — and it would keep the right pictures out of the HTML,
 * where crawlers and no-JS readers are looking.
 *
 * ⚠ EVERY STEP DOWN RE-DERIVES RATHER THAN TRUSTING. `?c=mattresses&s=doors` is
 * a well-formed pair of individually-valid values that cannot coexist, and it is
 * one hand-edited URL away at any time. Checking that the sub-category really
 * belongs to the division — rather than assuming — is what keeps that from
 * seating the shell on an empty grid.
 */
export default async function GalleryPage({
  params,
  searchParams,
}: PageProps<"/[locale]/gallery">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const sp = await searchParams;

  const t = await getTranslations("gallery");

  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const rawDivision = one(sp.c);
  const rawSub = one(sp.s);
  const rawProject = one(sp.p);

  /**
   * THE MOST SPECIFIC PARAMETER WINS, because it implies the general one.
   * A retired `?p=` settles the sub-category on its own and beats a
   * contradictory `?c=`; a valid `?s=` settles the division.
   */
  const sub: SubCategoryId =
    (rawProject ? LEGACY_PROJECT_SUB[rawProject] : undefined) ??
    (isSubCategoryId(rawSub)
      ? rawSub
      : (rawSub ? LEGACY_SUB[rawSub] : undefined)) ??
    (rawDivision ? LEGACY_DIVISION_SUB[rawDivision] : undefined) ??
    (isDivisionId(rawDivision)
      ? (subsOf(rawDivision)[0] ?? SUB_CATEGORY_IDS[0])
      : SUB_CATEGORY_IDS[0]);

  const division: DivisionId = divisionOf(sub) ?? DIVISIONS[0];

  const divisions: ShellDivision[] = DIVISIONS.map((d) => ({
    id: d,
    label: t(`categories.${d}` as never),
    subs: subsOf(d).map((s) => ({ id: s, label: t(`subCategories.${s}` as never) })),
  }));

  /**
   * Alt text, resolved on the server and keyed the same way the manifest keys
   * it — so the client component never holds a translator and never has to know
   * that these strings are translated at all.
   */
  const alts = {
    placeholder: t("alts.placeholder"),
    blueProduct: t("alts.blueProduct"),
    blueRoom: t("alts.blueRoom"),
    siestaProduct: t("alts.siestaProduct"),
    siestaRoom: t("alts.siestaRoom"),
  };

  return (
    <div style={{ height: "calc(100svh - var(--header-h))" }}>
      <h1 className="sr-only">{t("heading")}</h1>
      <GalleryShell
        divisions={divisions}
        imagesBySub={IMAGES}
        initialDivision={division}
        initialSub={sub}
        alts={alts}
        labels={{
          selectedWork: t("selectedWork"),
          divisions: t("divisions"),
          subCategories: t("subCategoriesLabel"),
          empty: t("empty"),
          startProject: t("startProject"),
          prev: t("prev"),
          next: t("next"),
          close: t("close"),
        }}
      />
    </div>
  );
}
