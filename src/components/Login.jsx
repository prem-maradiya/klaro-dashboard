import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LoaderCircle, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";

// Email/password + Google sign-in for the dashboard. On success the auth gate
// (AuthGate) swaps to the app — this screen doesn't navigate itself.
//
// `onBack` is optional: when AuthGate reached this from the landing page it
// passes a way back, so the sign-in form is not a dead end for a visitor who
// only meant to look around.
export default function Login({ onBack }) {
  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { text, error }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (signUp) {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        setMsg({ text: "Account created — check your email to verify, then sign in." });
        setSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        // AuthGate reacts and renders the dashboard.
      }
    } catch (err) {
      setMsg({ text: err.message || "Something went wrong.", error: true });
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setMsg({ text: error.message, error: true });
      setBusy(false);
    }
  }

  async function forgot() {
    if (!email.trim()) {
      setMsg({ text: 'Enter your email first, then click "Forgot password".' });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    setMsg(
      error
        ? { text: error.message, error: true }
        : { text: `Password reset link sent to ${email.trim()}.` }
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[380px]">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-5 flex items-center gap-1.5 text-[12.5px] text-muted hover:text-text"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl text-[20px] font-bold text-white"
               style={{ background: "linear-gradient(135deg,#5E6AD2,#828FFF)" }}>
            K
          </div>
          <h1 className="text-[22px] font-bold text-text">
            {signUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {signUp ? "Start tracking your spending." : "Sign in to your Klaro dashboard."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={setEmail} />
          <div className="relative">
            <Field
              icon={Lock}
              type={show ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={setPassword}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted2 hover:text-muted"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {!signUp && (
            <div className="text-right">
              <button type="button" onClick={forgot} className="text-[12px] text-accent2 hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          {msg && (
            <div className={`rounded-lg border px-3 py-2 text-[12.5px] ${
              msg.error
                ? "border-[#EB5757]/30 bg-[#EB5757]/10 text-[#EB5757]"
                : "border-[#4CB782]/30 bg-[#4CB782]/10 text-[#4CB782]"
            }`}>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[14px] font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#5E6AD2,#828FFF)" }}
          >
            {busy && <LoaderCircle size={16} className="animate-spin" />}
            {signUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-[12px] text-muted2">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={google}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface py-2.5 text-[13.5px] font-medium text-text hover:border-border2 disabled:opacity-60"
        >
          <GoogleG /> Continue with Google
        </button>

        <p className="mt-6 text-center text-[13px] text-muted">
          {signUp ? "Already have an account?" : "New to Klaro?"}{" "}
          <button
            onClick={() => { setSignUp((s) => !s); setMsg(null); }}
            className="font-semibold text-accent2 hover:underline"
          >
            {signUp ? "Sign in" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 focus-within:border-accent2">
      <Icon size={16} className="text-muted2" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-[13.5px] text-text outline-none placeholder:text-muted2"
      />
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16 3 9.1 7.6 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.9 26.7 37 24 37c-5.3 0-9.6-3.4-11.3-8.1l-6.5 5C9.1 40.3 16 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.3C39.9 36.4 45 31 45 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
