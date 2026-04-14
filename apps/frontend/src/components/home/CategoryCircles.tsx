'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

interface CategoryCirclesProps {
  categories: CategoryItem[];
}

function CategoryCircle({ cat }: { cat: CategoryItem }) {
  const [imgError, setImgError] = useState(false);
  const showImage = cat.imageUrl && !imgError;

  return (
    <Link
      href={`/products?category=${cat.slug}`}
      className="flex flex-col items-center gap-3 shrink-0 group"
    >
      <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden bg-muted ring-2 ring-transparent group-hover:ring-primary transition-all">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cat.imageUrl!}
            alt={cat.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-2xl font-semibold">
              {cat.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <span className="text-sm md:text-base font-medium text-foreground text-center whitespace-nowrap">
        {cat.name}
      </span>
    </Link>
  );
}

export function CategoryCircles({ categories }: CategoryCirclesProps) {
  if (categories.length === 0) return null;

  return (
    <div
      className="flex gap-6 overflow-x-auto px-6 pb-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {categories.map((cat) => (
        <CategoryCircle key={cat.id} cat={cat} />
      ))}
    </div>
  );
}
