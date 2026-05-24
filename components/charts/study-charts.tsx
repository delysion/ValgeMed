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

export function MinutesBarChart({ data }: { data: Array<{ name: string; minutes: number }> }) {
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
  return (
    <Bar
      data={{
        labels: data.map((d) => d.name as string),
        datasets: [{
          label: dataKey,
          data: data.map((d) => Number(d[dataKey])),
          backgroundColor: "#7C3AED",
          borderRadius: 6,
          borderSkipped: false,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
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
      height={220}
    />
  );
}

export function TrendLineChart({
  data,
  lines,
}: {
  data: Array<Record<string, string | number | null>>;
  lines: Array<{ key: string; color?: string }>;
}) {
  return (
    <Line
      data={{
        labels: data.map((d) => d.date as string),
        datasets: lines.map((line, index) => ({
          label: line.key,
          data: data.map((d) => Number(d[line.key])),
          borderColor: line.color ?? lightColors[index % lightColors.length],
          backgroundColor: line.color ?? lightColors[index % lightColors.length],
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
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
      height={220}
    />
  );
}

export function MethodPieChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <Doughnut
      data={{
        labels: data.map((d) => d.name),
        datasets: [{
          data: data.map((d) => d.value),
          backgroundColor: lightColors,
          borderWidth: 0,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: "42%",
        plugins: {
          tooltip: tooltipOptions,
          legend: { display: false },
        },
      }}
      height={200}
    />
  );
}
