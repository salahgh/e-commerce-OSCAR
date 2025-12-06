import React from 'react';
import { formatPrice } from '../../lib/utils';
import { Package } from 'lucide-react';
import type { ProductData } from '../../hooks/useDashboardData';

interface TopProductsBarChartProps {
  data: ProductData[];
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
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
        <div className="h-6 w-48 bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded" />
              <div className="flex-1 h-8 bg-gray-700/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Top 10 Produits</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  // Sort by selected metric and take top 10
  const sortedData = [...data]
    .sort((a, b) => (metric === 'revenue' ? b.revenue - a.revenue : b.quantity - a.quantity))
    .slice(0, 10);

  const maxValue = Math.max(...sortedData.map((d) => (metric === 'revenue' ? d.revenue : d.quantity)));

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Top 10 Produits</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Par</span>
          <span className="text-blue-400 font-medium">
            {metric === 'revenue' ? 'Revenus' : 'Quantité'}
          </span>
        </div>
      </div>

      {/* Custom horizontal bar list for better control */}
      <div className="space-y-3">
        {sortedData.map((product, index) => {
          const value = metric === 'revenue' ? product.revenue : product.quantity;
          const percentage = (value / maxValue) * 100;
          const gradientOpacity = 1 - index * 0.08;

          return (
            <div key={product.id} className="group">
              <div className="flex items-center gap-3 mb-1">
                {/* Rank */}
                <span className="text-sm font-medium text-gray-500 w-5">
                  {index + 1}.
                </span>

                {/* Product image or placeholder */}
                <div className="w-8 h-8 rounded bg-gray-700 flex-shrink-0 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Product name */}
                <span className="text-sm text-gray-300 truncate flex-1 group-hover:text-white transition-colors">
                  {product.name}
                </span>

                {/* Value */}
                <span className="text-sm font-medium text-white">
                  {metric === 'revenue' ? formatPrice(product.revenue) : product.quantity}
                </span>
              </div>

              {/* Progress bar */}
              <div className="ml-8 pl-3">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
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
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Top 10</span>
          <span className="text-white font-medium">
            {metric === 'revenue'
              ? formatPrice(sortedData.reduce((sum, p) => sum + p.revenue, 0))
              : `${sortedData.reduce((sum, p) => sum + p.quantity, 0)} unités`}
          </span>
        </div>
      </div>
    </div>
  );
};
