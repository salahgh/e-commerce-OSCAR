'use client';

import Image from 'next/image';
import { useGetRootCollectionsQuery } from '@oscar/graphql-shop/generated';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

interface CategoryCirclesProps {
  /** Diameter of each circle in px (Figma: 120 on home, ~78 on the listing toolbar). */
  size?: number;
  /** Row alignment — centred on the home page, end-aligned on the products listing. */
  align?: 'center' | 'end';
  /** Max number of categories to show. */
  limit?: number;
}

export function CategoryCircles({ size = 120, align = 'center', limit = 12 }: CategoryCirclesProps) {
  const { data, loading } = useGetRootCollectionsQuery();
  const roots = data?.collections.items ?? [];
  // Prefer sub-categories (shirts, abayas, dresses…) as in the Figma; fall back to top-level.
  const children = roots.flatMap((c) => c.children ?? []);
  const collections = children.length > 0 ? children : roots;

  if (!loading && collections.length === 0) return null;

  return (
    <section className={cn('flex flex-wrap gap-x-9 gap-y-8', align === 'end' ? 'justify-end' : 'justify-center')}>
      {loading
        ? Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3" style={{ width: size }}>
              <div className="animate-pulse rounded-full bg-bg-muted" style={{ height: size, width: size }} />
              <div className="h-4 w-16 animate-pulse rounded bg-bg-muted" />
            </div>
          ))
        : collections.slice(0, limit).map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group flex flex-col items-center gap-3"
              style={{ width: size }}
            >
              <span
                className="relative overflow-hidden rounded-full bg-bg-muted ring-1 ring-hairline transition-transform group-hover:scale-105"
                style={{ height: size, width: size }}
              >
                {c.featuredAsset?.preview && (
                  <Image src={c.featuredAsset.preview} alt={c.name} fill sizes={`${size}px`} className="object-cover" />
                )}
              </span>
              <span className="text-center text-16 text-content-strong">{c.name}</span>
            </Link>
          ))}
    </section>
  );
}
