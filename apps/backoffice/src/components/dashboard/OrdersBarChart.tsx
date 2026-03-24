import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { OrdersByStatusDataPoint } from '../../hooks/useDashboardData';

interface OrdersBarChartProps {
  data: OrdersByStatusDataPoint[];
  loading?: boolean;
}

const STATUS_COLORS = {
  pending: '#f59e0b', // amber
  processing: '#3b82f6', // blue
  shipped: '#8b5cf6', // purple
  delivered: '#22c55e', // green
  cancelled: '#ef4444', // red
};

const STATUS_LABELS = {
  pending: 'En attente',
  processing: 'En cours',
  shipped: 'Expedie',
  delivered: 'Livre',
  cancelled: 'Annule',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
        <p className="text-muted-foreground text-sm mb-2 font-medium">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any) => (
            <p key={entry.dataKey} className="text-sm flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">
                {STATUS_LABELS[entry.dataKey as keyof typeof STATUS_LABELS]}:
              </span>
              <span className="font-semibold text-foreground">{entry.value}</span>
            </p>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Total:{' '}
            <span className="font-semibold text-foreground">
              {payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}
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
    <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
      {payload?.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">
            {STATUS_LABELS[entry.dataKey as keyof typeof STATUS_LABELS]}
          </span>
        </div>
      ))}
    </div>
  );
};

export const OrdersBarChart: React.FC<OrdersBarChartProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="h-64 bg-muted/50 rounded" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Commandes par statut</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Aucune donnee disponible
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Commandes par statut</h3>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="rgb(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgb(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} radius={[0, 0, 0, 0]} />
            <Bar dataKey="processing" stackId="a" fill={STATUS_COLORS.processing} radius={[0, 0, 0, 0]} />
            <Bar dataKey="shipped" stackId="a" fill={STATUS_COLORS.shipped} radius={[0, 0, 0, 0]} />
            <Bar dataKey="delivered" stackId="a" fill={STATUS_COLORS.delivered} radius={[0, 0, 0, 0]} />
            <Bar dataKey="cancelled" stackId="a" fill={STATUS_COLORS.cancelled} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
