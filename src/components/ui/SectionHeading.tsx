'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  icon?: React.ReactNode;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

/** Page-level section header used above each dashboard block. */
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  icon,
  eyebrow,
  title,
  description,
  actions,
  className,
}) => (
  <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
    <div className="flex items-start gap-3">
      {icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-emerald-400">
          {icon}
        </span>
      )}
      <div>
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {eyebrow}
          </div>
        )}
        <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
        {description && (
          <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
