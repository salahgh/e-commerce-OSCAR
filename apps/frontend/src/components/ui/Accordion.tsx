'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AccordionItemProps {
  value: string;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface AccordionContextValue {
  open: Set<string>;
  toggle: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ type = 'single', defaultValue, children, className }: AccordionProps) {
  const [open, setOpen] = React.useState<Set<string>>(() => {
    if (!defaultValue) return new Set();
    return new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue]);
  });
  const toggle = React.useCallback(
    (value: string) => {
      setOpen((prev) => {
        const next = new Set(prev);
        if (next.has(value)) {
          next.delete(value);
        } else {
          if (type === 'single') next.clear();
          next.add(value);
        }
        return next;
      });
    },
    [type],
  );
  return (
    <AccordionContext.Provider value={{ open, toggle, type }}>
      <div className={cn('flex flex-col divide-y divide-border', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, title, children, className }: AccordionItemProps) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionItem must be inside Accordion');
  const isOpen = ctx.open.has(value);
  return (
    <div className={cn('py-3', className)}>
      <button
        type="button"
        onClick={() => ctx.toggle(value)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-2 text-start"
      >
        <span className="text-16 font-medium text-content-strong">{title}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-content-muted transition-transform duration-fast',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && <div className="pt-2 text-14 text-content-muted">{children}</div>}
    </div>
  );
}
