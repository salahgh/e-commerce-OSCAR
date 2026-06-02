import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <label htmlFor={inputId} className={cn('inline-flex items-center gap-2 cursor-pointer select-none', className)}>
        <span className="relative inline-flex h-5 w-5">
          <input
            ref={ref}
            id={inputId}
            type="radio"
            className="peer absolute h-full w-full appearance-none rounded-full border border-border-input bg-bg-base outline-none checked:border-accent focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
          <span className="pointer-events-none absolute inset-1 rounded-full bg-accent opacity-0 peer-checked:opacity-100" />
        </span>
        {label && <span className="text-14 text-content">{label}</span>}
      </label>
    );
  },
);
Radio.displayName = 'Radio';

interface RadioGroupProps {
  name: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: Array<{ value: string; label: React.ReactNode }>;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function RadioGroup({
  name,
  value,
  onValueChange,
  options,
  orientation = 'vertical',
  className,
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={cn('flex gap-4', orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap', className)}
    >
      {options.map((opt) => (
        <Radio
          key={opt.value}
          name={name}
          value={opt.value}
          label={opt.label}
          checked={value === opt.value}
          onChange={(e) => e.currentTarget.checked && onValueChange?.(opt.value)}
        />
      ))}
    </div>
  );
}
