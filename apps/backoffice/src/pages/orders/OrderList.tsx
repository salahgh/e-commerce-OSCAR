import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { ShoppingCart, AlertCircle, RotateCcw } from 'lucide-react';
import { AdminOrdersDocument, AdminOrderTabCountsDocument } from '../../graphql/generated/graphql';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import {
  buildOrderListOptions,
  buildTabCountOptions,
  toggleSort,
  PAGE_SIZES,
  type OrderTab,
} from './order-list-params';
import { useOrderListParams } from './useOrderListParams';
import { OrderStatusTabs } from './OrderStatusTabs';
import { OrderFilterBar } from './OrderFilterBar';
import { OrderTable } from './OrderTable';

/**
 * Orders list. The view (tab, search, filters, sort, page) is URL state, every
 * filter runs server-side, and the default is the most recent orders first.
 */
export const OrderList: React.FC = () => {
  const { state, update, reset } = useOrderListParams();

  const options = useMemo(() => buildOrderListOptions(state), [state]);
  const { data, previousData, loading, error, refetch } = useQuery(AdminOrdersDocument, {
    variables: { options },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const countVars = useMemo(() => buildTabCountOptions(state), [state]);
  const countsQuery = useQuery(AdminOrderTabCountsDocument, {
    variables: countVars,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });
  const countsData = countsQuery.data ?? countsQuery.previousData;
  const counts = countsData
    ? (Object.fromEntries(
        Object.entries(countsData).filter(([k]) => k !== '__typename').map(([k, v]) => [k, (v as { totalItems: number }).totalItems])
      ) as Partial<Record<OrderTab, number>>)
    : undefined;

  // Keep the previous page on screen while the next one loads.
  const list = data?.orders ?? previousData?.orders;
  const orders = list?.items ?? [];
  const totalItems = list?.totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / state.size));
  const firstRow = totalItems === 0 ? 0 : (state.page - 1) * state.size + 1;
  const lastRow = Math.min(state.page * state.size, totalItems);
  const hasFilters = !!(state.q || state.wilaya || state.from || state.to || state.min || state.max);

  if (error && !list) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="mb-1 text-lg font-medium text-foreground">Erreur de chargement</p>
          <p className="mb-4 text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => refetch()} icon={<RotateCcw className="h-4 w-4" />}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Commandes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Les plus récentes d'abord. Cliquez une colonne pour trier.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <OrderStatusTabs active={state.tab} counts={counts} onChange={(tab) => update({ tab })} />
        <OrderFilterBar state={state} onChange={update} onReset={reset} />

        {!list && loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <Spinner size="lg" />
            Chargement des commandes…
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingCart className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium text-foreground">Aucune commande</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters ? 'Aucune commande ne correspond à ces filtres.' : 'Rien dans cet onglet pour le moment.'}
            </p>
            {hasFilters && (
              <Button variant="secondary" className="mt-4" onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="border-t border-border">
              <OrderTable
                orders={orders}
                sort={state.sort}
                dir={state.dir}
                onSort={(column) => update(toggleSort(state, column))}
                loading={loading}
              />
            </div>
            <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row">
              <div className="flex items-center gap-3">
                <span>
                  {firstRow}–{lastRow} sur {totalItems}
                </span>
                <label className="flex items-center gap-2">
                  <span className="sr-only">Commandes par page</span>
                  <select
                    value={state.size}
                    onChange={(e) => update({ size: Number(e.target.value) })}
                    className="h-8 rounded-md border border-border bg-background px-2 text-foreground"
                  >
                    {PAGE_SIZES.map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {totalPages > 1 && (
                <Pagination currentPage={state.page} totalPages={totalPages} onPageChange={(page) => update({ page })} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
