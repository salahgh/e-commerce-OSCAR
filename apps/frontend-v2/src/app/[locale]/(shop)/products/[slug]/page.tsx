'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { ShoppingBag, Heart, Share2 } from 'lucide-react';
import { useGetProductBySlugQuery } from '@oscar/graphql-shop/generated';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/Toast';
import {
  Alert,
  Breadcrumb,
  Button,
  ColorSwatchGroup,
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

export default function ProductPage() {
  const params = useParams<{ slug: string; locale: string }>();
  const slug = params?.slug as string;

  const { data, loading, error } = useGetProductBySlugQuery({
    variables: { slug },
    skip: !slug,
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
        <Alert intent="danger" title="Produit introuvable">
          {error?.message ?? "Ce produit n'existe pas ou n'est plus disponible."}
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

  async function handleAddToCart() {
    if (!selectedVariant) return;
    if (colorGroup && !selectedColor) {
      toast.error('Veuillez sélectionner une couleur.');
      return;
    }
    if (sizeGroup && !selectedSize) {
      toast.error('Veuillez sélectionner une taille.');
      return;
    }
    await addToCart(selectedVariant.id, quantity);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Produits', href: '/products' },
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Gallery */}
        <div className="flex flex-col gap-4 lg:flex-row-reverse">
          <div className="relative aspect-square overflow-hidden rounded border border-border bg-bg-muted lg:flex-1">
            {images[activeImage] && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={images[activeImage].preview}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
          {images.length > 1 && (
            <ul className="flex gap-3 lg:flex-col">
              {images.map((img, i) => (
                <li key={img.id}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Vue ${i + 1}`}
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
              <p className="text-14 font-medium text-content-strong">{colorGroup.name}</p>
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
              <p className="text-14 font-medium text-content-strong">{sizeGroup.name}</p>
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
            <p className="text-14 font-medium text-content-strong">Quantité</p>
            <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={10} />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Button size="lg" onClick={handleAddToCart} leadingIcon={<ShoppingBag className="h-5 w-5" />}>
              Ajouter au panier
            </Button>
            <IconButton aria-label="Ajouter aux favoris" intent="secondary" size="lg">
              <Heart className="h-5 w-5" />
            </IconButton>
            <IconButton aria-label="Partager" intent="ghost" size="lg">
              <Share2 className="h-5 w-5" />
            </IconButton>
          </div>

          <Tabs defaultValue="description" className="mt-4">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="shipping">Livraison</TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              <p className="text-14 text-content-muted">{product.description}</p>
            </TabsContent>
            <TabsContent value="details">
              <ul className="grid grid-cols-1 gap-2 text-14 md:grid-cols-2">
                <li className="flex justify-between border-b border-border py-2">
                  <span className="text-content-muted">Référence</span>
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
              <p className="text-14 text-content-muted">
                Livraison sous 48-72h à travers toutes les wilayas. Paiement à la livraison,
                CIB ou Baridimob.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
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
