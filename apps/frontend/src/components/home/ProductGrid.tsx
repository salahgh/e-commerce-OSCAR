'use client';

import { ProductCard, type HomeProduct } from './ProductCard';

interface ProductGridProps {
  products: HomeProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
