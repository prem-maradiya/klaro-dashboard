import {
  ArrowRight, ShieldCheck, Smartphone, Zap, WifiOff, GitBranch,
  MessageSquare, Cpu, LayoutDashboard, Check, FlaskConical, Code2,
} from "lucide-react";

// lucide dropped its brand icons, so the GitHub mark is inlined here - same
// approach Login.jsx already takes for the Google logo.
function GithubMark({ className = "" }) {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

// Public landing page. This is what someone who has never heard of Klaro sees
// at "/" - previously that was a bare sign-in form, which explained nothing.
//
// It lives inside the React bundle rather than as a static page at the root so
// that window.location.origin stays the OAuth/password-reset redirect target.
// Moving the SPA to /app would have silently broken both.
export default function Landing({ onSignIn }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav onSignIn={onSignIn} />
      <Hero onSignIn={onSignIn} />
      <HowItWorks />
      <Privacy />
      <Features />
      <Engineering />
      <Footer />
    </div>
  );
}

const REPOS = [
  { name: "klaro-app", desc: "Flutter client", href: "https://github.com/prem-maradiya/klaro-app" },
  { name: "klaro-backend", desc: "FastAPI service", href: "https://github.com/prem-maradiya/klaro-backend" },
  { name: "klaro-dashboard", desc: "React dashboard", href: "https://github.com/prem-maradiya/klaro-dashboard" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="grid h-8 w-8 place-items-center rounded-lg text-[15px] font-bold text-white"
        style={{ background: "linear-gradient(135deg,#5E6AD2,#828FFF)" }}
      >
        K
      </div>
      <span className="text-[15px] font-semibold tracking-tight">Klaro</span>
    </div>
  );
}

function Nav({ onSignIn }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <Logo />
        <div className="flex items-center gap-1.5 sm:gap-4">
          <a
            href="https://klaro-api.vercel.app/docs"
            target="_blank"
            rel="noreferrer"
            className="hidden text-[13px] text-muted hover:text-text sm:block"
          >
            API docs
          </a>
          <a
            href="https://github.com/prem-maradiya/klaro-app"
            target="_blank"
            rel="noreferrer"
            className="hidden text-[13px] text-muted hover:text-text sm:block"
          >
            GitHub
          </a>
          <button
            onClick={onSignIn}
            className="rounded-lg px-3.5 py-1.5 text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#5E6AD2,#828FFF)" }}
          >
            Sign in
          </button>
        </div>
      </nav>
    </header>
  );
}

function Hero({ onSignIn }) {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-16 pt-16 sm:pt-24">
      <div className="inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-soft px-3 py-1 text-[12px] font-medium text-accent2">
        <ShieldCheck size={13} /> Parsing runs entirely on your phone
      </div>

      <h1 className="mt-5 max-w-3xl text-[34px] font-bold leading-[1.1] tracking-tight sm:text-[52px]">
        Your spending, tracked
        <br />
        without typing a thing.
      </h1>

      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-[16.5px]">
        Klaro reads the transaction SMS your bank already sends and turns them into a
        clean spending dashboard. No manual entry, no receipt scanning &mdash; and no
        message ever leaves your device.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          onClick={onSignIn}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#5E6AD2,#828FFF)" }}
        >
          Open the dashboard <ArrowRight size={15} />
        </button>
        <a
          href="https://klaro-api.vercel.app/docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-[14px] font-medium text-text hover:border-border2"
        >
          <Code2 size={15} /> Browse the API
        </a>
      </div>

      <DashboardPreview />
    </section>
  );
}

