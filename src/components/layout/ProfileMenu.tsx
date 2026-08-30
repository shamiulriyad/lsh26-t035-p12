'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  LogIn,
  RefreshCw,
  CloudOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from './AuthProvider';
import { userFromEmail } from './userDisplay';

export const ProfileMenu: React.FC<{ onOpenAccount: () => void }> = ({ onOpenAccount }) => {
  const { configured, ready, email, remoteLoading, syncError, refresh, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = userFromEmail(email);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item =
    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 py-1 pl-1 pr-2 transition hover:border-slate-700 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-[11px] font-bold text-slate-950">
          {ready ? user.initials : '·'}
        </span>
        <span className="hidden max-w-[130px] truncate text-xs font-medium text-slate-300 lg:block">
          {email ?? (configured ? 'Signed out' : 'Local demo')}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-slate-500 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-xl border border-slate-800 bg-slate-950 p-1.5 shadow-popover animate-slide-down"
        >
          <div className="flex items-center gap-2.5 border-b border-slate-800 px-2.5 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-xs font-bold text-slate-950">
              {user.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="truncate text-[10px] text-slate-500">{user.handle}</p>
            </div>
          </div>

          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={() => {
                setOpen(false);
                onOpenAccount();
              }}
            >
              <User className="h-4 w-4 text-slate-500" />
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={() => {
                setOpen(false);
                onOpenAccount();
              }}
            >
              <Settings className="h-4 w-4 text-slate-500" />
              Settings
            </button>
            {configured && email && (
              <button
                type="button"
                role="menuitem"
                className={item}
                onClick={() => {
                  setOpen(false);
                  refresh();
                }}
              >
                <RefreshCw
                  className={cn('h-4 w-4 text-slate-500', remoteLoading && 'animate-spin')}
                />
                Reload data
                {syncError && <span className="ml-auto text-[10px] text-rose-400">error</span>}
              </button>
            )}
          </div>

          <div className="border-t border-slate-800 py-1">
            {!configured ? (
              <div className="flex items-center gap-2.5 px-2.5 py-2 text-[11px] text-slate-500">
                <CloudOff className="h-4 w-4" />
                Local demo mode
              </div>
            ) : email ? (
              <button
                type="button"
                role="menuitem"
                className={cn(item, 'hover:bg-rose-500/10 hover:text-rose-300')}
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            ) : (
              <Link
                href="/login"
                role="menuitem"
                className={item}
                onClick={() => setOpen(false)}
              >
                <LogIn className="h-4 w-4 text-slate-500" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
