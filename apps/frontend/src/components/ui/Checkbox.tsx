import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md';
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, size = 'md', label, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const dim = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    const icon = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <label htmlFor={inputId} className={cn('inline-flex items-center gap-2 cursor-pointer select-none', className)}>
        <span className="relative inline-flex">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer absolute h-full w-full appearance-none rounded border border-border-input bg-bg-base outline-none checked:bg-accent checked:border-accent focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
          <span className={cn('pointer-events-none inline-flex items-center justify-center rounded border border-transparent', dim)}>
            <Check className={cn(icon, 'text-accent-content opacity-0 peer-checked:opacity-100')} strokeWidth={3} />
          </span>
        </span>
        {label && <span className="text-14 text-content">{label}</span>}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
