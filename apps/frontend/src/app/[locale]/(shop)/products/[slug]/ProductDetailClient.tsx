'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button, Spinner } from '@/components/ui';
import { Heart, Minus, Plus, ChevronDown, ImageOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchProductsQuery } from '@/graphql/generated/graphql';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/formatters';
import { parseProductDiscount } from '@/lib/utils/discountParser';
import { ProductRow, SectionHeader, type HomeProduct } from '@/components/home';
import { RecentlyViewed, useRecentlyViewed } from '@/components/product/RecentlyViewed';
import { SocialShare } from '@/components/product/SocialShare';

interface ProductAsset {
  id: string;
  preview: string;
}

interface ProductOption {
  id: string;
  name: string;
  group: {
    code: string;
    name: string;
  };
}

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  priceWithTax: number;
  stockLevel: string;
  options: ProductOption[];
}

interface ProductCollection {
  id?: string;
  slug: string;
  name: string;
}

interface ProductFacetValue {
  id: string;
  name: string;
  facet: { name: string };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredAsset?: ProductAsset;
  assets: ProductAsset[];
  variants: ProductVariant[];
  collections?: ProductCollection[];
  facetValues?: ProductFacetValue[];
}

function normalizeUrl(url: string | undefined): string | undefined {
  return url?.replace(/\\/g, '/');
}

