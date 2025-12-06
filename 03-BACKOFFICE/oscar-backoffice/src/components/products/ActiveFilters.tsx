import React from 'react';
import { X } from 'lucide-react';
import { ColorSwatch } from '../ui/ColorSwatch';
import type { ProductFilters } from '../../hooks/useProductFilters';

interface ActiveFiltersProps {
  filters: ProductFilters;
  onClearFilter: <K extends keyof ProductFilters>(key: K) => void;
  onClearAll: () => void;
  collections?: Array<{ id: string; name: string; slug: string }>;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onClearFilter,
  onClearAll,
  collections = [],
}) => {
  const badges: Array<{
    key: keyof ProductFilters;
    label: string;
    value?: string;
    color?: string;
  }> = [];

  // Status filter
  if (filters.enabled === true) {
    badges.push({ key: 'enabled', label: 'Actifs uniquement' });
  } else if (filters.enabled === false) {
    badges.push({ key: 'enabled', label: 'Inactifs uniquement' });
  }

  // Featured filter
  if (filters.isFeatured === true) {
    badges.push({ key: 'isFeatured', label: 'Vedettes' });
  }

  // Stock status
  if (filters.stockStatus !== 'all') {
    const labels = {
      in_stock: 'En stock',
      low_stock: 'Stock faible',
      out_of_stock: 'Rupture',
    };
    badges.push({ key: 'stockStatus', label: labels[filters.stockStatus] });
  }

  // Price range
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    let priceLabel = 'Prix: ';
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      priceLabel += `${filters.minPrice} - ${filters.maxPrice} DZD`;
    } else if (filters.minPrice !== undefined) {
      priceLabel += `≥ ${filters.minPrice} DZD`;
    } else if (filters.maxPrice !== undefined) {
      priceLabel += `≤ ${filters.maxPrice} DZD`;
    }
    badges.push({ key: 'minPrice', label: priceLabel });
  }

  // Categories
  if (filters.categoryIds.length > 0) {
    const categoryNames = filters.categoryIds
      .map(id => collections.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');
    badges.push({ key: 'categoryIds', label: `Catégories: ${categoryNames}` });
  }

  // Sizes
  if (filters.sizes.length > 0) {
    badges.push({ key: 'sizes', label: `Tailles: ${filters.sizes.join(', ')}` });
  }

  // Colors
  filters.colors.forEach(color => {
    badges.push({ key: 'colors', label: color, value: color, color: color });
  });

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">Filtres actifs:</span>
      {badges.map((badge, index) => (
        <span
          key={`${badge.key}-${index}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
        >
          {badge.color && (
            <ColorSwatch color={badge.color} size="xs" />
          )}
          <span>{badge.label}</span>
          <button
            onClick={() => {
              if (badge.key === 'colors' && badge.value) {
                // Remove specific color from array
                const newColors = filters.colors.filter(c => c !== badge.value);
                // Need to handle this differently - just clear for now
              }
              onClearFilter(badge.key);
            }}
            className="hover:bg-blue-200 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-red-600 hover:text-red-700 hover:underline"
      >
        Tout effacer
      </button>
    </div>
  );
};

export default ActiveFilters;
