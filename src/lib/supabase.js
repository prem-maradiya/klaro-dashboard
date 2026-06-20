import { createClient } from "@supabase/supabase-js";

// Supabase project (Phase 7). The anon key is publishable — safe in the bundle;
// per-user data is protected by RLS + the API's per-user scoping.
const URL = "https://mcfsanvdokuiwijqbbmy.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZnNhbnZkb2t1aXdpanFiYm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MTQ5MjQsImV4cCI6MjA5NzQ5MDkyNH0.oc9BQ7Ouk6HEnT1e6Uc8YGwU3lovBIg9bUUHvkYxaIM";

export const supabase = createClient(URL, ANON, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// api.js builds request headers synchronously, so we keep the current access
// token in a module variable kept fresh by the auth listener.
let _token = null;
supabase.auth.getSession().then(({ data }) => {
  _token = data.session?.access_token ?? null;
});
supabase.auth.onAuthStateChange((_event, session) => {
  _token = session?.access_token ?? null;
});

export function getAccessToken() {
  return _token;
}
