import { useEffect, useRef, useState } from "react";
import { Download, ChevronDown, Loader2, Check } from "lucide-react";
import { api } from "../api";

// Turn "YYYY-MM" into "Jun 2026" for the menu label.
function prettyMonth(key) {
  if (!key) return "";
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return "";
  return new Date(y, m - 1, 1).toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// CSV export control: a dropdown to download this month / this year / all time.
// Disabled in demo mode (no backend to export from).
export default function ExportMenu({ monthKey, year, disabled }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(null); // scope currently downloading
  const [done, setDone] = useState(null); // scope just finished (brief ✓)
  const [error, setError] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function run(scope) {
    if (busy) return;
    setBusy(scope);
    setError("");
    setDone(null);
    try {
      const opts =
        scope === "month" ? { month: monthKey } : scope === "year" ? { year } : {};
      const { blob, filename } = await api.exportCsv(opts);
      triggerDownload(blob, filename);
      setDone(scope);
      setTimeout(() => {
        setOpen(false);
        setDone(null);
      }, 900);
    } catch (e) {
      setError(e?.message || "Export failed");
    } finally {
      setBusy(null);
    }
  }

  const items = [
    { scope: "month", label: "This month", note: prettyMonth(monthKey) },
    { scope: "year", label: "This year", note: year ? String(year) : "" },
    { scope: "all", label: "All time", note: "" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        title={disabled ? "Connect to a backend to export" : "Export transactions as CSV"}
        className="flex items-center gap-2 rounded-lg border border-border2 bg-surface px-3 py-[7px] text-[12.5px] font-semibold text-muted transition-colors hover:text-text hover:border-accent2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border2 disabled:hover:text-muted"
      >
        <Download size={14} className="text-muted" />
        Export
        <ChevronDown
          size={14}
          className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute right-0 z-20 mt-1.5 w-[200px] overflow-hidden rounded-lg border border-border2 bg-surface2 py-1 shadow-2xl">
          {items.map((it) => (
            <button
              key={it.scope}
              onClick={() => run(it.scope)}
              disabled={busy !== null}
              className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[12.5px] text-text transition-colors hover:bg-card disabled:opacity-60"
            >
              <span className="flex items-center gap-2">
                {busy === it.scope ? (
                  <Loader2 size={13} className="animate-spin text-accent2" />
                ) : done === it.scope ? (
                  <Check size={13} className="text-[#4CB782]" />
                ) : null}
                {it.label}
              </span>
              {it.note && <span className="text-[11px] text-muted2">{it.note}</span>}
            </button>
          ))}
          {error && (
            <div className="border-t border-border2 px-3 py-1.5 text-[11px] text-[#E5484D]">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
