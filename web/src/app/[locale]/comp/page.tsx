import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { LogoDefs } from "@/components/brand/LogoDefs";
import {
  BladeField,
  MarkGlyph,
  MarkTexture,
  PentagonClip,
} from "@/components/brand/geometry";
import { landingImages } from "@/components/landing/assets";
import "@/styles/comp.css";

/**
 * A0c — two comps, throwaway.
 *
 * Not linked from anywhere and not in the sitemap. Its whole purpose is to
 * answer two questions before four foundation phases are built on the answers:
 *
 *   1. does the recolour read as AUTHORED, or as one template recoloured?
 *   2. does the brand geometry read as STRUCTURE, or as noise?
 *
 * Two comps, deliberately the furthest apart in the system: the Home hero
 * (centred, symmetric, 1.0 density, green ink, ambient geometry) and a
 * Woodworks capability band (hard-left editorial axis, 0.8 density, graphite
 * ink, structural geometry). If those two read as one system AND as different
 * pages, the four-axis differentiation works. If they don't, it is far cheaper
 * to find out now than at Checkpoint 3.
 *
 * Copy is real Stark positioning from the brand book, not lorem — tone is part
 * of what is being judged. Numbers are deliberately absent: F1-F8 are
 * unconfirmed and a comp with invented figures teaches the wrong thing.
 */

const AR = {
  eyebrow: "قوة سعودية",
  h1a: "بيئات متكاملة.",
  h1b: "مُنفَّذة بالكامل.",
  lead: "ستارك ليست مجرد مُصنِّع، بل شريك حلول موثوق يقدّم أنظمة تصنيع وتصميم داخلي وتنفيذ متكاملة.",
  cta1: "ابدأ مشروعاً",
  cta2: "شاهد أعمالنا",
  wEyebrow: "الأعمال الخشبية",
  wH2: "حيث تتحوّل المواد إلى مساحات",
  wBody:
    "خطوط إنتاج مؤتمتة تعمل ضمن تفاوتات هندسية دقيقة، من الألواح الخام حتى التجميع النهائي.",
  wPanel: "دقة سعودية. معيار عالمي.",
} as const;

const EN = {
  eyebrow: "Saudi Based Power",
  h1a: "Complete environments.",
  h1b: "Fully delivered.",
  lead: "STARK is more than a manufacturer. It is a trusted solutions partner delivering integrated manufacturing, interior, and execution systems.",
  cta1: "Start a project",
  cta2: "View our work",
  wEyebrow: "Woodworks",
  wH2: "Where materials become spaces",
  wBody:
    "Automated lines running to engineered tolerances, from raw panel through to final assembly.",
  wPanel: "Saudi precision. Global standard.",
} as const;

