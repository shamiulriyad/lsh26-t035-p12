'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Field, Input, Button } from '@/components/ui';
import { getSupabaseClient } from '@/lib/supabase/client';

type Props = {
  /** Switch the parent view to the sign-up form. */
  onSwitchToSignUp: () => void;
  /** Called after a successful sign-in (parent handles the redirect). */
  onSignedIn: () => void;
};

export const SignIn: React.FC<Props> = ({ onSwitchToSignUp, onSignedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);

    // ---- validate before calling Supabase ----
    if (!email.trim()) return setError('Enter your email address.');
    if (!password) return setError('Enter your password.');

    setBusy(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Always dump the full object so it can be inspected in devtools.
        console.error('[auth] signInWithPassword error:', error);

        const msg = error.message || '';
        if (msg.includes('Email not confirmed')) {
          setError(
            'Your email address has not been confirmed yet. Open the confirmation ' +
              'link we emailed you, then sign in.'
          );
        } else if (msg.includes('Invalid login credentials')) {
          setError(
            'That email and password combination is not valid — either the password ' +
              'is wrong, or this account was created but never confirmed.'
          );
        } else {
          setError(msg || 'Sign in failed. Please try again.');
        }
        return;
      }

      onSignedIn();
    } catch (err) {
      console.error('[auth] signIn unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !busy) handleSignIn();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white">Welcome back</h2>
      <p className="mt-1 text-sm text-slate-400">Sign in to sync your ledger to Supabase.</p>

      <div className="mt-6 space-y-4">
        <Field label="Email" htmlFor="signin-email">
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-10"
          />
        </Field>

        <Field label="Password" htmlFor="signin-password">
          <Input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-10"
          />
        </Field>

        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </p>
        )}

        <Button
          type="button"
          size="md"
          disabled={busy}
          className="w-full"
          onClick={handleSignIn}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </div>

      <button
        type="button"
        onClick={onSwitchToSignUp}
        className="mt-4 w-full text-center text-xs text-slate-400 transition hover:text-slate-200"
      >
        Don&apos;t have an account? Sign up
      </button>
    </div>
  );
};
