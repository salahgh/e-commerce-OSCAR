'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { formatDzdTotal } from '@/lib/format/price';
import { useGetOrderByCodeQuery } from '@oscar/graphql-shop/generated';
import { Link } from '@/i18n/routing';
import { Alert, Button, Card, Skeleton } from '@/components/ui';
import { trackPurchase } from '@/lib/analytics';

export default function ConfirmationPage() {
  const t = useTranslations('CheckoutConfirmationPage');
  const locale = useLocale();
  const params = useParams<{ code: string; locale: string }>();
  const code = params?.code ?? '';

  const { data, loading, error } = useGetOrderByCodeQuery({
    variables: { code },
    skip: !code,
    fetchPolicy: 'network-only',
  });

  const order = data?.orderByCode;

  useEffect(() => {
    if (!order) return;
    trackPurchase({
      code: order.code,
      value: order.totalWithTax / 100,
      items: order.lines.map((line) => ({
        sku: line.productVariant.sku,
        quantity: line.quantity,
      })),
    });
  }, [order]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <Alert intent="danger" title={t('errorTitle')}>
          {error?.message ?? t('errorBody')}
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-state-success-border" />
      <header className="flex flex-col gap-2">
        <h1 className="text-32 font-bold text-content-strong">{t('title')}</h1>
        <p className="text-14 text-content-muted">{t('subtitle', { code: order.code })}</p>
      </header>

      <Card padding="lg" className="text-start">
        <dl className="grid grid-cols-2 gap-y-2 text-14">
          <dt className="text-content-muted">{t('orderNumber')}</dt>
          <dd className="font-mono text-end text-content-strong">{order.code}</dd>
          <dt className="text-content-muted">{t('total')}</dt>
          <dd className="text-end font-bold text-content-strong">
            {formatDzdTotal(order.totalWithTax, locale)}
          </dd>
        </dl>
      </Card>

      <p className="text-12 text-content-muted">{t('trackingHint')}</p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={`/orders/${order.code}`}>{t('viewOrder')}</Link>
        </Button>
        <Button asChild intent="secondary">
          <Link href="/products">{t('continueShopping')}</Link>
        </Button>
      </div>
    </div>
  );
}
