"use client";

import { useEffect, useState } from "react";

/**
 * Computes contrast ratios in the browser from the ACTUAL resolved tokens.
 *
 * Deliberately not a hardcoded table. A table of ratios copied out of a
 * calculator is the single most drift-prone artefact in a design system: it is
 * right the day it is written and silently wrong the first time anyone touches
 * a token. This mounts a hidden probe under each [data-theme], reads what the
 * cascade actually produced, and reports that.
 */

type Row = { theme: string; role: string; surface: string; ratio: number };

const THEMES: { attr: "data-theme" | "data-surface"; value: string; label: string }[] = [
  { attr: "data-theme", value: "home", label: "Home" },
  { attr: "data-theme", value: "woodworks", label: "Woodworks" },
  { attr: "data-theme", value: "mattresses", label: "Mattresses" },
  { attr: "data-surface", value: "dark", label: "Dark surfaces" },
];

const ROLES = ["--color-ink", "--color-ink-body", "--color-ink-muted", "--color-interactive"];
const SURFACES = ["--color-surface", "--color-surface-2"];

function luminance(rgb: string): number {
  const m = rgb.match(/[\d.]+/g);
  if (!m) return 0;
  const [r, g, b] = m.slice(0, 3).map((n) => {
    const s = Number(n) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function LiveContrast() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const out: Row[] = [];
    for (const t of THEMES) {
      const host = document.createElement("div");
      host.setAttribute(t.attr, t.value);
      host.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
      document.body.appendChild(host);
      const cs = getComputedStyle(host);

      for (const surface of SURFACES) {
        for (const role of ROLES) {
          const fg = cs.getPropertyValue(role).trim();
          const bg = cs.getPropertyValue(surface).trim();
          if (!fg || !bg) continue;
          // Resolve to rgb() by round-tripping through a real element — the
          // custom property may still be a var() chain or a hex.
          const probe = document.createElement("div");
          probe.style.color = fg;
          probe.style.backgroundColor = bg;
          host.appendChild(probe);
          const pc = getComputedStyle(probe);
          out.push({
            theme: t.label,
            role: role.replace("--color-", ""),
            surface: surface.replace("--color-", ""),
            ratio: ratio(pc.color, pc.backgroundColor),
          });
          probe.remove();
        }
      }
      host.remove();
    }
    setRows(out);
  }, []);

  const failing = rows.filter((r) => r.ratio < 4.5).length;

  return (
    <div>
      <p className="mb-4 text-body-sm" style={{ color: failing ? "var(--color-error)" : "var(--color-ink-muted)" }}>
        {rows.length === 0
          ? "measuring…"
          : failing === 0
            ? `${rows.length} pairs measured · all clear AA`
            : `${failing} of ${rows.length} pairs FAIL AA`}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-line)] text-left">
              {["Theme", "Role", "On", "Ratio"].map((h, i) => (
                <th
                  key={h}
                  className={`py-2 font-mono text-[11px] uppercase tracking-eyebrow text-[color:var(--color-ink-muted)] ${i === 3 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const grade = r.ratio >= 7 ? "AAA" : r.ratio >= 4.5 ? "AA" : "FAILS";
              const color =
                r.ratio >= 7
                  ? "var(--color-ink)"
                  : r.ratio >= 4.5
                    ? "var(--color-ink-body)"
                    : "var(--color-error)";
              return (
                <tr key={i} className="border-b border-[color:var(--color-line)]">
                  <td className="py-2">{r.theme}</td>
                  <td>
                    <code className="font-mono text-[12px]">{r.role}</code>
                  </td>
                  <td>
                    <code className="font-mono text-[12px]">{r.surface}</code>
                  </td>
                  <td className="text-right font-mono tabular-nums" style={{ color }}>
                    {r.ratio.toFixed(2)}:1 {grade}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Reads a resolved custom property off the nearest matching theme host. */
export function TokenProbe({ theme, token }: { theme: string; token: string }) {
  const [value, setValue] = useState("…");
  useEffect(() => {
    const host = document.querySelector(`[data-theme="${theme}"]`);
    if (!host) return;
    setValue(getComputedStyle(host).getPropertyValue(token).trim() || "—");
  }, [theme, token]);
  return <span>{value}</span>;
}