// A CSS mock of the real dashboard rather than a screenshot: it never goes
// stale against the UI, stays crisp on any display, and ships no image bytes.
function DashboardPreview() {
  const bars = [38, 64, 31, 78, 52, 88, 45, 70, 58, 92, 41, 66];
  const cats = [
    { label: "Food", pct: 34, color: "#5E6AD2" },
    { label: "Grocery", pct: 26, color: "#828FFF" },
    { label: "Transport", pct: 18, color: "#4CB782" },
    { label: "Shopping", pct: 14, color: "#F2C94C" },
    { label: "Bills", pct: 8, color: "#8A8F98" },
  ];
  return (
    <div className="mt-14 overflow-hidden rounded-card border border-border bg-card">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#EB5757]/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#F2C94C]/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#4CB782]/60" />
        <span className="ml-3 text-[11.5px] text-muted2">klaro &mdash; November 2026</span>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-3">
        <Kpi label="Spent this month" value="&#8377;18,432" tone="text-text" />
        <Kpi label="Safe to spend today" value="&#8377;741" tone="text-pos" />
        <Kpi label="Needs a label" value="7" tone="text-warn" />
      </div>

      <div className="grid gap-4 px-4 pb-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-4 text-[12.5px] font-medium text-muted">Daily spend</div>
          <div className="flex h-28 items-end gap-1.5">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  height: `${h}%`,
                  background: "linear-gradient(180deg,#828FFF,#5E6AD2)",
                  opacity: 0.45 + (h / 100) * 0.55,
                }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-4 text-[12.5px] font-medium text-muted">By category</div>
          <div className="space-y-2.5">
            {cats.map((c) => (
              <div key={c.label} className="flex items-center gap-2.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} />
                <span className="w-20 shrink-0 text-[12px] text-muted">{c.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface2">
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                </div>
                <span className="num w-8 shrink-0 text-right text-[11.5px] text-muted2">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted2">
        Illustrative figures &mdash; your dashboard is built from your own transactions.
      </p>
    </div>
  );
}

function Kpi({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-[12px] text-muted">{label}</div>
      <div className={`num mt-1.5 text-[24px] font-bold ${tone}`}>{value}</div>
    </div>
  );
}

function Section({ eyebrow, title, blurb, children }) {
  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-5xl px-5">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-accent2">{eyebrow}</div>
        <h2 className="mt-2.5 text-[26px] font-bold tracking-tight sm:text-[32px]">{title}</h2>
        {blurb && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{blurb}</p>}
        <div className="mt-9">{children}</div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: MessageSquare,
      title: "Your bank texts you",
      body: "Every UPI payment, card swipe and transfer already arrives as an SMS. Klaro reads those, and ignores everything else.",
      code: "HDFC Bank: Rs.486.00 debited\nfrom a/c XX1234 to VPA\nzomato@icici on 14-NOV-26",
    },
    {
      icon: Cpu,
      title: "Parsed on the device",
      body: "A local parser pulls out the amount, merchant and direction using pattern rules and a brand lookup. No network call, so it works in airplane mode.",
      code: "merchant  -> Zomato\namount    -> 486.00\ncategory  -> Food\ndirection -> debit",
    },
    {
      icon: LayoutDashboard,
      title: "Only the result syncs",
      body: "The clean transaction syncs so the web dashboard can show it. The original message stays on the phone, because the server has no field to put it in.",
      code: "POST /expenses\n{ merchant, amount, category,\n  raw_sms_hash }   <- one-way",
    },
  ];
  return (
    <Section
      eyebrow="How it works"
      title="Three steps, no typing"
      blurb="The whole point is that you never open the app to log something. The data was already sitting in your messages."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-card border border-border bg-card p-5">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent2">
                <s.icon size={16} />
              </div>
              <span className="num text-[12px] font-semibold text-muted2">0{i + 1}</span>
            </div>
            <h3 className="mt-3.5 text-[16px] font-semibold">{s.title}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{s.body}</p>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-bg p-3 text-[11.5px] leading-relaxed text-muted2">
              {s.code}
            </pre>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Privacy() {
  const points = [
    "The SMS parser makes no network calls at all, and that is enforced by tests rather than by convention.",
    "Raw message text is never uploaded, stored server-side, or logged.",
    "Duplicates are caught with a one-way SHA-256 hash, so the server can compare messages it cannot read.",
    "A message the parser does not recognise waits on the phone for you to categorise, instead of being sent away for a guess.",
  ];
  const flows = [
    ["Merchant name", true],
    ["Amount and date", true],
    ["Category", true],
    ["Dedupe hash (one-way)", true],
    ["Raw SMS text", false],
    ["Your contacts", false],
    ["Message sender", false],
  ];
  return (
    <Section
      eyebrow="Privacy"
      title="The parser used to call an API. Now it does not."
      blurb="An earlier version sent message text to a hosted language model whenever the local rules failed. That made the privacy promise untrue, so the dependency was removed rather than reworded, and the on-device parser was strengthened to cover the gap."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <ul className="space-y-3">
          {points.map((p) => (
            <li key={p} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <Check size={16} className="mt-0.5 shrink-0 text-pos" />
              <span className="text-[13.5px] leading-relaxed text-muted">{p}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-card border border-border bg-card p-5">
          <div className="text-[12.5px] font-medium text-muted">What crosses the network</div>
          <div className="mt-4 space-y-2.5">
            {flows.map(([label, sent]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-border pb-2.5 last:border-0"
              >
                <span className="text-[13px] text-muted">{label}</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    sent ? "bg-[#4CB782]/15 text-pos" : "bg-[#EB5757]/15 text-neg"
                  }`}
                >
                  {sent ? "synced" : "never"}
                </span>
              </div>
            ))}
          </div>
          <a
            href="/privacy.html"
            className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent2 hover:underline"
          >
            Read the full privacy policy <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </Section>
  );
}

function Features() {
  const items = [
    {
      icon: Zap,
      title: "Zero manual entry",
      body: "Transactions appear on their own. The app is something you read, not something you feed.",
    },
    {
      icon: WifiOff,
      title: "Offline-first",
      body: "Everything works with no connection. Changes queue on the device and sync when the network returns.",
    },
    {
      icon: Smartphone,
      title: "Budgets that pace you",
      body: "A per-category limit becomes a safe-to-spend-today figure, so the number means something on the 9th as well as the 30th.",
    },
    {
      icon: GitBranch,
      title: "Learns your merchants",
      body: "Correct a category once and Klaro remembers that merchant, so the same shop is never miscategorised twice.",
    },
  ];
  return (
    <Section eyebrow="Features" title="Built around one idea">
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((f) => (
          <div key={f.title} className="rounded-card border border-border bg-card p-5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-soft text-accent2">
              <f.icon size={17} />
            </div>
            <h3 className="mt-3.5 text-[15.5px] font-semibold">{f.title}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Engineering() {
  const stack = [
    ["Mobile", "Flutter, Dart, Provider"],
    ["API", "FastAPI, SQLAlchemy 2.0, psycopg3"],
    ["Data", "Supabase Postgres, Supabase Auth (JWT)"],
    ["Web", "React 19, Vite, Tailwind, Recharts"],
    ["Infra", "Vercel serverless, GitHub Actions CI, Sentry"],
  ];
  return (
    <Section
      eyebrow="Engineering"
      title="How it is put together"
      blurb="Three repositories, all public. The API ships an interactive OpenAPI page you can call directly from the browser."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-card border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-muted">
            <FlaskConical size={14} /> Tested on every push
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="num text-[28px] font-bold text-accent2">116</div>
              <div className="text-[12px] text-muted">unit &amp; widget tests in the app</div>
            </div>
            <div>
              <div className="num text-[28px] font-bold text-accent2">56</div>
              <div className="text-[12px] text-muted">tests in the API</div>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            Including tests that assert the sync payload carries no raw message text, and
            that an unreachable database reports as down instead of healthy. Both
            repositories run their suites in CI, and the app builds a signed release APK on
            every push to master.
          </p>
        </div>

        <div className="rounded-card border border-border bg-card p-5">
          <div className="text-[12.5px] font-medium text-muted">Stack</div>
          <div className="mt-4 space-y-2.5">
            {stack.map(([k, v]) => (
              <div
                key={k}
                className="flex flex-wrap items-baseline gap-x-3 border-b border-border pb-2.5 last:border-0"
              >
                <span className="w-14 shrink-0 text-[12px] font-semibold text-muted2">{k}</span>
                <span className="text-[13px] text-muted">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {REPOS.map((r) => (
          <a
            key={r.name}
            href={r.href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-border2"
          >
            <GithubMark className="shrink-0 text-muted" />
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-medium">{r.name}</div>
              <div className="text-[12px] text-muted2">{r.desc}</div>
            </div>
            <ArrowRight size={14} className="ml-auto shrink-0 text-muted2 group-hover:text-accent2" />
          </a>
        ))}
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-muted">
          <a href="/privacy.html" className="hover:text-text">Privacy</a>
          <a href="/security.html" className="hover:text-text">Security</a>
          <a href="/terms.html" className="hover:text-text">Terms</a>
          <a href="/help.html" className="hover:text-text">Help</a>
          <a href="/data-deletion.html" className="hover:text-text">Delete your data</a>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-5xl px-5 text-[12px] text-muted2">
        Built by Prem Maradiya. Klaro is a personal project, not a bank or a licensed
        financial service.
      </p>
    </footer>
  );
}
