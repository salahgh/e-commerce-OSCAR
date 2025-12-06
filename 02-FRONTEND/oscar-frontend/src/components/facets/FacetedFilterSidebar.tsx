'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Palette,
  Ruler,
  Tag,
  DollarSign,
} from 'lucide-react';
import { type FacetGroup, type FacetedSearchState } from '@/lib/facet-utils';
import { FacetCheckboxList } from './FacetCheckboxList';
import { FacetColorSwatches } from './FacetColorSwatches';
import { FacetSizeButtons } from './FacetSizeButtons';
import { FacetPriceRange } from './FacetPriceRange';
import { cn } from '@/lib/utils';

interface FacetedFilterSidebarProps {
  facetGroups: FacetGroup[];
  state: FacetedSearchState;
  onToggleFacetValue: (id: string) => void;
  onClearFacetGroup: (facetId: string) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onClearAll: () => void;
  loading?: boolean;
  className?: string;
}

// Facet type icons
const FACET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'color-swatch': Palette,
  'size-button': Ruler,
  checkbox: Tag,
  'price-range': DollarSign,
};

// Gradient styles for facet headers
const FACET_GRADIENTS: Record<string, string> = {
  'color-swatch': 'from-pink-500/10 via-purple-500/10 to-blue-500/10',
  'size-button': 'from-blue-500/10 via-cyan-500/10 to-teal-500/10',
  checkbox: 'from-gray-100 to-gray-50',
  'price-range': 'from-amber-500/10 via-orange-500/10 to-red-500/10',
};

export function FacetedFilterSidebar({
  facetGroups,
  state,
  onToggleFacetValue,
  onClearFacetGroup,
  onPriceChange,
  onClearAll,
  loading = false,
  className,
}: FacetedFilterSidebarProps) {
  const [expandedFacets, setExpandedFacets] = useState<Set<string>>(() => {
    // Expand all facets by default
    return new Set(facetGroups.map((g) => g.id));
  });

  const toggleFacetExpansion = (facetId: string) => {
    const newExpanded = new Set(expandedFacets);
    if (newExpanded.has(facetId)) {
      newExpanded.delete(facetId);
    } else {
      newExpanded.add(facetId);
    }
    setExpandedFacets(newExpanded);
  };

  const getSelectedCountForFacet = (facet: FacetGroup): number => {
    return facet.values.filter((v) => state.facetValueIds.includes(v.id)).length;
  };

  const totalActiveFilters = state.facetValueIds.length + (state.priceMin || state.priceMax ? 1 : 0);

  return (
    <div className={cn('bg-white rounded-xl shadow-lg border border-gray-100', className)}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Filter className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Filtres</h3>
            {totalActiveFilters > 0 && (
              <p className="text-xs text-gray-500">
                {totalActiveFilters} filtre{totalActiveFilters > 1 ? 's' : ''} actif
                {totalActiveFilters > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {totalActiveFilters > 0 && (
          <motion.button
            onClick={onClearAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1
                       px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X className="h-4 w-4" />
            Tout effacer
          </motion.button>
        )}
      </div>

      {/* Skeleton Loading */}
      {loading && (
        <div className="p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Facet Groups */}
      {!loading && (
        <div className="divide-y divide-gray-100">
          {/* Price Range (always first) */}
          <FacetSection
            id="price"
            name="Prix"
            displayType="price-range"
            isExpanded={expandedFacets.has('price')}
            selectedCount={state.priceMin || state.priceMax ? 1 : 0}
            onToggle={() => toggleFacetExpansion('price')}
            onClear={
              state.priceMin || state.priceMax
                ? () => onPriceChange(undefined, undefined)
                : undefined
            }
          >
            <FacetPriceRange
              minPrice={state.priceMin}
              maxPrice={state.priceMax}
              onPriceChange={onPriceChange}
            />
          </FacetSection>

          {/* Dynamic Facets */}
          {facetGroups.map((facet) => {
            const selectedCount = getSelectedCountForFacet(facet);
            const isExpanded = expandedFacets.has(facet.id);

            return (
              <FacetSection
                key={facet.id}
                id={facet.id}
                name={facet.name}
                displayType={facet.displayType}
                isExpanded={isExpanded}
                selectedCount={selectedCount}
                onToggle={() => toggleFacetExpansion(facet.id)}
                onClear={selectedCount > 0 ? () => onClearFacetGroup(facet.id) : undefined}
              >
                {facet.displayType === 'color-swatch' && (
                  <FacetColorSwatches
                    values={facet.values}
                    selectedIds={state.facetValueIds}
                    onToggle={onToggleFacetValue}
                  />
                )}
                {facet.displayType === 'size-button' && (
                  <FacetSizeButtons
                    values={facet.values}
                    selectedIds={state.facetValueIds}
                    onToggle={onToggleFacetValue}
                  />
                )}
                {facet.displayType === 'checkbox' && (
                  <FacetCheckboxList
                    values={facet.values}
                    selectedIds={state.facetValueIds}
                    onToggle={onToggleFacetValue}
                  />
                )}
              </FacetSection>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface FacetSectionProps {
  id: string;
  name: string;
  displayType: string;
  isExpanded: boolean;
  selectedCount: number;
  onToggle: () => void;
  onClear?: () => void;
  children: React.ReactNode;
}

function FacetSection({
  name,
  displayType,
  isExpanded,
  selectedCount,
  onToggle,
  onClear,
  children,
}: FacetSectionProps) {
  const Icon = FACET_ICONS[displayType] || Tag;
  const gradient = FACET_GRADIENTS[displayType] || FACET_GRADIENTS.checkbox;

  return (
    <div className="overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full px-5 py-4 flex items-center justify-between',
          'hover:bg-gray-50 transition-colors',
          `bg-gradient-to-r ${gradient}`
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">{name}</span>
          {selectedCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-0.5 text-xs font-bold bg-primary-500 text-white rounded-full"
            >
              {selectedCount}
            </motion.span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onClear && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1
                         rounded hover:bg-red-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Effacer
            </motion.button>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </motion.div>
        </div>
      </button>

      {/* Section Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
