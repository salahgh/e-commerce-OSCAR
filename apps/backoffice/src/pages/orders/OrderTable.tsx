import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, Home, Building2 } from 'lucide-react';
import type { ResultOf } from '@graphql-typed-document-node/core';
import type { AdminOrdersDocument } from '../../graphql/generated/graphql';
import { cn, formatPrice, formatDateTime } from '../../lib/utils';
import { orderStateMeta, type OrderSortKey, type SortDir, type StateTone } from './order-list-params';

export type OrderRow = ResultOf<typeof AdminOrdersDocument>['orders']['items'][number];

interface Props {
  orders: OrderRow[];
  sort: OrderSortKey;
  dir: SortDir;
  onSort: (column: OrderSortKey) => void;
  /** Dims the rows while a new page loads, instead of blanking the table. */
  loading?: boolean;
}

const TONE_CLS: Record<StateTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  success: 'bg-green-500/15 text-green-400 ring-1 ring-green-500/30',
  warning: 'bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30',
  shipped: 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30',
  danger: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
};

export const OrderStateBadge: React.FC<{ state: string }> = ({ state }) => {
  const meta = orderStateMeta(state);
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', TONE_CLS[meta.tone])}>
      {meta.label}
    </span>
  );
};

const COLUMNS: Array<{ key: OrderSortKey | 'delivery'; label: string; align?: 'right' }> = [
  { key: 'code', label: 'Commande' },
  { key: 'customer', label: 'Client' },
  { key: 'wilaya', label: 'Wilaya' },
  { key: 'delivery', label: 'Livraison' },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'state', label: 'Statut' },
  { key: 'date', label: 'Date' },
];

function deliveryMode(order: OrderRow): { label: string; icon: React.ReactNode } | null {
  const method = order.shippingLines?.[0]?.shippingMethod;
  if (!method) return null;
  if (method.code === 'home-delivery') return { label: 'Domicile', icon: <Home className="h-3.5 w-3.5" /> };
  if (method.code === 'office-delivery') return { label: 'Bureau', icon: <Building2 className="h-3.5 w-3.5" /> };
  return { label: method.name, icon: null };
}

export const OrderTable: React.FC<Props> = ({ orders, sort, dir, onSort, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full text-sm', loading && 'opacity-60 transition-opacity')}>
        <thead>
          <tr className="border-b border-border bg-background/50 text-xs uppercase tracking-wider text-muted-foreground">
            {COLUMNS.map((col) => {
              const sortable = col.key !== 'delivery';
              const active = sortable && sort === col.key;
              const Icon = !sortable ? null : active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={cn('px-4 py-3 font-semibold', col.align === 'right' ? 'text-right' : 'text-left')}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key as OrderSortKey)}
                      className={cn(
                        // Buttons do not inherit text-transform from the row.
                        'group inline-flex items-center gap-1 rounded px-1 -mx-1 uppercase tracking-wider hover:text-foreground',
                        active && 'text-foreground'
                      )}
                    >
                      {col.label}
                      {Icon && (
                        <Icon
                          className={cn('h-3.5 w-3.5', !active && 'opacity-0 group-hover:opacity-60')}
                        />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {orders.map((order) => {
            const delivery = deliveryMode(order);
            const href = `/orders/${order.id}`;
            return (
              <tr
                key={order.id}
                onClick={() => navigate(href)}
                className="cursor-pointer transition-colors hover:bg-accent/40"
              >
                <td className="px-4 py-3">
                  <Link
                    to={href}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {order.code}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {order.totalQuantity} article{order.totalQuantity > 1 ? 's' : ''}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {order.customer ? (
                    <>
                      <Link
                        to={`/customers/${order.customer.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {order.customer.firstName} {order.customer.lastName}
                      </Link>
                      {order.customer.phoneNumber && (
                        <div className="text-xs text-muted-foreground tabular-nums">{order.customer.phoneNumber}</div>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-foreground">{order.customFields?.wilaya || <span className="text-muted-foreground">—</span>}</td>
                <td className="px-4 py-3">
                  {delivery ? (
                    <span className="inline-flex items-center gap-1.5 text-foreground">
                      {delivery.icon}
                      {delivery.label}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                  {formatPrice(order.totalWithTax / 100)}
                </td>
                <td className="px-4 py-3">
                  <OrderStateBadge state={order.state} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums text-foreground">
                  {formatDateTime(order.orderPlacedAt ?? order.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
