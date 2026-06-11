// ---------- Formatting helpers ----------

export function formatINR(amount, { compact = false } = {}) {
  const n = Number(amount) || 0;
  if (compact && n >= 1000) {
    return "₹" + (n / 1000).toFixed(n >= 10000 ? 1 : 2).replace(/\.0$/, "") + "k";
  }
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ---------- Category colors (Linear-tuned palette) ----------
export const CATEGORY_COLORS = {
  Food: "#5E6AD2",
  Grocery: "#828FFF",
  Transport: "#4CB782",
  Shopping: "#F2C94C",
  Entertainment: "#E879A6",
  Personal: "#38BDF8",
  Bills: "#56B6C2",
  Transfer: "#A78BFA",
  Health: "#4ADE80",
  Fuel: "#FB923C",
  Cash: "#94A3B8",
  Other: "#7A7F88",
};

export const ALL_CATEGORIES = [
  "Food",
  "Grocery",
  "Shopping",
  "Transport",
  "Entertainment",
  "Personal",
  "Bills",
  "Transfer",
  "Health",
  "Fuel",
  "Cash",
  "Other",
];

export function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
}

export function initialFor(name) {
  return (name || "?").trim().charAt(0).toUpperCase() || "?";
}
