import { useState } from "react";
import { Settings, Check, ShieldAlert, WifiOff, Loader2 } from "lucide-react";
import { getConnection, saveConnection, testConnection } from "../api";

// Gear button + modal to point the dashboard at any backend (local or cloud)
// with an API key. Stored in localStorage so the key never ships in the bundle.
export default function ConnectionSettings({ onSaved }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [status, setStatus] = useState(null); // null | 'testing' | 'ok' | 'unauthorized' | 'unreachable'

  const openModal = () => {
    const c = getConnection();
    setUrl(c.url);
    setKey(c.key);
    setStatus(null);
    setOpen(true);
  };

  const test = async () => {
    setStatus("testing");
    setStatus(await testConnection(url, key));
  };

  const save = () => {
    saveConnection(url, key);
    setOpen(false);
    onSaved?.();
  };

  return (
    <>
      <button
        onClick={openModal}
        title="Backend connection"
        className="flex items-center rounded-lg border border-border2 bg-surface px-2.5 py-[7px] text-muted transition-colors hover:text-text"
      >
        <Settings size={15} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-[420px] rounded-card border border-border bg-card p-5 shadow-2xl">
            <h2 className="mb-1 text-[15px] font-bold">Backend connection</h2>
            <p className="mb-4 text-[12px] leading-relaxed text-muted">
              Point the dashboard at your Klaro API — local
              (http://localhost:8000) or cloud. The API key is the value of the
              server's <span className="font-semibold">API_KEY</span> env var;
              both are stored only in this browser.
            </p>

            <label className="mb-1 block text-[11.5px] font-semibold text-muted">
              API URL
            </label>
            <input
              value={url}
              onChange={(e) => { setUrl(e.target.value); setStatus(null); }}
              placeholder="https://klaro-api.onrender.com"
              spellCheck={false}
              className="mb-3 w-full rounded-lg border border-border2 bg-surface px-3 py-2 text-[12.5px] text-text outline-none placeholder:text-muted2 focus:border-accent2"
            />

            <label className="mb-1 block text-[11.5px] font-semibold text-muted">
              API key <span className="font-normal text-muted2">(blank if the server has none)</span>
            </label>
            <input
              value={key}
              onChange={(e) => { setKey(e.target.value); setStatus(null); }}
              type="password"
              placeholder="••••••••••••"
              spellCheck={false}
              className="mb-3 w-full rounded-lg border border-border2 bg-surface px-3 py-2 text-[12.5px] text-text outline-none placeholder:text-muted2 focus:border-accent2"
            />

            {status && status !== "testing" && (
              <div
                className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] ${
                  status === "ok"
                    ? "border-[#4CB78240] bg-[#4CB78214] text-[#4CB782]"
                    : status === "unauthorized"
                    ? "border-[#F2C94C40] bg-[#F2C94C14] text-[#F2C94C]"
                    : "border-[#EB575740] bg-[#EB575714] text-[#EB5757]"
                }`}
              >
                {status === "ok" ? (
                  <><Check size={14} /> Connected — URL and key both work.</>
                ) : status === "unauthorized" ? (
                  <><ShieldAlert size={14} /> Server reachable, but the API key is wrong or missing.</>
                ) : (
                  <><WifiOff size={14} /> Can't reach that URL. Check it (and that the server is up).</>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={test}
                disabled={status === "testing"}
                className="flex items-center gap-1.5 rounded-lg border border-border2 bg-surface px-3 py-[7px] text-[12.5px] font-semibold text-text transition-colors hover:border-accent2 disabled:opacity-60"
              >
                {status === "testing" && <Loader2 size={13} className="animate-spin" />}
                {status === "testing" ? "Testing…" : "Test"}
              </button>
              <button
                onClick={save}
                className="rounded-lg px-3 py-[7px] text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(90deg,#5E6AD2,#828FFF)" }}
              >
                Save & reload
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
