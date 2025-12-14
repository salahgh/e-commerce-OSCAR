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
      <div className="bg-card rounded-xl p-6 border border-border animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconBgColor}`}>
            <div className="h-6 w-6 bg-muted rounded" />
          </div>
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="h-8 w-24 bg-muted rounded mb-2" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border hover:border-muted-foreground/50 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBgColor} group-hover:scale-110 transition-transform`}>
          <div className={iconColor}>{icon}</div>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${
              trend.isPositive
                ? 'bg-success/20 text-success'
                : trend.value === 0
                ? 'bg-muted text-muted-foreground'
                : 'bg-destructive/20 text-destructive'
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
        <h3 className="text-3xl font-bold text-foreground">{formattedValue}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground/70">{subtitle}</p>}
      </div>
    </div>
  );
};
