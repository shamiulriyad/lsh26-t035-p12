'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wallet, Loader2, ShieldCheck, TrendingUp, Target, ArrowLeft } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { enterGuestMode } from '@/lib/guest';
import { SignIn } from '@/components/auth/SignIn';
import { SignUp } from '@/components/auth/SignUp';

type View = 'signin' | 'signup';

const HIGHLIGHTS = [
  { icon: TrendingUp, title: 'Run-rate forecasting', body: 'Project month-end spend from live daily burn.' },
  { icon: Target, title: 'Goal pockets & DPS', body: 'Model savings horizons with compounding interest.' },
  { icon: ShieldCheck, title: 'Zero-hallucination OCR', body: 'Receipt amounts below 85% confidence require review.' },
];

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('signin');
  const [checkingSession, setCheckingSession] = useState(isSupabaseConfigured);

  const resolveRedirect = useCallback(() => {
    if (typeof window === 'undefined') return '/';
    const target = new URLSearchParams(window.location.search).get('redirect');
    return target && target.startsWith('/') ? target : '/';
  }, []);

  const goToApp = useCallback(() => {
    router.replace(resolveRedirect());
    router.refresh();
  }, [router, resolveRedirect]);

  const continueAsGuest = useCallback(() => {
    enterGuestMode();
    router.replace(resolveRedirect());
    router.refresh();
  }, [router, resolveRedirect]);

  // If a session already exists, skip the form entirely — never flash it.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    getSupabaseClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        if (session) goToApp();
        else setCheckingSession(false);
      })
      .catch((err) => {
        console.error('[auth] getSession on /login failed:', err);
        if (!cancelled) setCheckingSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, [goToApp]);

  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-800 bg-slate-900/40 p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[15px] font-bold tracking-tight text-white">TakaRunway</div>
            <p className="text-[11px] text-slate-500">Cashflow Runway Manager</p>
          </div>
        </div>

        <div className="max-w-sm">
          <h1 className="text-2xl font-bold leading-tight text-white">
            Financial architecture for salaried Dhaka professionals.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Track every taka, forecast your runway, and model savings goals with paisa-precise DPS
            compounding.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-emerald-400">
                  <h.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{h.title}</p>
                  <p className="text-xs text-slate-500">{h.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-slate-600">
          Zero-hallucination guardrail active · Paisa-precise DPS compounding
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>

          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-white">TakaRunway</span>
          </div>

          {!isSupabaseConfigured ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
              Supabase is not configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then reload. The app still runs in local
              demo mode without them.
            </div>
          ) : checkingSession ? (
            <div className="flex items-center gap-2 py-10 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking your session…
            </div>
          ) : view === 'signin' ? (
            <SignIn onSwitchToSignUp={() => setView('signup')} onSignedIn={goToApp} />
          ) : (
            <SignUp onSwitchToSignIn={() => setView('signin')} onSignedIn={goToApp} />
          )}

          {!checkingSession && (
            <>
              <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-600">
                <span className="h-px flex-1 bg-slate-800" />
                or
                <span className="h-px flex-1 bg-slate-800" />
              </div>
              <button
                type="button"
                onClick={continueAsGuest}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                Continue as guest
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-600">
                Explore with sample data — nothing is saved. Sign in later to sync your own ledger.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
