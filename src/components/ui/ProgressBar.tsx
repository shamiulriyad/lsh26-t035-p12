'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type ProgressBarProps = {
  value: number; // 0 - 100
  className?: string;
  barClassName?: string;
  size?: 'sm' | 'md';
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className,
  barClassName = 'bg-emerald-400',
  size = 'sm',
}) => (
  <div
    role="progressbar"
    aria-valuenow={Math.round(Math.min(100, Math.max(0, value)))}
    aria-valuemin={0}
    aria-valuemax={100}
    className={cn(
      'w-full overflow-hidden rounded-full bg-slate-800',
      size === 'sm' ? 'h-1.5' : 'h-2',
      className
    )}
  >
    <div
      className={cn('h-full rounded-full transition-all duration-500 ease-out-expo', barClassName)}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
