'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Heart, Minus, Plus, ChevronDown } from 'lucide-react';
import { formatDzd } from '@/lib/format/price';
import {
  useGetProductBySlugQuery,
  useGetCollectionWithProductsQuery,
  useGetProductsQuery,
} from '@oscar/graphql-shop/generated';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/components/ui/Toast';
import { Alert, Skeleton } from '@/components/ui';
import { ProductCard, type ProductCardData } from '@/components/patterns';
import { variantDiscount } from '@/lib/format/discount';
import { productOutOfStock } from '@/lib/format/stock';
import { SectionHeader } from '@/components/home';
import { cn } from '@/lib/utils/cn';
import { JsonLd } from '@/components/seo/JsonLd';
import { productSchema, breadcrumbSchema } from '@/lib/seo/schema';
import { trackViewContent } from '@/lib/analytics';
import { ProductGallery } from '@/components/product/ProductGallery';
import { gallerySlides } from '@/lib/catalog/gallery-slides';
import {
  optionGroupsOf,
  initialSelections,
  matchVariant,
  missingGroup,
  type OptionGroupView,
  type OptionSelections,
} from '@/lib/catalog/variant-options';

/** Size / colour selector chip — black when selected, outlined otherwise (Figma "متغيرات الأوسمة"). */
function VariantChip({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex w-[131px] items-center justify-center rounded-lg border px-[26px] py-2 text-14 font-medium transition-colors',
        selected
          ? 'border-accent bg-accent text-content-inverse'
          : 'border-border bg-white text-content-strong hover:border-border-strong',
      )}
    >
      {children}
    </button>
  );
}

