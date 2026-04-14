'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard, type HomeProduct } from './ProductCard';

interface ProductRowProps {
  products: HomeProduct[];
}

export function ProductRow({ products }: ProductRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (products.length === 0) return null;

  return (
    <div className="relative group/row">
      {/* Scroll Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute start-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-white"
      >
        <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute end-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-white"
      >
        <ChevronRight className="w-5 h-5 rtl:rotate-180" />
      </button>

      {/* Scrollable Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="snap-start shrink-0 w-[265px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