function ProductImage({ src, alt, className, onClick }: { src?: string; alt: string; className?: string; onClick?: () => void }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className={cn('bg-muted flex items-center justify-center', className)} onClick={onClick}>
        <ImageOff className="w-12 h-12 text-muted-foreground" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      onClick={onClick}
    />
  );
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const t = useTranslations('product');
  const { addToCart } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id || '');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

  // Record this product in the client-side "recently viewed" history (localStorage).
  const { addProduct: addRecentlyViewed } = useRecentlyViewed();
  useEffect(() => {
    addRecentlyViewed({
      id: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.featuredAsset?.preview,
      price: selectedVariant?.priceWithTax ?? product.variants[0]?.priceWithTax ?? 0,
      currency: 'DZD',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // Deduplicated images
  const allImages = useMemo(() => {
    const images = [
      ...(product.featuredAsset ? [product.featuredAsset] : []),
      ...(product.assets || []),
    ];
    const seen = new Set<string>();
    return images.filter((img) => {
      if (seen.has(img.id)) return false;
      seen.add(img.id);
      return true;
    });
  }, [product.featuredAsset, product.assets]);

  // Discount info
  const discount = useMemo(() => {
    const price = selectedVariant?.priceWithTax ?? 0;
    return parseProductDiscount(product.collections, price);
  }, [selectedVariant, product.collections]);

  // Group options by group code
  const optionGroups = useMemo(() => {
    const groups = new Map<string, { name: string; values: { id: string; value: string; variantId: string }[] }>();
    product.variants.forEach((variant) => {
      variant.options.forEach((option) => {
        const key = option.group.code;
        if (!groups.has(key)) {
          groups.set(key, { name: option.group.name, values: [] });
        }
        const group = groups.get(key)!;
        if (!group.values.find((v) => v.value === option.name)) {
          group.values.push({ id: option.id, value: option.name, variantId: variant.id });
        }
      });
    });
    return groups;
  }, [product.variants]);

  // Related products
  const { data: relatedData } = useSearchProductsQuery({
    variables: {
      input: {
        take: 10,
        groupByProduct: true,
        ...(product.collections?.[0]?.slug
          ? { collectionSlug: product.collections[0].slug }
          : {}),
      },
    },
  });

  const relatedProducts: HomeProduct[] = useMemo(() => {
    return (relatedData?.search?.items ?? [])
      .filter((item: any) => item.productId !== product.id)
      .slice(0, 8)
      .map((item: any) => {
        const price = item.priceWithTax;
        const priceValue = price?.__typename === 'SinglePrice' ? price.value : price?.min;
        return {
          id: item.productId,
          name: item.productName,
          slug: item.slug,
          imageUrl: normalizeUrl(item.productAsset?.preview),
          price: formatPrice((priceValue || 0) / 100),
          inStock: true,
          rating: 4,
          reviewCount: 2,
        };
      });
  }, [relatedData, product.id]);

  const handleAddToCart = async () => {
    if (!selectedVariantId) return;
    setIsAddingToCart(true);
    try {
      await addToCart(selectedVariantId, quantity);
    } catch (error: any) {
      toast.error(error.message || 'Error adding to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const priceDisplay = discount.hasDiscount
    ? formatPrice(discount.salePrice / 100)
    : formatPrice((selectedVariant?.priceWithTax ?? 0) / 100);

  const originalPriceDisplay = discount.hasDiscount
    ? formatPrice(discount.originalPrice / 100)
    : null;

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
        {/* Main Product Section — two-column on desktop */}
        <div className="pdp-layout" style={{ display: 'flex', gap: '2rem' }}>
          {/* Image Gallery */}
          <div className="pdp-gallery" style={{ width: '55%', display: 'flex', gap: '1rem', flexShrink: 0 }}>
            {/* Main Image */}
            <div style={{ flex: 1, aspectRatio: '606/714' }} className="rounded-sm overflow-hidden bg-muted">
              <ProductImage
                src={normalizeUrl(allImages[selectedImageIndex]?.preview)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '126px', flexShrink: 0 }}>
                {allImages.slice(0, 4).map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(i)}
                    className={cn(
                      'w-[126px] h-[140px] rounded-sm overflow-hidden border-2 transition-colors',
                      i === selectedImageIndex ? 'border-primary' : 'border-transparent'
                    )}
                  >
                    <ProductImage
                      src={normalizeUrl(img.preview)}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
            {/* Name */}
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-snug">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4 flex-wrap">
              {discount.hasDiscount && (
                <span className="bg-[#FFE5E5] border border-[#EB3E3E] text-[#B22F2F] text-sm font-medium rounded-lg px-2 py-1">
                  -{discount.percentage}%
                </span>
              )}
              {originalPriceDisplay && (
                <span className="text-xl font-bold text-muted-foreground line-through">
                  {originalPriceDisplay}
                </span>
              )}
              <span className="text-3xl lg:text-4xl font-bold text-foreground">
                {priceDisplay}
              </span>
            </div>

            {/* Option Selectors */}
            {Array.from(optionGroups.entries()).map(([groupCode, group]) => (
              <div key={groupCode} className="flex flex-col gap-3">
                <span className="text-lg font-semibold text-foreground">
                  {group.name}
                </span>
                <div className="flex flex-wrap gap-3">
                  {group.values.map((option) => {
                    const isSelected = selectedVariant?.options.some((o) => o.name === option.value);
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedVariantId(option.variantId)}
                        className={cn(
                          'min-w-[131px] px-6 py-2 rounded-lg border text-sm font-medium transition-colors',
                          isSelected
                            ? 'bg-[#1E1E1E] border-[#1E1E1E] text-white'
                            : 'bg-card border-gray-200 text-foreground hover:border-gray-400'
                        )}
                      >
                        {option.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="flex flex-col gap-3">
              <span className="text-lg font-semibold text-foreground">
                {t('quantity')}
              </span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-card">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="p-3 hover:bg-muted transition-colors disabled:opacity-40"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="flex-1 text-center text-lg font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-3 hover:bg-muted transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button className="w-12 h-12 shrink-0 border border-gray-300 rounded-lg flex items-center justify-center bg-card hover:bg-muted transition-colors">
                  <Heart className="w-6 h-6 text-foreground" />
                </button>
                <Button
                  onClick={handleAddToCart}
                  disabled={!selectedVariantId || isAddingToCart || selectedVariant?.stockLevel === 'OUT_OF_STOCK'}
                  className="flex-1 h-12 bg-[#1E1E1E] hover:bg-[#333] text-white text-lg font-medium rounded-lg"
                >
                  {isAddingToCart && <Spinner size="sm" className="mr-2" />}
                  {t('addToCart')}
                </Button>
              </div>
              <button className="w-full h-12 border border-gray-300 rounded-lg text-lg font-medium text-foreground bg-card hover:bg-muted transition-colors">
                {t('buyNow')}
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Accordion */}
        <div className="mt-12 border-t border-b">
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="w-full flex items-center justify-between py-5"
          >
            <span className="text-xl font-semibold text-foreground">
              {t('productDetails')}
            </span>
            <ChevronDown
              className={cn(
                'w-6 h-6 text-muted-foreground transition-transform',
                detailsOpen && 'rotate-180'
              )}
            />
          </button>
          {detailsOpen && product.description && (
            <div className="pb-6 prose prose-sm max-w-none text-muted-foreground">
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}
        </div>

        {/* Share */}
        <div className="mt-10">
          <SocialShare
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title={product.name}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <SectionHeader
              title={t('youMayAlsoLike')}
              href={`/products${product.collections?.[0] ? `?collection=${product.collections[0].slug}` : ''}`}
            />
            <ProductRow products={relatedProducts} />
          </div>
        )}

        <RecentlyViewed
          currentProductId={product.id}
          title={t('recentlyViewed')}
          className="mt-12"
        />
      </div>
    </div>
  );
}
