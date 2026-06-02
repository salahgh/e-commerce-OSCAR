'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShoppingBag, Heart, Share2, ZoomIn } from 'lucide-react';
import {
  useGetProductBySlugQuery,
  useGetCollectionWithProductsQuery,
  useGetProductsQuery,
} from '@oscar/graphql-shop/generated';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/Toast';
import {
  Alert,
  Breadcrumb,
  Button,
  ColorSwatchGroup,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  IconButton,
  PriceDisplay,
  QuantityStepper,
  SizeButtonGroup,
  Skeleton,
  StockIndicator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import {
  ProductCard,
  ProductCardSkeleton,
  ProductGrid,
  SizeGuideDialog,
  type ProductCardData,
} from '@/components/patterns';

export default function ProductPage() {
  const t = useTranslations('ProductPage');
  const tTabs = useTranslations('ProductPage.tabs');
  const params = useParams<{ slug: string; locale: string }>();
  const slug = params?.slug as string;

  const { data, loading, error } = useGetProductBySlugQuery({
    variables: { slug },
    skip: !slug,
  });

  // Related: products from this product's first collection if any, otherwise
  // fall back to "recently added" (seed data has no collections assigned).
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

  const [quantity, setQuantity] = React.useState(1);
  const [selectedColor, setSelectedColor] = React.useState<string>();
  const [selectedSize, setSelectedSize] = React.useState<string>();
  const [activeImage, setActiveImage] = React.useState(0);

  if (loading) {
    return <PdpSkeleton />;
  }

  if (error || !data?.product) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <Alert intent="danger" title={t('errorTitle')}>
          {error?.message ?? t('errorBody')}
        </Alert>
      </div>
    );
  }

  const product = data.product;
  const variants = product.variants;
  const images = product.assets.length > 0 ? product.assets : product.featuredAsset ? [product.featuredAsset] : [];

  // Derive option groups
  const optionGroups = new Map<string, { code: string; name: string; values: Map<string, { code: string; name: string }> }>();
  for (const v of variants) {
    for (const opt of v.options) {
      const g = optionGroups.get(opt.group.code) ?? { code: opt.group.code, name: opt.group.name, values: new Map() };
      g.values.set(opt.code, { code: opt.code, name: opt.name });
      optionGroups.set(opt.group.code, g);
    }
  }
  const colorGroup = Array.from(optionGroups.values()).find((g) => /couleur|color|لون/i.test(g.code) || /couleur|color|لون/i.test(g.name));
  const sizeGroup = Array.from(optionGroups.values()).find((g) => /taille|size|مقاس/i.test(g.code) || /taille|size|مقاس/i.test(g.name));

  // Resolve selected variant
  const selectedVariant = variants.find((v) => {
    const matches = v.options.every((o) => {
      if (colorGroup && o.group.code === colorGroup.code) return o.code === selectedColor;
      if (sizeGroup && o.group.code === sizeGroup.code) return o.code === selectedSize;
      return true;
    });
    return matches;
  }) ?? variants[0];

  const stockLevel = selectedVariant?.stockLevel;
  const stockNumeric = stockLevel === 'IN_STOCK' ? 99 : stockLevel === 'OUT_OF_STOCK' ? 0 : stockLevel === 'LOW_STOCK' ? 3 : null;

  // Related products: prefer collection siblings, fall back to recent.
  // Dedupe by product id, drop current product, cap at 4.
  const relatedSource = collectionSlug
    ? (collectionRelated?.collection?.productVariants.items ?? []).flatMap((v) =>
        v.product ? [v.product] : [],
      )
    : recentRelated?.products.items ?? [];
  const relatedSeen = new Set<string>([product.id]);
  const relatedProducts = relatedSource
    .filter((p) => {
      if (relatedSeen.has(p.id)) return false;
      relatedSeen.add(p.id);
      return true;
    })
    .slice(0, 4);

  async function handleAddToCart() {
    if (!selectedVariant) return;
    if (colorGroup && !selectedColor) {
      toast.error(t('selectColor'));
      return;
    }
    if (sizeGroup && !selectedSize) {
      toast.error(t('selectSize'));
      return;
    }
    await addToCart(selectedVariant.id, quantity);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: '/' },
          { label: t('breadcrumbProducts'), href: '/products' },
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Gallery */}
        <div className="flex flex-col gap-4 lg:flex-row-reverse">
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label={t('zoomAria')}
                className="group relative aspect-square w-full overflow-hidden rounded border border-border bg-bg-muted lg:flex-1"
              >
                {images[activeImage] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={images[activeImage].preview}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                )}
                <span className="absolute end-3 bottom-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-bg-elevated/90 text-content-strong opacity-0 transition-opacity group-hover:opacity-100">
                  <ZoomIn className="h-5 w-5" />
                </span>
              </button>
            </DialogTrigger>
            <DialogContent
              className="flex max-w-5xl items-center justify-center bg-transparent p-2 shadow-none"
              hideClose
            >
              <DialogTitle className="sr-only">{t('zoomAria')}</DialogTitle>
              {images[activeImage] && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={images[activeImage].preview}
                  alt={product.name}
                  className="max-h-[85vh] w-auto object-contain"
                />
              )}
            </DialogContent>
          </Dialog>
          {images.length > 1 && (
            <ul className="flex gap-3 lg:flex-col">
              {images.map((img, i) => (
                <li key={img.id}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={t('viewLabel', { n: i + 1 })}
                    className={`relative h-20 w-20 overflow-hidden rounded border-2 ${
                      i === activeImage ? 'border-accent' : 'border-border hover:border-border-strong'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.preview} alt="" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-3">
            <h1 className="text-32 font-bold text-content-strong">{product.name}</h1>
            <PriceDisplay
              amount={selectedVariant?.priceWithTax ?? 0}
              currencyCode={selectedVariant?.currencyCode ?? 'DZD'}
              size="xl"
            />
            <StockIndicator stock={stockNumeric} />
          </header>

          {colorGroup && (
            <div className="flex flex-col gap-2">
              <p className="text-14 font-medium text-content-strong">{t('color')}</p>
              <ColorSwatchGroup
                value={selectedColor}
                onValueChange={setSelectedColor}
                options={Array.from(colorGroup.values.values()).map((v) => ({
                  value: v.code,
                  name: v.name,
                  hex: /^#[0-9a-fA-F]{3,8}$/.test(v.code) ? v.code : '#999999',
                }))}
              />
            </div>
          )}

          {sizeGroup && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-14 font-medium text-content-strong">{t('size')}</p>
                <SizeGuideDialog />
              </div>
              <SizeButtonGroup
                value={selectedSize}
                onValueChange={setSelectedSize}
                options={Array.from(sizeGroup.values.values()).map((v) => ({
                  value: v.code,
                  label: v.name,
                }))}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-14 font-medium text-content-strong">{t('quantity')}</p>
            <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={10} />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Button size="lg" onClick={handleAddToCart} leadingIcon={<ShoppingBag className="h-5 w-5" />}>
              {t('addToCart')}
            </Button>
            <IconButton aria-label={t('wishlistAria')} intent="secondary" size="lg">
              <Heart className="h-5 w-5" />
            </IconButton>
            <IconButton aria-label={t('shareAria')} intent="ghost" size="lg">
              <Share2 className="h-5 w-5" />
            </IconButton>
          </div>

          <Tabs defaultValue="description" className="mt-4">
            <TabsList>
              <TabsTrigger value="description">{tTabs('description')}</TabsTrigger>
              <TabsTrigger value="details">{tTabs('details')}</TabsTrigger>
              <TabsTrigger value="shipping">{tTabs('shipping')}</TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              <p className="text-14 text-content-muted">{product.description}</p>
            </TabsContent>
            <TabsContent value="details">
              <ul className="grid grid-cols-1 gap-2 text-14 md:grid-cols-2">
                <li className="flex justify-between border-b border-border py-2">
                  <span className="text-content-muted">{t('reference')}</span>
                  <span className="font-medium text-content">{selectedVariant?.sku ?? '—'}</span>
                </li>
                {product.facetValues.slice(0, 4).map((f) => (
                  <li key={f.id} className="flex justify-between border-b border-border py-2">
                    <span className="text-content-muted">{f.facet.name}</span>
                    <span className="font-medium text-content">{f.name}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="shipping">
              <p className="text-14 text-content-muted">{t('shippingBody')}</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-8 border-t border-border pt-8">
          <h2 className="mb-4 text-20 font-bold text-content-strong">{t('related')}</h2>
          <ProductGrid columns={4}>
            {relatedProducts.map((p) => {
              const card: ProductCardData = {
                slug: p.slug,
                name: p.name,
                imageUrl: p.featuredAsset?.preview ?? null,
                price: p.variants[0]?.priceWithTax ?? 0,
                currencyCode: p.variants[0]?.currencyCode ?? 'DZD',
              };
              return <ProductCard key={p.id} product={card} />;
            })}
          </ProductGrid>
        </section>
      )}
    </div>
  );
}

function PdpSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-1/2" />
      </div>
    </div>
  );
}
