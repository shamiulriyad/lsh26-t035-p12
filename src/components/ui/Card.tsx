'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Adds a subtle lift + border highlight on hover. */
  interactive?: boolean;
  /** Tone the surface / border for status cards. */
  tone?: 'default' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'sky';
};

const toneMap: Record<NonNullable<CardProps['tone']>, string> = {
  default: 'border-slate-800 bg-slate-900/80',
  emerald: 'border-emerald-800/60 bg-emerald-950/20',
  amber: 'border-amber-800/50 bg-amber-950/15',
  rose: 'border-rose-800/60 bg-rose-950/20',
  indigo: 'border-indigo-800/60 bg-indigo-950/25',
  sky: 'border-sky-800/60 bg-sky-950/20',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, tone = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'min-w-0 rounded-xl border shadow-card',
        toneMap[tone],
        interactive &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-card-hover',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('p-4 sm:p-5', className)} {...props} />;

type CardHeaderProps = {
  icon?: React.ReactNode;
  iconClassName?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  icon,
  iconClassName,
  title,
  subtitle,
  actions,
  className,
}) => (
  <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
    <div className="flex items-start gap-3 min-w-0">
      {icon && (
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
            iconClassName
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-white sm:text-[15px]">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);