export default function ProductPage() {
  const t = useTranslations('ProductPage');
  const tStock = useTranslations('StockIndicator');
  const params = useParams<{ slug: string; locale: string }>();
  const slug = params?.slug as string;

  const { data, loading, error } = useGetProductBySlugQuery({ variables: { slug }, skip: !slug });

  const collectionSlug = data?.product?.collections?.[0]?.slug ?? '';
  const { data: collectionRelated } = useGetCollectionWithProductsQuery({
    variables: { slug: collectionSlug, take: 12, skip: 0 },
    skip: !collectionSlug,
  });
  const { data: recentRelated } = useGetProductsQuery({
    variables: { options: { take: 12 } },
    skip: !!collectionSlug,
  });

  const { addToCart } = useCart();
  const toast = useToast();
  const wishlist = useWishlist();

  const [quantity, setQuantity] = React.useState(1);
  const [selections, setSelections] = React.useState<OptionSelections>({});
  const [detailsOpen, setDetailsOpen] = React.useState(true);

  const product = data?.product;

  // Every option group the variants carry (size-like first: "Taille", "Pointure", ...).
  // Groups with a single value need no choice, so they start selected.
  const optionGroups = React.useMemo(() => optionGroupsOf(product?.variants ?? []), [product]);
  React.useEffect(() => {
    setSelections(initialSelections(optionGroups));
  }, [optionGroups]);

  React.useEffect(() => {
    if (!product) return;
    const variant = product.variants[0];
    trackViewContent({
      sku: variant?.sku ?? product.slug,
      name: product.name,
      value: (variant?.priceWithTax ?? 0) / 100,
    });
  }, [product]);

  if (loading) return <PdpSkeleton />;

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <Alert intent="danger" title={t('errorTitle')}>
          {error?.message ?? t('errorBody')}
        </Alert>
      </div>
    );
  }

  const variants = product.variants;
  const images = product.assets.length > 0 ? product.assets : product.featuredAsset ? [product.featuredAsset] : [];
  const slides = gallerySlides(images, product.name);

  const selectedVariant = matchVariant(variants, selections) ?? variants[0];

  const groupLabel = (g: OptionGroupView) => (g.kind === 'size' ? t('size') : g.kind === 'color' ? t('color') : g.name);
  const selectGroupMessage = (g: OptionGroupView) =>
    g.kind === 'size' ? t('selectSize') : g.kind === 'color' ? t('selectColor') : t('selectOption', { name: g.name });

  const currency = selectedVariant?.currencyCode ?? 'DZD';
  const price = selectedVariant?.priceWithTax ?? 0;
  // Pre-discount price + percent come from the variant custom fields; the
  // strike-through + "-N%" badge show only when a genuine discount is present.
  const originalPrice = selectedVariant?.customFields?.originalPrice ?? null;
  const onSale = originalPrice != null && originalPrice > price;

  // Related products: collection siblings, else recent; dedupe + drop current.
  const relatedSource = collectionSlug
    ? (collectionRelated?.collection?.productVariants.items ?? []).flatMap((v) => (v.product ? [v.product] : []))
    : (recentRelated?.products.items ?? []);
  const relatedSeen = new Set<string>([product.id]);
  const relatedProducts = relatedSource
    .filter((p) => (relatedSeen.has(p.id) ? false : (relatedSeen.add(p.id), true)))
    .slice(0, 8);

  async function handleAddToCart() {
    if (!selectedVariant) return;
    const missing = missingGroup(optionGroups, selections);
    if (missing) return toast.error(selectGroupMessage(missing));
    await addToCart(selectedVariant.id, quantity);
  }

  const localePath = (path: string) =>
    params?.locale && params.locale !== 'fr' ? `/${params.locale}${path}` : path;
  const ldImage = images[0]?.preview ?? product.featuredAsset?.preview ?? undefined;
  const productLd = productSchema({
    name: product.name,
    description: product.description?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || undefined,
    image: ldImage,
    url: localePath(`/products/${slug}`),
    sku: selectedVariant?.sku,
    price: price / 100,
    priceCurrency: currency,
    inStock: (selectedVariant?.stockLevel ?? 'IN_STOCK') !== 'OUT_OF_STOCK',
  });
  const breadcrumbLd = breadcrumbSchema([
    { name: t('breadcrumbHome'), url: localePath('/') },
    { name: t('breadcrumbProducts'), url: localePath('/products') },
    { name: product.name, url: localePath(`/products/${slug}`) },
  ]);

  return (
    <div className="px-6 py-8">
      <JsonLd data={[productLd, breadcrumbLd]} />
      <div className="mx-auto flex max-w-[1392px] flex-col gap-12">
        {/* Detail row: gallery (right in RTL) + info (left in RTL) */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Gallery: slider + thumbnails + fullscreen zoom */}
          <ProductGallery slides={slides} />

          {/* Info */}
          <div className="flex w-full flex-col gap-9 lg:w-[557px]">
            <h1 className="w-full text-right font-dm text-36 font-bold leading-[1.5] text-accent">{product.name}</h1>

            {/* Price */}
            <div className="flex w-full items-center justify-end gap-4" dir="ltr">
              {onSale && (
                <span className="font-dm text-24 font-medium text-content-muted line-through">
                  {formatDzd(originalPrice!)}
                </span>
              )}
              <span className="font-dm text-36 font-bold text-accent">{formatDzd(price)}</span>
            </div>

            {/* One chip row per option group: size (Taille / Pointure ...), colour, then anything else */}
            {optionGroups.map((group) => (
              <div key={group.code} className="flex w-full flex-col items-end gap-3">
                <p className="w-full text-right text-24 font-[600] leading-8 text-accent">{groupLabel(group)}</p>
                <div className="flex w-full flex-wrap items-center justify-end gap-3">
                  {group.values.map((v) => (
                    <VariantChip
                      key={v.code}
                      selected={selections[group.code] === v.code}
                      onClick={() => setSelections((s) => ({ ...s, [group.code]: v.code }))}
                    >
                      {v.name}
                    </VariantChip>
                  ))}
                </div>
              </div>
            ))}

            {/* Products without purchasable variants must not offer cart actions */}
            {variants.length === 0 && (
              <Alert intent="warning" className="w-full">
                {tStock('outOfStock')}
              </Alert>
            )}

            {variants.length > 0 && (<>
            {/* Quantity */}
            <div className="flex w-full flex-col items-end gap-3">
              <p className="w-full text-right text-24 font-[600] leading-8 text-accent">{t('quantity')}</p>
              <div className="flex w-full items-center justify-center gap-4 rounded-lg border border-border bg-white p-2">
                <button
                  type="button"
                  aria-label="-"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex size-6 items-center justify-center text-content-strong"
                >
                  <Minus className="size-5" strokeWidth={1.75} />
                </button>
                <span className="flex-1 text-center text-18 text-content-strong">{quantity}</span>
                <button
                  type="button"
                  aria-label="+"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="flex size-6 items-center justify-center text-content-strong"
                >
                  <Plus className="size-5" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex w-full flex-col gap-4">
              <div className="flex w-full items-stretch gap-4">
                <button
                  type="button"
                  aria-label={t('wishlistAria')}
                  aria-pressed={wishlist.has(product.slug)}
                  onClick={() =>
                    wishlist.toggle({
                      slug: product.slug,
                      name: product.name,
                      imageUrl: images[0]?.preview ?? null,
                      price,
                      currencyCode: currency,
                    })
                  }
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-lg border border-border-strong bg-white transition-colors',
                    wishlist.has(product.slug) ? 'text-state-danger-border' : 'text-accent',
                  )}
                >
                  <Heart
                    className={cn('size-6', wishlist.has(product.slug) && 'fill-current')}
                    strokeWidth={1.5}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center rounded-lg bg-accent px-4 py-2 text-18 font-medium text-content-inverse"
                >
                  {t('addToCart')}
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center rounded-lg border border-border-strong bg-white px-4 py-2 text-18 font-medium text-content-strong"
              >
                {t('buyNow')}
              </button>
            </div>
            </>)}
          </div>
        </div>

        {/* Product details (collapsible) */}
        <div className="border-y border-hairline">
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            aria-expanded={detailsOpen}
            className="flex w-full items-center justify-between gap-2 py-4 text-right"
          >
            <ChevronDown className={cn('size-6 shrink-0 text-accent transition-transform', !detailsOpen && 'rotate-180')} />
            <span className="flex-1 text-right text-24 font-[600] leading-8 text-accent">{t('detailsTitle')}</span>
          </button>
          {detailsOpen && product.description && (
            <div
              className="pb-6 text-right text-16 leading-[30px] text-content-muted"
              dir="auto"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="flex flex-col gap-6">
            <SectionHeader title={t('related')} viewAllHref="/products" viewAllLabel={t('viewAll')} />
            <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {relatedProducts.map((p) => {
                const card: ProductCardData = {
                  slug: p.slug,
                  name: p.name,
                  imageUrl: p.featuredAsset?.preview ?? null,
                  currencyCode: p.variants[0]?.currencyCode ?? 'DZD',
                  outOfStock: productOutOfStock(p.variants),
                  ...variantDiscount(p.variants[0]),
                };
                return <ProductCard key={p.id} product={card} className="w-[260px] shrink-0" />;
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function PdpSkeleton() {
  return (
    <div className="px-6 py-8">
      <div className="mx-auto flex max-w-[1392px] flex-col gap-8 lg:flex-row lg:items-start">
        <Skeleton className="aspect-[606/714] w-full lg:w-[755px]" />
        <div className="flex w-full flex-col gap-6 lg:w-[557px]">
          <Skeleton className="h-12 w-3/4 self-end" />
          <Skeleton className="h-9 w-1/3 self-end" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
