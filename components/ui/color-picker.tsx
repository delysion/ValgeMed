"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#5746E5", "#7C3AED", "#06B6D4", "#0EA5E9", "#3B82F6",
  "#10B981", "#059669", "#84CC16", "#EAB308", "#F59E0B",
  "#F97316", "#EF4444", "#F43F5E", "#EC4899", "#A855F7",
  "#6366F1", "#14B8A6", "#78716C", "#6B7280", "#1E293B",
];

function luminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function textColor(hex: string) {
  return luminance(hex) > 140 ? "text-black/70" : "text-white/70";
}

export function ColorPicker({
  value,
  onChange,
  name,
  label = "Color",
  presetLabel = "Preset colors",
}: {
  value?: string;
  onChange?: (color: string) => void;
  name?: string;
  label?: string;
  presetLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value || PRESET_COLORS[0];

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selected} />

      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-bg-page px-4 py-3 text-sm transition-all duration-150 hover:border-primary/30 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.15)] focus:outline-none focus:ring-2 focus:ring-primary/30 active:scale-[0.98]"
      >
        <span
          className="h-6 w-6 shrink-0 rounded-lg border border-white/10 shadow-sm"
          style={{ backgroundColor: selected }}
        />
        <span className="font-mono text-sm text-text-primary">{selected}</span>
        <ChevronDown className={cn("ml-auto h-4 w-4 text-text-muted transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-border/60 bg-bg-elevated p-4 shadow-[var(--shadow-premium)] backdrop-blur-xl">
            {presetLabel && (
              <p className="mb-3 text-xs font-medium text-text-muted">{presetLabel}</p>
            )}
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-5 md:grid-cols-5">
              {PRESET_COLORS.map((color) => {
                const isSelected = selected === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      onChange?.(color);
                      setOpen(false);
                    }}
                    className="group relative flex aspect-square w-full items-center justify-center rounded-xl transition-all duration-150 hover:scale-110 active:scale-90"
                    style={{ backgroundColor: color }}
                  >
                    {isSelected && (
                      <span className="absolute inset-0 rounded-xl ring-2 ring-white/60 ring-offset-2 ring-offset-bg-elevated" />
                    )}
                    <span className={cn(
                      "text-[9px] font-mono font-semibold opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                      textColor(color),
                    )}>
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
