'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'slate' | 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'teal' | 'purple';

const tones: Record<Tone, string> = {
  slate: 'bg-slate-800 text-slate-300 border-slate-700',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
  sky: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
  indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
  teal: 'bg-teal-500/10 text-teal-300 border-teal-500/25',
  purple: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
};

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  mono?: boolean;
  pill?: boolean;
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  tone = 'slate',
  mono,
  pill,
  ...props
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-semibold leading-none',
      pill ? 'rounded-full' : 'rounded-md',
      mono && 'font-mono',
      tones[tone],
      className
    )}
    {...props}
  />
);
