'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type FacetValueWithCount, sortSizes } from '@/lib/facet-utils';
import { cn } from '@/lib/utils';

interface FacetSizeButtonsProps {
  values: FacetValueWithCount[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  className?: string;
}

export function FacetSizeButtons({
  values,
  selectedIds,
  onToggle,
  className,
}: FacetSizeButtonsProps) {
  // Sort sizes in logical order
  const sortedValues = [...values].sort((a, b) => {
    const orderedNames = sortSizes([a.name, b.name]);
    return orderedNames.indexOf(a.name) - orderedNames.indexOf(b.name);
  });

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {sortedValues.map((value) => {
        const isSelected = selectedIds.includes(value.id);
        const isDisabled = value.count === 0 && !isSelected;

        return (
          <motion.button
            key={value.id}
            onClick={() => !isDisabled && onToggle(value.id)}
            disabled={isDisabled}
            className={cn(
              'group relative px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
              'border-2 min-w-[48px]',
              isSelected
                ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30'
                : 'bg-card border-border text-foreground hover:border-border hover:bg-muted',
              isDisabled && 'opacity-40 cursor-not-allowed bg-muted'
            )}
            whileHover={!isDisabled ? { scale: 1.05, y: -2 } : undefined}
            whileTap={!isDisabled ? { scale: 0.95 } : undefined}
          >
            {/* Size Name */}
            <span className="relative z-10">{value.name}</span>

            {/* Selection Indicator */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  className="absolute inset-0 bg-primary-600 rounded-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ zIndex: 0 }}
                />
              )}
            </AnimatePresence>

            {/* Count Badge (on hover) */}
            <div
              className={cn(
                'absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity',
                'bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px]',
                'flex items-center justify-center z-20'
              )}
            >
              {value.count}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
