import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Tag,
  Settings,
  LineChart,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "categories", label: "Categories", icon: PieChart },
  { id: "labels", label: "Labels", icon: Tag, badgeKey: true },
];

export default function Sidebar({ active, onNavigate, unlabeledCount = 0, demo = false }) {
  return (
    <aside className="sticky top-0 flex h-screen w-[232px] flex-col gap-1 border-r border-border bg-surface px-3.5 py-[18px]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 pb-4 pt-1.5">
        <div
          className="grid h-7 w-7 place-items-center rounded-lg"
          style={{
            background: "linear-gradient(135deg,#5E6AD2,#828FFF)",
            boxShadow: "0 4px 14px rgba(94,106,210,0.4)",
          }}
        >
          <LineChart size={16} color="#fff" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <b className="text-[14.5px] font-bold">Expense</b>
          <span className="-mt-0.5 block text-[11px] text-muted2">Tracker</span>
        </div>
      </div>

      <div className="px-2 pb-1.5 pt-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-muted2">
        Menu
      </div>

      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate?.(item.id)}
            className={`relative flex items-center gap-2.5 rounded-lg px-[9px] py-2 text-[13.5px] font-medium transition-colors ${
              isActive
                ? "bg-accent-soft text-[#C9CEFF]"
                : "text-muted hover:bg-surface2 hover:text-text"
            }`}
          >
            <Icon size={16} className={isActive ? "text-accent2" : "opacity-80"} />
            {item.label}
            {item.badgeKey && unlabeledCount > 0 && (
              <span className="ml-auto rounded-full bg-warn px-[7px] py-px text-[10.5px] font-bold text-[#1a1500]">
                {unlabeledCount}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="nav-active"
                className="absolute inset-0 -z-10 rounded-lg bg-accent-soft"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        );
      })}

      <div className="px-2 pb-1.5 pt-3.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-muted2">
        General
      </div>
      <button className="flex items-center gap-2.5 rounded-lg px-[9px] py-2 text-[13.5px] font-medium text-muted transition-colors hover:bg-surface2 hover:text-text">
        <Settings size={16} className="opacity-80" />
        Settings
      </button>

      {/* Footer user */}
      <SidebarUser demo={demo} />
    </aside>
  );
}

// Whoever is actually signed in — previously the name and email here were
// hardcoded, which was wrong twice over: any other user saw someone else's
// identity in their own sidebar, and the public demo would have published a
// real personal email to every visitor. Now it reads the live Supabase user,
// and shows a neutral placeholder when there is nobody to read.
function SidebarUser({ demo }) {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    if (demo) return; // no session in demo mode, and nothing to look up
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setEmail(data?.user?.email ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [demo]);

  const name = demo ? "Demo user" : email ? email.split("@")[0] : "Signed in";
  const sub = demo ? "Sample data" : email || "—";
  const initial = (demo ? "D" : name[0] || "?").toUpperCase();

  return (
    <div className="mt-auto flex items-center gap-2.5 border-t border-border px-2 py-2.5">
      <div
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-bold"
        style={{ background: "linear-gradient(135deg,#3a3f55,#5E6AD2)" }}
      >
        {initial}
      </div>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[12.5px] font-semibold capitalize">{name}</div>
        <div className="truncate text-[11px] text-muted2" title={sub}>
          {sub}
        </div>
      </div>
    </div>
  );
}
