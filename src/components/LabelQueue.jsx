import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { ALL_CATEGORIES, formatDateTime, formatINR } from "../lib/format";

function LabelRow({ expense, onSave }) {
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = merchant.trim() && category;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSave(expense.id, merchant.trim(), category);
    // row animates out via parent list (expense leaves unlabeled set)
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
      className="flex items-center gap-3 rounded-[10px] border border-border bg-surface px-3.5 py-[13px]"
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[rgba(242,201,76,0.13)] font-bold text-warn">
        ?
      </div>
      <div className="min-w-0 leading-tight">
        <b className="block truncate text-[13px] font-semibold">{expense.upi_id}</b>
        <span className="text-[11.5px] text-muted2">
          {formatINR(expense.amount)} debited · {formatDateTime(expense.date)}
        </span>
      </div>
      <span className="num ml-1 shrink-0 font-bold">−{formatINR(expense.amount)}</span>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <input
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="Merchant name"
          className="w-[150px] rounded-[7px] border border-border2 bg-bg px-[11px] py-[7px] text-[12.5px] outline-none placeholder:text-muted2 focus:border-accent2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-[120px] rounded-[7px] border border-border2 bg-bg px-[11px] py-[7px] text-[12.5px] outline-none focus:border-accent2"
        >
          <option value="">Category</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="flex items-center gap-1.5 rounded-[7px] px-3.5 py-[7px] text-[12.5px] font-semibold text-white transition-opacity disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg,#5E6AD2,#828FFF)",
            boxShadow: "0 2px 10px rgba(94,106,210,0.35)",
          }}
        >
          {saving ? <Check size={14} /> : "Save"}
        </button>
      </div>
    </motion.div>
  );
}

export default function LabelQueue({ unlabeled, onLabel }) {
  if (unlabeled.length === 0) {
    return (
      <div className="rounded-card border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[rgba(76,183,130,0.13)]">
          <Check size={22} className="text-pos" />
        </div>
        <div className="text-[14px] font-semibold">All caught up</div>
        <div className="mt-1 text-[12.5px] text-muted2">
          No unknown merchants to label right now.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <h2 className="text-[14px] font-semibold">Needs labeling</h2>
        <span className="rounded-full bg-[rgba(242,201,76,0.13)] px-2 py-px text-[11px] font-bold text-warn">
          {unlabeled.length}
        </span>
      </div>
      <p className="mb-2.5 mt-0.5 text-[12px] text-muted2">
        Unknown UPI IDs detected from your SMS — label them so future payments
        auto-categorize.
      </p>
      <div className="flex flex-col gap-2.5">
        <AnimatePresence mode="popLayout">
          {unlabeled.map((e) => (
            <LabelRow key={e.id} expense={e} onSave={onLabel} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
