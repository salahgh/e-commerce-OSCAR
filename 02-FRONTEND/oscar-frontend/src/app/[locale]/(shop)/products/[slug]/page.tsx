'use client';

import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/common';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductInfo from '@/components/product/ProductInfo';
import { Spinner } from '@/components/ui';
import { useGetProductBySkuQuery } from '@/graphql/generated/graphql';
import { mapProduct } from '@/lib/utils/mappers';
import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/utils/mappers';

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const locale = useLocale() as Locale;

  // Note: Backend uses SKU instead of slug, so we treat slug parameter as SKU
  const { data, loading, error } = useGetProductBySkuQuery({
    variables: {
      sku: params.slug,
    },
  });

  if (loading) {
    return (
      <div className="container-custom py-20">
        <div className="flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !data?.productBySku) {
    return (
      <div className="container-custom py-20">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <p className="text-gray-600 mb-6">
            {error ? error.message : 'Le produit que vous recherchez n\'existe pas.'}
          </p>
          <a href="/products" className="text-primary hover:underline">
            Retour aux produits
          </a>
        </div>
      </div>
    );
  }

  // Map backend product to frontend format
  const product = mapProduct(data.productBySku, locale);

  return (
    <div className="container-custom py-8">
      <Breadcrumb
        items={[
          { label: 'Produits', href: '/products' },
          ...(product.category
            ? [{ label: product.category.name[locale], href: '/products' }]
            : []),
          { label: product.name[locale] },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <ProductImageGallery images={product.images} productName={product.name[locale]} />

        {/* Product Info */}
        <ProductInfo product={product} locale={locale} />
      </div>

      {/* Product Tabs */}
      <div className="mt-12 border-t pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Caractéristiques</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Matière: 100% Coton</li>
              <li>• Coupe: Slim fit</li>
              <li>• Col: Col classique</li>
              <li>• Entretien: Lavage en machine à 30°C</li>
              <li>• Origine: Made in Algeria</li>
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
              <tbody className="text-gray-700">
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
        <div className="card p-6 text-center text-gray-500">
          Les avis seront affichés ici prochainement...
        </div>
      </div>
    </div>
  );
}
