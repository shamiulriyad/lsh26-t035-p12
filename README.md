# TakaRunway

**Personal ledger & cashflow-runway manager for salaried professionals in Dhaka.**

TakaRunway turns a month of transactions into a live financial picture: how fast you are
burning cash, where it is going, what a spending cut would recover, and whether your
savings goals are reachable this cycle — every figure recomputed deterministically as the
ledger changes.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Auth_%2B_Postgres-3FCF8E?logo=supabase&logoColor=white">
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green">
</p>

**Live demo:** https://lsh26-t035-p12.onrender.com

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Supabase setup](#supabase-setup)
- [Scripts](#scripts)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [Deployment](#deployment)
- [Engine verification](#engine-verification)
- [Contributions](#contributions)
- [License](#license)

---

## Features

| Area | What it does |
| --- | --- |
| **Cashflow runway** | Projects month-end spend from live daily burn rate, then derives projected surplus against salary. |
| **Programmatic insights** | Generates data-grounded written narratives (concrete amounts, merchants, run rates) — no free-text guessing. |
| **Spending analytics** | Category share, month-over-month variance, and the largest individual outflows this cycle. |
| **What-if scenarios** | Model 0–50% cuts per category and watch recovered liquidity, burn rate, and goal horizons update instantly. |
| **Goal pockets & DPS** | Savings targets constrained by projected surplus, with a paisa-precise, monthly-compounded DPS maturity engine (half-up rounding). |
| **Auto-recurring detector** | Matches this month's expenses to last month's by merchant + amount tolerance to flag recurring costs. |
| **OCR receipt verifier** | Simulated multimodal receipt parsing with a zero-hallucination guardrail: any field below 85% confidence is forced to `null` and flagged for review. |
| **Transaction ledger** | Full audit trail with month, category, and free-text filtering; optimistic writes with rollback on failure. |
| **Auth & per-user sync** | Supabase email/password auth, route-gated by middleware, with row-level-security-scoped expense storage. |
| **Local demo mode** | Runs entirely on an official benchmark dataset when Supabase is not configured — no backend required to explore. |

---

## Tech stack

- **Framework:** Next.js 15 (App Router) · React 19 · TypeScript 5
- **Styling:** Tailwind CSS 3 · lucide-react icons
- **State:** Zustand 5 (optimistic store with remote-sync bridge)
- **Backend:** Supabase — Auth + Postgres with Row Level Security, via `@supabase/ssr`
- **Runtime:** Node.js ≥ 18.18, custom HTTP server (`server.js`) for production

---

## Getting started

### Prerequisites

- Node.js **18.18+** (20 LTS recommended)
- npm 9+
- A Supabase project (optional — the app runs in demo mode without one)

### Install & run

```bash
git clone https://github.com/shamiulriyad/lsh26-t035-p12.git
cd lsh26-t035-p12
npm install

cp .env.example .env.local   # then fill in the Supabase values (see below)
npm run dev
```

Open http://localhost:3000. Without Supabase credentials the app loads in **Local demo
mode** against the built-in benchmark ledger.

---

## Environment variables

Set these in `.env.local` for local development and in your host's dashboard for
production.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | For auth + sync | Project URL, `https://<project-ref>.supabase.co` — **not** the `https://supabase.com/dashboard/...` link. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth + sync | Project **anon / public** key from *Project Settings → API*. |
| `PORT` | No | Injected by the hosting platform. Do **not** set it on Render — a hardcoded value overrides the platform port and breaks routing. |

> The `NEXT_PUBLIC_` prefix is mandatory: without it Next.js will not expose the values
> and the app silently falls back to demo mode.

`SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL` are not used by the application today; they
are only relevant if you add server-side admin scripts or a direct Postgres client later.

---

## Supabase setup

Full walkthrough in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md). In short:

1. Create a project at <https://supabase.com/dashboard>.
2. Copy the Project URL and anon key into `.env.local` (see table above).
3. Run [`supabase/migrations/20260830000000_init_expenses.sql`](./supabase/migrations/20260830000000_init_expenses.sql)
   in the SQL Editor (or `supabase db push`). It creates the `public.expenses` table, an
   `updated_at` trigger, and RLS policies so each user can only read and write their own
   rows.
4. In *Authentication → Providers → Email*, disable **Confirm email** for the fastest
   sign-up flow, or configure **Site URL** / **Redirect URLs** to include
   `<your-origin>/auth/callback` if you keep confirmation on.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server on `localhost:3000`. |
| `npm run build` | Production build. |
| `npm start` | Run the production server via `server.js` — binds `process.env.PORT` on `0.0.0.0` and serves a database-free `/health` probe. |
| `npm run start:next` | Fallback: vanilla `next start`. |
| `npm run lint` | ESLint via `next lint`. |

---

## API reference

All expense routes require a valid Supabase session cookie and return `401` otherwise.

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/expenses` | List the signed-in user's expenses, newest first. |
| `POST` | `/api/expenses` | Create an expense. |
| `PATCH` | `/api/expenses/:id` | Update fields on one expense. |
| `DELETE` | `/api/expenses/:id` | Delete one expense. |
| `GET` | `/auth/callback` | Supabase email-confirmation / magic-link handler. |
| `GET` | `/health` | Liveness probe — returns `200 {"status":"ok"}` without touching the database. |

---

## Project structure

```
.
├── server.js                       # Production HTTP server (PORT / 0.0.0.0 / /health)
├── render.yaml                     # Render Blueprint
├── src/
│   ├── middleware.ts               # Auth gate — session refresh + route redirects
│   ├── app/
│   │   ├── page.tsx                # Single-page dashboard (scroll-spy sections)
│   │   ├── login/                  # Sign in / sign up
│   │   ├── auth/callback/          # Supabase link callback
│   │   ├── health/                 # /health route (dev + fallback)
│   │   └── api/expenses/           # REST route handlers
│   ├── components/
│   │   ├── layout/                 # App shell, sidebar, topbar, auth provider
│   │   └── ui/                     # Design-system primitives
│   ├── lib/
│   │   ├── calculations.ts         # Runway, DPS compounding, recurring detector
│   │   ├── insights.ts             # Programmatic written insights
│   │   ├── ocrSimulator.ts         # Receipt parsing + zero-hallucination guardrail
│   │   ├── api/expenses.ts         # Typed fetch wrappers
│   │   └── supabase/               # Browser / server / middleware clients
│   ├── store/ledgerStore.ts        # Zustand store with optimistic remote sync
│   ├── data/benchmarks.ts          # Official benchmark dataset (demo mode)
│   └── types/                      # Shared TypeScript types
├── supabase/migrations/            # SQL schema + RLS
└── scripts/verify-engine.ts        # Deterministic engine test suite
```

---

## Deployment

Deployed as a **Render Web Service**. Settings (also codified in
[`render.yaml`](./render.yaml)):

| Setting | Value |
| --- | --- |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Health check path | `/health` |
| Environment variables | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NODE_ENV=production` |

Do not set `PORT` — Render injects it and `server.js` binds it automatically on
`0.0.0.0`.

---

## Engine verification

The financial engine ships with a deterministic verification suite covering runway math,
the auto-recurring detector, what-if category cuts, paisa-precise DPS half-up compounding,
and the OCR confidence guardrail:

```bash
npx tsx scripts/verify-engine.ts
```

---

## Contributions

- **[Rabbi Islam Emon](https://github.com/iamrabbiislamemon)** — Core Developer
- **[Shamiul Islam Riyad](https://github.com/shamiulriyad)** — Core Developer
- **[Sayem Rahman](https://github.com/SayemR0018)** — Core Developer
- **[Rabbi Islam Emon](https://github.com/iamrabbiislamemon)** — Core Developer
- **[Rumman Karim](https://github.com/rumman999)** — QA & Bug Tester

---

## License

[MIT](./LICENSE) © 2026 Riyad
