'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/index';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  error?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue,
      options,
      onChange,
      orientation = 'vertical',
      className,
      error,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const currentValue = value !== undefined ? value : internalValue;

    const handleChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    return (
      <div ref={ref} className={className}>
        <div
          role="radiogroup"
          className={cn(
            'flex gap-3',
            orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
          )}
        >
          {options.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex items-start gap-3 cursor-pointer group',
                option.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={currentValue === option.value}
                  onChange={() => handleChange(option.value)}
                  disabled={option.disabled}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'h-5 w-5 rounded-full border-2 transition-colors',
                    currentValue === option.value
                      ? 'border-primary'
                      : 'border-input group-hover:border-primary/50',
                    error && 'border-destructive'
                  )}
                >
                  {currentValue === option.value && (
                    <div className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <span
                  className={cn(
                    'text-sm font-medium text-foreground',
                    option.disabled && 'text-muted-foreground'
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

// Simple Radio component for individual use
interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, error, ...props }, ref) => {
    return (
      <label
        className={cn(
          'flex items-start gap-3 cursor-pointer group',
          props.disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="radio"
            ref={ref}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'h-5 w-5 rounded-full border-2 transition-colors',
              'peer-checked:border-primary border-input group-hover:border-primary/50',
              error && 'border-destructive'
            )}
          />
          <div className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform" />
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <span
                className={cn(
                  'text-sm font-medium text-foreground',
                  props.disabled && 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio, RadioGroup };
