'use client';

import { useTranslations, useLocale } from 'next-intl';
import { formatDzdTotal } from '@/lib/format/price';
import { useGetMyOrdersQuery, SortOrder } from '@oscar/graphql-shop/generated';
import { Link } from '@/i18n/routing';
import { Alert, Badge, Button, Skeleton } from '@/components/ui';

const stateIntent: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'accent'> = {
  AddingItems: 'info',
  ArrangingPayment: 'warning',
  PaymentAuthorized: 'warning',
  PaymentSettled: 'success',
  PartiallyShipped: 'accent',
  Shipped: 'success',
  PartiallyDelivered: 'accent',
  Delivered: 'success',
  Cancelled: 'danger',
};

function dateFmt(iso: string, locale = 'fr-DZ') {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function OrdersPage() {
  const t = useTranslations('OrdersPage');
  const locale = useLocale();
  const dateLocale = locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-GB' : 'fr-DZ';
  const { data, loading, error } = useGetMyOrdersQuery({
    // Exclude the active cart (state AddingItems) from order history.
    variables: { options: { take: 50, sort: { createdAt: SortOrder.Desc }, filter: { active: { eq: false } } } },
    fetchPolicy: 'cache-and-network',
  });

  const orders = data?.activeCustomer?.orders.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-24 font-bold text-content-strong">{t('title')}</h1>
        <p className="text-14 text-content-muted">{t('subtitle')}</p>
      </header>

      {error && (
        <Alert intent="danger" title={t('errorTitle')}>
          {error.message}
        </Alert>
      )}

      {loading && orders.length === 0 && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && !error && (
        <div className="flex flex-col items-start gap-4 rounded border border-border bg-bg-subtle p-6">
          <p className="text-14 text-content-muted">{t('empty')}</p>
          <Button asChild>
            <Link href="/products">{t('shopCta')}</Link>
          </Button>
        </div>
      )}

      {orders.length > 0 && (
        <div className="overflow-x-auto rounded border border-border">
          <table className="min-w-full divide-y divide-border text-14">
            <thead className="bg-bg-subtle text-content-muted">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t('tableCode')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('tableDate')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('tableState')}</th>
                <th className="px-4 py-3 text-end font-medium">{t('tableTotal')}</th>
                <th className="px-4 py-3 text-end font-medium">{t('tableActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-mono text-12 text-content-strong">{o.code}</td>
                  <td className="px-4 py-3 text-content-muted">{dateFmt(o.createdAt, dateLocale)}</td>
                  <td className="px-4 py-3">
                    <Badge intent={stateIntent[o.state] ?? 'info'}>
                      {t.has(`states.${o.state}`) ? t(`states.${o.state}`) : o.state}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-end font-medium text-content-strong">
                    {formatDzdTotal(o.totalWithTax, locale)}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      href={`/orders/${o.code}`}
                      className="text-content-strong hover:underline"
                    >
                      {t('view')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
