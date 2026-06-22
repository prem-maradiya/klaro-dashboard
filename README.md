<div align="center">

# Klaro Dashboard

**The web companion for [Klaro](https://github.com/prem-maradiya/klaro-app) — view, search,
edit and export the transactions Klaro captures on your phone.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deploy](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel&logoColor=white)](https://klaro-dashboard.vercel.app)

</div>

---

## What it is

Klaro's mobile app captures your spending automatically from bank SMS. This
dashboard is the optional web view of that same data — sign in with the same
Supabase account, and your transactions, trends and budgets are right there in the
browser. It also hosts Klaro's static legal pages (privacy, terms, data-deletion,
security, FAQ).

## Features

- 🔐 **Same account, anywhere** — Supabase email/password (and Google OAuth) login;
  the session JWT authorizes every API call.
- 📊 **Visual breakdowns** — category and trend charts powered by Recharts, with
  smooth Framer Motion transitions.
- 🔎 **Browse & edit** — search, re-categorize and correct transactions; changes
  sync back through the same API the app uses.
- 📤 **Export** — pull your data out whenever you want.
- 📄 **Hosted legal pages** — `privacy.html`, `terms.html`, `data-deletion.html`,
  `security.html`, `help.html` (static, script-free).
- 🛡️ **Opt-in error tracking** — Sentry, enabled only when `VITE_SENTRY_DSN` is set;
  never sends PII (this is finance data).

## Where it fits

```
📱 Klaro app  ──┐
                ├──HTTPS + JWT──►  Klaro API (FastAPI)  ──►  Supabase (Postgres + Auth)
🌐 Dashboard ──┘
```

The dashboard talks to the [**Klaro backend**](https://github.com/prem-maradiya/klaro-backend);
the [**Flutter app**](https://github.com/prem-maradiya/klaro-app) does the on-device capture.

## Tech stack

React 19 · Vite · Tailwind CSS v4 · Recharts · Framer Motion · `lucide-react`
icons · `@supabase/supabase-js` (auth) · `@sentry/react` (opt-in).

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values below
npm run dev            # http://localhost:5173
```

### Environment

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Klaro API. |
| `VITE_SUPABASE_URL` | Supabase project URL (auth). |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key. |
| `VITE_SENTRY_DSN` | Optional — enables Sentry error tracking. |
| `VITE_SENTRY_ENVIRONMENT` | Optional — Sentry environment label. |

### Build & deploy

```bash
npm run build     # → dist/
npm run preview   # serve the production build locally
```

Deployed on **Vercel** (auto-deploys on push to `master`):
**https://klaro-dashboard.vercel.app**

## License

MIT © Prem Maradiya — see [`LICENSE`](LICENSE).
