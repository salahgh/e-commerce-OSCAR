import React, { useState, useRef, useLayoutEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  contentClassName?: string;
  maxWidth?: string;
  disabled?: boolean;
  followCursor?: boolean;
  as?: 'div' | 'span' | 'tr';
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'right',
  delay = 300,
  className,
  contentClassName,
  maxWidth = '450px',
  disabled = false,
  followCursor = false,
  as = 'div',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLTableRowElement & HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculatePosition = useCallback(() => {
    if (!tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 16;
    const viewportPadding = 16;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    if (followCursor) {
      // Position based on cursor
      left = mousePos.x + gap;
      top = mousePos.y + gap;

      // If tooltip would go off the right edge, show on left of cursor
      if (left + tooltipRect.width > viewportWidth - viewportPadding) {
        left = mousePos.x - tooltipRect.width - gap;
      }

      // If tooltip would go off the bottom edge, show above cursor
      if (top + tooltipRect.height > viewportHeight - viewportPadding) {
        top = mousePos.y - tooltipRect.height - gap;
      }

      // Clamp to viewport bounds
      if (left < viewportPadding) {
        left = viewportPadding;
      }
      if (top < viewportPadding) {
        top = viewportPadding;
      }
    } else {
      // Original trigger-based positioning
      if (!triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      let finalPosition = position;

      // Calculate initial position based on preferred position
      const positions = {
        top: {
          top: triggerRect.top - tooltipRect.height - gap,
          left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
        },
        bottom: {
          top: triggerRect.bottom + gap,
          left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
        },
        left: {
          top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
          left: triggerRect.left - tooltipRect.width - gap,
        },
        right: {
          top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
          left: triggerRect.right + gap,
        },
      };

      // Check if preferred position fits, otherwise try alternatives
      const fitsInViewport = (pos: { top: number; left: number }) => {
        return (
          pos.top >= viewportPadding &&
          pos.left >= viewportPadding &&
          pos.top + tooltipRect.height <= viewportHeight - viewportPadding &&
          pos.left + tooltipRect.width <= viewportWidth - viewportPadding
        );
      };

      // Try preferred position first
      if (fitsInViewport(positions[position])) {
        top = positions[position].top;
        left = positions[position].left;
        finalPosition = position;
      } else {
        // Try opposite position
        const opposites: Record<string, 'top' | 'bottom' | 'left' | 'right'> = {
          top: 'bottom',
          bottom: 'top',
          left: 'right',
          right: 'left',
        };
        const opposite = opposites[position];

        if (fitsInViewport(positions[opposite])) {
          top = positions[opposite].top;
          left = positions[opposite].left;
          finalPosition = opposite;
        } else {
          // Use preferred position but clamp to viewport
          top = positions[position].top;
          left = positions[position].left;
          finalPosition = position;
        }
      }

      // Clamp to viewport bounds
      if (left < viewportPadding) {
        left = viewportPadding;
      } else if (left + tooltipRect.width > viewportWidth - viewportPadding) {
        left = viewportWidth - tooltipRect.width - viewportPadding;
      }

      if (top < viewportPadding) {
        top = viewportPadding;
      } else if (top + tooltipRect.height > viewportHeight - viewportPadding) {
        top = viewportHeight - tooltipRect.height - viewportPadding;
      }

      setActualPosition(finalPosition);
    }

    setCoords({ top, left });
    setIsPositioned(true);
  }, [position, followCursor, mousePos.x, mousePos.y]);

  // Use layout effect to calculate position before paint
  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current) {
      // Small delay to ensure tooltip is rendered with content
      requestAnimationFrame(() => {
        calculatePosition();
      });
    } else {
      setIsPositioned(false);
    }
  }, [isVisible, calculatePosition]);

  // Handle scroll and resize
  useLayoutEffect(() => {
    if (!isVisible) return;

    const handleUpdate = () => {
      calculatePosition();
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isVisible, calculatePosition]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (disabled) return;
    if (followCursor) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (followCursor && isVisible) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
    setIsPositioned(false);
  };

  // Cleanup timeout on unmount
  useLayoutEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const Wrapper = as === 'tr' ? 'tr' : as === 'span' ? 'span' : 'div';
  const wrapperClassName = as === 'tr' ? className : cn('inline-block', className);

  return (
    <>
      <Wrapper
        ref={triggerRef as any}
        className={wrapperClassName}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Wrapper>
      {isVisible &&
        content &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className={cn(
              'fixed z-[9999]',
              'bg-gray-900 text-white text-sm rounded-lg shadow-2xl',
              'border border-gray-700',
              'transition-opacity duration-150',
              isPositioned ? 'opacity-100' : 'opacity-0',
              contentClassName
            )}
            style={{
              top: coords.top,
              left: coords.left,
              maxWidth,
              pointerEvents: followCursor ? 'none' : 'auto',
            }}
            onMouseEnter={followCursor ? undefined : handleMouseEnter}
            onMouseLeave={followCursor ? undefined : handleMouseLeave}
          >
            {content}
          </div>,
          document.body
        )}
    </>
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
  const minPrice = product.variants?.length ? Math.min(...product.variants.map((v) => v.price)) : 0;
  const maxPrice = product.variants?.length ? Math.max(...product.variants.map((v) => v.price)) : 0;

  // Strip HTML from description
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <div className="p-4 min-w-[320px]">
      {/* Header with Image */}
      <div className="flex gap-3 mb-3">
        {product.featuredAsset?.preview ? (
          <img
            src={product.featuredAsset.preview}
            alt={product.name}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-600"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{product.name}</h3>
          <p className="text-gray-400 text-xs truncate mb-1">{product.slug}</p>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex px-1.5 py-0.5 text-xs font-medium rounded',
                product.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              )}
            >
              {product.enabled ? 'Actif' : 'Inactif'}
            </span>
            {product.customFields?.isFeatured && (
              <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-blue-500/20 text-blue-400">
                Vedette
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Multi-language Names */}
      {(product.customFields?.nameFr || product.customFields?.nameAr) && (
        <div className="mb-2 p-2 bg-gray-800 rounded text-xs">
          <div className="text-gray-500 uppercase text-[10px] mb-1">Traductions</div>
          {product.customFields?.nameFr && (
            <div>
              <span className="text-gray-400">FR:</span>{' '}
              <span className="text-gray-200">{product.customFields.nameFr}</span>
            </div>
          )}
          {product.customFields?.nameAr && (
            <div dir="rtl">
              <span className="text-gray-400">AR:</span>{' '}
              <span className="text-gray-200">{product.customFields.nameAr}</span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {product.description && (
        <div className="mb-2">
          <div className="text-gray-500 uppercase text-[10px] mb-1">Description</div>
          <p className="text-gray-300 text-xs line-clamp-2">
            {stripHtml(product.description).slice(0, 120)}
            {stripHtml(product.description).length > 120 ? '...' : ''}
          </p>
        </div>
      )}

      {/* Pricing & Stock */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="p-2 bg-gray-800 rounded">
          <div className="text-gray-500 uppercase text-[10px] mb-0.5">Prix</div>
          {minPrice === maxPrice ? (
            <div className="text-green-400 font-semibold text-sm">{formatPrice(minPrice / 100)}</div>
          ) : (
            <div className="text-green-400 font-semibold text-xs">
              {formatPrice(minPrice / 100)} - {formatPrice(maxPrice / 100)}
            </div>
          )}
          {product.customFields?.salePrice && (
            <div className="text-orange-400 text-[10px]">
              Promo: {formatPrice(product.customFields.salePrice / 100)}
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-800 rounded">
          <div className="text-gray-500 uppercase text-[10px] mb-0.5">Stock</div>
          <div
            className={cn(
              'font-semibold text-sm',
              totalStock > 10 ? 'text-green-400' : totalStock > 0 ? 'text-orange-400' : 'text-red-400'
            )}
          >
            {totalStock} unités
          </div>
          {totalAllocated > 0 && (
            <div className="text-gray-400 text-[10px]">({totalAllocated} alloués)</div>
          )}
        </div>
      </div>

      {/* Variants Info */}
      {product.variants && product.variants.length > 1 && (
        <div className="mb-2">
          <div className="text-gray-500 uppercase text-[10px] mb-1">
            Variantes ({product.variants.length})
          </div>
          <div className="space-y-0.5 max-h-20 overflow-y-auto">
            {product.variants.slice(0, 3).map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between text-xs p-1 bg-gray-800/50 rounded"
              >
                <span className="text-gray-400 font-mono text-[10px]">{variant.sku}</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-[10px]">{formatPrice(variant.price / 100)}</span>
                  <span
                    className={cn(
                      'font-medium text-[10px]',
                      variant.stockOnHand > 5
                        ? 'text-green-400'
                        : variant.stockOnHand > 0
                          ? 'text-orange-400'
                          : 'text-red-400'
                    )}
                  >
                    {variant.stockOnHand}
                  </span>
                </div>
              </div>
            ))}
            {product.variants.length > 3 && (
              <div className="text-center text-gray-500 text-[10px]">
                +{product.variants.length - 3} autres
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sizes & Colors */}
      {((product.customFields?.availableSizes && product.customFields.availableSizes.length > 0) ||
        (product.customFields?.availableColors && product.customFields.availableColors.length > 0)) && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          {product.customFields?.availableSizes && product.customFields.availableSizes.length > 0 && (
            <div>
              <div className="text-gray-500 uppercase text-[10px] mb-1">Tailles</div>
              <div className="flex flex-wrap gap-0.5">
                {product.customFields.availableSizes.slice(0, 6).map((size) => (
                  <span key={size} className="px-1 py-0.5 text-[10px] bg-gray-700 text-gray-300 rounded">
                    {size}
                  </span>
                ))}
                {product.customFields.availableSizes.length > 6 && (
                  <span className="text-gray-500 text-[10px]">+{product.customFields.availableSizes.length - 6}</span>
                )}
              </div>
            </div>
          )}
          {product.customFields?.availableColors && product.customFields.availableColors.length > 0 && (
            <div>
              <div className="text-gray-500 uppercase text-[10px] mb-1">Couleurs</div>
              <div className="flex flex-wrap gap-0.5">
                {product.customFields.availableColors.slice(0, 4).map((color) => (
                  <span key={color} className="px-1 py-0.5 text-[10px] bg-gray-700 text-gray-300 rounded">
                    {color}
                  </span>
                ))}
                {product.customFields.availableColors.length > 4 && (
                  <span className="text-gray-500 text-[10px]">+{product.customFields.availableColors.length - 4}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-gray-700">
        <div className="flex items-center gap-3">
          {product.customFields?.weightKg && <span>Poids: {product.customFields.weightKg}kg</span>}
          {product.assets && product.assets.length > 0 && <span>{product.assets.length} images</span>}
          {product.customFields?.viewCount !== undefined && product.customFields?.viewCount !== null && (
            <span>{product.customFields.viewCount} vues</span>
          )}
        </div>
        {formatDate && product.updatedAt && <span>Màj: {formatDate(product.updatedAt)}</span>}
      </div>
    </div>
  );
};

export default Tooltip;
