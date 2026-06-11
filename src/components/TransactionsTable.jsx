import { motion } from "framer-motion";
import {
  categoryColor,
  formatDateTime,
  formatINR,
  initialFor,
} from "../lib/format";

function hexA(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function TransactionsTable({
  transactions,
  limit,
  title = "Recent transactions",
  scroll = false,
}) {
  const rows = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="rounded-card border border-border bg-card p-[18px]">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold">
          {title} <span className="font-normal text-muted2">({transactions.length})</span>
        </h3>
      </div>

      {rows.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-muted2">
          No transactions this month.
        </div>
      ) : (
        <div className={scroll ? "max-h-[480px] overflow-y-auto" : ""}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Merchant", "Category", "Date", "Amount"].map((h, i) => (
                <th
                  key={h}
                  className={`border-b border-border px-2 py-[9px] text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted2 ${
                    i === 3 ? "text-right" : "text-left"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((t, i) => {
              const color = categoryColor(t.category || "Other");
              return (
                <motion.tr
                  key={t.id ?? i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="group"
                >
                  <td className="border-b border-border px-2 py-3 group-hover:bg-surface">
                    <div className="flex items-center gap-[11px]">
                      <div
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-[13px] font-bold"
                        style={{ background: hexA(color, 0.14), color }}
                      >
                        {initialFor(t.merchant)}
                      </div>
                      <div className="leading-tight">
                        <b className="block text-[13px] font-semibold">{t.merchant}</b>
                        <span className="text-[11px] text-muted2">
                          {t.upi_id || "—"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-border px-2 py-3 group-hover:bg-surface">
                    <span
                      className="rounded-md px-[9px] py-[3px] text-[11px] font-semibold"
                      style={{ background: hexA(color, 0.14), color }}
                    >
                      {t.category || "Other"}
                    </span>
                  </td>
                  <td className="border-b border-border px-2 py-3 text-[12px] text-muted group-hover:bg-surface">
                    {formatDateTime(t.date)}
                  </td>
                  <td className="num border-b border-border px-2 py-3 text-right text-[13px] font-bold group-hover:bg-surface">
                    −{formatINR(t.amount)}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
