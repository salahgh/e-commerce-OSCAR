'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
}

interface CategoryTreeProps {
  collections: CategoryNode[];
  currentSlug?: string;
  locale: string;
  className?: string;
  showRoot?: boolean;
}

interface CategoryItemProps {
  category: CategoryNode;
  currentSlug?: string;
  locale: string;
  level: number;
}

function CategoryItem({ category, currentSlug, locale, level }: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(
    currentSlug === category.slug ||
    category.children?.some(child =>
      child.slug === currentSlug ||
      child.children?.some(grandchild => grandchild.slug === currentSlug)
    )
  );

  const hasChildren = category.children && category.children.length > 0;
  const isActive = currentSlug === category.slug;

  return (
    <div className="w-full">
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors cursor-pointer group',
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-muted-foreground/10 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-primary/70" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground" />
          )
        ) : (
          <span className="w-4" />
        )}

        <Link
          href={`/${locale}/categories/${category.slug}`}
          className="flex-1 text-sm truncate"
        >
          {category.name}
        </Link>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-2">
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              currentSlug={currentSlug}
              locale={locale}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTree({
  collections,
  currentSlug,
  locale,
  className,
  showRoot = true
}: CategoryTreeProps) {
  // Build tree structure from flat list
  const buildTree = (items: CategoryNode[]): CategoryNode[] => {
    // Filter to get only root items (those without parents or with parentId = null/1)
    const rootItems = items.filter(item => {
      // Check if this item has no parent in the current list
      const hasParent = items.some(other =>
        item.slug.startsWith(other.slug + '-') ||
        (other.children && other.children.some(child => child.id === item.id))
      );
      return !hasParent || items.every(other => other.id !== item.id.split('-')[0]);
    });

    return items.filter(item => !items.some(other =>
      other.children?.some(child => child.id === item.id)
    ));
  };

  // Get root level collections (those without parents showing in the data)
  const rootCollections = collections.filter(collection => {
    // If collection has no parent field or parent is null, it's a root
    return !collections.some(other =>
      other.children?.some(child => child.id === collection.id)
    );
  });

  return (
    <div className={cn('space-y-1', className)}>
      {showRoot && (
        <Link
          href={`/${locale}/categories`}
          className={cn(
            'flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors text-sm',
            !currentSlug
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          <Folder className="h-4 w-4" />
          Toutes les catégories
        </Link>
      )}

      {rootCollections.map((collection) => (
        <CategoryItem
          key={collection.id}
          category={collection}
          currentSlug={currentSlug}
          locale={locale}
          level={0}
        />
      ))}
    </div>
  );
}
