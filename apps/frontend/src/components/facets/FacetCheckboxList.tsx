'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { type FacetValueWithCount } from '@/lib/facet-utils';
import { cn } from '@/lib/utils';

interface FacetCheckboxListProps {
  values: FacetValueWithCount[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  showSearch?: boolean;
  maxVisible?: number;
  className?: string;
}

export function FacetCheckboxList({
  values,
  selectedIds,
  onToggle,
  showSearch = true,
  maxVisible = 6,
  className,
}: FacetCheckboxListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredValues = useMemo(() => {
    if (!searchTerm) return values;
    const term = searchTerm.toLowerCase();
    return values.filter(
      (v) => v.name.toLowerCase().includes(term) || v.code.toLowerCase().includes(term)
    );
  }, [values, searchTerm]);

  const visibleValues = isExpanded ? filteredValues : filteredValues.slice(0, maxVisible);
  const hasMore = filteredValues.length > maxVisible;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Search Input */}
      {showSearch && values.length > 8 && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                       bg-muted hover:bg-background transition-colors"
          />
        </div>
      )}

      {/* Checkbox List */}
      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {visibleValues.map((value) => {
            const isSelected = selectedIds.includes(value.id);
            const isDisabled = value.count === 0 && !isSelected;

            return (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  onClick={() => !isDisabled && onToggle(value.id)}
                  disabled={isDisabled}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150',
                    isSelected
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted border border-transparent',
                    isDisabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150',
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-input bg-background'
                    )}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      'flex-1 text-sm font-medium transition-colors',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {value.name}
                  </span>

                  {/* Count Badge */}
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full transition-colors',
                      isSelected
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {value.count}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show More/Less */}
      {hasMore && !searchTerm && (
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700
                     font-medium py-2 px-3 rounded-lg hover:bg-primary-50 transition-colors w-full"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Voir {filteredValues.length - maxVisible} de plus
            </>
          )}
        </motion.button>
      )}

      {/* No Results */}
      {searchTerm && filteredValues.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">Aucun resultat pour "{searchTerm}"</p>
      )}
    </div>
  );
}
