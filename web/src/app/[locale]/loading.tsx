import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("states");
  return (
    <div className="grid min-h-[60vh] place-items-center bg-[color:var(--color-hero-bg)]">
      <div className="flex flex-col items-center gap-4">
        {/* Simple ring loader; collapses to static under reduced motion (globals.css). */}
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--ink-green-muted)] border-t-accent" />
        <span className="font-mono text-xs uppercase tracking-eyebrow text-[color:var(--ink-green-body)]">
          {t("loading")}
        </span>
      </div>
    </div>
  );
}
