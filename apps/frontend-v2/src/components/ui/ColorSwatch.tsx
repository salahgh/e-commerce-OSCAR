'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getContrastColor } from '@oscar/shared';

interface ColorSwatchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hex: string;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-10 w-10' } as const;

export const ColorSwatch = React.forwardRef<HTMLButtonElement, ColorSwatchProps>(
  ({ hex, selected, size = 'md', className, ...props }, ref) => {
    const checkColor = getContrastColor(hex);
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={selected}
        aria-label={`Couleur ${hex}`}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full border-2 transition-all duration-fast',
          selected ? 'border-accent ring-2 ring-accent ring-offset-2 ring-offset-bg-base' : 'border-border hover:border-border-strong',
          sizeMap[size],
          className,
        )}
        style={{ backgroundColor: hex }}
        {...props}
      >
        {selected && (
          <Check className="h-4 w-4" strokeWidth={3} style={{ color: checkColor }} />
        )}
      </button>
    );
  },
);
ColorSwatch.displayName = 'ColorSwatch';

interface ColorSwatchGroupProps {
  options: Array<{ hex: string; name: string; value: string }>;
  value?: string;
  onValueChange?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ColorSwatchGroup({ options, value, onValueChange, size, className }: ColorSwatchGroupProps) {
  return (
    <div role="radiogroup" className={cn('flex flex-wrap gap-3', className)}>
      {options.map((opt) => (
        <ColorSwatch
          key={opt.value}
          hex={opt.hex}
          size={size}
          selected={value === opt.value}
          onClick={() => onValueChange?.(opt.value)}
          title={opt.name}
        />
      ))}
    </div>
  );
}
