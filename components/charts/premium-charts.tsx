"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Filler);

const colors = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6"];
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
};

function ChartEmpty({ height }: { height: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-dashed border-border bg-bg-subtle text-xs text-text-muted"
      style={{ height }}
    >
      No data yet
    </div>
  );
}

export function ActivityAreaChart({
  data,
  dataKey = "minutes",
  color = "#7C3AED",
  height = 200,
}: {
  data: Array<Record<string, string | number>>;
  dataKey?: string;
  color?: string;
  height?: number;
}) {
  if (data.length === 0) return <ChartEmpty height={height} />;
  const labels = data.map((d) => d.name as string);
  const values = data.map((d) => Number(d[dataKey]));
  const gradientId = `areaGrad_${dataKey}_${color.replace("#", "")}`;

  return (
    <div style={{ position: "relative", height }}>
      <canvas
        id={gradientId}
        ref={(el) => {
          if (!el) return;
          const ctx = el.getContext("2d");
          if (!ctx) return;
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, color + "33");
          gradient.addColorStop(1, color + "03");
          const chart = ChartJS.getChart(el);
          if (chart) {
            chart.data.datasets[0].backgroundColor = gradient;
            chart.update();
          }
        }}
        style={{ display: "none" }}
      />
      <Line
        data={{
          labels,
          datasets: [{
            label: dataKey,
            data: values,
            borderColor: color,
            backgroundColor: color + "33",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3,
            fill: true,
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
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 11 } },
              beginAtZero: true,
            },
          },
        }}
        height={height}
      />
    </div>
  );
}

export function StatusDonutChart({
  data,
  height = 200,
}: {
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
}) {
  if (data.length === 0 || data.every((d) => d.value === 0)) return <ChartEmpty height={height} />;
  return (
    <Doughnut
      data={{
        labels: data.map((d) => d.name),
        datasets: [{
          data: data.map((d) => d.value),
          backgroundColor: data.map((d, i) => d.color ?? colors[i % colors.length]),
          borderWidth: 0,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          tooltip: tooltipOptions,
          legend: { display: false },
        },
      }}
      height={height}
    />
  );
}
