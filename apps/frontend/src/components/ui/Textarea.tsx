import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'block w-full rounded border bg-bg-base px-4 py-3 text-14 text-content placeholder:text-content-muted transition-colors duration-fast outline-none focus:border-border-focus disabled:cursor-not-allowed disabled:opacity-50 resize-y',
        invalid ? 'border-state-danger-border focus:border-state-danger-border' : 'border-border-input',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
