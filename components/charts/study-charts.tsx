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

const balticColors = ["#7CAFD6", "#8B9CBF", "#4A7C6F", "#C9A45C", "#A86B7D", "#8FBDBA"];

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
        <CartesianGrid stroke="rgba(248,250,252,0.05)" vertical={false} />
        <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#94A3B8" fontSize={11} domain={domain} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(248,250,252,0.03)" }}
          contentStyle={{ background: "rgba(11,31,51,.96)", border: "1px solid rgba(248,250,252,.1)", borderRadius: 8 }}
        />
        <Bar dataKey={dataKey} radius={[6, 6, 2, 2]} fill="#7CAFD6" />
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
        <CartesianGrid stroke="rgba(248,250,252,0.05)" vertical={false} />
        <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 10]} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "rgba(11,31,51,.96)", border: "1px solid rgba(248,250,252,.1)", borderRadius: 8 }}
        />
        {lines.map((line, index) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color ?? balticColors[index % balticColors.length]}
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
            <Cell key={entry.name} fill={balticColors[index % balticColors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "rgba(11,31,51,.96)", border: "1px solid rgba(248,250,252,.1)", borderRadius: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
