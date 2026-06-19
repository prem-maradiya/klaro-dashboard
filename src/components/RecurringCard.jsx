import { useEffect, useState } from "react";
import { Repeat, CalendarClock } from "lucide-react";
import { api } from "../api";
import { categoryColor, formatINR } from "../lib/format";

// "in 3 days" / "tomorrow" / "Jul 10" — and whether it's soon (highlight).
function dueLabel(iso) {
  const due = new Date(`${iso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((due - today) / 86400000);
  if (days <= 0) return { text: "due today", soon: true };
  if (days === 1) return { text: "tomorrow", soon: true };
  if (days <= 7) return { text: `in ${days} days`, soon: true };
  return {
    text: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    soon: false,
  };
}

// Detected subscriptions / EMIs / regular bills with predicted next-due dates.
// Fed by the backend /recurring detector.
export default function RecurringCard({ source }) {
  const [data, setData] = useState(null); // null = loading / unavailable

  useEffect(() => {
    let alive = true;
    if (source === "live") {
      api
        .recurring()
        .then((d) => alive && setData(d))
        .catch(() => alive && setData(null));
    }
    return () => {
      alive = false;
    };
  }, [source]);

  if (source !== "live" || data === null) return null;
  const items = data.recurring || [];

  return (
    <div className="mb-[18px] rounded-card border border-border bg-card p-[18px]">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[14px] font-semibold">
          <Repeat size={15} className="text-accent2" /> Upcoming payments
        </h3>
        {items.length > 0 && (
          <span className="text-[12px] text-muted">
            ~{formatINR(data.monthly_total)}/mo · {items.length} recurring
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-3 text-[12.5px] text-muted2">
          No recurring payments detected yet — subscriptions, EMIs and regular
          bills show up here automatically as Klaro spots the pattern.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((r, i) => {
            const color = categoryColor(r.category || "Other");
            const due = dueLabel(r.next_due);
            return (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">
                    {r.merchant}
                  </div>
                  <div className="text-[11px] text-muted2">
                    {r.cadence} · {r.category || "Other"}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="num text-[13px] font-bold">
                    {formatINR(r.amount)}
                  </div>
                  <div
                    className={`flex items-center justify-end gap-1 text-[11px] ${
                      due.soon ? "text-accent2" : "text-muted2"
                    }`}
                  >
                    <CalendarClock size={11} /> {due.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
