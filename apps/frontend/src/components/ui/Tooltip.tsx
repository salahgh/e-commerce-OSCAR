'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils/cn';

// Lightweight tooltip — uses Popover so it works for any rich content.
// For text-only hover hints, future iterations can swap to @radix-ui/react-tooltip.

interface TooltipProps {
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  children: React.ReactElement;
  className?: string;
}

export function Tooltip({ content, side = 'top', align = 'center', children, className }: TooltipProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          className={cn(
            'z-overlay max-w-[220px] rounded bg-content-strong px-2 py-2 text-12 font-medium text-content-inverse shadow-overlay data-[state=open]:animate-fade-in',
            className,
          )}
        >
          {content}
          <PopoverPrimitive.Arrow className="fill-content-strong" width={8} height={6} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
