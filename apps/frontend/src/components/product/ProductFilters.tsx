'use client';

import React, { useState } from 'react';
import { Button, Badge } from '@/components/ui';
import { X, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProductFiltersProps {
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
  }>;
  priceRange?: {
    min: number;
    max: number;
  };
}

export default function ProductFilters({
  categories = [],
  priceRange = { min: 0, max: 50000 },
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [minPrice, setMinPrice] = useState(
    Number(searchParams.get('minPrice')) || priceRange.min
  );
  const [maxPrice, setMaxPrice] = useState(
    Number(searchParams.get('maxPrice')) || priceRange.max
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.get('size')?.split(',').filter(Boolean) || []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get('color')?.split(',').filter(Boolean) || []
  );

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Noir', value: 'black', hex: '#000000' },
    { name: 'Blanc', value: 'white', hex: '#FFFFFF' },
    { name: 'Bleu', value: 'blue', hex: '#3B82F6' },
    { name: 'Rouge', value: 'red', hex: '#EF4444' },
    { name: 'Vert', value: 'green', hex: '#10B981' },
    { name: 'Gris', value: 'gray', hex: '#6B7280' },
  ];

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','));
    } else {
      params.delete('category');
    }

    if (minPrice > priceRange.min) {
      params.set('minPrice', minPrice.toString());
    } else {
      params.delete('minPrice');
    }

    if (maxPrice < priceRange.max) {
      params.set('maxPrice', maxPrice.toString());
    } else {
      params.delete('maxPrice');
    }

    if (selectedSizes.length > 0) {
      params.set('size', selectedSizes.join(','));
    } else {
      params.delete('size');
    }

    if (selectedColors.length > 0) {
      params.set('color', selectedColors.join(','));
    } else {
      params.delete('color');
    }

    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setSelectedSizes([]);
    setSelectedColors([]);
    router.push('/products');
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    minPrice > priceRange.min ||
    maxPrice < priceRange.max;

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Filtres
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-primary flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Effacer
          </button>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Catégories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{category.name}</span>
                <span className="text-xs text-gray-400">({category.count})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="border-t pt-4">
        <h3 className="font-medium mb-3">Prix</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-600">Min</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="input w-full mt-1"
                min={priceRange.min}
                max={maxPrice}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-600">Max</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="input w-full mt-1"
                min={minPrice}
                max={priceRange.max}
              />
            </div>
          </div>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="border-t pt-4">
        <h3 className="font-medium mb-3">Taille</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-4 py-2 rounded-md border transition-colors ${
                selectedSizes.includes(size)
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="border-t pt-4">
        <h3 className="font-medium mb-3">Couleur</h3>
        <div className="grid grid-cols-3 gap-3">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => toggleColor(color.value)}
              className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${
                selectedColors.includes(color.value)
                  ? 'border-primary bg-primary-50'
                  : 'border-gray-200 hover:border-primary'
              }`}
            >
              <div
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-xs">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <div className="border-t pt-4">
        <Button onClick={applyFilters} className="w-full">
          Appliquer les filtres
        </Button>
      </div>
    </div>
  );
}
