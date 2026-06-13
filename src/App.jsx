import { useMemo, useState } from "react";
import { IndianRupee, ArrowLeftRight, PieChart, Clock, CreditCard, Smartphone } from "lucide-react";

import { useExpenses } from "./hooks/useExpenses";
import { computeAnalytics } from "./lib/analytics";
import { formatINR } from "./lib/format";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import KpiCard from "./components/KpiCard";
import CountUp from "./components/CountUp";
import SpendingChart from "./components/SpendingChart";
import CategoryDonut from "./components/CategoryDonut";
import TransactionsTable from "./components/TransactionsTable";
import LabelQueue from "./components/LabelQueue";
import EditExpenseModal from "./components/EditExpenseModal";
import BudgetsCard from "./components/BudgetsCard";

// Build an SVG polyline (62x26 viewBox) from a numeric array.
function sparkPoints(values) {
  if (!values.length) return "";
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const W = 62, H = 26, pad = 3;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1 || 1)) * W;
      const y = H - pad - ((v - min) / range) * (H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function App() {
  const {
    expenses,
    months,
    selected,
    selectMonth,
    source,
    reload,
    labelExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();
  const [nav, setNav] = useState("overview");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // transaction being edited

  const selectedKey = selected
    ? `${selected.year}-${String(selected.month + 1).padStart(2, "0")}`
    : null;

  const a = useMemo(() => computeAnalytics(expenses, selected), [expenses, selected]);

  const filteredTx = useMemo(() => {
    if (!search.trim()) return a.monthTransactions;
    const q = search.toLowerCase();
    return a.monthTransactions.filter(
      (e) =>
        e.merchant?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.upi_id?.toLowerCase().includes(q)
    );
  }, [a.monthTransactions, search]);

  const last7 = a.series.slice(-7).map((d) => d.amount);
  const txSpark = a.series.slice(-7).map((d, i) => i + (d.amount > 0 ? 1 : 0));

  return (
    <div className="grid min-h-screen grid-cols-[232px_1fr]">
      <Sidebar active={nav} onNavigate={setNav} unlabeledCount={a.unlabeled.length} />

      <main className="pb-16">
        <TopBar
          title="Overview"
          crumb={a.monthLabel}
          months={months}
          selected={selected}
          onSelectMonth={selectMonth}
          search={search}
          onSearch={setSearch}
          source={source}
          onReload={reload}
          monthKey={selectedKey}
        />

        <div className="max-w-[1280px] px-7 py-6">
          {/* KPI ROW */}
          <div className="mb-[18px] grid grid-cols-4 gap-3.5">
            <KpiCard
              index={0}
              icon={IndianRupee}
              iconColor="#828FFF"
              iconBg="rgba(94,106,210,0.14)"
              label="Total spent"
              delta={{
                value: `${Math.abs(a.totalDelta).toFixed(1)}%`,
                dir: a.totalDelta >= 0 ? "up" : "down",
                note: "vs prev month",
              }}
              sparkColor="#828FFF"
              sparkPoints={sparkPoints(last7)}
            >
              <span className="num">
                <CountUp value={a.total} format={(v) => formatINR(v)} />
              </span>
            </KpiCard>

            <KpiCard
              index={1}
              icon={ArrowLeftRight}
              iconColor="#4CB782"
              iconBg="rgba(76,183,130,0.12)"
              label="Transactions"
              delta={{
                value:
                  a.txDelta === 0
                    ? ""
                    : `${Math.abs(a.txDelta)} ${a.txDelta > 0 ? "more" : "fewer"}`,
                dir: a.txDelta > 0 ? "up" : a.txDelta < 0 ? "down" : null,
                note: "vs prev month",
              }}
              sparkColor="#4CB782"
              sparkPoints={sparkPoints(txSpark)}
            >
              <span className="num">
                <CountUp value={a.txCount} format={(v) => Math.round(v)} />
              </span>
            </KpiCard>

            <KpiCard
              index={2}
              icon={PieChart}
              iconColor="#828FFF"
              iconBg="rgba(130,143,255,0.12)"
              label="Top category"
              delta={{
                note: `${formatINR(a.topCategory.value)} · ${a.topCategory.pct.toFixed(
                  0
                )}% of spend`,
              }}
            >
              {a.topCategory.name}
            </KpiCard>

            <KpiCard
              index={3}
              icon={Clock}
              iconColor="#F2C94C"
              iconBg="rgba(242,201,76,0.12)"
              label="Avg / day"
              delta={{ note: `over ${a.daysElapsed} days` }}
            >
              <span className="num">
                <CountUp value={a.avgPerDay} format={(v) => formatINR(v)} />
              </span>
            </KpiCard>
          </div>

          {/* CARD vs UPI SPLIT */}
          <MethodSplit upi={a.upiTotal} card={a.cardTotal} total={a.total} />

          {/* BUDGETS */}
          <BudgetsCard monthKey={selectedKey} source={source} />

          {/* CHART ROW */}
          <div className="mb-[18px] grid grid-cols-[1.9fr_1fr] gap-3.5">
            <SpendingChart series={a.series} monthName={a.monthName} />
            <CategoryDonut categories={a.categories} total={a.total} />
          </div>

          {/* TRANSACTIONS (full month list, searchable, click to edit) */}
          <div className="mb-[18px]">
            <TransactionsTable
              transactions={filteredTx}
              title={search ? "Search results" : `Transactions · ${a.monthLabel}`}
              scroll
              onEdit={setEditing}
            />
          </div>

          {/* LABEL QUEUE */}
          <LabelQueue unlabeled={a.unlabeled} onLabel={labelExpense} />
        </div>
      </main>

      <EditExpenseModal
        expense={editing}
        onClose={() => setEditing(null)}
        onSave={updateExpense}
        onDelete={deleteExpense}
      />
    </div>
  );
}

function MethodSplit({ upi, card, total }) {
  const t = total || 1;
  const upiPct = (upi / t) * 100;
  const cardPct = (card / t) * 100;
  return (
    <div className="mb-[18px] rounded-card border border-border bg-card p-[18px]">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold">Payment method</h3>
        <div className="flex gap-4 text-[12px]">
          <span className="flex items-center gap-1.5 text-muted">
            <Smartphone size={13} className="text-accent2" /> UPI {formatINR(upi)} ({upiPct.toFixed(0)}%)
          </span>
          <span className="flex items-center gap-1.5 text-muted">
            <CreditCard size={13} style={{ color: "#A78BFA" }} /> Card {formatINR(card)} ({cardPct.toFixed(0)}%)
          </span>
        </div>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface2">
        <div style={{ width: `${upiPct}%`, background: "linear-gradient(90deg,#5E6AD2,#828FFF)" }} />
        <div style={{ width: `${cardPct}%`, background: "#A78BFA" }} />
      </div>
    </div>
  );
}
