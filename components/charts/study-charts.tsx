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

const colors = ["#a8d8ff", "#b9a7ff", "#d8dee9", "#7dd3fc", "#c4b5fd", "#94a3b8"];

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
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="name" stroke="#98a3b3" fontSize={11} />
        <YAxis stroke="#98a3b3" fontSize={11} domain={domain} />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{ background: "#10141c", border: "1px solid rgba(255,255,255,.1)" }}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} fill="#a8d8ff" />
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
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="date" stroke="#98a3b3" fontSize={11} />
        <YAxis stroke="#98a3b3" fontSize={11} domain={[0, 10]} />
        <Tooltip
          contentStyle={{ background: "#10141c", border: "1px solid rgba(255,255,255,.1)" }}
        />
        {lines.map((line, index) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color ?? colors[index % colors.length]}
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
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#10141c", border: "1px solid rgba(255,255,255,.1)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
