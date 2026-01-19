import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Plus, Trash2, ChevronDown, ChevronRight, Filter, Package } from 'lucide-react';
import {
  CollectionFilterDefinitionsDocument,
  AdminFacetsForFilterDocument,
} from '../../graphql/generated/graphql';
import { FacetValueFilterConfig } from './FacetValueFilterConfig';

interface ConfigurableOperationInput {
  code: string;
  arguments: Array<{ name: string; value: string }>;
}

interface CollectionFilterBuilderProps {
  filters: ConfigurableOperationInput[];
  onChange: (filters: ConfigurableOperationInput[]) => void;
  previewCount?: number;
  onPreview?: () => void;
}

export const CollectionFilterBuilder: React.FC<CollectionFilterBuilderProps> = ({
  filters,
  onChange,
  previewCount,
  onPreview,
}) => {
  const [expandedFilters, setExpandedFilters] = useState<Set<number>>(new Set([0]));

  // Fetch available filter definitions
  const { data: filterDefsData, loading: loadingDefs } = useQuery(CollectionFilterDefinitionsDocument);

  // Fetch facets for facet-value-filter
  const { data: facetsData, loading: loadingFacets } = useQuery(AdminFacetsForFilterDocument);

  const filterDefinitions = filterDefsData?.collectionFilters || [];
  const facets = facetsData?.facets?.items || [];

  const toggleExpand = (index: number) => {
    setExpandedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const addFilter = () => {
    // Default to facet-value-filter if available
    const defaultCode = filterDefinitions.find((f: any) => f.code === 'facet-value-filter')?.code
      || filterDefinitions[0]?.code
      || 'facet-value-filter';

    const newFilter: ConfigurableOperationInput = {
      code: defaultCode,
      arguments: getDefaultArguments(defaultCode),
    };

    const newFilters = [...filters, newFilter];
    onChange(newFilters);
    setExpandedFilters((prev) => new Set([...prev, filters.length]));
  };

  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    onChange(newFilters);
    setExpandedFilters((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const updateFilterCode = (index: number, code: string) => {
    const newFilters = [...filters];
    newFilters[index] = {
      code,
      arguments: getDefaultArguments(code),
    };
    onChange(newFilters);
  };

  const updateFilterArguments = (index: number, args: Array<{ name: string; value: string }>) => {
    const newFilters = [...filters];
    newFilters[index] = {
      ...newFilters[index],
      arguments: args,
    };
    onChange(newFilters);
  };

  const getDefaultArguments = (code: string): Array<{ name: string; value: string }> => {
    const definition = filterDefinitions.find((f: any) => f.code === code);
    if (!definition) return [];

    return definition.args.map((arg: any) => ({
      name: arg.name,
      value: arg.defaultValue || (arg.type === 'boolean' ? 'false' : ''),
    }));
  };

  const getFilterLabel = (code: string): string => {
    const labels: Record<string, string> = {
      'facet-value-filter': 'Filtrer par attributs (Facettes)',
      'product-id-filter': 'Filtrer par ID de produit',
      'variant-name-filter': 'Filtrer par nom de variante',
      'variant-id-filter': 'Filtrer par ID de variante',
    };
    return labels[code] || code;
  };

  const getFilterDescription = (code: string): string => {
    const definition = filterDefinitions.find((f: any) => f.code === code);
    return definition?.description || '';
  };

  if (loadingDefs || loadingFacets) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter List */}
      {filters.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-lg">
          <Filter className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aucun filtre configure</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ajoutez des filtres pour definir quels produits apparaissent dans cette categorie
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filters.map((filter, index) => (
            <div
              key={index}
              className="border border-border rounded-lg overflow-hidden bg-card"
            >
              {/* Filter Header */}
              <div
                className="flex items-center justify-between px-4 py-3 bg-muted/50 cursor-pointer"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-center gap-3">
                  <button type="button" className="text-muted-foreground">
                    {expandedFilters.has(index) ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>
                  <div>
                    <p className="font-medium text-foreground">
                      {getFilterLabel(filter.code)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getFilterSummary(filter, facets)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFilter(index);
                  }}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Supprimer ce filtre"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Content */}
              {expandedFilters.has(index) && (
                <div className="p-4 border-t border-border">
                  {/* Filter Type Selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Type de filtre
                    </label>
                    <select
                      value={filter.code}
                      onChange={(e) => updateFilterCode(index, e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      {filterDefinitions.map((def: any) => (
                        <option key={def.code} value={def.code}>
                          {getFilterLabel(def.code)}
                        </option>
                      ))}
                    </select>
                    {getFilterDescription(filter.code) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {getFilterDescription(filter.code)}
                      </p>
                    )}
                  </div>

                  {/* Filter Arguments */}
                  {filter.code === 'facet-value-filter' ? (
                    <FacetValueFilterConfig
                      facets={facets}
                      selectedIds={getSelectedFacetValueIds(filter)}
                      combineWithAnd={getCombineWithAnd(filter)}
                      onSelectionChange={(ids) => {
                        const args = [
                          { name: 'facetValueIds', value: JSON.stringify(ids) },
                          {
                            name: 'containsAny',
                            value: getCombineWithAnd(filter) ? 'false' : 'true',
                          },
                          { name: 'combineWithAnd', value: String(getCombineWithAnd(filter)) },
                        ];
                        updateFilterArguments(index, args);
                      }}
                      onCombineChange={(combineWithAnd) => {
                        const args = [
                          { name: 'facetValueIds', value: JSON.stringify(getSelectedFacetValueIds(filter)) },
                          { name: 'containsAny', value: combineWithAnd ? 'false' : 'true' },
                          { name: 'combineWithAnd', value: String(combineWithAnd) },
                        ];
                        updateFilterArguments(index, args);
                      }}
                    />
                  ) : (
                    <GenericFilterArguments
                      filterCode={filter.code}
                      arguments={filter.arguments}
                      definitions={filterDefinitions}
                      onChange={(args) => updateFilterArguments(index, args)}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Filter Button */}
      <button
        type="button"
        onClick={addFilter}
        className="flex items-center gap-2 px-4 py-2 w-full border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <Plus className="h-5 w-5" />
        Ajouter un filtre
      </button>

      {/* Preview Button */}
      {filters.length > 0 && onPreview && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-5 w-5" />
            <span className="text-sm">
              {previewCount !== undefined ? (
                <>
                  <strong className="text-foreground">{previewCount}</strong> produits correspondent
                </>
              ) : (
                'Previsualiser les produits'
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={onPreview}
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
          >
            Previsualiser
          </button>
        </div>
      )}
    </div>
  );
};

// Helper functions
function getSelectedFacetValueIds(filter: ConfigurableOperationInput): string[] {
  const arg = filter.arguments.find((a) => a.name === 'facetValueIds');
  if (!arg?.value) return [];
  try {
    return JSON.parse(arg.value);
  } catch {
    return [];
  }
}

function getCombineWithAnd(filter: ConfigurableOperationInput): boolean {
  const arg = filter.arguments.find((a) => a.name === 'combineWithAnd');
  return arg?.value === 'true';
}

function getFilterSummary(filter: ConfigurableOperationInput, facets: any[]): string {
  if (filter.code === 'facet-value-filter') {
    const ids = getSelectedFacetValueIds(filter);
    if (ids.length === 0) return 'Aucun attribut selectionne';

    // Find facet value names
    const names: string[] = [];
    facets.forEach((facet: any) => {
      facet.values.forEach((value: any) => {
        if (ids.includes(value.id)) {
          names.push(value.name);
        }
      });
    });

    if (names.length <= 3) {
      return names.join(', ');
    }
    return `${names.slice(0, 3).join(', ')} +${names.length - 3}`;
  }

  return `${filter.arguments.length} parametre(s)`;
}

// Generic arguments editor for other filter types
interface GenericFilterArgumentsProps {
  filterCode: string;
  arguments: Array<{ name: string; value: string }>;
  definitions: any[];
  onChange: (args: Array<{ name: string; value: string }>) => void;
}

const GenericFilterArguments: React.FC<GenericFilterArgumentsProps> = ({
  filterCode,
  arguments: args,
  definitions,
  onChange,
}) => {
  const filterDef = definitions.find((d: any) => d.code === filterCode);
  if (!filterDef) return null;

  const updateArg = (name: string, value: string) => {
    const newArgs = args.map((a) => (a.name === name ? { ...a, value } : a));
    onChange(newArgs);
  };

  return (
    <div className="space-y-4">
      {filterDef.args.map((argDef: any) => {
        const currentArg = args.find((a) => a.name === argDef.name);
        const value = currentArg?.value || '';

        return (
          <div key={argDef.name}>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {argDef.label || argDef.name}
              {argDef.required && <span className="text-destructive ml-1">*</span>}
            </label>

            {argDef.type === 'boolean' ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value === 'true'}
                  onChange={(e) => updateArg(argDef.name, String(e.target.checked))}
                  className="rounded border-border"
                />
                <span className="text-sm text-muted-foreground">
                  {argDef.description || 'Activer'}
                </span>
              </label>
            ) : argDef.type === 'ID' || argDef.type === 'string' ? (
              <input
                type="text"
                value={value}
                onChange={(e) => updateArg(argDef.name, e.target.value)}
                placeholder={argDef.description || `Entrez ${argDef.name}`}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            ) : (
              <textarea
                value={value}
                onChange={(e) => updateArg(argDef.name, e.target.value)}
                placeholder={argDef.description || `Entrez ${argDef.name}`}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              />
            )}

            {argDef.description && argDef.type !== 'boolean' && (
              <p className="text-xs text-muted-foreground mt-1">{argDef.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
