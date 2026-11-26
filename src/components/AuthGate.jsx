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

  // "#demo" opens the walkthrough directly, which makes it a linkable URL for a
  // CV or a message rather than something only reachable by clicking around.
  const [demo, setDemo] = useState(
    () => typeof window !== "undefined" && window.location.hash === "#demo"
  );

  function enterDemo() {
    if (typeof window !== "undefined") window.location.hash = "demo";
    setDemo(true);
  }

  function exitDemo() {
    if (typeof window !== "undefined") {
      // Clear the fragment without reloading or leaving "#" behind.
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    setDemo(false);
  }

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

  // Demo is checked before the login form so that "#demo" wins on a cold load.
  if (demo) return <App demo onExitDemo={exitDemo} />;

  return showLogin ? (
    <Login onBack={() => setShowLogin(false)} />
  ) : (
    <Landing onSignIn={() => setShowLogin(true)} onDemo={enterDemo} />
  );
}
