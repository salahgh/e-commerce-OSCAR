'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';
import { type FacetGroup, type FacetedSearchState } from '@/lib/facet-utils';
import { FacetedFilterSidebar } from './FacetedFilterSidebar';
import { cn } from '@/lib/utils';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  facetGroups: FacetGroup[];
  state: FacetedSearchState;
  totalProducts: number;
  onToggleFacetValue: (id: string) => void;
  onClearFacetGroup: (facetId: string) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onClearAll: () => void;
  loading?: boolean;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  facetGroups,
  state,
  totalProducts,
  onToggleFacetValue,
  onClearFacetGroup,
  onPriceChange,
  onClearAll,
  loading = false,
}: MobileFilterDrawerProps) {
  const totalActiveFilters = state.facetValueIds.length + (state.priceMin || state.priceMax ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 lg:hidden
                       shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <SlidersHorizontal className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Filtres</h2>
                  <p className="text-xs text-gray-500">
                    {totalProducts} produit{totalProducts !== 1 ? 's' : ''} trouve
                    {totalProducts !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <FacetedFilterSidebar
                facetGroups={facetGroups}
                state={state}
                onToggleFacetValue={onToggleFacetValue}
                onClearFacetGroup={onClearFacetGroup}
                onPriceChange={onPriceChange}
                onClearAll={onClearAll}
                loading={loading}
                className="border-0 shadow-none rounded-none"
              />
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
              {/* Active Filters Count */}
              {totalActiveFilters > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {totalActiveFilters} filtre{totalActiveFilters > 1 ? 's' : ''} actif
                    {totalActiveFilters > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={onClearAll}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Tout effacer
                  </button>
                </div>
              )}

              {/* Apply Button */}
              <motion.button
                onClick={onClose}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white
                           font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Voir {totalProducts} produit{totalProducts !== 1 ? 's' : ''}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mobile Filter Button Component
interface MobileFilterButtonProps {
  onClick: () => void;
  activeFiltersCount: number;
  className?: string;
}

export function MobileFilterButton({
  onClick,
  activeFiltersCount,
  className,
}: MobileFilterButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200',
        'rounded-xl shadow-sm hover:shadow-md transition-all',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <SlidersHorizontal className="h-5 w-5 text-gray-600" />
      <span className="font-medium text-gray-700">Filtres</span>
      {activeFiltersCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-2 py-0.5 text-xs font-bold bg-primary-500 text-white rounded-full"
        >
          {activeFiltersCount}
        </motion.span>
      )}
    </motion.button>
  );
}
