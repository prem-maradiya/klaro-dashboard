import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { ALL_CATEGORIES, formatDateTime, formatINR } from "../lib/format";

// Edit any transaction from the web: rename, recategorize, or delete.
// Saving PATCHes the backend, which also learns the rename/category so
// future SMS auto-apply the correction (same engine the phone app uses).
export default function EditExpenseModal({ expense, onClose, onSave, onDelete }) {
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("Other");

  useEffect(() => {
    if (expense) {
      setMerchant(expense.merchant || "");
      setCategory(
        ALL_CATEGORIES.includes(expense.category) ? expense.category : "Other"
      );
    }
  }, [expense]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSave = merchant.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    onSave(expense.id, { merchant: merchant.trim(), category });
    onClose();
  };

  const remove = () => {
    onDelete(expense.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {expense && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-[2px]"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            className="w-[420px] rounded-card border border-border bg-card p-5 shadow-2xl"
          >
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">Edit transaction</h3>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-muted2 hover:bg-surface hover:text-muted"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mb-4 text-[12px] text-muted2">
              <span className="num font-bold">−{formatINR(expense.amount)}</span>
              {" · "}
              {formatDateTime(expense.date)}
              {expense.upi_id ? ` · ${expense.upi_id}` : ""}
            </p>

            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-muted2">
              Merchant / name
            </label>
            <input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              autoFocus
              className="mb-3 w-full rounded-[8px] border border-border2 bg-bg px-3 py-2 text-[13px] outline-none focus:border-accent2"
            />

            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-muted2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mb-5 w-full rounded-[8px] border border-border2 bg-bg px-3 py-2 text-[13px] outline-none focus:border-accent2"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between">
              <button
                onClick={remove}
                className="flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[12.5px] font-semibold text-neg hover:bg-[rgba(235,87,87,0.1)]"
              >
                <Trash2 size={14} /> Delete
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="rounded-[8px] border border-border2 px-3.5 py-2 text-[12.5px] font-semibold text-muted hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={!canSave}
                  className="rounded-[8px] px-4 py-2 text-[12.5px] font-semibold text-white disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg,#5E6AD2,#828FFF)",
                    boxShadow: "0 2px 10px rgba(94,106,210,0.35)",
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
