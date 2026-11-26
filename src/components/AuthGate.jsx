import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import App from "../App";
import Login from "./Login";
import Landing from "./Landing";

// Gates the dashboard behind Supabase auth. `undefined` = still resolving the
// persisted session (avoids a flash of the login screen on refresh).
//
// Signed out, the visitor gets the landing page rather than a bare sign-in
// form; the form appears when they ask for it. Both live at "/" on purpose, so
// window.location.origin remains a valid OAuth and password-reset redirect.
export default function AuthGate() {
  const [session, setSession] = useState(undefined);

  // "#signin" skips the pitch, so a returning user can bookmark straight to it.
  const [showLogin, setShowLogin] = useState(
    () => typeof window !== "undefined" && window.location.hash === "#signin"
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <LoaderCircle className="animate-spin text-accent2" size={28} />
      </div>
    );
  }

  if (session) return <App />;

  return showLogin ? (
    <Login onBack={() => setShowLogin(false)} />
  ) : (
    <Landing onSignIn={() => setShowLogin(true)} />
  );
}
