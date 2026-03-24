'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { type FacetValueWithCount, isColorDark } from '@/lib/facet-utils';
import { cn } from '@/lib/utils';

// Color name to hex mapping for common colors
const COLOR_MAP: Record<string, string> = {
  // English
  black: '#000000',
  white: '#FFFFFF',
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#EAB308',
  orange: '#F97316',
  purple: '#A855F7',
  pink: '#EC4899',
  brown: '#92400E',
  gray: '#6B7280',
  grey: '#6B7280',
  navy: '#1E3A5F',
  beige: '#D4C4B0',
  cream: '#FFFDD0',
  gold: '#FFD700',
  silver: '#C0C0C0',
  // French
  noir: '#000000',
  blanc: '#FFFFFF',
  rouge: '#EF4444',
  bleu: '#3B82F6',
  vert: '#22C55E',
  jaune: '#EAB308',
  marron: '#92400E',
  gris: '#6B7280',
  rose: '#EC4899',
  violet: '#A855F7',
  marine: '#1E3A5F',
  // Arabic colors (transliterated)
  aswad: '#000000',
  abyad: '#FFFFFF',
  ahmar: '#EF4444',
  azraq: '#3B82F6',
  akhdar: '#22C55E',
  asfar: '#EAB308',
};

interface FacetColorSwatchesProps {
  values: FacetValueWithCount[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  className?: string;
}

export function FacetColorSwatches({
  values,
  selectedIds,
  onToggle,
  className,
}: FacetColorSwatchesProps) {
  const getColorHex = (value: FacetValueWithCount): string => {
    // Check if we have a custom colorHex
    if (value.colorHex) return value.colorHex;

    // Try to find color from name or code
    const colorKey = value.code.toLowerCase().replace(/[-_]/g, '');
    if (COLOR_MAP[colorKey]) return COLOR_MAP[colorKey];

    const nameKey = value.name.toLowerCase().replace(/[-_\s]/g, '');
    if (COLOR_MAP[nameKey]) return COLOR_MAP[nameKey];

    // Default to a neutral gray
    return '#9CA3AF';
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {values.map((value) => {
        const isSelected = selectedIds.includes(value.id);
        const isDisabled = value.count === 0 && !isSelected;
        const colorHex = getColorHex(value);
        const isDark = isColorDark(colorHex);

        return (
          <motion.button
            key={value.id}
            onClick={() => !isDisabled && onToggle(value.id)}
            disabled={isDisabled}
            className={cn(
              'group relative flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all',
              isSelected && 'bg-primary/10 ring-2 ring-primary',
              isDisabled && 'opacity-40 cursor-not-allowed',
              !isDisabled && !isSelected && 'hover:bg-muted'
            )}
            whileHover={!isDisabled ? { scale: 1.05 } : undefined}
            whileTap={!isDisabled ? { scale: 0.95 } : undefined}
          >
            {/* Color Circle */}
            <div
              className={cn(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-sm',
                isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border',
                colorHex === '#FFFFFF' && 'border-border'
              )}
              style={{ backgroundColor: colorHex }}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check
                      className={cn('h-4 w-4', isDark ? 'text-white' : 'text-gray-900')}
                      strokeWidth={3}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Color Name */}
            <span
              className={cn(
                'text-[10px] font-medium truncate max-w-[50px] transition-colors',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {value.name}
            </span>

            {/* Count Tooltip */}
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100
                         bg-popover text-popover-foreground text-xs px-2 py-1 rounded pointer-events-none
                         transition-opacity whitespace-nowrap z-10 border border-border shadow-md"
            >
              {value.count} produit{value.count !== 1 ? 's' : ''}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
