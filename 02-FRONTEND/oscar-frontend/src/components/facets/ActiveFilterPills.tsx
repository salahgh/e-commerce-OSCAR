'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { type FacetGroup, formatPrice, isColorDark } from '@/lib/facet-utils';
import { cn } from '@/lib/utils';

// Color name to hex mapping
const COLOR_MAP: Record<string, string> = {
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
};

interface ActiveFilterPillsProps {
  searchTerm?: string;
  collectionName?: string;
  facetGroups: FacetGroup[];
  selectedFacetValueIds: string[];
  priceMin?: number;
  priceMax?: number;
  onClearSearch?: () => void;
  onClearCollection?: () => void;
  onRemoveFacetValue: (id: string) => void;
  onClearPrice?: () => void;
  onClearAll: () => void;
  className?: string;
}

export function ActiveFilterPills({
  searchTerm,
  collectionName,
  facetGroups,
  selectedFacetValueIds,
  priceMin,
  priceMax,
  onClearSearch,
  onClearCollection,
  onRemoveFacetValue,
  onClearPrice,
  onClearAll,
  className,
}: ActiveFilterPillsProps) {
  // Get selected facet values with their details
  const selectedValues = facetGroups.flatMap((group) =>
    group.values
      .filter((v) => selectedFacetValueIds.includes(v.id))
      .map((v) => ({
        ...v,
        facetName: group.name,
        facetCode: group.code,
        displayType: group.displayType,
      }))
  );

  const hasFilters =
    searchTerm || collectionName || selectedValues.length > 0 || priceMin !== undefined || priceMax !== undefined;

  if (!hasFilters) return null;

  const getColorHex = (code: string): string | null => {
    const colorKey = code.toLowerCase().replace(/[-_]/g, '');
    return COLOR_MAP[colorKey] || null;
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground font-medium mr-1">Filtres actifs:</span>

      <AnimatePresence initial={false}>
        {/* Search Term */}
        {searchTerm && (
          <FilterPill
            key="search"
            label={`Recherche: "${searchTerm}"`}
            onRemove={onClearSearch}
          />
        )}

        {/* Collection */}
        {collectionName && (
          <FilterPill
            key="collection"
            label={`Categorie: ${collectionName}`}
            onRemove={onClearCollection}
            variant="secondary"
          />
        )}

        {/* Facet Values */}
        {selectedValues.map((value) => {
          const colorHex = value.displayType === 'color-swatch' ? getColorHex(value.code) : null;

          return (
            <FilterPill
              key={value.id}
              label={value.name}
              subLabel={value.facetName}
              colorHex={colorHex}
              onRemove={() => onRemoveFacetValue(value.id)}
            />
          );
        })}

        {/* Price Range */}
        {(priceMin !== undefined || priceMax !== undefined) && (
          <FilterPill
            key="price"
            label={
              priceMin !== undefined && priceMax !== undefined
                ? `${formatPrice(priceMin)} - ${formatPrice(priceMax)}`
                : priceMin !== undefined
                  ? `Min: ${formatPrice(priceMin)}`
                  : `Max: ${formatPrice(priceMax!)}`
            }
            subLabel="Prix"
            onRemove={onClearPrice}
            variant="warning"
          />
        )}
      </AnimatePresence>

      {/* Clear All Button */}
      <motion.button
        onClick={onClearAll}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600
                   hover:bg-red-50 rounded-lg transition-colors ml-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Trash2 className="h-4 w-4" />
        Tout effacer
      </motion.button>
    </div>
  );
}

interface FilterPillProps {
  label: string;
  subLabel?: string;
  colorHex?: string | null;
  variant?: 'default' | 'secondary' | 'warning';
  onRemove?: () => void;
}

function FilterPill({ label, subLabel, colorHex, variant = 'default', onRemove }: FilterPillProps) {
  const variantStyles = {
    default: 'bg-primary/10 text-primary border-primary/30',
    secondary: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 10 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium',
        variantStyles[variant]
      )}
    >
      {/* Color Swatch */}
      {colorHex && (
        <div
          className="w-4 h-4 rounded-full border border-border shadow-sm"
          style={{ backgroundColor: colorHex }}
        />
      )}

      {/* Label */}
      <span>
        {subLabel && <span className="opacity-70 mr-1">{subLabel}:</span>}
        {label}
      </span>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-0.5 hover:bg-muted rounded-full transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}
