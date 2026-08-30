# Supabase Backend Setup

TakaRunway persists the **expense ledger** to Supabase, scoped per authenticated
user with Row Level Security. Without Supabase env vars the app still runs on the
local benchmark data ("Local demo" badge in the navbar).

## 1. Create a Supabase project

<https://supabase.com/dashboard> → **New project**. Wait for it to provision.

## 2. Add environment variables

Copy `.env.example` to `.env.local` and fill in from **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

> The URL is the **Project URL** (`https://<ref>.supabase.co`) — not the
> dashboard link. `<project-ref>` is the random slug in the dashboard URL.

Restart `npm run dev` after editing `.env.local`.

## 3. Run the schema migration

Open **SQL Editor** in the dashboard and run the contents of
[`supabase/migrations/20260830000000_init_expenses.sql`](supabase/migrations/20260830000000_init_expenses.sql).

It creates:

- `public.expenses` — `id`, `user_id → auth.users`, `date`, `category`, `shop`,
  `amount_bdt`, `is_recurring`, `notes`, `receipt_confidence`, timestamps
- an `updated_at` trigger
- RLS policies so each user can only read/write their own rows

(Or, with the Supabase CLI: `supabase db push`.)

## 4. Auth settings

**Authentication → Providers → Email** is enabled by default.

- For quick local testing, turn **"Confirm email"** off
  (Authentication → Providers → Email) so sign-up logs you straight in.
- If you keep confirmation on, set **Site URL** to `http://localhost:3000` and add
  `http://localhost:3000/auth/callback` under **Redirect URLs**.

## 5. Use it

1. `npm run dev`
2. Visit `/login`, sign up / sign in.
3. The navbar shows your email + a sync button. Expenses you add, edit, or delete
   now write through `/api/expenses` to Supabase and reload on refresh.

## API surface

| Method | Route                | Description                         |
| ------ | -------------------- | ----------------------------------- |
| GET    | `/api/expenses`      | List the signed-in user's expenses  |
| POST   | `/api/expenses`      | Create an expense                    |
| PATCH  | `/api/expenses/:id`  | Update fields on an expense          |
| DELETE | `/api/expenses/:id`  | Delete an expense                    |

All routes require a valid Supabase session cookie and return `401` otherwise.

## Files

| Path | Role |
| ---- | ---- |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Route Handler / Server Component client |
| `src/lib/supabase/middleware.ts` + `middleware.ts` | Session refresh on every request |
| `src/app/api/expenses/**` | REST route handlers |
| `src/lib/api/expenses.ts` | Typed `fetch` wrappers used by the store |
| `src/app/login/page.tsx`, `src/app/auth/callback/route.ts` | Auth UI + email link callback |
| `src/components/AuthStatus.tsx` | Navbar auth state ↔ store sync bridge |
| `src/store/ledgerStore.ts` | Optimistic writes with rollback on failure |

## Extending to pockets

The same pattern (table + RLS + `api/pockets/**` + store wiring) applies to the
savings pockets. Empty `src/app/api/pockets/` route folders are already scaffolded.
