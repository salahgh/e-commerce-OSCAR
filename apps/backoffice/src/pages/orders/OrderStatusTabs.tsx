import React from 'react';
import { cn } from '../../lib/utils';
import { ORDER_TABS, type OrderTab } from './order-list-params';

interface Props {
  active: OrderTab;
  counts?: Partial<Record<OrderTab, number>>;
  onChange: (tab: OrderTab) => void;
}

/** Status tabs above the orders table. Counts reflect the other active filters. */
export const OrderStatusTabs: React.FC<Props> = ({ active, counts, onChange }) => (
  <nav className="flex flex-wrap gap-1 border-b border-border px-2" aria-label="Statut des commandes">
    {ORDER_TABS.map(({ key, label }) => {
      const isActive = key === active;
      const count = counts?.[key];
      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'relative flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors',
            '-mb-px border-b-2',
            isActive
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
            key === 'carts' && 'ml-auto'
          )}
        >
          {label}
          {count !== undefined && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs tabular-nums',
                isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </nav>
);
