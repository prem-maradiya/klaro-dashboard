import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { categoryColor, formatINR } from "../lib/format";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border2 bg-surface2 px-3 py-2 shadow-xl">
      <div className="text-[11px] text-muted2">{d.name}</div>
      <div className="num text-[14px] font-bold text-text">
        {formatINR(d.value)} · {d.pct.toFixed(0)}%
      </div>
    </div>
  );
}

export default function CategoryDonut({ categories, total }) {
  return (
    <div className="rounded-card border border-border bg-card p-[18px]">
      <div className="mb-1.5">
        <h3 className="text-[14px] font-semibold">By category</h3>
        <div className="text-[11.5px] text-muted2">This month</div>
      </div>

      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-[130px] w-[130px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={2}
                strokeWidth={0}
                animationDuration={800}
              >
                {categories.map((c) => (
                  <Cell key={c.name} fill={categoryColor(c.name)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="num text-[20px] font-extrabold leading-none">
                {formatINR(total, { compact: true })}
              </div>
              <div className="mt-0.5 text-[10.5px] text-muted2">total</div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-[11px]">
          {categories.slice(0, 6).map((c) => (
            <div key={c.name} className="flex items-center gap-2.5 text-[12.5px]">
              <i
                className="h-[9px] w-[9px] rounded-[3px]"
                style={{ background: categoryColor(c.name) }}
              />
              <span className="text-text">{c.name}</span>
              <span className="ml-auto text-[11.5px] text-muted2">
                {c.pct.toFixed(0)}%
              </span>
              <span className="num min-w-[54px] text-right font-semibold">
                {formatINR(c.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