export default async function CompPage({ params }: PageProps<"/[locale]/comp">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = locale === "ar" ? AR : EN;

  return (
    <div data-comp>
      <LogoDefs />

      {/* ============================================================ */}
      {/* COMP 1 — Home hero.                                          */}
      {/* Centred and symmetric. G2 ambient blades behind, sand at 12%: */}
      {/* the field is either ambient OR structural on a page, never    */}
      {/* both, or the geometry reads as accidental.                    */}
      {/* ============================================================ */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          paddingBlock: "calc(var(--space-section) * var(--density))",
          background: "var(--color-surface)",
        }}
      >
        <BladeField
          weight="ambient"
          color="var(--sand-500)"
          blades={[
            { element: "interiors", width: 380, top: "-40px", start: "-80px", float: 9 },
            { element: "woodworks", width: 440, top: "18%", end: "-90px", float: 11 },
            { element: "furniture", width: 400, bottom: "-60px", start: "-100px", float: 10 },
          ]}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1180,
            margin: "0 auto",
            padding: "0 32px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
          }}
        >
          <span className="c-eyebrow">{t.eyebrow}</span>

          <h1 className="c-display" style={{ maxWidth: "16ch" }}>
            <span className="thin">{t.h1a}</span>
            <span className="bold">{t.h1b}</span>
          </h1>

          <hr className="c-rule" />

          <p className="c-lead" style={{ maxWidth: "56ch" }}>
            {t.lead}
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <a className="c-pill c-pill--solid" href="#">
              {t.cta1}
            </a>
            <a className="c-pill c-pill--ghost" href="#">
              {t.cta2}
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* COMP 2 — Woodworks capability band.                          */}
      {/* Same components, same type scale, same motion. Different on   */}
      {/* four axes: graphite ink ramp, hard-left axis with a standing  */}
      {/* vertical rule, 0.8 density, close-crop high-contrast imagery. */}
      {/* ============================================================ */}
      <section
        data-comp-theme="woodworks"
        style={{
          position: "relative",
          overflow: "hidden",
          paddingBlock: "calc(var(--space-section) * var(--density))",
          background: "var(--color-surface-2)",
        }}
      >
        {/* Was variant="tile" at 0.04. The repeating 300px tile read as
            WALLPAPER — a pattern swatch competing with the copy, not a
            watermark behind it. This is the "geometry as noise" failure this
            comp exists to catch. One large mark bleeding off the end edge is
            more confident and disappears into the surface. */}
        <MarkTexture
          variant="mark"
          color="var(--neutral-500)"
          opacity={0.05}
          size={620}
          style={{ bottom: "-180px", insetInlineEnd: "-160px" }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1180,
            margin: "0 auto",
            padding: "0 32px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))",
            gap: "clamp(32px, 5vw, 72px)",
            alignItems: "center",
          }}
        >
          {/* The editorial axis: a standing rule the copy hangs off. This is
              the axis difference made visible — Home has no such spine.
              At 1px in --color-line it read as an accident rather than a
              deliberate structure, so it is 2px in the accent and carries a
              marker at the eyebrow's height. */}
          <div
            style={{
              position: "relative",
              paddingInlineStart: 32,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 20,
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                insetInlineStart: 0,
                top: 4,
                bottom: 4,
                width: 2,
                background: `linear-gradient(to bottom,
                  var(--color-accent) 0 64px,
                  var(--color-line) 64px 100%)`,
              }}
            />
            <span className="c-eyebrow">
              <MarkGlyph division="woodworks" size={14} color="var(--color-ink)" />
              {t.wEyebrow}
            </span>

            <h2 className="c-h2" style={{ maxWidth: "14ch" }}>
              {t.wH2}
            </h2>

            <p className="c-body" style={{ maxWidth: "48ch" }}>
              {t.wBody}
            </p>

            {/* A capability strip instead of pills — the register difference
                against Home, which uses two CTAs here.

                First attempt was a spec table (CAPACITY / STANDARD / LEAD TIME)
                with em-dashes standing in for unconfirmed F1-F8 figures. It
                read as BROKEN, not as pending: an em-dash under a label looks
                like a rendering failure, and three of them look like the page
                failed to load. Qualitative capabilities say the same thing,
                need no client confirmation, and look finished. */}
            <ul
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0 20px",
                listStyle: "none",
                margin: "8px 0 0",
                padding: 0,
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                letterSpacing: "var(--tracking-eyebrow)",
                textTransform: "var(--eyebrow-transform)" as "uppercase",
                color: "var(--color-ink-muted)",
              }}
            >
              {(locale === "ar"
                ? ["خطوط مؤتمتة", "تفاوتات هندسية", "تشطيب داخلي"]
                : ["Automated lines", "Engineered tolerances", "In-house finishing"]
              ).map((k, i) => (
                <li key={k} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  {i > 0 && (
                    <span
                      aria-hidden
                      style={{ width: 4, height: 4, borderRadius: 999, background: "var(--color-accent)" }}
                    />
                  )}
                  {k}
                </li>
              ))}
            </ul>
          </div>

          {/* G1 photo + G1 panel as ONE overlapping pair.
              Stacked in a column they read as two of the same shape pointing
              the same way, with a large void under the shorter text column.
              Overlapping the panel into the photo's lower inline-start corner
              makes them one object, kills the void, and is the handoff's own
              device. */}
          <div style={{ position: "relative" }}>
            <PentagonClip
              variant="photo"
              /* was --warm-300 on --warm-200: invisible. The ring has to read
                 as a deliberate mount, so it takes the surface colour the
                 section does NOT use. */
              ringColor="var(--white-500)"
              style={{ boxShadow: "var(--shadow-pentagon)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={landingImages.bands[0]}
                alt=""
                style={{
                  display: "block",
                  width: "100%",
                  aspectRatio: "115 / 118",
                  objectFit: "cover",
                  // Woodworks treatment: close-crop, high contrast, material.
                  // TODO(F-content): placeholder — needs machined-timber
                  // photography, not a styled interior.
                  filter: "contrast(1.12) saturate(0.92) brightness(0.98)",
                }}
              />
            </PentagonClip>

            <PentagonClip
              variant="panel"
              /* --neutral-500 (#1d1d1b) at panel scale read as a hole punched
                 in the page. The 400 step carries the same graphite intent at
                 a weight the layout can hold. */
              background="var(--neutral-400)"
              style={{
                position: "absolute",
                width: "46%",
                bottom: "-8%",
                insetInlineStart: "-6%",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display), system-ui, sans-serif",
                  fontWeight: 600,
                  color: "var(--white-500)",
                  fontSize: "clamp(13px, 1.2vw, 16px)",
                  lineHeight: 1.35,
                  margin: 0,
                }}
              >
                {t.wPanel}
              </p>
            </PentagonClip>
          </div>
        </div>
      </section>
    </div>
  );
}
