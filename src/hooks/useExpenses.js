import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { DEMO_EXPENSES } from "../lib/demo";
import { getAvailableMonths } from "../lib/analytics";

// "YYYY-MM" string for a {year, month(0-based)} pair.
const monthKey = ({ year, month }) =>
  `${year}-${String(month + 1).padStart(2, "0")}`;

// Previous calendar month of a {year, month} pair.
const prevOf = ({ year, month }) =>
  month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };

// Month-aware loader. Fetches the list of months from the backend, then only
// the selected + previous month's expenses (for the MoM deltas) plus all
// unlabeled ones — so the dashboard scales to years of history.
// Falls back to demo data if the backend is unreachable or empty.
export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [months, setMonths] = useState([]); // [{year, month}] newest first
  const [picked, setPicked] = useState(null); // user-chosen {year, month} or null
  const [selected, setSelected] = useState(null);
  const [source, setSource] = useState("loading"); // 'live' | 'demo' | 'loading'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const monthRows = await api.months();
        if (!Array.isArray(monthRows) || monthRows.length === 0)
          throw new Error("no data");

        const available = monthRows.map(({ month }) => {
          const [y, m] = month.split("-").map(Number);
          return { year: y, month: m - 1 };
        });
        const sel =
          (picked &&
            available.find(
              (m) => m.year === picked.year && m.month === picked.month
            )) ||
          available[0];

        const [cur, prev, unlabeled] = await Promise.all([
          api.listExpenses({ month: monthKey(sel) }),
          api.listExpenses({ month: monthKey(prevOf(sel)) }).catch(() => []),
          api.listExpenses({ unlabeledOnly: true }).catch(() => []),
        ]);
        // Merge, de-duped by id (unlabeled rows may also be in a fetched month).
        const byId = new Map();
        for (const e of [...cur, ...prev, ...unlabeled]) byId.set(e.id, e);

        if (cancelled) return;
        setMonths(available);
        setSelected(sel);
        setExpenses([...byId.values()]);
        setSource("live");
      } catch (err) {
        if (cancelled) return;
        setExpenses(DEMO_EXPENSES);
        setMonths(getAvailableMonths(DEMO_EXPENSES));
        setSelected(picked || getAvailableMonths(DEMO_EXPENSES)[0] || null);
        setSource("demo");
        if (err.message !== "no data") setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [picked, tick]);

  // Label an unknown expense. Optimistic update; syncs to backend if live.
  const labelExpense = useCallback(
    async (id, merchant, category) => {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, merchant, category, is_labeled: true } : e
        )
      );
      if (source === "live") {
        try {
          await api.updateExpense(id, { merchant, category, is_labeled: true });
        } catch {
          /* keep optimistic state; backend will reconcile on next load */
        }
      }
    },
    [source]
  );

  // Edit any expense (rename/recategorize). Optimistic; the backend PATCH also
  // feeds rename-learning so future SMS parse to the corrected name.
  const updateExpense = useCallback(
    async (id, { merchant, category }) => {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, merchant, category, is_labeled: true } : e
        )
      );
      if (source === "live") {
        try {
          await api.updateExpense(id, { merchant, category, is_labeled: true });
        } catch {
          /* keep optimistic state; backend reconciles on next load */
        }
      }
    },
    [source]
  );

  // Delete an expense. Optimistic removal.
  const deleteExpense = useCallback(
    async (id) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      if (source === "live") {
        try {
          await api.deleteExpense(id);
        } catch {
          /* row returns on next load if the delete didn't land */
        }
      }
    },
    [source]
  );

  return {
    expenses,
    months,
    selected,
    selectMonth: setPicked,
    source,
    loading,
    error,
    reload,
    labelExpense,
    updateExpense,
    deleteExpense,
  };
}
