import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { LogoDefs, DIVISION_ELEMENT, type DivisionKey } from "@/components/brand/LogoDefs";
import { BladeField, MarkGlyph, MarkTexture, PentagonClip } from "@/components/brand/geometry";
import { LogoLoader, type LoaderVariant } from "@/components/motion/LogoLoader";
import "@/styles/logo-loader.css";
import { CountUp } from "@/components/motion/CountUp";
import { LiveContrast, TokenProbe } from "@/components/specimen/LiveContrast";

/**
 * CHECKPOINT 1 — the design system, rendered.
 *
 * Internal. Not linked, not in the sitemap, noindex. It exists so the system
 * can be JUDGED as a whole before four pages are built on it — retuning here
 * costs an afternoon, retuning at Checkpoint 3 costs a rebuild.
 *
 * Deliberately shows the things that are usually only in a document: live
 * contrast ratios computed in the browser from the actual computed tokens (not
 * copied from a spreadsheet that can drift), the type scale in EN and AR side
 * by side, and every geometry technique with its division legend.
 */

export const metadata = { robots: { index: false, follow: false } };

const COLUMNS = [
  { name: "Brand Green", key: "green", note: "primary", darkFrom: 500 },
  { name: "Neutral", key: "neutral", note: "graphite — Woodworks", darkFrom: 500 },
  { name: "Sage", key: "sage", note: "interactive, on dark only", darkFrom: 900 },
  { name: "Warm Gray", key: "warm", note: "Woodworks surfaces", darkFrom: 900 },
  { name: "Off-White", key: "white", note: "the page", darkFrom: 900 },
  { name: "Sand", key: "sand", note: "the accent", darkFrom: 900 },
] as const;

const STEPS = [500, 400, 300, 200] as const;

const LOADER_VARIANTS: LoaderVariant[] = [
  "assemble", "sequence", "pulse", "cascade",
  "pinwheel", "shutter", "wave", "bloom",
  "trace", "unfold", "swing", "vortex",
];

const TYPE_ROLES = [
  { token: "display", cls: "text-display", sample: { en: "Complete environments.", ar: "بيئات متكاملة." } },
  { token: "h2", cls: "text-h2", sample: { en: "Where materials become spaces", ar: "حيث تتحوّل المواد إلى مساحات" } },
  { token: "h3", cls: "text-h3", sample: { en: "Precision manufacturing", ar: "تصنيع دقيق" } },
  { token: "h4", cls: "text-h4", sample: { en: "Interior fit-outs", ar: "التشطيبات الداخلية" } },
  { token: "lead", cls: "text-lead", sample: { en: "STARK is more than a manufacturer.", ar: "ستارك ليست مجرد مُصنِّع." } },
  { token: "body", cls: "text-body", sample: { en: "From materials to interiors, we deliver complete environments that perform, last, and feel right.", ar: "من المواد إلى التصميم الداخلي، نقدّم بيئات متكاملة تؤدي وتدوم وتُشعرك بالراحة." } },
  { token: "body-sm", cls: "text-body-sm", sample: { en: "Automated lines, engineered tolerances.", ar: "خطوط مؤتمتة، تفاوتات هندسية." } },
] as const;

