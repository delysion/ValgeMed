"use client";

import { useState } from "react";

const PRESET_COLORS = [
  "#5746E5", // primary violet
  "#7C3AED", // vivid violet
  "#06B6D4", // cyan
  "#0EA5E9", // sky blue
  "#3B82F6", // blue
  "#10B981", // emerald
  "#059669", // green
  "#84CC16", // lime
  "#EAB308", // yellow
  "#F59E0B", // amber
  "#F97316", // orange
  "#EF4444", // rose red
  "#F43F5E", // pink
  "#EC4899", // hot pink
  "#A855F7", // purple
  "#6366F1", // indigo
  "#14B8A6", // teal
  "#78716C", // warm gray
  "#6B7280", // cool gray
  "#1E293B", // slate
];

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isLight(hex: string) {
  return luminance(hex) > 140;
}

export function ColorPicker({
  value,
  onChange,
  name,
}: {
  value?: string;
  onChange?: (color: string) => void;
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value || PRESET_COLORS[0];

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selected} />

      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
        Color
      </label>

      {/* Trigger button with preview */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-bg-page px-4 py-3 text-sm transition-all duration-150 hover:border-primary/30 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.15)] focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <span
          className="h-6 w-6 shrink-0 rounded-lg border border-white/10 shadow-sm"
          style={{ backgroundColor: selected }}
        />
        <span className="font-mono text-sm text-text-primary">{selected}</span>
        <span className="ml-auto text-xs text-text-muted">▼</span>
      </button>

      {/* Dropdown palette */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-border/60 bg-bg-elevated p-4 shadow-[var(--shadow-premium)] backdrop-blur-xl">
            <p className="mb-3 text-xs font-medium text-text-muted">Preset colors</p>
            <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-5">
              {PRESET_COLORS.map((color) => {
                const isSelected = selected === color;
                const light = isLight(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      onChange?.(color);
                      setOpen(false);
                    }}
                    className="group relative flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-all duration-150 hover:scale-105 active:scale-95"
                    style={{ backgroundColor: color }}
                  >
                    {isSelected && (
                      <span className="absolute inset-0 rounded-xl ring-2 ring-white/60 ring-offset-2 ring-offset-bg-elevated" />
                    )}
                    <span
                      className={`text-[9px] font-mono font-semibold opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${light ? "text-black/70" : "text-white/70"}`}
                    >
                      {color}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
