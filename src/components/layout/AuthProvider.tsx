'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { exitGuestMode } from '@/lib/guest';
import { useLedgerStore } from '@/store/ledgerStore';

type AuthContextValue = {
  configured: boolean;
  ready: boolean;
  email: string | null;
  signingOut: boolean;
  remoteLoading: boolean;
  syncError: string | null;
  refresh: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Bridges Supabase auth state into the ledger store (remote sync on/off) and
 * exposes it to the shell chrome. The dashboard is gated by middleware, so if
 * this provider renders the user is authenticated (or Supabase is unconfigured
 * and the app runs in local demo mode).
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const enableRemote = useLedgerStore((s) => s.enableRemote);
  const disableRemote = useLedgerStore((s) => s.disableRemote);
  const refreshRemoteExpenses = useLedgerStore((s) => s.refreshRemoteExpenses);
  const remoteLoading = useLedgerStore((s) => s.remoteLoading);
  const syncError = useLedgerStore((s) => s.syncError);

  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    const supabase = getSupabaseClient();

    // Restore any persisted session on mount.
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setEmail(session?.user?.email ?? null);
        if (session?.user) {
          exitGuestMode(); // a real session supersedes guest mode
          enableRemote();
        }
      })
      .catch((err) => {
        console.error('[auth] getSession failed:', err);
      })
      .finally(() => setReady(true));

    // React to auth changes for the lifetime of the app; unsubscribe on unmount.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      setEmail(user?.email ?? null);

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        if (user) {
          exitGuestMode();
          enableRemote();
        }
      } else if (event === 'SIGNED_OUT') {
        disableRemote();
        // Session ended while using the app — bounce to login.
        if (window.location.pathname !== '/login') {
          router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [enableRemote, disableRemote, router]);

  const signOut = async () => {
    if (!isSupabaseConfigured || signingOut) return;
    setSigningOut(true);
    try {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) console.error('[auth] signOut error:', error);
      disableRemote();
      router.replace('/login');
      router.refresh();
    } catch (err) {
      console.error('[auth] signOut unexpected error:', err);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        configured: isSupabaseConfigured,
        ready,
        email,
        signingOut,
        remoteLoading,
        syncError,
        refresh: () => refreshRemoteExpenses(),
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
