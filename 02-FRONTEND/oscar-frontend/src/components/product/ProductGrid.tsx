import React from 'react';
import ProductCard from './ProductCard';
import { SkeletonCard } from '@/components/ui';

interface ProductGridProps {
  products: Array<{
    id: string;
    slug: string;
    name: {
      ar: string;
      fr: string;
      en: string;
    };
    basePrice: number;
    salePrice?: number;
    images: Array<{
      url: string;
      alt?: string;
      isPrimary: boolean;
    }>;
    status: string;
    stockQuantity: number;
    badge?: string;
  }>;
  loading?: boolean;
  locale?: 'ar' | 'fr' | 'en';
  columns?: 2 | 3 | 4;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
}

export default function ProductGrid({
  products,
  loading = false,
  locale = 'fr',
  columns = 4,
  onAddToCart,
  onAddToWishlist,
}: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
        <p className="text-gray-400 text-sm mt-2">
          Essayez d'ajuster vos filtres ou de rechercher autre chose
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  );
}
