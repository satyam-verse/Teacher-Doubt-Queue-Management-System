import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'purple' | 'cyan';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300",
    secondary: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    destructive: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300",
    outline: "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    purple: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
    cyan: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-800/60",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
