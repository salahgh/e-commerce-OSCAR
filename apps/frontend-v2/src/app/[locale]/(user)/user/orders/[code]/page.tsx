'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@oscar/shared';
import { useGetOrderByCodeQuery } from '@oscar/graphql-shop/generated';
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
  const params = useParams<{ code: string; locale: string }>();
  const code = params?.code ?? '';

  const { data, loading, error } = useGetOrderByCodeQuery({
    variables: { code },
    skip: !code,
    fetchPolicy: 'cache-and-network',
  });

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const order = data?.orderByCode;
  if (error || !order) {
    return (
      <Alert intent="danger" title={t('errorTitle')}>
        {error?.message ?? t('errorBody')}
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: t('breadcrumbHome'), href: '/' },
          { label: t('breadcrumbOrders'), href: '/user/orders' },
          { label: order.code },
        ]}
      />

      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-24 font-bold text-content-strong">
            {t('title', { code: order.code })}
          </h1>
          <p className="text-12 text-content-muted">
            {t('placedOn')} {dateFmt(order.createdAt)}
          </p>
        </div>
        <Badge intent="info">{order.state}</Badge>
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
                    {formatPrice(line.linePriceWithTax, order.currencyCode)}
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
            <dd className="text-end">{formatPrice(order.subTotalWithTax, order.currencyCode)}</dd>
            <dt className="text-content-muted">{t('shipping')}</dt>
            <dd className="text-end">{formatPrice(order.shippingWithTax, order.currencyCode)}</dd>
            <dt className="pt-2 font-bold text-content-strong">{t('total')}</dt>
            <dd className="pt-2 text-end font-bold text-content-strong">
              {formatPrice(order.totalWithTax, order.currencyCode)}
            </dd>
          </dl>
        </Card>

        {order.shippingAddress && (
          <Card padding="md" className="flex flex-col gap-2">
            <h3 className="text-14 font-bold text-content-strong">{t('shippingAddress')}</h3>
            <address className="not-italic text-12 text-content-muted">
              {order.shippingAddress.fullName && <div>{order.shippingAddress.fullName}</div>}
              {order.shippingAddress.streetLine1 && <div>{order.shippingAddress.streetLine1}</div>}
              {order.shippingAddress.streetLine2 && <div>{order.shippingAddress.streetLine2}</div>}
              {(order.shippingAddress.city || order.shippingAddress.postalCode) && (
                <div>
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}
                </div>
              )}
              {order.shippingAddress.province && <div>{order.shippingAddress.province}</div>}
              {order.shippingAddress.country && <div>{order.shippingAddress.country}</div>}
              {order.shippingAddress.phoneNumber && <div>{order.shippingAddress.phoneNumber}</div>}
            </address>
          </Card>
        )}
      </section>
    </div>
  );
}
