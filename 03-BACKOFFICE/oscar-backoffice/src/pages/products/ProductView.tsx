import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  ArrowLeft,
  Edit3,
  Package,
  Globe,
  Layers,
  Image as ImageIcon,
  Star,
  Eye,
  FolderTree,
  Calendar,
  Tag,
  Box,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  AdminProductDocument,
  AdminCollectionsWithFiltersDocument,
} from '../../graphql/generated/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice, formatDateTime } from '../../lib/utils';

export const ProductView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch product data
  const { data, loading, error } = useQuery(AdminProductDocument, {
    variables: { id: id! },
    skip: !id,
  });

  // Fetch collections to show which ones contain this product
  const { data: collectionsData } = useQuery(AdminCollectionsWithFiltersDocument, {
    variables: { options: { take: 100 } },
  });

  const product = data?.product;
  const allCollections = collectionsData?.collections?.items || [];

  // Get collections containing this product
  const getProductCollections = () => {
    if (!id || !allCollections.length) return [];
    return allCollections.filter((col: any) => {
      const productIdFilter = col.filters?.find((f: any) => f.code === 'product-id-filter');
      if (!productIdFilter) return false;
      const productIdsArg = productIdFilter.args?.find((a: any) => a.name === 'productIds');
      if (!productIdsArg?.value) return false;
      try {
        const ids = JSON.parse(productIdsArg.value);
        return ids.includes(id);
      } catch {
        return false;
      }
    });
  };

  const productCollections = getProductCollections();

  // Variant stats - must be before early returns to follow rules of hooks
  const variantStats = useMemo(() => {
    const variants = product?.variants || [];
    return {
      total: variants.length,
      active: variants.filter(v => v.enabled).length,
      inactive: variants.filter(v => !v.enabled).length,
      outOfStock: variants.filter(v => (v.stockOnHand ?? 0) === 0).length,
      lowStock: variants.filter(v =>
        (v.stockOnHand ?? 0) > 0 &&
        (v.stockOnHand ?? 0) < (v.customFields?.minStockAlert || 10)
      ).length,
    };
  }, [product?.variants]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg mb-4">Produit non trouvé</p>
        <Link to="/products" className="text-primary hover:text-primary/80">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stockOnHand || 0), 0) || 0;
  const mainVariant = product.variants?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Retour
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
              <Badge variant={product.enabled ? 'success' : 'default'}>
                {product.enabled ? 'Actif' : 'Inactif'}
              </Badge>
              {product.customFields?.isFeatured && (
                <Badge variant="warning">
                  <Star className="h-3 w-3 mr-1" />
                  Vedette
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {product.id} | Slug: {product.slug}
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={<Edit3 className="h-4 w-4" />}
          onClick={() => navigate(`/products/${id}/edit`)}
        >
          Modifier
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images & Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Featured Image */}
                {product.featuredAsset ? (
                  <div className="relative">
                    <img
                      src={product.featuredAsset.preview}
                      alt={product.name}
                      className="w-full max-h-96 object-contain rounded-lg bg-muted"
                    />
                    <Badge variant="warning" className="absolute top-2 left-2">
                      <Star className="h-3 w-3 mr-1" />
                      Image principale
                    </Badge>
                  </div>
                ) : (
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Aucune image</p>
                    </div>
                  </div>
                )}

                {/* Gallery */}
                {product.assets && product.assets.length > 1 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Galerie ({product.assets.length} images)
                    </p>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {product.assets.map((asset) => (
                        <a
                          key={asset.id}
                          href={asset.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`relative rounded-lg overflow-hidden border-2 hover:border-primary transition-colors ${
                            product.featuredAsset?.id === asset.id
                              ? 'border-yellow-500'
                              : 'border-border'
                          }`}
                        >
                          <img
                            src={asset.preview}
                            alt={asset.name}
                            className="h-20 w-full object-cover"
                          />
                          {product.featuredAsset?.id === asset.id && (
                            <div className="absolute top-1 right-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {product.description ? (
                  <p className="text-foreground whitespace-pre-wrap">{product.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">Aucune description</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Translations */}
          {(product.customFields?.nameFr || product.customFields?.nameAr) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Traductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* French */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <span className="text-sm">FR</span> Français
                    </h4>
                    {product.customFields?.nameFr ? (
                      <>
                        <p className="text-sm text-foreground">
                          <span className="font-medium">Nom:</span> {product.customFields.nameFr}
                        </p>
                        {product.customFields?.descriptionFr && (
                          <p className="text-sm text-muted-foreground">
                            {product.customFields.descriptionFr}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Non traduit</p>
                    )}
                  </div>

                  {/* Arabic */}
                  <div className="space-y-2" dir="rtl">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <span className="text-sm">AR</span> العربية
                    </h4>
                    {product.customFields?.nameAr ? (
                      <>
                        <p className="text-sm text-foreground">
                          <span className="font-medium">الاسم:</span> {product.customFields.nameAr}
                        </p>
                        {product.customFields?.descriptionAr && (
                          <p className="text-sm text-muted-foreground">
                            {product.customFields.descriptionAr}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">غير مترجم</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Variantes ({product.variants?.length || 0})
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/products/${id}/edit?step=3`)}
                  icon={<Edit3 className="h-3 w-3" />}
                >
                  Modifier
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Variant Stats */}
              {variantStats.total > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-xs text-muted-foreground">Actives</p>
                      <p className="text-lg font-semibold text-green-400">{variantStats.active}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-lg">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Inactives</p>
                      <p className="text-lg font-semibold text-foreground">{variantStats.inactive}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    variantStats.outOfStock > 0
                      ? 'bg-red-900/20 border border-red-700/50'
                      : 'bg-muted/30 border border-border'
                  }`}>
                    <AlertCircle className={`h-4 w-4 ${variantStats.outOfStock > 0 ? 'text-red-400' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">Rupture</p>
                      <p className={`text-lg font-semibold ${variantStats.outOfStock > 0 ? 'text-red-400' : 'text-foreground'}`}>
                        {variantStats.outOfStock}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    variantStats.lowStock > 0
                      ? 'bg-orange-900/20 border border-orange-700/50'
                      : 'bg-muted/30 border border-border'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${variantStats.lowStock > 0 ? 'text-orange-400' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">Stock bas</p>
                      <p className={`text-lg font-semibold ${variantStats.lowStock > 0 ? 'text-orange-400' : 'text-foreground'}`}>
                        {variantStats.lowStock}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {product.variants && product.variants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          SKU
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Nom
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Options
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Prix
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Prix TTC
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Stock
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {product.variants.map((variant) => (
                        <tr key={variant.id} className="hover:bg-accent">
                          <td className="px-4 py-3">
                            <span className="text-sm font-mono font-medium text-foreground">
                              {variant.sku}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-foreground">{variant.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            {variant.options && variant.options.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {variant.options.map((opt) => (
                                  <Badge key={opt.id} variant="default" className="text-xs">
                                    {opt.group?.name ? `${opt.group.name}: ` : ''}{opt.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-foreground">
                              {formatPrice(Number(variant.price ?? 0) / 100)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">
                              {formatPrice(Number(variant.priceWithTax ?? 0) / 100)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm font-medium ${
                                (variant.stockOnHand ?? 0) === 0
                                  ? 'text-red-500'
                                  : (variant.stockOnHand ?? 0) <
                                      (variant.customFields?.minStockAlert || 10)
                                    ? 'text-orange-500'
                                    : 'text-green-500'
                              }`}
                            >
                              {variant.stockOnHand ?? 0}
                              {(variant.stockAllocated ?? 0) > 0 && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  ({variant.stockAllocated} réservé)
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={variant.enabled ? 'success' : 'default'}>
                              {variant.enabled ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Box className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucune variante</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Prix principal</span>
                <span className="font-semibold text-foreground">
                  {mainVariant?.price ? formatPrice(mainVariant.price / 100) : '-'}
                </span>
              </div>
              {product.customFields?.salePrice && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Prix promo</span>
                  <span className="font-semibold text-green-500">
                    {formatPrice(product.customFields.salePrice / 100)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Stock total</span>
                <span
                  className={`font-semibold ${
                    totalStock === 0
                      ? 'text-red-500'
                      : totalStock < 10
                        ? 'text-orange-500'
                        : 'text-green-500'
                  }`}
                >
                  {totalStock} unités
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Variantes</span>
                <span className="font-semibold text-foreground">
                  {product.variants?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Vues</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  {product.customFields?.viewCount || 0}
                </span>
              </div>
              {product.customFields?.weightKg && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Poids</span>
                  <span className="font-semibold text-foreground">
                    {product.customFields.weightKg} kg
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attributes */}
          {(product.customFields?.availableSizes?.length > 0 ||
            product.customFields?.availableColors?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Attributs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.customFields?.availableSizes?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Tailles</p>
                    <div className="flex flex-wrap gap-2">
                      {product.customFields.availableSizes.map((size, i) => (
                        <Badge key={i} variant="default">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {product.customFields?.availableColors?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Couleurs</p>
                    <div className="flex flex-wrap gap-2">
                      {product.customFields.availableColors.map((color, i) => (
                        <Badge key={i} variant="default">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Catégories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productCollections.length > 0 ? (
                <div className="space-y-2">
                  {productCollections.map((col: any) => (
                    <Link
                      key={col.id}
                      to={`/categories/${col.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <FolderTree className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{col.name}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Aucune catégorie</p>
              )}
            </CardContent>
          </Card>

          {/* Facets */}
          {product.facetValues && product.facetValues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Facettes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {product.facetValues.map((fv) => (
                    <div key={fv.id} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{fv.facet.name}</span>
                      <Badge variant="default">{fv.name}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Créé le</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDateTime(product.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Modifié le</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDateTime(product.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Option Groups */}
          {product.optionGroups && product.optionGroups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Groupes d'options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.optionGroups.map((group) => (
                    <div key={group.id}>
                      <p className="text-sm font-medium text-foreground">{group.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {group.options?.map((opt) => (
                          <Badge key={opt.id} variant="default" className="text-xs">
                            {opt.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
