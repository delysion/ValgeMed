"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

const colors = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6"];
const gridColor = "#F1F5F9";
const textColor = "#94A3B8";
const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 8,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

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
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#areaGrad)" />
      </AreaChart>
    </ResponsiveContainer>
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
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={entry.color ?? colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

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
