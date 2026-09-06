'use client';

import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { formatDzd, formatDzdTotal } from '@/lib/format/price';
import { useGetOrderByCodeQuery } from '@oscar/graphql-shop/generated';
import { localizePlaceName } from '@oscar/shared';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@/i18n/routing';
import { Alert, Badge, Breadcrumb, Card, Skeleton } from '@/components/ui';

function dateFmt(iso: string, locale = 'fr-DZ') {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function OrderDetailPage() {
  const t = useTranslations('OrderPage');
  const tStates = useTranslations('OrdersPage.states');
  const locale = useLocale();
  const dateLocale = locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-GB' : 'fr-DZ';
  const { isAuthenticated } = useAuth();
  const params = useParams<{ code: string; locale: string }>();
  const code = params?.code ?? '';

  const { data, loading, error } = useGetOrderByCodeQuery({
    variables: { code },
    skip: !code,
    fetchPolicy: 'cache-and-network',
  });

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="mt-4 h-40 w-full" />
        <Skeleton className="mt-4 h-32 w-full" />
      </div>
    );
  }

  const order = data?.orderByCode;
  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <Alert intent="danger" title={t('errorTitle')}>
          {error?.message ?? t('errorBody')}
        </Alert>
      </div>
    );
  }

  // Authenticated users get a path back to their orders list; guests don't.
  const breadcrumbs = isAuthenticated
    ? [
        { label: t('breadcrumbHome'), href: '/' },
        { label: t('breadcrumbOrders'), href: '/user/orders' },
        { label: order.code },
      ]
    : [
        { label: t('breadcrumbHome'), href: '/' },
        { label: order.code },
      ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <Breadcrumb items={breadcrumbs} />

      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-24 font-bold text-content-strong">
            {t('title', { code: order.code })}
          </h1>
          <p className="text-12 text-content-muted">
            {t('placedOn')} {dateFmt(order.createdAt, dateLocale)}
          </p>
        </div>
        <Badge intent="info">{tStates.has(order.state) ? tStates(order.state) : order.state}</Badge>
      </header>

      <section>
        <h2 className="mb-3 text-16 font-bold text-content-strong">{t('items')}</h2>
        <ul className="flex flex-col gap-3">
          {order.lines.map((line) => (
            <li key={line.id}>
              <Card padding="md" className="flex items-stretch gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-bg-muted">
                  {(line.featuredAsset?.preview ?? line.productVariant.product.featuredAsset?.preview) && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={
                        (line.featuredAsset?.preview ?? line.productVariant.product.featuredAsset?.preview) ?? ''
                      }
                      alt={line.productVariant.product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between md:flex-row md:items-center md:gap-4">
                  <div>
                    <Link
                      href={`/products/${line.productVariant.product.slug}`}
                      className="text-14 font-medium text-content-strong hover:underline"
                    >
                      {line.productVariant.product.name}
                    </Link>
                    <p className="text-12 text-content-muted">
                      {line.productVariant.name} · {line.productVariant.sku} × {line.quantity}
                    </p>
                  </div>
                  <span className="text-14 font-bold text-content-strong">
                    {formatDzd(line.linePriceWithTax)}
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card padding="md" className="flex flex-col gap-3">
          <h3 className="text-14 font-bold text-content-strong">{t('totals')}</h3>
          <dl className="grid grid-cols-2 gap-y-1 text-14">
            <dt className="text-content-muted">{t('subtotal')}</dt>
            <dd className="text-end">{formatDzdTotal(order.subTotalWithTax, locale)}</dd>
            <dt className="text-content-muted">{t('shipping')}</dt>
            <dd className="text-end">
              {order.shippingLines[0]?.shippingMethod.name && (
                <span className="me-2 text-content-muted">{order.shippingLines[0].shippingMethod.name}</span>
              )}
              {formatDzdTotal(order.shippingWithTax, locale)}
            </dd>
            <dt className="pt-2 font-bold text-content-strong">{t('total')}</dt>
            <dd className="pt-2 text-end font-bold text-content-strong">
              {formatDzdTotal(order.totalWithTax, locale)}
            </dd>
          </dl>
        </Card>

        {order.shippingAddress && (
          <Card padding="md" className="flex flex-col gap-2">
            <h3 className="text-14 font-bold text-content-strong">{t('shippingAddress')}</h3>
            <address className="not-italic text-12 text-content-muted">
              {order.shippingAddress.fullName && <div>{order.shippingAddress.fullName}</div>}
              {order.shippingAddress.streetLine1 && <div>{localizePlaceName(order.shippingAddress.streetLine1, locale)}</div>}
              {order.shippingAddress.streetLine2 && <div>{order.shippingAddress.streetLine2}</div>}
              {(order.shippingAddress.city || order.shippingAddress.postalCode) && (
                <div>
                  {order.shippingAddress.postalCode} {localizePlaceName(order.shippingAddress.city, locale)}
                </div>
              )}
              {order.shippingAddress.province && <div>{localizePlaceName(order.shippingAddress.province, locale)}</div>}
              {order.shippingAddress.country && <div>{order.shippingAddress.country}</div>}
              {order.shippingAddress.phoneNumber && <div>{order.shippingAddress.phoneNumber}</div>}
            </address>
          </Card>
        )}
      </section>
    </div>
  );
}
