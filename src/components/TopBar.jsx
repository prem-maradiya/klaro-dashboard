import { useEffect, useRef, useState } from "react";
import { Search, Calendar, ChevronDown, RefreshCw } from "lucide-react";
import { monthLabel } from "../lib/analytics";
import ConnectionSettings from "./ConnectionSettings";
import ExportMenu from "./ExportMenu";

export default function TopBar({
  title,
  crumb,
  months = [],
  selected,
  onSelectMonth,
  search,
  onSearch,
  source,
  onReload,
  monthKey,
}) {
  const isLive = source === "live";
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const label = selected ? monthLabel(selected.year, selected.month) : crumb;

  return (
    <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-bg/70 px-7 py-[18px] backdrop-blur-xl">
      <h1 className="text-[18px] font-bold">{title}</h1>
      {crumb && <span className="-ml-1.5 text-[13px] text-muted2">/ {crumb}</span>}

      <div className="flex-1" />

      {/* Search */}
      <div className="flex w-[240px] items-center gap-2 rounded-lg border border-border2 bg-surface px-3 py-[7px]">
        <Search size={14} className="text-muted2" />
        <input
          value={search}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder="Search transactions…"
          className="w-full bg-transparent text-[12.5px] text-text outline-none placeholder:text-muted2"
        />
      </div>

      {/* Month picker */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-border2 bg-surface px-3 py-[7px] text-[12.5px] font-semibold transition-colors hover:border-accent2"
        >
          <Calendar size={14} className="text-muted" />
          {label}
          <ChevronDown size={14} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && months.length > 0 && (
          <div className="absolute right-0 z-20 mt-1.5 max-h-[300px] w-[150px] overflow-y-auto rounded-lg border border-border2 bg-surface2 py-1 shadow-2xl">
            {months.map((m) => {
              const isSel = selected && selected.year === m.year && selected.month === m.month;
              return (
                <button
                  key={`${m.year}-${m.month}`}
                  onClick={() => {
                    onSelectMonth?.(m);
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-1.5 text-left text-[12.5px] transition-colors hover:bg-card ${
                    isSel ? "font-semibold text-accent2" : "text-text"
                  }`}
                >
                  {monthLabel(m.year, m.month)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CSV export */}
      <ExportMenu monthKey={monthKey} year={selected?.year} disabled={source !== "live"} />

      {/* Sync status */}
      <button
        onClick={onReload}
        title="Reload data"
        className="flex items-center gap-2 rounded-lg border border-border2 bg-surface px-3 py-[7px] text-[12.5px] text-muted transition-colors hover:text-text"
      >
        <span
          className="h-[7px] w-[7px] rounded-full"
          style={{
            background: isLive ? "#4CB782" : "#F2C94C",
            boxShadow: `0 0 8px ${isLive ? "#4CB782" : "#F2C94C"}`,
          }}
        />
        {isLive ? "Synced" : "Demo data"}
        <RefreshCw size={12} className="ml-0.5 opacity-70" />
      </button>

      {/* Backend connection (URL + API key) */}
      <ConnectionSettings onSaved={onReload} />
    </div>
  );
}
