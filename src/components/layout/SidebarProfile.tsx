'use client';

import React from 'react';
import Link from 'next/link';
import { LogIn, LogOut, CloudOff, RefreshCw, CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui';
import { useAuth } from './AuthProvider';
import { userFromEmail } from './userDisplay';

export const SidebarProfile: React.FC<{ showLabels: boolean }> = ({ showLabels }) => {
  const { configured, ready, email, remoteLoading, syncError, refresh, signOut } = useAuth();
  const user = userFromEmail(email);

  if (!configured) {
    return (
      <div
        className={cn(
          'border-t border-slate-800 p-3',
          !showLabels && 'flex justify-center'
        )}
      >
        <span
          title="Supabase not configured — running on local demo data"
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-2 text-[11px] text-slate-500',
            !showLabels && 'px-2'
          )}
        >
          <CloudOff className="h-4 w-4 shrink-0" />
          {showLabels && 'Local demo mode'}
        </span>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center border-t border-slate-800 p-4">
        <Spinner />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="border-t border-slate-800 p-3">
        <Link
          href="/login"
          className={cn(
            'flex items-center rounded-lg border border-slate-700 bg-slate-900 text-sm font-medium text-slate-200 transition hover:bg-slate-800',
            showLabels ? 'gap-2 px-3 py-2' : 'justify-center px-2 py-2.5'
          )}
        >
          <LogIn className="h-4 w-4" />
          {showLabels && 'Sign in'}
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-800 p-3">
      <div
        className={cn(
          'flex items-center rounded-lg bg-slate-900/70 p-2',
          showLabels ? 'gap-2.5' : 'justify-center'
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-[11px] font-bold text-slate-950">
          {user.initials}
        </span>
        {showLabels && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-100">{user.name}</p>
              <p className="truncate text-[10px] text-slate-500">{user.handle}</p>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={refresh}
                title={syncError ? `Sync error: ${syncError}` : 'Reload from Supabase'}
                className={cn(
                  'rounded-md p-1.5 transition',
                  syncError
                    ? 'text-rose-400 hover:bg-rose-500/10'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                {remoteLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : syncError ? (
                  <CircleAlert className="h-3.5 w-3.5" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={signOut}
                title="Sign out"
                className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-rose-300"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
