'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Field, Input, Button } from '@/components/ui';
import { getSupabaseClient } from '@/lib/supabase/client';

type Props = {
  /** Switch the parent view to the sign-in form. */
  onSwitchToSignIn: () => void;
  /** Called when sign-up produced an active session (parent handles the redirect). */
  onSignedIn: () => void;
};

export const SignUp: React.FC<Props> = ({ onSwitchToSignIn, onSignedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSignUp = async () => {
    setError(null);
    setNotice(null);

    // ---- validate before calling Supabase ----
    if (!email.trim()) return setError('Enter your email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('The two passwords do not match.');

    setBusy(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });

      if (error) {
        console.error('[auth] signUp error:', error);
        const msg = error.message || '';
        if (msg.toLowerCase().includes('rate limit')) {
          setError(
            'Too many sign-up emails were sent recently. Wait a few minutes, or ask ' +
              'an admin to turn off email confirmation for the demo.'
          );
        } else {
          setError(msg || 'Sign up failed. Please try again.');
        }
        return;
      }

      // ---- already-registered detection ----
      // Supabase does NOT return an error for an email that already exists. It
      // returns a success payload with an obfuscated user whose `identities`
      // array is empty. That is the only reliable tell.
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        setError('This email is already registered — sign in instead.');
        return;
      }

      // ---- confirmation-mode branching ----
      if (data.session) {
        // "Confirm email" is OFF: the account is live and signed in right now.
        onSignedIn();
        return;
      }

      // "Confirm email" is ON: a session does not exist yet. Do not redirect.
      setNotice('Check your email to confirm your account, then sign in.');
    } catch (err) {
      console.error('[auth] signUp unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !busy) handleSignUp();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white">Create your account</h2>
      <p className="mt-1 text-sm text-slate-400">Start syncing your ledger across devices.</p>

      <div className="mt-6 space-y-4">
        <Field label="Email" htmlFor="signup-email">
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-10"
          />
        </Field>

        <Field label="Password" htmlFor="signup-password" hint="At least 6 characters.">
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-10"
          />
        </Field>

        <Field label="Confirm password" htmlFor="signup-confirm">
          <Input
            id="signup-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-10"
          />
        </Field>

        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            {notice}
          </p>
        )}

        <Button
          type="button"
          size="md"
          disabled={busy}
          className="w-full"
          onClick={handleSignUp}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? 'Creating account…' : 'Sign up'}
        </Button>
      </div>

      <button
        type="button"
        onClick={onSwitchToSignIn}
        className="mt-4 w-full text-center text-xs text-slate-400 transition hover:text-slate-200"
      >
        Already have an account? Sign in
      </button>
    </div>
  );
};
