import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, X } from 'lucide-react';

interface Facet {
  id: string;
  name: string;
  code: string;
  values: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

interface FacetValueFilterConfigProps {
  facets: Facet[];
  selectedIds: string[];
  combineWithAnd: boolean;
  onSelectionChange: (ids: string[]) => void;
  onCombineChange: (combineWithAnd: boolean) => void;
}

export const FacetValueFilterConfig: React.FC<FacetValueFilterConfigProps> = ({
  facets,
  selectedIds,
  combineWithAnd,
  onSelectionChange,
  onCombineChange,
}) => {
  const [expandedFacets, setExpandedFacets] = useState<Set<string>>(new Set());

  const toggleFacetExpand = (facetId: string) => {
    setExpandedFacets((prev) => {
      const next = new Set(prev);
      if (next.has(facetId)) {
        next.delete(facetId);
      } else {
        next.add(facetId);
      }
      return next;
    });
  };

  const toggleFacetValue = (valueId: string) => {
    if (selectedIds.includes(valueId)) {
      onSelectionChange(selectedIds.filter((id) => id !== valueId));
    } else {
      onSelectionChange([...selectedIds, valueId]);
    }
  };

  const selectAllInFacet = (facet: Facet) => {
    const facetValueIds = facet.values.map((v) => v.id);
    const allSelected = facetValueIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // Deselect all
      onSelectionChange(selectedIds.filter((id) => !facetValueIds.includes(id)));
    } else {
      // Select all
      const newIds = [...new Set([...selectedIds, ...facetValueIds])];
      onSelectionChange(newIds);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const getSelectedCountInFacet = (facet: Facet): number => {
    return facet.values.filter((v) => selectedIds.includes(v.id)).length;
  };

  return (
    <div className="space-y-4">
      {/* Combine Logic Toggle */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div>
          <p className="font-medium text-foreground text-sm">Logique de combinaison</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {combineWithAnd
              ? 'Produits ayant TOUS les attributs (ET)'
              : 'Produits ayant AU MOINS UN attribut (OU)'}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
          <button
            type="button"
            onClick={() => onCombineChange(false)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              !combineWithAnd
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            OU
          </button>
          <button
            type="button"
            onClick={() => onCombineChange(true)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              combineWithAnd
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ET
          </button>
        </div>
      </div>

      {/* Selected Summary */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {selectedIds.slice(0, 5).map((id) => {
              const value = facets.flatMap((f) => f.values).find((v) => v.id === id);
              if (!value) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {value.name}
                  <button
                    type="button"
                    onClick={() => toggleFacetValue(id)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
            {selectedIds.length > 5 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                +{selectedIds.length - 5} autres
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-destructive hover:underline"
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* Facet List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {facets.map((facet) => {
          const isExpanded = expandedFacets.has(facet.id);
          const selectedCount = getSelectedCountInFacet(facet);
          const allSelected = selectedCount === facet.values.length && facet.values.length > 0;

          return (
            <div
              key={facet.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              {/* Facet Header */}
              <div
                className="flex items-center justify-between px-3 py-2 bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => toggleFacetExpand(facet.id)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">{facet.name}</span>
                  {selectedCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                      {selectedCount}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {facet.values.length} valeur{facet.values.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Facet Values */}
              {isExpanded && (
                <div className="p-2 border-t border-border">
                  {/* Select All */}
                  <button
                    type="button"
                    onClick={() => selectAllInFacet(facet)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors mb-1"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        allSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-border'
                      }`}
                    >
                      {allSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span>{allSelected ? 'Tout deselectionner' : 'Tout selectionner'}</span>
                  </button>

                  <div className="h-px bg-border my-1" />

                  {/* Individual Values */}
                  <div className="space-y-0.5">
                    {facet.values.map((value) => {
                      const isSelected = selectedIds.includes(value.id);
                      return (
                        <button
                          key={value.id}
                          type="button"
                          onClick={() => toggleFacetValue(value.id)}
                          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-accent rounded transition-colors"
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-border hover:border-primary'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <span
                            className={isSelected ? 'text-foreground font-medium' : 'text-foreground'}
                          >
                            {value.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {facets.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p>Aucune facette disponible</p>
          <p className="text-sm mt-1">
            Creez des facettes dans les parametres pour les utiliser ici
          </p>
        </div>
      )}
    </div>
  );
};
