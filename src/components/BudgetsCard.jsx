import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { api } from "../api";
import { ALL_CATEGORIES, categoryColor, formatINR } from "../lib/format";

const OVERALL = "overall";

function barColor(pct) {
  if (pct >= 100) return "#EB5757";
  if (pct >= 80) return "#F2C94C";
  return "#828FFF";
}

function BudgetRow({ b, onEdit, onRemove }) {
  const pct = Math.min(b.pct, 100);
  const over = b.pct >= 100;
  const name = b.category === OVERALL ? "Monthly budget" : b.category;
  const dot = b.category === OVERALL ? "#828FFF" : categoryColor(b.category);

  return (
    <div className="group flex items-center gap-3 py-2">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: dot }}
      />
      <span className="w-[130px] shrink-0 truncate text-[12.5px] font-semibold">
        {name}
      </span>
      <div className="h-[7px] min-w-0 flex-1 overflow-hidden rounded-full bg-surface2">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: barColor(b.pct) }}
        />
      </div>
      <span className="num w-[150px] shrink-0 text-right text-[12px] text-muted">
        {formatINR(b.spent)} / {formatINR(b.amount)}
        <b
          className="ml-1.5"
          style={{ color: over ? "#EB5757" : b.pct >= 80 ? "#F2C94C" : "#8A8F98" }}
        >
          {b.pct.toFixed(0)}%
        </b>
      </span>
      <span className="flex w-[44px] shrink-0 justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(b)}
          title="Edit limit"
          className="rounded p-1 text-muted2 hover:bg-surface hover:text-muted"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onRemove(b.category)}
          title="Remove budget"
          className="rounded p-1 text-muted2 hover:bg-surface hover:text-neg"
        >
          <Trash2 size={13} />
        </button>
      </span>
    </div>
  );
}

// Monthly budgets with live progress for the selected month. Edits go
// straight to the backend; the phone app picks them up on next sync.
export default function BudgetsCard({ monthKey, source }) {
  const [rows, setRows] = useState(null); // null = loading / unavailable
  const [editing, setEditing] = useState(null); // category being edited
  const [adding, setAdding] = useState(false);
  const [addCategory, setAddCategory] = useState(OVERALL);
  const [amount, setAmount] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await api.budgetsStatus(monthKey);
      setRows(data.budgets || []);
    } catch {
      setRows(null);
    }
  }, [monthKey]);

  useEffect(() => {
    if (source === "live" && monthKey) refresh();
  }, [source, monthKey, refresh]);

  if (source !== "live" || rows === null) return null;

  const budgeted = new Set(rows.map((b) => b.category));
  const addable = [OVERALL, ...ALL_CATEGORIES].filter((c) => !budgeted.has(c));

  const startEdit = (b) => {
    setAdding(false);
    setEditing(b.category);
    setAmount(String(Math.round(b.amount)));
  };

  const save = async (category) => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    try {
      await api.putBudget(category, value);
      setEditing(null);
      setAdding(false);
      setAmount("");
      refresh();
    } catch {
      /* leave the editor open */
    }
  };

  const remove = async (category) => {
    try {
      await api.deleteBudget(category);
      refresh();
    } catch {
      /* ignore */
    }
  };

  // Shared amount input + save/cancel buttons for edit and add rows.
  const editorControls = (category, onCancel) => (
    <>
      <input
        autoFocus
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") save(category);
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Limit per month (₹)"
        className="w-[170px] rounded-[7px] border border-border2 bg-bg px-[11px] py-[6px] text-[12.5px] outline-none focus:border-accent2"
      />
      <button
        onClick={() => save(category)}
        className="rounded-[7px] px-3 py-[6px] text-[12px] font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#5E6AD2,#828FFF)" }}
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="rounded-[7px] border border-border2 px-3 py-[6px] text-[12px] font-semibold text-muted hover:bg-surface"
      >
        Cancel
      </button>
    </>
  );

  return (
    <div className="mb-[18px] rounded-card border border-border bg-card p-[18px]">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[14px] font-semibold">
          <Wallet size={15} className="text-accent2" /> Budgets
        </h3>
        {addable.length > 0 && !adding && (
          <button
            onClick={() => {
              setEditing(null);
              setAdding(true);
              setAddCategory(addable[0]);
              setAmount("");
            }}
            className="flex items-center gap-1 rounded-[7px] border border-border2 px-2.5 py-[5px] text-[12px] font-semibold text-muted hover:bg-surface"
          >
            <Plus size={13} /> Add budget
          </button>
        )}
      </div>

      {rows.length === 0 && !adding && (
        <p className="py-3 text-[12.5px] text-muted2">
          No budgets yet — add one to get progress bars here and threshold
          alerts on the phone.
        </p>
      )}

      <div className="divide-y divide-border">
        {rows.map((b) =>
          editing === b.category ? (
            <div key={b.category} className="flex items-center gap-2 py-2">
              <span className="w-[130px] shrink-0 text-[12.5px] font-semibold">
                {b.category === OVERALL ? "Monthly budget" : b.category}
              </span>
              {editorControls(b.category, () => setEditing(null))}
            </div>
          ) : (
            <BudgetRow key={b.category} b={b} onEdit={startEdit} onRemove={remove} />
          )
        )}
        {adding && (
          <div className="flex items-center gap-2 py-2">
            <select
              value={addCategory}
              onChange={(e) => setAddCategory(e.target.value)}
              className="w-[130px] shrink-0 rounded-[7px] border border-border2 bg-bg px-2 py-[6px] text-[12.5px] outline-none focus:border-accent2"
            >
              {addable.map((c) => (
                <option key={c} value={c}>
                  {c === OVERALL ? "Monthly (overall)" : c}
                </option>
              ))}
            </select>
            {editorControls(addCategory, () => setAdding(false))}
          </div>
        )}
      </div>
    </div>
  );
}
