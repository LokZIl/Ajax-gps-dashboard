"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/aggregate";

const PALETTE = [
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#22d3ee",
  "#818cf8",
  "#e879f9",
  "#f472b6",
  "#a3e635",
  "#38bdf8",
];

export default function CumulativeChart({
  chart,
  series,
}: {
  chart: ChartPoint[];
  series: { key: string; name: string }[];
}) {
  if (chart.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-white/50">
        Cumulative fines over the season
      </h2>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="gw"
              tickFormatter={(gw) => `GW${gw}`}
              stroke="#ffffff40"
              fontSize={12}
            />
            <YAxis stroke="#ffffff40" fontSize={12} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: "#14161d", border: "1px solid #23262f", borderRadius: 8 }}
              labelFormatter={(gw) => `Gameweek ${gw}`}
              formatter={(value, name) => [`$${value}`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
