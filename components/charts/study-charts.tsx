"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

import { normalizeChartNumber } from "@/lib/charts/data";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Filler);

const lightColors = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6"];
const gridColor = "#E8E4DB";
const textColor = "#94A3B8";

const tooltipOptions = {
  backgroundColor: "#FAF8F5",
  titleColor: "#1E1B4B",
  bodyColor: "#1E1B4B",
  borderColor: "#D0CBC2",
  borderWidth: 1,
  cornerRadius: 8,
  padding: 8,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

function ChartFrame({
  children,
  height,
}: {
  children: React.ReactNode;
  height: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        height,
        minHeight: height,
        maxHeight: height,
        overflow: "hidden",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}

export function MinutesBarChart({ data }: { data: Array<{ name: string; minutes: number }> }) {
  if (!data || data.length === 0) return null;
  return <MetricBarChart data={data} dataKey="minutes" />;
}

export function MetricBarChart({
  data,
  dataKey,
  domain,
}: {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  domain?: [number, number];
}) {
  if (!data || data.length === 0) return null;

  return (
    <ChartFrame height={220}>
      <Bar
        data={{
          labels: data.map((d) => d.name as string),
          datasets: [{
            label: dataKey,
            data: data.map((d) => normalizeChartNumber(d[dataKey], { min: domain?.[0], max: domain?.[1], fallback: 0 })),
            backgroundColor: "#7C3AED",
            borderRadius: 6,
            borderSkipped: false,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          resizeDelay: 100,
          animation: false,
          plugins: {
            tooltip: tooltipOptions,
            legend: { display: false },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 11 } },
            },
            y: {
              min: domain?.[0],
              max: domain?.[1],
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 11 } },
            },
          },
        }}
      />
    </ChartFrame>
  );
}

export function TrendLineChart({
  data,
  lines,
}: {
  data: Array<Record<string, string | number | null>>;
  lines: Array<{ key: string; color?: string }>;
}) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <ChartFrame height={220}>
      <Line
        data={{
          labels: data.map((d) => d.date as string),
          datasets: lines.map((line, index) => ({
            label: line.key,
            data: data.map((d) => normalizeChartNumber(d[line.key], { min: 0, max: 10 })),
            borderColor: line.color ?? lightColors[index % lightColors.length],
            backgroundColor: line.color ?? lightColors[index % lightColors.length],
            borderWidth: 2,
            pointRadius: 0,
            spanGaps: true,
            tension: 0.3,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          resizeDelay: 100,
          animation: false,
          plugins: {
            tooltip: tooltipOptions,
            legend: { display: false },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 11 } },
            },
            y: {
              min: 0,
              max: 10,
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 11 } },
            },
          },
        }}
        redraw={false}
      />
    </ChartFrame>
  );
}

export function MethodPieChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <ChartFrame height={200}>
      <Doughnut
        data={{
          labels: data.map((d) => d.name),
          datasets: [{
            data: data.map((d) => normalizeChartNumber(d.value, { min: 0, fallback: 0 })),
            backgroundColor: lightColors,
            borderWidth: 0,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          resizeDelay: 100,
          cutout: "42%",
          plugins: {
            tooltip: tooltipOptions,
            legend: { display: false },
          },
        }}
      />
    </ChartFrame>
  );
}
