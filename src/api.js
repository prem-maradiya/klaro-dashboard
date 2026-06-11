// API client for the FastAPI backend.
// The connection (URL + API key) is configurable at runtime via the gear icon
// and stored in localStorage — so one deployed dashboard build works against
// any backend, and the key never ships inside the JS bundle.
// Falls back to VITE_API_URL, then localhost.
const DEFAULT_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const URL_KEY = "klaro_api_url";
const KEY_KEY = "klaro_api_key";

export function getConnection() {
  return {
    url: (localStorage.getItem(URL_KEY) || DEFAULT_URL).replace(/\/+$/, ""),
    key: localStorage.getItem(KEY_KEY) || "",
  };
}

export function saveConnection(url, key) {
  const u = (url || "").trim().replace(/\/+$/, "");
  if (u) localStorage.setItem(URL_KEY, u);
  else localStorage.removeItem(URL_KEY);
  const k = (key || "").trim();
  if (k) localStorage.setItem(KEY_KEY, k);
  else localStorage.removeItem(KEY_KEY);
}

function authHeaders(key) {
  return {
    "Content-Type": "application/json",
    ...(key ? { "X-API-Key": key } : {}),
  };
}

async function http(path, options = {}) {
  const { url, key } = getConnection();
  // Abort slow/unreachable requests so the UI can fall back to demo data.
  // (A free-tier backend waking from sleep can exceed this — hit Reload.)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${url}${path}`, {
      headers: authHeaders(key),
      signal: controller.signal,
      ...options,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    if (res.status === 204) return null;
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  getConnection,
  saveConnection,
  // Months that have data: [{month: "YYYY-MM", count, total}], newest first.
  months: () => http("/months"),
  listExpenses: ({ month, limit = 1000, unlabeledOnly = false } = {}) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (month) params.set("month", month);
    if (unlabeledOnly) params.set("unlabeled_only", "true");
    return http(`/expenses?${params}`);
  },
  createExpense: (expense) =>
    http("/expenses", { method: "POST", body: JSON.stringify(expense) }),
  updateExpense: (id, patch) =>
    http(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteExpense: (id) => http(`/expenses/${id}`, { method: "DELETE" }),
  summary: (month) =>
    http(`/summary${month ? `?month=${encodeURIComponent(month)}` : ""}`),
};

// Probe a candidate connection without saving it.
// Returns 'ok' | 'unauthorized' | 'unreachable'.
export async function testConnection(url, key) {
  const base = (url || "").trim().replace(/\/+$/, "");
  if (!base) return "unreachable";
  try {
    const health = await fetch(`${base}/health`, { signal: AbortSignal.timeout(6000) });
    if (!health.ok) return "unreachable";
  } catch {
    return "unreachable";
  }
  try {
    const res = await fetch(`${base}/expenses?limit=1`, {
      headers: authHeaders((key || "").trim()),
      signal: AbortSignal.timeout(6000),
    });
    if (res.status === 401 || res.status === 403) return "unauthorized";
    return "ok";
  } catch {
    return "unreachable";
  }
}
