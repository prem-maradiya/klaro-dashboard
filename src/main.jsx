import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import AuthGate from './components/AuthGate.jsx'

// Error tracking (Phase 7.5). Enabled only when VITE_SENTRY_DSN is set at build
// time (Vercel env); a no-op otherwise. Never sends PII — this is finance data.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthGate />
  </StrictMode>,
)
