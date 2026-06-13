// Derives all dashboard metrics from a flat list of expenses, for a given month.

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const monthLabel = (year, month) => `${MONTHS[month]} ${year}`;

// Distinct {year, month} present in the data, newest first.
export function getAvailableMonths(expenses) {
  const map = new Map();
  for (const e of expenses) {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map.has(key)) map.set(key, { year: d.getFullYear(), month: d.getMonth() });
  }
  const list = [...map.values()].sort((a, b) => b.year - a.year || b.month - a.month);
  return list;
}

export function computeAnalytics(expenses, target) {
  const labeled = expenses.filter((e) => e.is_labeled);
  const unlabeled = expenses.filter((e) => !e.is_labeled);

  const now = new Date();
  const curYear = target?.year ?? now.getFullYear();
  const curMonth = target?.month ?? now.getMonth();

  const inMonth = (e, monthOffset = 0) => {
    const d = new Date(e.date);
    const t = new Date(curYear, curMonth + monthOffset, 1);
    return d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  };

  const thisMonth = labeled.filter((e) => inMonth(e, 0));
  const lastMonth = labeled.filter((e) => inMonth(e, -1));

  // Spending is debits; income is credits. Rows predating income tracking have
  // no `direction` and count as debits (spending), so old totals are unchanged.
  const isIncome = (e) => e.direction === "credit";
  const thisMonthSpend = thisMonth.filter((e) => !isIncome(e));
  const lastMonthSpend = lastMonth.filter((e) => !isIncome(e));

  const total = thisMonthSpend.reduce((s, e) => s + e.amount, 0);
  const income = thisMonth.filter(isIncome).reduce((s, e) => s + e.amount, 0);
  const net = income - total;
  const lastTotal = lastMonthSpend.reduce((s, e) => s + e.amount, 0);
  const totalDelta = lastTotal > 0 ? ((total - lastTotal) / lastTotal) * 100 : 0;

  const txCount = thisMonth.length;
  const lastTxCount = lastMonth.length;

  // card vs UPI split for the month (spending only)
  const cardTotal = thisMonthSpend
    .filter((e) => e.method === "card")
    .reduce((s, e) => s + e.amount, 0);
  const upiTotal = total - cardTotal;

  // category totals (spending only — income is never a spend category)
  const byCat = {};
  for (const e of thisMonthSpend) {
    const c = e.category || "Other";
    byCat[c] = (byCat[c] || 0) + e.amount;
  }
  const categories = Object.entries(byCat)
    .map(([name, value]) => ({ name, value, pct: total ? (value / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value);
  const topCategory = categories[0] || { name: "—", value: 0, pct: 0 };

  const isCurrentMonth = curMonth === now.getMonth() && curYear === now.getFullYear();
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const daysElapsed = Math.max(1, isCurrentMonth ? now.getDate() : daysInMonth);
  const avgPerDay = total / daysElapsed;

  // per-day series for the selected month
  const series = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayTotal = thisMonthSpend
      .filter((e) => new Date(e.date).getDate() === d)
      .reduce((s, e) => s + e.amount, 0);
    series.push({ day: d, label: `${MONTHS[curMonth]} ${d}`, amount: Math.round(dayTotal) });
  }

  // transactions IN the selected month (newest first) for the table
  const monthTransactions = [...thisMonth].sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    total,
    income,
    net,
    totalDelta,
    txCount,
    txDelta: txCount - lastTxCount,
    topCategory,
    avgPerDay,
    daysElapsed,
    cardTotal,
    upiTotal,
    categories,
    series,
    monthTransactions,
    monthName: MONTHS[curMonth],
    monthLabel: monthLabel(curYear, curMonth),
    unlabeled: [...unlabeled].sort((a, b) => new Date(b.date) - new Date(a.date)),
    isEmpty: expenses.length === 0,
  };
}
