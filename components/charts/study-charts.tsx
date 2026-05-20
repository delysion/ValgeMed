"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const lightColors = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6"];
const chartGrid = "#E8E4DB";
const chartText = "#94A3B8";
const tooltipBg = "#FAF8F5";
const tooltipBorder = "#D0CBC2";

export function MinutesBarChart({
  data,
}: {
  data: Array<{ name: string; minutes: number }>;
}) {
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
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="name" stroke={chartText} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={chartText} fontSize={11} domain={domain} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "#F8F9FA" }}
          contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
        />
        <Bar dataKey={dataKey} radius={[6, 6, 2, 2]} fill="#7C3AED" />
      </BarChart>
    </ResponsiveContainer>
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
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke={chartGrid} vertical={false} />
        <XAxis dataKey="date" stroke={chartText} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={chartText} fontSize={11} domain={[0, 10]} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
        />
        {lines.map((line, index) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color ?? lightColors[index % lightColors.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MethodPieChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={44} outerRadius={76}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={lightColors[index % lightColors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
