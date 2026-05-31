'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { formatPrice, wilayas, getShippingZone } from '@oscar/shared';
import {
  useSetCustomerForOrderMutation,
  useSetOrderShippingAddressMutation,
  useSetOrderBillingAddressMutation,
  useGetEligibleShippingMethodsQuery,
  useSetOrderShippingMethodMutation,
  useGetEligiblePaymentMethodsQuery,
  useTransitionOrderToStateMutation,
  useAddPaymentToOrderMutation,
} from '@oscar/graphql-shop/generated';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter, Link } from '@/i18n/routing';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  Radio,
  Select,
  Skeleton,
} from '@/components/ui';

type Stage = 'address' | 'shipping' | 'payment';

export default function CheckoutPage() {
  const t = useTranslations('CheckoutPage');
  const tAddr = useTranslations('CheckoutPage.address');
  const tShip = useTranslations('CheckoutPage.shipping');
  const tPay = useTranslations('CheckoutPage.payment');
  const tSummary = useTranslations('CheckoutPage.summary');
  const tErrors = useTranslations('CheckoutPage.errors');
  const router = useRouter();

  const { cart, refetchCart } = useCart();
  const { customer, isAuthenticated, logout } = useAuth();

  const [setCustomer] = useSetCustomerForOrderMutation();
  const [setShipping] = useSetOrderShippingAddressMutation();
  const [setBilling] = useSetOrderBillingAddressMutation();
  const [setShippingMethod] = useSetOrderShippingMethodMutation();
  const [transition] = useTransitionOrderToStateMutation();
  const [addPayment] = useAddPaymentToOrderMutation();

  const [stage, setStage] = React.useState<Stage>('address');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // True when the Vendure session reports "already logged in" but the
  // frontend has no active customer — leftover state from an earlier failed
  // attempt that left the session bound to a nonexistent user. Recovery
  // requires logging out (which also clears the cart).
  const [staleSession, setStaleSession] = React.useState(false);

  const [addr, setAddr] = React.useState({
    email: '',
    fullName: '',
    streetLine1: '',
    streetLine2: '',
    city: '',
    wilayaCode: '',
    postalCode: '',
    phoneNumber: '',
  });

  // Prefill known fields from the logged-in customer.
  React.useEffect(() => {
    if (customer) {
      setAddr((a) => ({
        ...a,
        email: a.email || customer.emailAddress,
        fullName: a.fullName || `${customer.firstName} ${customer.lastName}`.trim(),
        phoneNumber: a.phoneNumber || customer.phoneNumber || '',
      }));
    }
  }, [customer]);
  const [billingSameAsShipping, setBillingSameAsShipping] = React.useState(true);

  const [selectedShipping, setSelectedShipping] = React.useState<string>('');
  const [selectedPayment, setSelectedPayment] = React.useState<string>('');

  const shippingQuery = useGetEligibleShippingMethodsQuery({
    skip: stage !== 'shipping' && stage !== 'payment',
    fetchPolicy: 'network-only',
  });
  const paymentQuery = useGetEligiblePaymentMethodsQuery({
    skip: stage !== 'payment',
    fetchPolicy: 'network-only',
  });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-24 font-bold text-content-strong">{t('title')}</h1>
        <p className="text-14 text-content-muted">{t('emptyCart')}</p>
        <Button asChild>
          <Link href="/products">{t('browse')}</Link>
        </Button>
      </div>
    );
  }

  const selectedWilaya = wilayas.find((w) => w.code === addr.wilayaCode);

  async function submitAddress(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // For guest checkout, attach the customer to the order first.
      if (!isAuthenticated) {
        const trimmed = addr.fullName.trim();
        const spaceIdx = trimmed.indexOf(' ');
        const firstName = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
        const lastName = spaceIdx === -1 ? trimmed : trimmed.slice(spaceIdx + 1);
        const { data: customerData } = await setCustomer({
          variables: {
            input: {
              emailAddress: addr.email,
              firstName,
              lastName,
              phoneNumber: addr.phoneNumber || undefined,
            },
          },
        });
        const customerResp = customerData?.setCustomerForOrder;
        if (customerResp && customerResp.__typename === 'AlreadyLoggedInError') {
          // Frontend says we're not logged in, but the Vendure session
          // disagrees. The order will never gain a customer and the state
          // transition will fail. Surface a recoverable error.
          setStaleSession(true);
          setSubmitting(false);
          return;
        }
        if (
          customerResp &&
          customerResp.__typename !== 'Order' &&
          'message' in customerResp
        ) {
          throw new Error(customerResp.message);
        }
      }

      const input = {
        fullName: addr.fullName,
        streetLine1: addr.streetLine1,
        streetLine2: addr.streetLine2 || undefined,
        city: addr.city,
        province: selectedWilaya?.name ?? addr.wilayaCode,
        postalCode: addr.postalCode || undefined,
        countryCode: 'DZ',
        phoneNumber: addr.phoneNumber,
      };
      const { data: ship } = await setShipping({ variables: { input } });
      if (ship?.setOrderShippingAddress.__typename !== 'Order') {
        const err = ship?.setOrderShippingAddress as { message?: string } | undefined;
        throw new Error(err?.message ?? tErrors('addressFailed'));
      }
      if (billingSameAsShipping) {
        await setBilling({ variables: { input } });
      }
      await refetchCart();
      setStage('shipping');
    } catch (err) {
      setError(err instanceof Error ? err.message : tErrors('addressFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function chooseShipping() {
    if (!selectedShipping) return;
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await setShippingMethod({ variables: { shippingMethodId: [selectedShipping] } });
      if (data?.setOrderShippingMethod.__typename !== 'Order') {
        const err = data?.setOrderShippingMethod as { message?: string } | undefined;
        throw new Error(err?.message ?? tErrors('shippingFailed'));
      }
      await refetchCart();
      setStage('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : tErrors('shippingFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function placeOrder() {
    if (!selectedPayment) return;
    setError(null);
    setSubmitting(true);
    try {
      const { data: stateData } = await transition({ variables: { state: 'ArrangingPayment' } });
      if (stateData?.transitionOrderToState?.__typename === 'OrderStateTransitionError') {
        const e = stateData.transitionOrderToState;
        throw new Error(e.message || tErrors('transitionFailed'));
      }
      const { data } = await addPayment({
        variables: { input: { method: selectedPayment, metadata: {} } },
      });
      const resp = data?.addPaymentToOrder;
      if (!resp) throw new Error(tErrors('paymentFailed'));
      if (resp.__typename === 'Order') {
        // Order has moved out of AddingItems → activeOrder query returns null.
        // Refresh the cart context so the header badge stops showing stale
        // line items from the completed order.
        await refetchCart();
        router.push(`/checkout/confirmation/${resp.code}`);
        return;
      }
      const e = resp as { message?: string };
      throw new Error(e.message ?? tErrors('paymentFailed'));
    } catch (err) {
      setError(err instanceof Error ? err.message : tErrors('paymentFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  const shippingMethods = shippingQuery.data?.eligibleShippingMethods ?? [];
  const paymentMethods = paymentQuery.data?.eligiblePaymentMethods ?? [];

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-24 font-bold text-content-strong">{t('title')}</h1>
          <p className="text-14 text-content-muted">{t('subtitle')}</p>
        </header>

        {error && <Alert intent="danger">{error}</Alert>}

        {staleSession && (
          <Alert intent="warning" title={tErrors('staleSessionTitle')}>
            <div className="flex flex-col gap-3">
              <p>{tErrors('staleSessionBody')}</p>
              <div>
                <Button
                  intent="secondary"
                  onClick={async () => {
                    await logout();
                    router.push('/products');
                  }}
                >
                  {tErrors('staleSessionReset')}
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {/* Address */}
        <Card padding="lg" className="flex flex-col gap-4">
          <h2 className="text-16 font-bold text-content-strong">{t('stepAddress')}</h2>
          {stage === 'address' ? (
            <form className="flex flex-col gap-4" onSubmit={submitAddress}>
              {!isAuthenticated && (
                <Field label={tAddr('email')} required hint={tAddr('emailHint')}>
                  <Input
                    type="email"
                    required
                    autoComplete="email"
                    value={addr.email}
                    onChange={(e) => setAddr((a) => ({ ...a, email: e.target.value }))}
                  />
                </Field>
              )}
              <Field label={tAddr('fullName')} required>
                <Input
                  required
                  value={addr.fullName}
                  onChange={(e) => setAddr((a) => ({ ...a, fullName: e.target.value }))}
                />
              </Field>
              <Field label={tAddr('streetLine1')} required>
                <Input
                  required
                  value={addr.streetLine1}
                  onChange={(e) => setAddr((a) => ({ ...a, streetLine1: e.target.value }))}
                />
              </Field>
              <Field label={tAddr('streetLine2')}>
                <Input
                  value={addr.streetLine2}
                  onChange={(e) => setAddr((a) => ({ ...a, streetLine2: e.target.value }))}
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label={tAddr('wilaya')} required>
                  <Select
                    required
                    value={addr.wilayaCode}
                    onChange={(e) => setAddr((a) => ({ ...a, wilayaCode: e.target.value }))}
                  >
                    <option value="">{tAddr('selectWilaya')}</option>
                    {wilayas.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} — {w.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label={tAddr('city')} required>
                  <Input
                    required
                    value={addr.city}
                    onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value }))}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label={tAddr('postalCode')}>
                  <Input
                    value={addr.postalCode}
                    onChange={(e) => setAddr((a) => ({ ...a, postalCode: e.target.value }))}
                  />
                </Field>
                <Field label={tAddr('phone')} required>
                  <Input
                    type="tel"
                    required
                    value={addr.phoneNumber}
                    onChange={(e) => setAddr((a) => ({ ...a, phoneNumber: e.target.value }))}
                    placeholder="0555 00 00 00"
                  />
                </Field>
              </div>
              <Checkbox
                label={tAddr('useShippingForBilling')}
                checked={billingSameAsShipping}
                onChange={(e) => setBillingSameAsShipping(e.target.checked)}
              />
              <Button type="submit" loading={submitting}>
                {submitting ? tSummary('saving') : tSummary('continue')}
              </Button>
            </form>
          ) : (
            <p className="text-12 text-content-muted">
              {addr.fullName} · {addr.streetLine1} · {selectedWilaya?.name}
            </p>
          )}
        </Card>

        {/* Shipping */}
        {(stage === 'shipping' || stage === 'payment') && (
          <Card padding="lg" className="flex flex-col gap-4">
            <h2 className="text-16 font-bold text-content-strong">{t('stepShipping')}</h2>
            {stage === 'shipping' ? (
              <>
                {shippingQuery.loading && (
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                )}
                {!shippingQuery.loading && shippingMethods.length === 0 && (
                  <p className="text-14 text-content-muted">{tShip('empty')}</p>
                )}
                <ul className="flex flex-col gap-2">
                  {shippingMethods.map((m) => (
                    <li key={m.id}>
                      <label className="flex cursor-pointer items-center justify-between rounded border border-border p-3 transition-colors hover:bg-bg-subtle">
                        <div className="flex items-center gap-3">
                          <Radio
                            name="shipping"
                            value={m.id}
                            checked={selectedShipping === m.id}
                            onChange={() => setSelectedShipping(m.id)}
                          />
                          <div>
                            <p className="text-14 font-medium text-content-strong">{m.name}</p>
                            {m.description && (
                              <p className="text-12 text-content-muted">{m.description}</p>
                            )}
                            {addr.wilayaCode && (
                              <p className="text-12 text-content-muted">
                                {tShip('deliveryEstimate', {
                                  delay: tShip(`delayZone${getShippingZone(addr.wilayaCode)}` as 'delayZone1' | 'delayZone2' | 'delayZone3' | 'delayZone4'),
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-14 font-bold text-content-strong">
                          {formatPrice(m.priceWithTax, cart.currencyCode)}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                <Button onClick={chooseShipping} disabled={!selectedShipping} loading={submitting}>
                  {submitting ? tSummary('saving') : tSummary('continue')}
                </Button>
              </>
            ) : (
              <p className="text-12 text-content-muted">
                {shippingMethods.find((m) => m.id === selectedShipping)?.name}
              </p>
            )}
          </Card>
        )}

        {/* Payment */}
        {stage === 'payment' && (
          <Card padding="lg" className="flex flex-col gap-4">
            <h2 className="text-16 font-bold text-content-strong">{t('stepPayment')}</h2>
            {paymentQuery.loading && <p className="text-12 text-content-muted">{tPay('loading')}</p>}
            {!paymentQuery.loading && paymentMethods.length === 0 && (
              <p className="text-14 text-content-muted">{tPay('empty')}</p>
            )}
            <ul className="flex flex-col gap-2">
              {paymentMethods.map((m) => (
                <li key={m.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded border border-border p-3 transition-colors ${
                      m.isEligible ? 'hover:bg-bg-subtle' : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Radio
                      name="payment"
                      value={m.code}
                      checked={selectedPayment === m.code}
                      onChange={() => setSelectedPayment(m.code)}
                      disabled={!m.isEligible}
                    />
                    <div className="flex-1">
                      <p className="text-14 font-medium text-content-strong">{m.name}</p>
                      {m.description && (
                        <p className="text-12 text-content-muted">{m.description}</p>
                      )}
                      {!m.isEligible && m.eligibilityMessage && (
                        <p className="text-12 text-state-warning-content">{m.eligibilityMessage}</p>
                      )}
                    </div>
                    {!m.isEligible && (
                      <span className="text-12 text-content-muted">{tPay('ineligible')}</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
            <Button onClick={placeOrder} disabled={!selectedPayment} loading={submitting}>
              {submitting ? tSummary('placing') : tSummary('placeOrder')}
            </Button>
            <p className="text-12 text-content-muted">{tSummary('termsNotice')}</p>
          </Card>
        )}
      </div>

      {/* Summary aside */}
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <Card padding="lg" className="flex flex-col gap-3">
          <h2 className="text-16 font-bold text-content-strong">{tSummary('title')}</h2>
          <p className="text-12 text-content-muted">
            {tSummary('items')} · {cart.totalQuantity}
          </p>
          <dl className="flex flex-col gap-1 border-t border-border pt-3 text-14">
            <Row label={tSummary('subtotal')} value={formatPrice(cart.subTotal * 100, cart.currencyCode)} />
            <Row
              label={tSummary('shipping')}
              value={
                cart.shipping > 0
                  ? formatPrice(cart.shipping * 100, cart.currencyCode)
                  : tSummary('shippingTbd')
              }
            />
          </dl>
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-14 font-medium text-content-strong">{tSummary('total')}</span>
            <span className="text-20 font-bold text-content-strong">
              {formatPrice(cart.total * 100, cart.currencyCode)}
            </span>
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-content-muted">{label}</dt>
      <dd className="font-medium text-content">{value}</dd>
    </div>
  );
}
