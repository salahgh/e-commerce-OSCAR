import React, { type ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';
import { ColorSwatch } from './ColorSwatch';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  contentClassName?: string;
  maxWidth?: string;
  disabled?: boolean;
  /** When true, tooltip stays open when hovering content */
  interactive?: boolean;
  /** Delay before hiding tooltip when mouse leaves */
  hideDelay?: number;
  as?: 'div' | 'span';
  /** Display mode: 'inline-block' (default) or 'block' for full-width triggers */
  display?: 'inline-block' | 'block';
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'right',
  delay = 300,
  className,
  contentClassName,
  maxWidth = '750px',
  disabled = false,
  interactive = false,
  hideDelay = 150,
  as = 'div',
  display = 'inline-block',
}) => {
  if (disabled || !content) {
    const Wrapper = as === 'span' ? 'span' : 'div';
    return <Wrapper className={className}>{children}</Wrapper>;
  }

  // Map position to Radix side
  const sideMap: Record<string, 'top' | 'bottom' | 'left' | 'right'> = {
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
  };

  const displayClass = display === 'block' ? 'block w-full' : 'inline-block';

  const triggerContent =
    as === 'span' ? (
      <span className={cn(displayClass, className)}>{children}</span>
    ) : (
      <div className={cn(displayClass, className)}>{children}</div>
    );

  return (
    <TooltipPrimitive.Provider delayDuration={delay} skipDelayDuration={hideDelay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{triggerContent}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={sideMap[position]}
            align="center"
            sideOffset={12}
            collisionPadding={16}
            avoidCollisions
            sticky={interactive ? 'always' : 'partial'}
            className={cn(
              'z-[9999]',
              'bg-gray-900 text-white text-sm rounded-lg shadow-2xl',
              'border border-gray-700',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2',
              'data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2',
              'data-[side=top]:slide-in-from-bottom-2',
              contentClassName
            )}
            style={{ maxWidth }}
            onPointerDownOutside={(e) => {
              if (interactive) {
                e.preventDefault();
              }
            }}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

// Rich tooltip content for product information
interface ProductTooltipContentProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    enabled: boolean;
    createdAt?: string;
    updatedAt?: string;
    featuredAsset?: {
      preview: string;
    } | null;
    assets?: Array<{
      id: string;
      preview: string;
    }>;
    variants?: Array<{
      id: string;
      name: string;
      sku: string;
      price: number;
      priceWithTax: number;
      stockOnHand: number;
      stockAllocated?: number;
      enabled: boolean;
      options?: Array<{
        name: string;
        code: string;
      }>;
    }>;
    optionGroups?: Array<{
      name: string;
      options: Array<{
        name: string;
      }>;
    }>;
    facetValues?: Array<{
      id: string;
      name: string;
      code: string;
      facet: {
        id: string;
        name: string;
        code: string;
      };
    }>;
    collections?: Array<{
      id: string;
      name: string;
      slug: string;
      parent?: {
        id: string;
        name: string;
      } | null;
    }>;
    customFields?: {
      nameFr?: string | null;
      nameAr?: string | null;
      descriptionFr?: string | null;
      descriptionAr?: string | null;
      salePrice?: number | null;
      isFeatured?: boolean | null;
      viewCount?: number | null;
      weightKg?: number | null;
      availableSizes?: string[] | null;
      availableColors?: string[] | null;
    } | null;
  };
  formatPrice: (price: number) => string;
  formatDate?: (date: string) => string;
}

export const ProductTooltipContent: React.FC<ProductTooltipContentProps> = ({
  product,
  formatPrice,
  formatDate,
}) => {
  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stockOnHand || 0), 0) || 0;
  const totalAllocated =
    product.variants?.reduce((sum, v) => sum + (v.stockAllocated || 0), 0) || 0;
  const enabledVariants = product.variants?.filter(v => v.enabled).length || 0;
  const disabledVariants = (product.variants?.length || 0) - enabledVariants;
  const minPrice = product.variants?.length ? Math.min(...product.variants.map((v) => v.price)) : 0;
  const maxPrice = product.variants?.length ? Math.max(...product.variants.map((v) => v.price)) : 0;
  const minPriceWithTax = product.variants?.length ? Math.min(...product.variants.map((v) => v.priceWithTax)) : 0;
  const maxPriceWithTax = product.variants?.length ? Math.max(...product.variants.map((v) => v.priceWithTax)) : 0;

  // Strip HTML from description
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Group facet values by facet
  const facetsByGroup = product.facetValues?.reduce((acc, fv) => {
    const facetName = fv.facet.name;
    if (!acc[facetName]) acc[facetName] = [];
    acc[facetName].push(fv.name);
    return acc;
  }, {} as Record<string, string[]>) || {};

  return (
    <div className="p-5 w-[700px]">
      {/* Header with Large Image and Gallery */}
      <div className="flex gap-5 mb-5">
        <div className="flex-shrink-0">
          {product.featuredAsset?.preview ? (
            <img
              src={product.featuredAsset.preview}
              alt={product.name}
              className="w-36 h-36 rounded-xl object-cover border-2 border-gray-600 shadow-lg"
            />
          ) : (
            <div className="w-36 h-36 rounded-xl bg-gray-700 flex items-center justify-center border-2 border-gray-600">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
          {/* Thumbnail Gallery */}
          {product.assets && product.assets.length > 1 && (
            <div className="flex gap-1.5 mt-2 justify-center">
              {product.assets.slice(0, 5).map((asset, idx) => (
                <img
                  key={asset.id}
                  src={asset.preview}
                  alt={`Image ${idx + 1}`}
                  className="w-7 h-7 rounded object-cover border border-gray-600 opacity-70 hover:opacity-100 transition-opacity"
                />
              ))}
              {product.assets.length > 5 && (
                <div className="w-7 h-7 rounded bg-gray-700 flex items-center justify-center text-[9px] text-gray-400">
                  +{product.assets.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-white text-base leading-tight">{product.name}</h3>
            <span className="text-gray-500 text-[10px] font-mono bg-gray-800 px-1.5 py-0.5 rounded flex-shrink-0">
              #{product.id}
            </span>
          </div>
          <p className="text-gray-400 text-xs mb-2 font-mono">{product.slug}</p>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span
              className={cn(
                'inline-flex px-2 py-0.5 text-xs font-semibold rounded-full',
                product.enabled
                  ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30'
                  : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
              )}
            >
              {product.enabled ? '● Actif' : '○ Inactif'}
            </span>
            {product.customFields?.isFeatured && (
              <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
                ★ Vedette
              </span>
            )}
            {product.variants && product.variants.length > 0 && (
              <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400">
                {product.variants.length} variante{product.variants.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-1.5 bg-gray-800/80 rounded-lg">
              <div className="text-[10px] text-gray-500 uppercase">Stock</div>
              <div className={cn(
                'font-bold text-sm',
                totalStock > 10 ? 'text-green-400' : totalStock > 0 ? 'text-orange-400' : 'text-red-400'
              )}>
                {totalStock}
              </div>
            </div>
            <div className="text-center p-1.5 bg-gray-800/80 rounded-lg">
              <div className="text-[10px] text-gray-500 uppercase">Vues</div>
              <div className="font-bold text-sm text-blue-400">
                {product.customFields?.viewCount ?? 0}
              </div>
            </div>
            <div className="text-center p-1.5 bg-gray-800/80 rounded-lg">
              <div className="text-[10px] text-gray-500 uppercase">Images</div>
              <div className="font-bold text-sm text-indigo-400">
                {product.assets?.length ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-language Names Section */}
      {(product.customFields?.nameFr || product.customFields?.nameAr) && (
        <div className="mb-3 p-3 bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-lg border border-gray-700">
          <div className="text-gray-400 uppercase text-[10px] font-semibold mb-2 flex items-center gap-1">
            <span>🌐</span> Traductions du nom
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-8 text-[10px] font-bold text-blue-400 bg-blue-500/20 px-1 py-0.5 rounded text-center">FR</span>
              <span className="text-gray-200 text-sm">{product.customFields?.nameFr || '—'}</span>
            </div>
            <div className="flex items-center gap-2" dir="rtl">
              <span className="text-gray-200 text-sm flex-1">{product.customFields?.nameAr || '—'}</span>
              <span className="w-8 text-[10px] font-bold text-green-400 bg-green-500/20 px-1 py-0.5 rounded text-center" dir="ltr">AR</span>
            </div>
          </div>
        </div>
      )}

      {/* Descriptions Section */}
      {(product.description || product.customFields?.descriptionFr || product.customFields?.descriptionAr) && (
        <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="text-gray-400 uppercase text-[10px] font-semibold mb-2">📝 Descriptions</div>
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {product.description && (
              <div>
                <span className="text-[10px] font-bold text-gray-500">EN:</span>
                <p className="text-gray-300 text-xs mt-0.5 line-clamp-2">{stripHtml(product.description)}</p>
              </div>
            )}
            {product.customFields?.descriptionFr && (
              <div>
                <span className="text-[10px] font-bold text-blue-400">FR:</span>
                <p className="text-gray-300 text-xs mt-0.5 line-clamp-2">{stripHtml(product.customFields.descriptionFr)}</p>
              </div>
            )}
            {product.customFields?.descriptionAr && (
              <div dir="rtl">
                <span className="text-[10px] font-bold text-green-400" dir="ltr">AR:</span>
                <p className="text-gray-300 text-xs mt-0.5 line-clamp-2">{stripHtml(product.customFields.descriptionAr)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing Section */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-3 bg-gradient-to-br from-green-900/30 to-green-900/10 rounded-lg border border-green-800/30">
          <div className="text-green-400/70 uppercase text-[10px] font-semibold mb-1">💰 Prix HT</div>
          {minPrice === maxPrice ? (
            <div className="text-green-400 font-bold text-lg">{formatPrice(minPrice / 100)}</div>
          ) : (
            <div className="text-green-400 font-bold text-sm">
              {formatPrice(minPrice / 100)} — {formatPrice(maxPrice / 100)}
            </div>
          )}
          {product.customFields?.salePrice && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-orange-400 text-xs font-semibold">Promo:</span>
              <span className="text-orange-400 font-bold">{formatPrice(product.customFields.salePrice / 100)}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-900/30 to-blue-900/10 rounded-lg border border-blue-800/30">
          <div className="text-blue-400/70 uppercase text-[10px] font-semibold mb-1">💵 Prix TTC</div>
          {minPriceWithTax === maxPriceWithTax ? (
            <div className="text-blue-400 font-bold text-lg">{formatPrice(minPriceWithTax / 100)}</div>
          ) : (
            <div className="text-blue-400 font-bold text-sm">
              {formatPrice(minPriceWithTax / 100)} — {formatPrice(maxPriceWithTax / 100)}
            </div>
          )}
        </div>
      </div>

      {/* Stock & Inventory Section */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center p-2 bg-gray-800 rounded-lg">
          <div className="text-[9px] text-gray-500 uppercase">Total</div>
          <div className={cn('font-bold', totalStock > 10 ? 'text-green-400' : totalStock > 0 ? 'text-orange-400' : 'text-red-400')}>
            {totalStock}
          </div>
        </div>
        <div className="text-center p-2 bg-gray-800 rounded-lg">
          <div className="text-[9px] text-gray-500 uppercase">Alloué</div>
          <div className="font-bold text-yellow-400">{totalAllocated}</div>
        </div>
        <div className="text-center p-2 bg-gray-800 rounded-lg">
          <div className="text-[9px] text-gray-500 uppercase">Disponible</div>
          <div className="font-bold text-cyan-400">{totalStock - totalAllocated}</div>
        </div>
        <div className="text-center p-2 bg-gray-800 rounded-lg">
          <div className="text-[9px] text-gray-500 uppercase">Poids</div>
          <div className="font-bold text-gray-300">{product.customFields?.weightKg ?? '—'}kg</div>
        </div>
      </div>

      {/* Variants Table */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 uppercase text-[10px] font-semibold">
              📦 Variantes ({product.variants.length})
            </div>
            {disabledVariants > 0 && (
              <span className="text-[10px] text-orange-400">{disabledVariants} désactivée{disabledVariants > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden">
            <div className="grid grid-cols-12 gap-1 px-2 py-1.5 bg-gray-800 text-[9px] text-gray-500 uppercase font-semibold">
              <div className="col-span-4">SKU</div>
              <div className="col-span-3">Options</div>
              <div className="col-span-2 text-right">Prix</div>
              <div className="col-span-2 text-right">Stock</div>
              <div className="col-span-1 text-center">État</div>
            </div>
            <div className="max-h-32 overflow-y-auto divide-y divide-gray-700/50">
              {product.variants.slice(0, 8).map((variant) => (
                <div
                  key={variant.id}
                  className={cn(
                    'grid grid-cols-12 gap-1 px-2 py-1.5 text-xs',
                    !variant.enabled && 'opacity-50'
                  )}
                >
                  <div className="col-span-4 font-mono text-[10px] text-gray-400 truncate" title={variant.sku}>
                    {variant.sku}
                  </div>
                  <div className="col-span-3 text-[10px] text-gray-300 truncate">
                    {variant.options?.map(o => o.name).join(' / ') || '—'}
                  </div>
                  <div className="col-span-2 text-right text-green-400 text-[10px]">
                    {formatPrice(variant.price / 100)}
                  </div>
                  <div className={cn(
                    'col-span-2 text-right font-medium text-[10px]',
                    variant.stockOnHand > 5 ? 'text-green-400' : variant.stockOnHand > 0 ? 'text-orange-400' : 'text-red-400'
                  )}>
                    {variant.stockOnHand}
                  </div>
                  <div className="col-span-1 text-center">
                    {variant.enabled ? (
                      <span className="text-green-400">●</span>
                    ) : (
                      <span className="text-red-400">○</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {product.variants.length > 8 && (
              <div className="text-center py-1.5 text-[10px] text-gray-500 bg-gray-800/50">
                +{product.variants.length - 8} autres variantes
              </div>
            )}
          </div>
        </div>
      )}

      {/* Option Groups */}
      {product.optionGroups && product.optionGroups.length > 0 && (
        <div className="mb-3">
          <div className="text-gray-400 uppercase text-[10px] font-semibold mb-2">🎛️ Groupes d'options</div>
          <div className="flex flex-wrap gap-2">
            {product.optionGroups.map((group) => (
              <div key={group.name} className="bg-gray-800 rounded-lg px-2 py-1.5 border border-gray-700/50">
                <div className="text-[10px] text-purple-400 font-semibold mb-1">{group.name}</div>
                <div className="flex flex-wrap gap-0.5">
                  {group.options.map((opt) => (
                    <span key={opt.name} className="px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 rounded">
                      {opt.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facet Values */}
      {Object.keys(facetsByGroup).length > 0 && (
        <div className="mb-3">
          <div className="text-gray-400 uppercase text-[10px] font-semibold mb-2">🏷️ Attributs (Facettes)</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(facetsByGroup).map(([facetName, values]) => (
              <div key={facetName} className="bg-gray-800 rounded-lg px-2 py-1.5 border border-gray-700/50">
                <div className="text-[10px] text-cyan-400 font-semibold mb-1">{facetName}</div>
                <div className="flex flex-wrap gap-0.5">
                  {values.map((val) => (
                    <span key={val} className="px-1.5 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 rounded">
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {product.collections && product.collections.length > 0 && (
        <div className="mb-3">
          <div className="text-gray-400 uppercase text-[10px] font-semibold mb-2">📁 Catégories ({product.collections.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {product.collections.map((collection) => (
              <span
                key={collection.id}
                className="px-2 py-1 text-[11px] bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30"
              >
                {collection.parent?.name ? (
                  <>
                    <span className="text-blue-400/60">{collection.parent.name}</span>
                    <span className="text-blue-400/40 mx-1">›</span>
                  </>
                ) : null}
                {collection.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sizes & Colors */}
      {((product.customFields?.availableSizes && product.customFields.availableSizes.length > 0) ||
        (product.customFields?.availableColors && product.customFields.availableColors.length > 0)) && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {product.customFields?.availableSizes && product.customFields.availableSizes.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
              <div className="text-gray-400 uppercase text-[10px] font-semibold mb-1.5">
                👕 Tailles ({product.customFields.availableSizes.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {product.customFields.availableSizes.map((size) => (
                  <span key={size} className="px-2 py-0.5 text-xs bg-gray-700 text-gray-200 rounded font-medium">
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}
          {product.customFields?.availableColors && product.customFields.availableColors.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
              <div className="text-gray-400 uppercase text-[10px] font-semibold mb-1.5">
                🎨 Couleurs ({product.customFields.availableColors.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.customFields.availableColors.map((color) => (
                  <ColorSwatch key={color} color={color} size="md" showLabel />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer with Dates */}
      <div className="pt-3 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-[10px]">
          <div>
            <span className="text-gray-500">Créé le: </span>
            <span className="text-gray-300">{formatDate && product.createdAt ? formatDate(product.createdAt) : '—'}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-500">Modifié le: </span>
            <span className="text-gray-300">{formatDate && product.updatedAt ? formatDate(product.updatedAt) : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
