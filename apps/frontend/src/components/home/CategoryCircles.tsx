'use client';

import Image from 'next/image';
import { useGetRootCollectionsQuery } from '@oscar/graphql-shop/generated';
import { Link } from '@/i18n/routing';

export function CategoryCircles() {
  const { data, loading } = useGetRootCollectionsQuery();
  const roots = data?.collections.items ?? [];
  // Prefer sub-categories (shirts, abayas, dresses…) as in the Figma; fall back to top-level.
  const children = roots.flatMap((c) => c.children ?? []);
  const collections = children.length > 0 ? children : roots;

  if (!loading && collections.length === 0) return null;

  return (
    <section className="flex flex-wrap justify-center gap-x-9 gap-y-8">
      {loading
        ? Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex w-[120px] flex-col items-center gap-3">
              <div className="h-[120px] w-[120px] animate-pulse rounded-full bg-bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-bg-muted" />
            </div>
          ))
        : collections.slice(0, 12).map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group flex w-[120px] flex-col items-center gap-3"
            >
              <span className="relative h-[120px] w-[120px] overflow-hidden rounded-full bg-bg-muted ring-1 ring-hairline transition-transform group-hover:scale-105">
                {c.featuredAsset?.preview && (
                  <Image
                    src={c.featuredAsset.preview}
                    alt={c.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                )}
              </span>
              <span className="text-center text-16 text-content-strong">{c.name}</span>
            </Link>
          ))}
    </section>
  );
}
