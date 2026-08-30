'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useLedgerStore } from '@/store/ledgerStore';

type AuthContextValue = {
  configured: boolean;
  ready: boolean;
  email: string | null;
  remoteLoading: boolean;
  syncError: string | null;
  refresh: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Bridges Supabase auth state into the ledger store (remote sync on/off) and
 * exposes it to the shell chrome. This preserves the effect that previously
 * lived in <AuthStatus />.
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

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
      setReady(true);
      if (user) enableRemote();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setEmail(user?.email ?? null);
      if (user) enableRemote();
      else disableRemote();
    });

    return () => sub.subscription.unsubscribe();
  }, [enableRemote, disableRemote]);

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    disableRemote();
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        configured: isSupabaseConfigured,
        ready,
        email,
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
