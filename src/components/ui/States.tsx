'use client';

import React from 'react';
import { Loader2, AlertTriangle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <Loader2 className={cn('h-4 w-4 animate-spin text-slate-400', className)} />
);

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 px-6 py-10 text-center',
      className
    )}
  >
    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-500">
      {icon ?? <Inbox className="h-5 w-5" />}
    </span>
    <p className="text-sm font-semibold text-slate-200">{title}</p>
    {description && (
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

type ErrorStateProps = {
  message: React.ReactNode;
  onRetry?: () => void;
  className?: string;
};

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, className }) => (
  <div
    className={cn(
      'flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-950/25 px-4 py-3',
      className
    )}
  >
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
    <div className="flex-1 text-xs text-rose-200">{message}</div>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-rose-500/40 px-2 py-1 text-[11px] font-semibold text-rose-200 transition hover:bg-rose-500/15"
      >
        Retry
      </button>
    )}
  </div>
);
