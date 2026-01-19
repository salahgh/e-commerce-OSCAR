import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { ChevronDown, ChevronRight, Check, Tag } from 'lucide-react';
import { AdminFacetsWithValuesDocument } from '../../graphql/generated/graphql';
import { detectFacetType, isColorDark, sortSizes } from '../../lib/facet-utils';
import { Spinner } from '../ui/Spinner';
import { cn } from '../../lib/utils';

interface FacetSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export const FacetSelector: React.FC<FacetSelectorProps> = ({
  selectedIds,
  onChange,
  className,
}) => {
  const [expandedFacets, setExpandedFacets] = useState<Set<string>>(new Set());

  const { data, loading, error } = useQuery(AdminFacetsWithValuesDocument, {
    variables: { options: { take: 100 } },
  });

  const facets = data?.facets?.items || [];

  const toggleFacet = (facetId: string) => {
    const newExpanded = new Set(expandedFacets);
    if (newExpanded.has(facetId)) {
      newExpanded.delete(facetId);
    } else {
      newExpanded.add(facetId);
    }
    setExpandedFacets(newExpanded);
  };

  const toggleValue = (valueId: string) => {
    const newSelected = selectedIds.includes(valueId)
      ? selectedIds.filter((id) => id !== valueId)
      : [...selectedIds, valueId];
    onChange(newSelected);
  };

  const getSelectedCountInFacet = (facet: any): number => {
    return facet.values.filter((v: any) => selectedIds.includes(v.id)).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-sm py-4">
        Erreur lors du chargement des attributs: {error.message}
      </div>
    );
  }

  if (facets.length === 0) {
    return (
      <div className="text-muted-foreground text-sm py-4 text-center">
        <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
        Aucun attribut disponible
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {facets.map((facet) => {
        const displayType = detectFacetType(facet.code);
        const isExpanded = expandedFacets.has(facet.id);
        const selectedCount = getSelectedCountInFacet(facet);
        const sortedValues =
          displayType === 'size-button'
            ? [...facet.values].sort((a, b) => {
                const sorted = sortSizes([a.name, b.name]);
                return sorted.indexOf(a.name) - sorted.indexOf(b.name);
              })
            : facet.values;

        return (
          <div
            key={facet.id}
            className="border border-border rounded-lg overflow-hidden bg-card"
          >
            {/* Facet Header */}
            <button
              type="button"
              onClick={() => toggleFacet(facet.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-foreground">{facet.name}</span>
                {selectedCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    {selectedCount}
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {facet.values.length} valeurs
              </span>
            </button>

            {/* Facet Values */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-border">
                {displayType === 'color-swatch' ? (
                  /* Color Swatches */
                  <div className="flex flex-wrap gap-2">
                    {sortedValues.map((value: any) => {
                      const isSelected = selectedIds.includes(value.id);
                      const colorHex =
                        value.customFields?.colorHex || getColorFromName(value.code);
                      const isDark = colorHex ? isColorDark(colorHex) : false;

                      return (
                        <button
                          key={value.id}
                          type="button"
                          onClick={() => toggleValue(value.id)}
                          title={value.name}
                          className={cn(
                            'relative w-10 h-10 rounded-full border-2 transition-all',
                            isSelected
                              ? 'border-primary ring-2 ring-primary/30 scale-110'
                              : 'border-border hover:border-muted-foreground'
                          )}
                          style={{ backgroundColor: colorHex || '#ccc' }}
                        >
                          {isSelected && (
                            <Check
                              className={cn(
                                'absolute inset-0 m-auto h-5 w-5',
                                isDark ? 'text-white' : 'text-black'
                              )}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : displayType === 'size-button' ? (
                  /* Size Buttons */
                  <div className="flex flex-wrap gap-2">
                    {sortedValues.map((value: any) => {
                      const isSelected = selectedIds.includes(value.id);
                      return (
                        <button
                          key={value.id}
                          type="button"
                          onClick={() => toggleValue(value.id)}
                          className={cn(
                            'px-3 py-2 min-w-[48px] rounded-lg border-2 font-medium text-sm transition-all',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card text-foreground hover:border-muted-foreground'
                          )}
                        >
                          {value.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Checkboxes */
                  <div className="space-y-2">
                    {sortedValues.map((value: any) => {
                      const isSelected = selectedIds.includes(value.id);
                      return (
                        <label
                          key={value.id}
                          className="flex items-center gap-3 cursor-pointer hover:bg-accent p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleValue(value.id)}
                            className="h-4 w-4 text-primary border-border rounded focus:ring-primary bg-card"
                          />
                          <span className="text-sm text-foreground">{value.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Selected Summary */}
      {selectedIds.length > 0 && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {selectedIds.length} attribut{selectedIds.length > 1 ? 's' : ''} selectionne
              {selectedIds.length > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-sm text-primary hover:underline"
            >
              Tout effacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get color from color name/code
function getColorFromName(code: string): string {
  const colorMap: Record<string, string> = {
    black: '#000000',
    noir: '#000000',
    white: '#FFFFFF',
    blanc: '#FFFFFF',
    red: '#EF4444',
    rouge: '#EF4444',
    blue: '#3B82F6',
    bleu: '#3B82F6',
    green: '#22C55E',
    vert: '#22C55E',
    yellow: '#EAB308',
    jaune: '#EAB308',
    orange: '#F97316',
    purple: '#A855F7',
    violet: '#A855F7',
    pink: '#EC4899',
    rose: '#EC4899',
    gray: '#6B7280',
    gris: '#6B7280',
    grey: '#6B7280',
    brown: '#92400E',
    marron: '#92400E',
    beige: '#D4B896',
    navy: '#1E3A5F',
    marine: '#1E3A5F',
    cream: '#FFFDD0',
    creme: '#FFFDD0',
    gold: '#FFD700',
    or: '#FFD700',
    silver: '#C0C0C0',
    argent: '#C0C0C0',
  };

  const lowerCode = code.toLowerCase();
  return colorMap[lowerCode] || '#9CA3AF';
}
