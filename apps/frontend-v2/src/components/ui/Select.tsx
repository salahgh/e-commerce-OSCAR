import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className="relative inline-flex w-full items-center">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-10 w-full appearance-none rounded border bg-bg-base px-4 pe-10 text-14 text-content transition-colors duration-fast outline-none focus:border-border-focus disabled:cursor-not-allowed disabled:opacity-50',
          invalid ? 'border-state-danger-border focus:border-state-danger-border' : 'border-border-input',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-4 h-4 w-4 text-content-muted" />
    </div>
  ),
);
Select.displayName = 'Select';
