import { useEffect, useRef, useState } from "react";
import { Repeat, CalendarClock, X, Undo2 } from "lucide-react";
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

// Rough monthly cost of one payment, mirroring the backend's normalization, so
// dismissing a row decrements the header total by the right amount.
function monthlyEquivalent(r) {
  switch ((r.cadence || "").toLowerCase()) {
    case "weekly":
      return r.amount * 4.345;
    case "fortnightly":
    case "biweekly":
      return r.amount * 2.173;
    case "quarterly":
      return r.amount / 3;
    case "yearly":
    case "annually":
      return r.amount / 12;
    case "daily":
      return r.amount * 30.4;
    default:
      return r.amount;
  }
}

// Detected subscriptions / EMIs / regular bills with predicted next-due dates.
// Fed by the backend /recurring detector. Rows can be dismissed (with undo).
export default function RecurringCard({ source }) {
  const [data, setData] = useState(null); // null = loading / unavailable
  const [items, setItems] = useState([]);
  const [removedMonthly, setRemovedMonthly] = useState(0);
  const [undo, setUndo] = useState(null); // { item, index }
  const undoTimer = useRef(null);

  useEffect(() => {
    let alive = true;
    if (source === "live") {
      api
        .recurring()
        .then((d) => {
          if (!alive) return;
          setData(d);
          setItems(d.recurring || []);
          setRemovedMonthly(0);
        })
        .catch(() => alive && setData(null));
    }
    return () => {
      alive = false;
    };
  }, [source]);

  useEffect(() => () => clearTimeout(undoTimer.current), []);

  function dismiss(item, index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setRemovedMonthly((m) => m + monthlyEquivalent(item));
    setUndo({ item, index });
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
    api.dismissRecurring(item.merchant).catch(() => {});
  }

  function restore() {
    if (!undo) return;
    const { item, index } = undo;
    setItems((prev) => {
      const next = [...prev];
      next.splice(Math.min(index, next.length), 0, item);
      return next;
    });
    setRemovedMonthly((m) => Math.max(0, m - monthlyEquivalent(item)));
    setUndo(null);
    clearTimeout(undoTimer.current);
    api.restoreRecurring(item.merchant).catch(() => {});
  }

  if (source !== "live" || data === null) return null;
  const monthlyTotal = Math.max(0, (data.monthly_total || 0) - removedMonthly);

  return (
    <div className="mb-[18px] rounded-card border border-border bg-card p-[18px]">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[14px] font-semibold">
          <Repeat size={15} className="text-accent2" /> Upcoming payments
        </h3>
        {items.length > 0 && (
          <span className="text-[12px] text-muted">
            ~{formatINR(monthlyTotal)}/mo · {items.length} recurring
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-3 text-[12.5px] text-muted2">
          {undo
            ? "Dismissed — undo below, or pull fresh data to recheck."
            : "No recurring payments detected yet — subscriptions, EMIs and regular bills show up here automatically as Klaro spots the pattern."}
        </p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((r, i) => {
            const color = categoryColor(r.category || "Other");
            const due = dueLabel(r.next_due);
            return (
              <div key={r.merchant} className="group flex items-center gap-3 py-2.5">
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
                <button
                  type="button"
                  onClick={() => dismiss(r, i)}
                  title="Dismiss — I no longer pay this"
                  aria-label={`Dismiss ${r.merchant}`}
                  className="shrink-0 rounded-md p-1 text-muted2 opacity-0 transition hover:bg-neg/15 hover:text-neg focus:opacity-100 group-hover:opacity-100"
                >
                  <X size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {undo && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-bg/40 px-3 py-2 text-[12px]">
          <span className="text-muted2">
            Dismissed <span className="text-text">{undo.item.merchant}</span>
          </span>
          <button
            type="button"
            onClick={restore}
            className="flex items-center gap-1 font-semibold text-accent2 hover:underline"
          >
            <Undo2 size={13} /> Undo
          </button>
        </div>
      )}
    </div>
  );
}
