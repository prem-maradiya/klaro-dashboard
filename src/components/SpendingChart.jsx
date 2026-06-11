import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatINR } from "../lib/format";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border2 bg-surface2 px-3 py-2 shadow-xl">
      <div className="text-[11px] text-muted2">{label}</div>
      <div className="num text-[14px] font-bold text-text">
        {formatINR(payload[0].value)}
      </div>
    </div>
  );
}

export default function SpendingChart({ series, monthName = "" }) {
  const [range, setRange] = useState("Day");

  // Aggregate by week if selected
  let data = series;
  if (range === "Week") {
    const weeks = [];
    for (let i = 0; i < series.length; i += 7) {
      const chunk = series.slice(i, i + 7);
      const amount = chunk.reduce((s, d) => s + d.amount, 0);
      weeks.push({ label: `Wk ${weeks.length + 1}`, amount });
    }
    data = weeks;
  }

  return (
    <div className="rounded-card border border-border bg-card p-[18px]">
      <div className="mb-1.5 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-semibold">Spending over time</h3>
          <div className="text-[11.5px] text-muted2">Daily spend, {monthName}</div>
        </div>
        <div className="flex gap-0.5 rounded-lg bg-surface2 p-[3px]">
          {["Day", "Week"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                range === r ? "bg-card text-text shadow" : "text-muted"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5E6AD2" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#5E6AD2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1E1F23" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#62666D", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={range === "Day" ? 6 : 0}
            />
            <YAxis
              tick={{ fill: "#62666D", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#26272C" }} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#828FFF"
              strokeWidth={2.5}
              fill="url(#areaFill)"
              animationDuration={900}
              dot={false}
              activeDot={{ r: 4, fill: "#828FFF", stroke: "#08090A", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
