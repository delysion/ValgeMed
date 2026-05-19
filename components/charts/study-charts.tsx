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

const colors = ["#79e7ff", "#c7a6ff", "#8ef0c4", "#f2d58a", "#ffb8c7", "#c8e7ff"];

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
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
        <XAxis dataKey="name" stroke="#a6adba" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#a6adba" fontSize={11} domain={domain} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{ background: "rgba(10,16,32,.96)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 16 }}
        />
        <Bar dataKey={dataKey} radius={[12, 12, 4, 4]} fill="#79e7ff" />
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
        <XAxis dataKey="date" stroke="#a6adba" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#a6adba" fontSize={11} domain={[0, 10]} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "rgba(10,16,32,.96)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 16 }}
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
          contentStyle={{ background: "rgba(10,16,32,.96)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 16 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
