'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Folder } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  locale: string;
  childCount?: number;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export default function CategoryCard({
  id,
  name,
  slug,
  description,
  imageUrl,
  locale,
  childCount,
  className,
  variant = 'default',
}: CategoryCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/${locale}/categories/${slug}`}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors group',
          className
        )}
      >
        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <Folder className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {name}
          </h3>
          {childCount !== undefined && childCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {childCount} sous-catégorie{childCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/${locale}/categories/${slug}`}
        className={cn(
          'relative group rounded-xl overflow-hidden aspect-[4/3] bg-muted',
          className
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Folder className="h-16 w-16 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg mb-1">{name}</h3>
          {description && (
            <p className="text-sm text-white/80 line-clamp-2">{description}</p>
          )}
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/${locale}/categories/${slug}`}
      className={cn(
        'group block rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="aspect-[3/2] bg-muted relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Folder className="h-12 w-12 text-primary/30" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
          {name}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
        {childCount !== undefined && childCount > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {childCount} sous-catégorie{childCount > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </Link>
  );
}
