import React from 'react';
import { formatPrice } from '../../lib/utils';
import { Package } from 'lucide-react';
import type { TopSellingProduct } from '../../hooks/useDashboardData';

interface TopProductsBarChartProps {
  data: TopSellingProduct[];
  loading?: boolean;
  metric?: 'revenue' | 'quantity';
}

export const TopProductsBarChart: React.FC<TopProductsBarChartProps> = ({
  data,
  loading = false,
  metric = 'revenue',
}) => {
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded" />
              <div className="flex-1 h-8 bg-muted/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top 10 Produits</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Aucune donnee disponible
        </div>
      </div>
    );
  }

  // Sort by selected metric and take top 10
  const sortedData = [...data]
    .sort((a, b) => (metric === 'revenue' ? b.revenue - a.revenue : b.quantitySold - a.quantitySold))
    .slice(0, 10);

  const maxValue = Math.max(
    ...sortedData.map((d) => (metric === 'revenue' ? d.revenue : d.quantitySold))
  );

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Top 10 Produits</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Par</span>
          <span className="text-primary font-medium">
            {metric === 'revenue' ? 'Revenus' : 'Quantite'}
          </span>
        </div>
      </div>

      {/* Custom horizontal bar list for better control */}
      <div className="space-y-3">
        {sortedData.map((product, index) => {
          const value = metric === 'revenue' ? product.revenue : product.quantitySold;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const gradientOpacity = 1 - index * 0.08;

          return (
            <div key={product.variantId} className="group">
              <div className="flex items-center gap-3 mb-1">
                {/* Rank */}
                <span className="text-sm font-medium text-muted-foreground w-5">{index + 1}.</span>

                {/* Product image or placeholder */}
                <div className="w-8 h-8 rounded bg-muted flex-shrink-0 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Product name */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-muted-foreground truncate block group-hover:text-foreground transition-colors">
                    {product.productName}
                  </span>
                  {product.variantName && product.variantName !== product.productName && (
                    <span className="text-xs text-muted-foreground/70 truncate block">
                      {product.variantName}
                    </span>
                  )}
                </div>

                {/* Value */}
                <span className="text-sm font-medium text-foreground">
                  {metric === 'revenue' ? formatPrice(product.revenue) : `${product.quantitySold} vendus`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="ml-8 pl-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, rgba(59, 130, 246, ${gradientOpacity}) 0%, rgba(96, 165, 250, ${gradientOpacity}) 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Top 10</span>
          <span className="text-foreground font-medium">
            {metric === 'revenue'
              ? formatPrice(sortedData.reduce((sum, p) => sum + p.revenue, 0))
              : `${sortedData.reduce((sum, p) => sum + p.quantitySold, 0)} unites`}
          </span>
        </div>
      </div>
    </div>
  );
};
