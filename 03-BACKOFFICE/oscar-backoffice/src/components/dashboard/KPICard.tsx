import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  isCurrency?: boolean;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend,
  subtitle,
  isCurrency = false,
  loading = false,
}) => {
  const formattedValue = isCurrency
    ? formatPrice(typeof value === 'number' ? value : parseFloat(value as string))
    : typeof value === 'number'
    ? value.toLocaleString('fr-FR')
    : value;

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconBgColor}`}>
            <div className="h-6 w-6 bg-gray-600 rounded" />
          </div>
          <div className="h-4 w-16 bg-gray-700 rounded" />
        </div>
        <div className="h-8 w-24 bg-gray-700 rounded mb-2" />
        <div className="h-4 w-32 bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBgColor} group-hover:scale-110 transition-transform`}>
          <div className={iconColor}>{icon}</div>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${
              trend.isPositive
                ? 'bg-green-500/20 text-green-400'
                : trend.value === 0
                ? 'bg-gray-500/20 text-gray-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : trend.value === 0 ? (
              <Minus className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{Math.abs(trend.value).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-white">{formattedValue}</h3>
        <p className="text-sm text-gray-400">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
};
