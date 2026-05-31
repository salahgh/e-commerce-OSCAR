import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, leadingIcon, trailingIcon, type = 'text', ...props }, ref) => {
    if (leadingIcon || trailingIcon) {
      return (
        <div
          className={cn(
            'group flex h-10 items-center gap-2 rounded border bg-bg-base px-4 transition-colors duration-fast',
            invalid ? 'border-state-danger-border' : 'border-border-input focus-within:border-border-focus',
            className,
          )}
        >
          {leadingIcon && <span className="text-content-muted">{leadingIcon}</span>}
          <input
            ref={ref}
            type={type}
            aria-invalid={invalid || undefined}
            className="flex-1 bg-transparent text-14 text-content placeholder:text-content-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
          {trailingIcon && <span className="text-content-muted">{trailingIcon}</span>}
        </div>
      );
    }
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex h-10 w-full rounded border bg-bg-base px-4 text-14 text-content placeholder:text-content-muted transition-colors duration-fast outline-none focus:border-border-focus disabled:cursor-not-allowed disabled:opacity-50',
          invalid ? 'border-state-danger-border focus:border-state-danger-border' : 'border-border-input',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
