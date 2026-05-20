import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatDateTime } from '../../lib/utils';
import type { RecentProductItem } from '../../hooks/useDashboardData';

interface RecentProductsListProps {
  products: RecentProductItem[];
  loading?: boolean;
}

export const RecentProductsList: React.FC<RecentProductsListProps> = ({
  products,
  loading = false,
}) => {
  return (
    <div className="bg-card rounded-xl border border-border h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          Produits récents
        </h3>
        <Link
          to="/products"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          Voir tout <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="p-6 flex-1">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="w-12 h-12 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Aucun produit</p>
            <p className="text-sm">Les nouveaux produits apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-all group border border-transparent hover:border-muted-foreground/30"
              >
                <div className="w-12 h-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                  {product.featuredAssetPreview ? (
                    <img
                      src={product.featuredAssetPreview}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {product.name}
                    </span>
                    {!product.enabled && (
                      <Badge variant="warning">Désactivé</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {product.variantCount} variante
                    {product.variantCount > 1 ? 's' : ''} •{' '}
                    {formatDateTime(product.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
