import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Palette,
  Ruler,
  Tag,
  DollarSign,
  FolderTree,
  Eye,
  EyeOff,
  Star,
  Package,
  Search,
  Check,
  Trash2,
  X,
} from 'lucide-react';
import {
  type FacetGroup,
  type AdminFilterState,
  sortSizes,
  PRICE_PRESETS,
} from '../../lib/facet-utils';
import { ColorSwatch } from '../ui/ColorSwatch';
import { cn } from '../../lib/utils';

interface FacetedFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  facetGroups: FacetGroup[];
  /** Live counts from the Vendure Search API, keyed by facet value id */
  facetValueCounts?: Map<string, number>;
  collections: Array<{ id: string; name: string; slug: string; parentId?: string }>;
  state: AdminFilterState;
  onToggleFacetValue: (id: string) => void;
  onClearFacetGroup: (facetId: string) => void;
  onSetCollectionIds: (ids: string[]) => void;
  onSetEnabled: (enabled?: boolean) => void;
  onSetFeatured: (featured?: boolean) => void;
  onSetStockStatus: (status: AdminFilterState['stockStatus']) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  loading?: boolean;
}

// Facet type icons
const FACET_ICONS: Record<string, React.ElementType> = {
  'color-swatch': Palette,
  'size-button': Ruler,
  checkbox: Tag,
  'price-range': DollarSign,
};

// Gradient styles for facet headers
const FACET_GRADIENTS: Record<string, string> = {
  'color-swatch': 'from-pink-900/30 via-purple-900/30 to-blue-900/30',
  'size-button': 'from-blue-900/30 via-cyan-900/30 to-teal-900/30',
  checkbox: 'from-gray-800 to-gray-900',
  'price-range': 'from-amber-900/30 via-orange-900/30 to-red-900/30',
};

