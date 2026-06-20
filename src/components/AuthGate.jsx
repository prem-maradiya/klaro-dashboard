import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import App from "../App";
import Login from "./Login";

// Gates the dashboard behind Supabase auth. `undefined` = still resolving the
// persisted session (avoids a flash of the login screen on refresh).
export default function AuthGate() {
  const [session, setSession] = useState(undefined);

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
  return session ? <App /> : <Login />;
}