const DIVISIONS: { key: DivisionKey; label: string }[] = [
  { key: "stark", label: "STARK — the hub" },
  { key: "woodworks", label: "Woodworks" },
  { key: "interiors", label: "Interior Fit-outs" },
  { key: "furniture", label: "Furniture" },
  { key: "mattresses", label: "Mattresses" },
  { key: "turnkey", label: "Turnkey Execution" },
];

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[color:var(--color-line)] py-14">
      <h2 className="font-display text-[26px] font-bold text-[color:var(--color-ink)]">{title}</h2>
      {note && <p className="mt-1 max-w-[70ch] text-body-sm text-[color:var(--color-ink-muted)]">{note}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default async function SpecimenPage({ params }: PageProps<"/[locale]/specimen">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <div className="mx-auto max-w-[1180px] px-8 py-16" data-theme="home">
      <LogoDefs />

      <header>
        <p className="font-mono text-eyebrow uppercase tracking-eyebrow text-[color:var(--color-ink-muted)]">
          Checkpoint 1
        </p>
        <h1 className="mt-3 font-display text-display font-light leading-display text-[color:var(--color-ink)]">
          The system
        </h1>
        <p className="mt-4 max-w-[62ch] text-lead text-[color:var(--color-ink-body)]">
          Every value here is read live from the computed stylesheet, so this page cannot
          drift from <code>tokens.css</code> the way a written spec can.
        </p>
      </header>

      {/* ---------------------------------------------------------------- */}
      <Section
        title="Palette"
        note="The official 6 × 4 grid, sampled from the brand book at 300dpi — the text extraction drops every colour page. Higher number = darker, in every column."
      >
        <div className="grid grid-cols-2 gap-6 nav:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.key}>
              <p className="text-body-sm font-semibold text-[color:var(--color-ink)]">{col.name}</p>
              <p className="mb-3 text-[12px] text-[color:var(--color-ink-muted)]">{col.note}</p>
              <div className="overflow-hidden rounded-[var(--radius-image)] border border-[color:var(--color-line)]">
                {STEPS.map((step) => (
                  <div
                    key={step}
                    className="flex items-center justify-between px-3 py-2.5 font-mono text-[11px]"
                    style={{
                      background: `var(--${col.key}-${step})`,
                      // Label ink follows the swatch's actual lightness, not its step
                      // number: only the green and neutral columns are dark at
                      // 500/400 — writing white on sand-500 was unreadable.
                      color: step >= col.darkFrom ? "var(--white-500)" : "var(--green-500)",
                    }}
                  >
                    <span>{col.key}-{step}</span>
                    <span data-swatch={`--${col.key}-${step}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        title="Contrast"
        note="Computed in the browser from the resolved tokens. Anything below 4.5:1 on a text role is a bug — the pre-redesign muted ink was 3.83:1 and shipped."
      >
        <LiveContrast />
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        title="Type scale"
        note="Seven roles. Latin and Arabic side by side, because the Arabic column is where tracking and uppercase stop being available and the leading has to open up."
      >
        <div className="space-y-8">
          {TYPE_ROLES.map((r) => (
            <div key={r.token} className="grid gap-4 nav:grid-cols-[110px_1fr_1fr] nav:items-baseline">
              <code className="font-mono text-[11px] text-[color:var(--color-ink-muted)]">{r.token}</code>
              <div lang="en" dir="ltr" className={`${r.cls} text-[color:var(--color-ink)]`}>
                {r.sample.en}
              </div>
              <div lang="ar" dir="rtl" className={`${r.cls} text-[color:var(--color-ink)]`}>
                {r.sample.ar}
              </div>
            </div>
          ))}
          <div className="grid gap-4 nav:grid-cols-[110px_1fr_1fr] nav:items-baseline">
            <code className="font-mono text-[11px] text-[color:var(--color-ink-muted)]">eyebrow</code>
            <div lang="en" dir="ltr" className="font-mono text-eyebrow uppercase tracking-eyebrow text-[color:var(--color-ink-muted)]">
              Saudi Based Power
            </div>
            <div lang="ar" dir="rtl" className="text-eyebrow font-semibold text-[color:var(--color-accent-2)]">
              قوة سعودية
              <span className="mx-2 inline-block h-px w-6 align-middle" style={{ background: "var(--color-accent)" }} />
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        title="Differentiation — four axes"
        note="Colour alone reads as one template recoloured. Each panel below is the SAME markup under a different [data-theme]; only tokens change."
      >
        <div className="grid gap-5 nav:grid-cols-3">
          {(["home", "woodworks", "mattresses"] as const).map((theme) => (
            <div
              key={theme}
              data-theme={theme}
              className="rounded-[var(--radius-card)] border border-[color:var(--color-line)] p-6"
              style={{ background: "var(--color-surface-2)" }}
            >
              <p className="font-mono text-[11px] uppercase tracking-eyebrow text-[color:var(--color-ink-muted)]">
                {theme}
              </p>
              <p className="mt-3 font-display text-h4 font-semibold text-[color:var(--color-ink)]">
                Where materials become spaces
              </p>
              <p className="mt-2 text-body-sm text-[color:var(--color-ink-body)]">
                Automated lines running to engineered tolerances.
              </p>
              <div className="mt-4 flex gap-2">
                <span className="h-6 w-6 rounded-full" style={{ background: "var(--color-ink)" }} />
                <span className="h-6 w-6 rounded-full" style={{ background: "var(--color-accent)" }} />
                <span className="h-6 w-6 rounded-full" style={{ background: "var(--color-panel)" }} />
              </div>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 font-mono text-[11px] text-[color:var(--color-ink-muted)]">
                <dt>density</dt>
                <dd><TokenProbe theme={theme} token="--density" /></dd>
                <dt>axis</dt>
                <dd><TokenProbe theme={theme} token="--align-axis" /></dd>
              </dl>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        title="Brand geometry"
        note="Brand book p.8: five abstract 'S' elements, each representing a core part of the ecosystem, orbiting a centre that is STARK itself. The mapping is fixed in DIVISION_ELEMENT so nobody picks a blade at random."
      >
        <div className="grid gap-4 nav:grid-cols-3">
          {DIVISIONS.map((d) => (
            <div
              key={d.key}
              className="flex items-center gap-4 rounded-[var(--radius-image)] border border-[color:var(--color-line)] p-4"
            >
              <MarkGlyph division={d.key} size={34} color="var(--color-ink)" />
              <div>
                <p className="text-body-sm font-semibold text-[color:var(--color-ink)]">{d.label}</p>
                <code className="font-mono text-[11px] text-[color:var(--color-ink-muted)]">
                  {DIVISION_ELEMENT[d.key]}
                </code>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 nav:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-eyebrow text-[color:var(--color-ink-muted)]">
              G1 · Clip — panel variant
            </p>
            <PentagonClip variant="panel" background="var(--color-panel)" style={{ maxWidth: 300 }}>
              <p className="font-display text-h4 font-semibold" style={{ color: "var(--white-500)" }}>
                Saudi precision. Global standard.
              </p>
            </PentagonClip>
          </div>

          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-eyebrow text-[color:var(--color-ink-muted)]">
              G2 · Field (ambient) + G3 · Texture (mark)
            </p>
            <div
              className="relative h-[220px] overflow-hidden rounded-[var(--radius-card)]"
              style={{ background: "var(--color-surface-2)" }}
            >
              <BladeField
                weight="ambient"
                color="var(--sand-500)"
                blades={[
                  { element: "interiors", width: 220, top: "-30px", start: "-40px" },
                  { element: "turnkey", width: 200, bottom: "-40px", end: "-30px" },
                ]}
              />
              <MarkTexture variant="mark" color="var(--green-500)" opacity={0.05} size={260}
                style={{ bottom: "-70px", insetInlineEnd: "-60px" }} />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-eyebrow text-[color:var(--color-ink-muted)]">
            Loading animations — all twelve from the handoff. The preloader runs
            &ldquo;assemble&rdquo;; swap VARIANT in Preloader.tsx to change it.
          </p>
          <div
            className="grid gap-4 rounded-[var(--radius-card)] p-8 sm:grid-cols-3 nav:grid-cols-4"
            style={{ background: "var(--green-900)" }}
          >
            {LOADER_VARIANTS.map((v) => (
              <figure key={v} className="grid place-items-center gap-3">
                <LogoLoader variant={v} size={78} color="var(--sand-500)" />
                <figcaption className="font-mono text-[11px] uppercase tracking-eyebrow text-[color:var(--green-300)]">
                  {v}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        title="Motion"
        note="Durations, easing and stagger are tokens, not per-component decisions. CountUp below carries the fail-safe every observer-driven state gets: if the observer never fires, a timeout snaps it to its final value rather than leaving a 0 on screen."
      >
        <div className="flex flex-wrap items-baseline gap-10">
          <div>
            <CountUp to={2019} locale={locale} grouping={false} className="font-display text-h2 font-bold text-[color:var(--color-ink)]" />
            <p className="text-body-sm text-[color:var(--color-ink-muted)]">CountUp, locale digits</p>
          </div>
          <div className="font-mono text-body-sm text-[color:var(--color-ink-body)]">
            {["instant .15s", "fast .25s", "base .45s", "reveal .85s", "curtain .6s"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="font-mono text-body-sm text-[color:var(--color-ink-body)]">
            {["standard .2 .8 .2 1", "zoom .16 1 .3 1", "curtain .76 0 .24 1", "line .7 0 .2 1"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
