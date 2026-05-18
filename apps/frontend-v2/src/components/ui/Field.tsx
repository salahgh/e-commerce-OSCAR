import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  const id = React.useId();
  const targetId = htmlFor ?? id;
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label htmlFor={targetId} className="text-14 font-medium text-content-strong">
          {label}
          {required && <span className="text-state-danger-content"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-12 text-content-muted">{hint}</p>}
      {error && <p className="text-12 text-state-danger-content">{error}</p>}
    </div>
  );
}
