import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatPrice } from '../../lib/utils';
import type { CategoryData } from '../../hooks/useDashboardData';

interface CategoryPieChartProps {
  data: CategoryData[];
  loading?: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
        <p className="text-foreground font-medium mb-1">{data.name}</p>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Revenus:{' '}
            <span className="text-foreground font-semibold">{formatPrice(data.value)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Part:{' '}
            <span className="text-foreground font-semibold">
              {typeof data.percentage === 'number' ? `${data.percentage.toFixed(1)}%` : '—'}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="h-64 flex items-center justify-center">
          <div className="w-48 h-48 bg-muted/50 rounded-full" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Ventes par catégorie</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Ventes par catégorie</h3>
      <div className="h-72 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4 text-center pointer-events-none">
          <p className="text-2xl font-bold text-foreground">{formatPrice(total)}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>
    </div>
  );
};
