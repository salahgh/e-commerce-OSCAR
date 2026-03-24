'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PRICE_PRESETS } from '@/lib/facet-utils';
import { cn } from '@/lib/utils';

interface FacetPriceRangeProps {
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (min?: number, max?: number) => void;
  currencyCode?: string;
  className?: string;
}

export function FacetPriceRange({
  minPrice,
  maxPrice,
  onPriceChange,
  currencyCode = 'DZD',
  className,
}: FacetPriceRangeProps) {
  const [localMin, setLocalMin] = useState<string>(minPrice ? String(minPrice / 100) : '');
  const [localMax, setLocalMax] = useState<string>(maxPrice ? String(maxPrice / 100) : '');
  const [isDirty, setIsDirty] = useState(false);

  // Sync local state with props
  useEffect(() => {
    if (!isDirty) {
      setLocalMin(minPrice ? String(minPrice / 100) : '');
      setLocalMax(maxPrice ? String(maxPrice / 100) : '');
    }
  }, [minPrice, maxPrice, isDirty]);

  // Debounced update
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      const min = localMin ? parseInt(localMin, 10) * 100 : undefined;
      const max = localMax ? parseInt(localMax, 10) * 100 : undefined;
      onPriceChange(min, max);
      setIsDirty(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [localMin, localMax, isDirty, onPriceChange]);

  const handleMinChange = useCallback((value: string) => {
    setLocalMin(value.replace(/[^0-9]/g, ''));
    setIsDirty(true);
  }, []);

  const handleMaxChange = useCallback((value: string) => {
    setLocalMax(value.replace(/[^0-9]/g, ''));
    setIsDirty(true);
  }, []);

  const applyPreset = useCallback(
    (preset: (typeof PRICE_PRESETS)[number]) => {
      onPriceChange(preset.min, preset.max);
      setLocalMin(preset.min ? String(preset.min / 100) : '');
      setLocalMax(preset.max ? String(preset.max / 100) : '');
      setIsDirty(false);
    },
    [onPriceChange]
  );

  const clearPrice = useCallback(() => {
    onPriceChange(undefined, undefined);
    setLocalMin('');
    setLocalMax('');
    setIsDirty(false);
  }, [onPriceChange]);

  const isPresetActive = (preset: (typeof PRICE_PRESETS)[number]) => {
    const currentMin = localMin ? parseInt(localMin, 10) * 100 : undefined;
    const currentMax = localMax ? parseInt(localMax, 10) * 100 : undefined;
    return preset.min === currentMin && preset.max === currentMax;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Price Inputs */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium mb-1 block">Min</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={localMin}
              onChange={(e) => handleMinChange(e.target.value)}
              placeholder="0"
              className="w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                         bg-white transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              DA
            </span>
          </div>
        </div>

        <div className="text-gray-400 pt-5">—</div>

        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium mb-1 block">Max</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={localMax}
              onChange={(e) => handleMaxChange(e.target.value)}
              placeholder="∞"
              className="w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                         bg-white transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              DA
            </span>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">Presets rapides</p>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset, index) => (
            <motion.button
              key={index}
              onClick={() => applyPreset(preset)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-all',
                isPresetActive(preset)
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Clear Button */}
      {(localMin || localMax) && (
        <motion.button
          onClick={clearPrice}
          className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          Effacer le filtre de prix
        </motion.button>
      )}
    </div>
  );
}
