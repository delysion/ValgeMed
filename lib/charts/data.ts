export type ChartNumberOptions = {
  min?: number;
  max?: number;
  fallback?: number | null;
};

export function normalizeChartNumber(
  value: unknown,
  { min, max, fallback = null }: ChartNumberOptions = {},
) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max ?? parsed, Math.max(min ?? parsed, parsed));
}
