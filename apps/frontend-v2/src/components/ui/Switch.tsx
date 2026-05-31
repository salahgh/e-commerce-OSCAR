import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <label htmlFor={inputId} className={cn('inline-flex items-center gap-3 cursor-pointer select-none', className)}>
        <span className="relative inline-flex h-6 w-10">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            className="peer absolute h-full w-full appearance-none rounded-full border border-border-input bg-bg-muted outline-none checked:border-accent checked:bg-accent focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-fast"
            {...props}
          />
          <span className="pointer-events-none absolute top-0.5 start-0.5 h-5 w-5 rounded-full bg-bg-base shadow-sm transition-transform duration-fast peer-checked:translate-x-4 rtl:peer-checked:-translate-x-4" />
        </span>
        {label && <span className="text-14 text-content">{label}</span>}
      </label>
    );
  },
);
Switch.displayName = 'Switch';
