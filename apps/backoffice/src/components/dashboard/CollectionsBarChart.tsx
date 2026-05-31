import React from 'react';
import { FolderTree } from 'lucide-react';
import type { ProductsByCollectionPoint } from '../../hooks/useDashboardData';

interface CollectionsBarChartProps {
  data: ProductsByCollectionPoint[];
  loading?: boolean;
}

export const CollectionsBarChart: React.FC<CollectionsBarChartProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded" />
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
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Produits par catégorie
        </h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Aucune catégorie disponible
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.productCount), 1);
  const totalProducts = data.reduce((sum, d) => sum + d.productCount, 0);

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-orange-400" />
          Produits par catégorie
        </h3>
        <span className="text-sm text-muted-foreground">
          Top {data.length}
        </span>
      </div>

      <div className="space-y-3">
        {data.map((collection, index) => {
          const percentage = (collection.productCount / maxValue) * 100;
          const gradientOpacity = 1 - index * 0.08;

          return (
            <div key={collection.collectionId} className="group">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-medium text-muted-foreground w-5">
                  {index + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-muted-foreground truncate block group-hover:text-foreground transition-colors">
                    {collection.collectionName}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {collection.productCount} produits
                </span>
              </div>
              <div className="ml-8 pl-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, rgba(251, 146, 60, ${gradientOpacity}) 0%, rgba(253, 186, 116, ${gradientOpacity}) 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Total assignations (produits × catégories)
          </span>
          <span className="text-foreground font-medium">{totalProducts}</span>
        </div>
      </div>
    </div>
  );
};
