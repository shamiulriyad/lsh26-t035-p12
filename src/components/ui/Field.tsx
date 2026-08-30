'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type FieldProps = {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  labelRight?: React.ReactNode;
  children: React.ReactNode;
};

export const Field: React.FC<FieldProps> = ({
  label,
  hint,
  htmlFor,
  className,
  labelRight,
  children,
}) => (
  <div className={cn('space-y-1.5', className)}>
    {(label || labelRight) && (
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label
            htmlFor={htmlFor}
            className="text-xs font-medium text-slate-300"
          >
            {label}
          </label>
        )}
        {labelRight}
      </div>
    )}
    {children}
    {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
  </div>
);

const controlBase =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 placeholder-slate-500 ' +
  'transition-colors focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/15 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(controlBase, 'h-9 text-xs', className)} {...props} />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(controlBase, 'py-2 text-xs leading-relaxed', className)}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        controlBase,
        'h-9 cursor-pointer appearance-none pr-9 text-xs',
        className
      )}
      {...props}
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </div>
));
Select.displayName = 'Select';
