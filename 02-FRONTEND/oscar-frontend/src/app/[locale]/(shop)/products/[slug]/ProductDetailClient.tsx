'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { Button, Spinner, Badge } from '@/components/ui';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, Minus, Plus, Check } from 'lucide-react';
import { useLocale } from 'next-intl';
import toast from 'react-hot-toast';

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
  priceWithTax: number;
  stockLevel: string;
  options: ProductOption[];
}

interface ProductCollection {
  slug: string;
  name: string;
}

interface ProductFacetValue {
  id: string;
  name: string;
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

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const locale = useLocale();
  const { addToCart } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ''
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

  // Get all images (product + variant) - deduplicate by ID
  const allImages = (() => {
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
  })();

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      toast.error('Veuillez selectionner une variante');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(selectedVariantId, quantity);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(priceInCents / 100);
  };

  // Group variants by option groups
  const optionGroups = new Map<string, { name: string; values: { id: string; value: string; variantId: string }[] }>();
  product.variants.forEach((variant) => {
    variant.options.forEach((option) => {
      const groupKey = option.group.code;
      if (!optionGroups.has(groupKey)) {
        optionGroups.set(groupKey, { name: option.group.name, values: [] });
      }
      const group = optionGroups.get(groupKey)!;
      if (!group.values.find((v) => v.value === option.name)) {
        group.values.push({ id: option.id, value: option.name, variantId: variant.id });
      }
    });
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8">
        <Link href={`/${locale}/products`} className="text-muted-foreground hover:text-foreground">
          Produits
        </Link>
        <span className="text-muted-foreground">/</span>
        {product.collections?.[0] && (
          <>
            <Link
              href={`/${locale}/products?collection=${product.collections[0].slug}`}
              className="text-muted-foreground hover:text-foreground"
            >
              {product.collections[0].name}
            </Link>
            <span className="text-muted-foreground">/</span>
          </>
        )}
        <span className="font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
            {allImages[selectedImageIndex] ? (
              <Image
                src={allImages[selectedImageIndex].preview}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Pas d'image
              </div>
            )}

            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 hover:bg-background transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    index === selectedImageIndex ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image src={image.preview} alt={`${product.name} ${index + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {selectedVariant && (
              <p className="text-2xl font-bold text-primary">{formatPrice(selectedVariant.priceWithTax)}</p>
            )}
          </div>

          {product.description && (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {Array.from(optionGroups.entries()).map(([groupCode, group]) => (
            <div key={groupCode} className="space-y-2">
              <label className="text-sm font-medium">{group.name}</label>
              <div className="flex flex-wrap gap-2">
                {group.values.map((option) => {
                  const isSelected = selectedVariant?.options.some((o) => o.name === option.value);
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedVariantId(option.variantId)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input hover:border-primary'
                      }`}
                    >
                      {option.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {selectedVariant && (
            <div className="flex items-center gap-2">
              {selectedVariant.stockLevel === 'IN_STOCK' || selectedVariant.stockLevel === 'LOW_STOCK' ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {selectedVariant.stockLevel === 'LOW_STOCK' ? 'Stock faible' : 'En stock'}
                  </span>
                </>
              ) : (
                <Badge variant="destructive">Rupture de stock</Badge>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantite</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="p-2 rounded-lg border border-input hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 rounded-lg border border-input hover:bg-secondary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={!selectedVariantId || isAddingToCart || selectedVariant?.stockLevel === 'OUT_OF_STOCK'}
              className="flex-1"
              size="lg"
            >
              {isAddingToCart ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <ShoppingCart className="h-5 w-5 mr-2" />
              )}
              Ajouter au panier
            </Button>
            <Button variant="outline" size="lg" className="px-4">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {selectedVariant && (
            <div className="border-t pt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-medium">{selectedVariant.sku}</span>
              </div>
              {product.collections && product.collections.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categorie</span>
                  <span className="font-medium">{product.collections.map((c) => c.name).join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {product.facetValues && product.facetValues.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {product.facetValues.map((fv) => (
                <Badge key={fv.id} variant="secondary">
                  {fv.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-16 border-t pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Caracteristiques</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>Matiere: 100% Coton</li>
              <li>Coupe: Slim fit</li>
              <li>Col: Col classique</li>
              <li>Entretien: Lavage en machine a 30C</li>
              <li>Origine: Made in Algeria</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Guide des tailles</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Taille</th>
                  <th className="text-left py-2">Poitrine (cm)</th>
                  <th className="text-left py-2">Longueur (cm)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2">S</td>
                  <td className="py-2">88-92</td>
                  <td className="py-2">72</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">M</td>
                  <td className="py-2">92-96</td>
                  <td className="py-2">74</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">L</td>
                  <td className="py-2">96-100</td>
                  <td className="py-2">76</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Avis clients</h2>
        <div className="bg-card rounded-lg border p-6 text-center text-muted-foreground">
          Les avis seront affiches ici prochainement...
        </div>
      </div>
    </div>
  );
}
