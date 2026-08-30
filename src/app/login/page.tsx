'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Wallet, Loader2, ShieldCheck, TrendingUp, Target, ArrowLeft } from 'lucide-react';
import { Field, Input, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

type Mode = 'signin' | 'signup';

const HIGHLIGHTS = [
  { icon: TrendingUp, title: 'Run-rate forecasting', body: 'Project month-end spend from live daily burn.' },
  { icon: Target, title: 'Goal pockets & DPS', body: 'Model savings horizons with compounding interest.' },
  { icon: ShieldCheck, title: 'Zero-hallucination OCR', body: 'Receipt amounts below 85% confidence require review.' },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolveRedirect = () => {
    if (typeof window === 'undefined') return '/';
    const target = new URLSearchParams(window.location.search).get('redirect');
    return target && target.startsWith('/') ? target : '/';
  };

  const goToApp = () => {
    router.push(resolveRedirect());
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.'
      );
      return;
    }

    setBusy(true);
    const supabase = createClient();

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) {
          // Email confirmation is disabled — the user is already signed in.
          goToApp();
        } else {
          setMessage('Check your inbox to confirm your email, then sign in.');
          setMode('signin');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        goToApp();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

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

          <h2 className="text-xl font-bold text-white">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {mode === 'signin'
              ? 'Sign in to sync your ledger to Supabase.'
              : 'Start syncing your ledger across devices.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Email" htmlFor="login-email">
              <Input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
              />
            </Field>

            <Field label="Password" htmlFor="login-password">
              <Input
                id="login-password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10"
              />
            </Field>

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                {message}
              </p>
            )}

            <Button type="submit" size="md" disabled={busy} className="w-full">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setMessage(null);
            }}
            className={cn(
              'mt-4 w-full text-center text-xs text-slate-400 transition hover:text-slate-200'
            )}
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
