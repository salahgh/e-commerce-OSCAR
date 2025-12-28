import React from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ColorSwatch } from '../ui/ColorSwatch';
import { COLOR_PALETTE } from '../../lib/colors';
import type { ProductFilters } from '../../hooks/useProductFilters';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ProductFilters;
  onFilterChange: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void;
  onReset: () => void;
  collections?: Array<{ id: string; name: string; slug: string }>;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

const STOCK_STATUS_OPTIONS = [
  { value: 'all' as const, label: 'Tous' },
  { value: 'in_stock' as const, label: 'En stock' },
  { value: 'low_stock' as const, label: 'Stock faible' },
  { value: 'out_of_stock' as const, label: 'Rupture' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  collections = [],
}) => {
  if (!isOpen) return null;

  const toggleArrayFilter = (key: 'sizes' | 'colors' | 'categoryIds', value: string) => {
    const current = filters[key] as string[];
    if (current.includes(value)) {
      onFilterChange(
        key,
        current.filter((v) => v !== value)
      );
    } else {
      onFilterChange(key, [...current, value]);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 shadow-xl z-50 flex flex-col border-l border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">Filtres avancés</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
            <div className="flex gap-2">
              <button
                onClick={() => onFilterChange('enabled', undefined)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                  filters.enabled === undefined
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                )}
              >
                Tous
              </button>
              <button
                onClick={() => onFilterChange('enabled', true)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                  filters.enabled === true
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                )}
              >
                Actifs
              </button>
              <button
                onClick={() => onFilterChange('enabled', false)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                  filters.enabled === false
                    ? 'bg-gray-600 text-white border-gray-600'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                )}
              >
                Inactifs
              </button>
            </div>
          </div>

          {/* Featured Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Produits vedettes
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onFilterChange('isFeatured', undefined)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                  filters.isFeatured === undefined
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                )}
              >
                Tous
              </button>
              <button
                onClick={() => onFilterChange('isFeatured', true)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                  filters.isFeatured === true
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                )}
              >
                Vedettes uniquement
              </button>
            </div>
          </div>

          {/* Stock Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">État du stock</label>
            <div className="flex flex-wrap gap-2">
              {STOCK_STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange('stockStatus', option.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    filters.stockStatus === option.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fourchette de prix (DZD)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice ?? ''}
                onChange={(e) =>
                  onFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice ?? ''}
                onChange={(e) =>
                  onFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Categories Filter */}
          {collections.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Catégories</label>
              <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-600 rounded-lg p-2 bg-gray-700/50">
                {collections.map((collection) => (
                  <label
                    key={collection.id}
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-600 rounded cursor-pointer"
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                        filters.categoryIds.includes(collection.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-500'
                      )}
                    >
                      {filters.categoryIds.includes(collection.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-300">{collection.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sizes Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tailles</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleArrayFilter('sizes', size)}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg border transition-colors',
                    filters.sizes.includes(size)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Couleurs</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((color) => (
                <ColorSwatch
                  key={color.name}
                  color={color.name}
                  hex={color.hex}
                  size="md"
                  selected={filters.colors.includes(color.name)}
                  onClick={() => toggleArrayFilter('colors', color.name)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;