export const FacetedFilterPanel: React.FC<FacetedFilterPanelProps> = ({
  isOpen,
  onClose,
  facetGroups,
  facetValueCounts,
  collections,
  state,
  onToggleFacetValue,
  onClearFacetGroup,
  onSetCollectionIds,
  onSetEnabled,
  onSetFeatured,
  onSetStockStatus,
  onPriceChange,
  onClearAll,
  activeFilterCount,
  loading = false,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(['status', 'stock', 'price', ...facetGroups.map((g) => g.id)])
  );

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const getSelectedCountForFacet = (facet: FacetGroup): number => {
    return facet.values.filter((v) => state.facetValueIds.includes(v.id)).length;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-[420px] bg-gray-900 shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-900/50 rounded-lg">
              <Filter className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">Filtres avances</h3>
              {activeFilterCount > 0 && (
                <p className="text-xs text-gray-400">
                  {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif
                  {activeFilterCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Skeleton Loading */}
        {loading && (
          <div className="flex-1 p-5 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-gray-700 rounded animate-pulse w-32" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-10 bg-gray-800 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Sections */}
        {!loading && (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-700">
            {/* Status Filter */}
            <FilterSection
              id="status"
              name="Statut"
              icon={Eye}
              isExpanded={expandedSections.has('status')}
              onToggle={() => toggleSection('status')}
              gradient="from-green-500/10 to-emerald-500/10"
            >
              <div className="space-y-2">
                <StatusButton
                  label="Tous"
                  isActive={state.enabled === undefined && state.isFeatured === undefined}
                  onClick={() => {
                    onSetEnabled(undefined);
                    onSetFeatured(undefined);
                  }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <StatusButton
                    label="Actifs"
                    icon={<Eye className="h-4 w-4" />}
                    isActive={state.enabled === true}
                    onClick={() => onSetEnabled(state.enabled === true ? undefined : true)}
                    variant="success"
                  />
                  <StatusButton
                    label="Inactifs"
                    icon={<EyeOff className="h-4 w-4" />}
                    isActive={state.enabled === false}
                    onClick={() => onSetEnabled(state.enabled === false ? undefined : false)}
                    variant="warning"
                  />
                </div>
                <StatusButton
                  label="Produits vedettes"
                  icon={<Star className="h-4 w-4" />}
                  isActive={state.isFeatured === true}
                  onClick={() => onSetFeatured(state.isFeatured === true ? undefined : true)}
                  variant="primary"
                />
              </div>
            </FilterSection>

            {/* Stock Status */}
            <FilterSection
              id="stock"
              name="Stock"
              icon={Package}
              isExpanded={expandedSections.has('stock')}
              onToggle={() => toggleSection('stock')}
              gradient="from-orange-500/10 to-red-500/10"
            >
              <div className="grid grid-cols-2 gap-2">
                <StatusButton
                  label="Tous"
                  isActive={state.stockStatus === 'all'}
                  onClick={() => onSetStockStatus('all')}
                />
                <StatusButton
                  label="En stock"
                  isActive={state.stockStatus === 'in_stock'}
                  onClick={() => onSetStockStatus('in_stock')}
                  variant="success"
                />
                <StatusButton
                  label="Stock faible"
                  isActive={state.stockStatus === 'low_stock'}
                  onClick={() => onSetStockStatus('low_stock')}
                  variant="warning"
                />
                <StatusButton
                  label="Rupture"
                  isActive={state.stockStatus === 'out_of_stock'}
                  onClick={() => onSetStockStatus('out_of_stock')}
                  variant="danger"
                />
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection
              id="price"
              name="Prix"
              icon={DollarSign}
              isExpanded={expandedSections.has('price')}
              selectedCount={state.priceMin !== undefined || state.priceMax !== undefined ? 1 : 0}
              onToggle={() => toggleSection('price')}
              onClear={
                state.priceMin !== undefined || state.priceMax !== undefined
                  ? () => onPriceChange(undefined, undefined)
                  : undefined
              }
              gradient={FACET_GRADIENTS['price-range']}
            >
              <PriceRangeFilter
                minPrice={state.priceMin}
                maxPrice={state.priceMax}
                onPriceChange={onPriceChange}
              />
            </FilterSection>

            {/* Categories */}
            {collections.length > 0 && (
              <FilterSection
                id="categories"
                name="Categories"
                icon={FolderTree}
                isExpanded={expandedSections.has('categories')}
                selectedCount={state.collectionIds.length}
                onToggle={() => toggleSection('categories')}
                onClear={state.collectionIds.length > 0 ? () => onSetCollectionIds([]) : undefined}
                gradient="from-indigo-500/10 to-purple-500/10"
              >
                <CategoryFilter
                  collections={collections}
                  selectedIds={state.collectionIds}
                  onToggle={(id) => {
                    const newIds = state.collectionIds.includes(id)
                      ? state.collectionIds.filter((cid) => cid !== id)
                      : [...state.collectionIds, id];
                    onSetCollectionIds(newIds);
                  }}
                />
              </FilterSection>
            )}

            {/* Dynamic Facets */}
            {facetGroups.map((facet) => {
              const selectedCount = getSelectedCountForFacet(facet);
              const isExpanded = expandedSections.has(facet.id);
              const Icon = FACET_ICONS[facet.displayType] || Tag;

              return (
                <FilterSection
                  key={facet.id}
                  id={facet.id}
                  name={facet.name}
                  icon={Icon}
                  isExpanded={isExpanded}
                  selectedCount={selectedCount}
                  onToggle={() => toggleSection(facet.id)}
                  onClear={selectedCount > 0 ? () => onClearFacetGroup(facet.id) : undefined}
                  gradient={FACET_GRADIENTS[facet.displayType] || FACET_GRADIENTS.checkbox}
                >
                  {facet.displayType === 'color-swatch' && (
                    <ColorSwatchFilter
                      values={facet.values}
                      selectedIds={state.facetValueIds}
                      onToggle={onToggleFacetValue}
                      counts={facetValueCounts}
                    />
                  )}
                  {facet.displayType === 'size-button' && (
                    <SizeButtonFilter
                      values={facet.values}
                      selectedIds={state.facetValueIds}
                      onToggle={onToggleFacetValue}
                      counts={facetValueCounts}
                    />
                  )}
                  {facet.displayType === 'checkbox' && (
                    <CheckboxFilter
                      values={facet.values}
                      selectedIds={state.facetValueIds}
                      onToggle={onToggleFacetValue}
                      counts={facetValueCounts}
                    />
                  )}
                </FilterSection>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800 flex gap-3">
          <button
            onClick={onClearAll}
            disabled={activeFilterCount === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-600
                       text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Reinitialiser
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg
                       hover:bg-primary-700 transition-colors font-medium"
          >
            Appliquer ({activeFilterCount})
          </button>
        </div>
      </motion.div>
    </>
  );
};

// Filter Section Component
interface FilterSectionProps {
  id: string;
  name: string;
  icon: React.ElementType;
  isExpanded: boolean;
  selectedCount?: number;
  onToggle: () => void;
  onClear?: () => void;
  gradient?: string;
  children: React.ReactNode;
}

function FilterSection({
  name,
  icon: Icon,
  isExpanded,
  selectedCount = 0,
  onToggle,
  onClear,
  gradient = 'from-gray-800 to-gray-900',
  children,
}: FilterSectionProps) {
  return (
    <div className="overflow-hidden">
      <button
        onClick={onToggle}
        className={cn(
          'w-full px-5 py-3.5 flex items-center justify-between',
          'hover:bg-gray-700 transition-colors',
          `bg-gradient-to-r ${gradient}`
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-100 text-sm">{name}</span>
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
              className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1
                         rounded hover:bg-red-900/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Effacer
            </motion.button>
          )}
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </motion.div>
        </div>
      </button>

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

// Status Button Component
interface StatusButtonProps {
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
}

function StatusButton({ label, icon, isActive, onClick, variant = 'default' }: StatusButtonProps) {
  const variantStyles = {
    default: isActive
      ? 'bg-gray-700 border-gray-600 text-gray-100'
      : 'bg-gray-800 border-gray-700 text-gray-400',
    success: isActive
      ? 'bg-green-900/50 border-green-600 text-green-400'
      : 'bg-gray-800 border-gray-700 text-gray-400',
    warning: isActive
      ? 'bg-amber-900/50 border-amber-600 text-amber-400'
      : 'bg-gray-800 border-gray-700 text-gray-400',
    danger: isActive
      ? 'bg-red-900/50 border-red-600 text-red-400'
      : 'bg-gray-800 border-gray-700 text-gray-400',
    primary: isActive
      ? 'bg-primary-900/50 border-primary-600 text-primary-400'
      : 'bg-gray-800 border-gray-700 text-gray-400',
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all',
        variantStyles[variant]
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      {label}
    </motion.button>
  );
}

// Price Range Filter
interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (min?: number, max?: number) => void;
}

function PriceRangeFilter({ minPrice, maxPrice, onPriceChange }: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState<string>(minPrice ? String(minPrice / 100) : '');
  const [localMax, setLocalMax] = useState<string>(maxPrice ? String(maxPrice / 100) : '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const applyPreset = (preset: (typeof PRICE_PRESETS)[number]) => {
    onPriceChange(preset.min, preset.max);
    setLocalMin(preset.min ? String(preset.min / 100) : '');
    setLocalMax(preset.max ? String(preset.max / 100) : '');
    setValidationError(null);
  };

  const handleApply = () => {
    const min = localMin ? parseInt(localMin, 10) * 100 : undefined;
    const max = localMax ? parseInt(localMax, 10) * 100 : undefined;

    // Validate min <= max
    if (min !== undefined && max !== undefined && min > max) {
      setValidationError('Le prix minimum doit etre inferieur au maximum');
      return;
    }

    setValidationError(null);
    onPriceChange(min, max);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="number"
            value={localMin}
            onChange={(e) => {
              setLocalMin(e.target.value);
              setValidationError(null);
            }}
            placeholder="Min"
            className={cn(
              "w-full px-3 py-2 border rounded-lg text-sm bg-gray-800 text-gray-100 placeholder-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
              validationError ? "border-red-500" : "border-gray-600"
            )}
          />
        </div>
        <span className="text-gray-500">—</span>
        <div className="flex-1">
          <input
            type="number"
            value={localMax}
            onChange={(e) => {
              setLocalMax(e.target.value);
              setValidationError(null);
            }}
            placeholder="Max"
            className={cn(
              "w-full px-3 py-2 border rounded-lg text-sm bg-gray-800 text-gray-100 placeholder-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
              validationError ? "border-red-500" : "border-gray-600"
            )}
          />
        </div>
        <button
          onClick={handleApply}
          className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium
                     hover:bg-primary-600 transition-colors"
        >
          OK
        </button>
      </div>

      {validationError && (
        <p className="text-xs text-red-400">{validationError}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {PRICE_PRESETS.map((preset, index) => (
          <button
            key={index}
            onClick={() => applyPreset(preset)}
            className="px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-gray-300
                       hover:bg-gray-600 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Category Filter
interface CategoryFilterProps {
  collections: Array<{ id: string; name: string; slug: string; parentId?: string }>;
  selectedIds: string[];
  onToggle: (id: string) => void;
}

function CategoryFilter({ collections, selectedIds, onToggle }: CategoryFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCollections = useMemo(() => {
    if (!searchTerm) return collections;
    const term = searchTerm.toLowerCase();
    return collections.filter((c) => c.name.toLowerCase().includes(term));
  }, [collections, searchTerm]);

  return (
    <div className="space-y-2">
      {collections.length > 6 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
      )}

      <div className="max-h-48 overflow-y-auto space-y-1">
        {filteredCollections.map((collection) => {
          const isSelected = selectedIds.includes(collection.id);
          return (
            <button
              key={collection.id}
              onClick={() => onToggle(collection.id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all',
                isSelected
                  ? 'bg-primary-900/50 border border-primary-600 text-primary-400'
                  : 'hover:bg-gray-700 border border-transparent text-gray-300'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                  isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-600'
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="flex-1 truncate">{collection.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Color Swatch Filter
interface ColorSwatchFilterProps {
  values: Array<{ id: string; name: string; code: string }>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  counts?: Map<string, number>;
}

function ColorSwatchFilter({ values, selectedIds, onToggle, counts }: ColorSwatchFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => {
        const isSelected = selectedIds.includes(value.id);
        const count = counts?.get(value.id);
        const disabled = count === 0 && !isSelected;
        return (
          <motion.button
            key={value.id}
            onClick={() => onToggle(value.id)}
            disabled={disabled}
            className={cn(
              'relative p-1 rounded-lg transition-all',
              isSelected && 'ring-2 ring-primary-500 ring-offset-2',
              disabled && 'opacity-40 cursor-not-allowed'
            )}
            whileHover={!disabled ? { scale: 1.1 } : undefined}
            whileTap={!disabled ? { scale: 0.9 } : undefined}
            title={count !== undefined ? `${value.name} (${count})` : value.name}
          >
            <ColorSwatch color={value.code} size="md" selected={isSelected} />
          </motion.button>
        );
      })}
    </div>
  );
}

// Size Button Filter
interface SizeButtonFilterProps {
  values: Array<{ id: string; name: string; code: string }>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  counts?: Map<string, number>;
}

function SizeButtonFilter({ values, selectedIds, onToggle, counts }: SizeButtonFilterProps) {
  const sortedValues = useMemo(() => {
    return [...values].sort((a, b) => {
      const orderedNames = sortSizes([a.name, b.name]);
      return orderedNames.indexOf(a.name) - orderedNames.indexOf(b.name);
    });
  }, [values]);

  return (
    <div className="flex flex-wrap gap-2">
      {sortedValues.map((value) => {
        const isSelected = selectedIds.includes(value.id);
        const count = counts?.get(value.id);
        const disabled = count === 0 && !isSelected;
        return (
          <motion.button
            key={value.id}
            onClick={() => onToggle(value.id)}
            disabled={disabled}
            className={cn(
              'px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all min-w-[44px]',
              isSelected
                ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500',
              disabled && 'opacity-40 cursor-not-allowed hover:border-gray-600'
            )}
            whileHover={!disabled ? { scale: 1.05 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
          >
            {value.name}
            {count !== undefined && (
              <span className="ml-1 text-xs opacity-70">({count})</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// Checkbox Filter
interface CheckboxFilterProps {
  values: Array<{ id: string; name: string; code: string }>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  counts?: Map<string, number>;
}

function CheckboxFilter({ values, selectedIds, onToggle, counts }: CheckboxFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredValues = useMemo(() => {
    if (!searchTerm) return values;
    const term = searchTerm.toLowerCase();
    return values.filter((v) => v.name.toLowerCase().includes(term));
  }, [values, searchTerm]);

  const visibleValues = showAll ? filteredValues : filteredValues.slice(0, 6);
  const hasMore = filteredValues.length > 6;

  return (
    <div className="space-y-2">
      {values.length > 8 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
      )}

      <div className="space-y-1">
        {visibleValues.map((value) => {
          const isSelected = selectedIds.includes(value.id);
          const count = counts?.get(value.id);
          const disabled = count === 0 && !isSelected;
          return (
            <button
              key={value.id}
              onClick={() => onToggle(value.id)}
              disabled={disabled}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all',
                isSelected
                  ? 'bg-primary-900/50 border border-primary-600'
                  : 'hover:bg-gray-700 border border-transparent text-gray-300',
                disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                  isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-600'
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className={cn('flex-1', isSelected && 'text-primary-400 font-medium')}>
                {value.name}
              </span>
              {count !== undefined && (
                <span className="text-xs text-gray-500 tabular-nums">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {hasMore && !searchTerm && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Voir {filteredValues.length - 6} de plus
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default FacetedFilterPanel;
