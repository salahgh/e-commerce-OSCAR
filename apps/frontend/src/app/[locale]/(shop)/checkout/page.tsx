'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown, ArrowLeft, Check } from 'lucide-react';
import { wilayas } from '@oscar/shared';
import { formatDzdTotal } from '@/lib/format/price';
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
import { Alert, Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { trackInitiateCheckout } from '@/lib/analytics/meta-pixel';

const inputCls =
  'w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-right text-16 text-accent shadow-sm placeholder:text-content-subtle focus:border-accent focus:outline-none';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex w-full flex-col items-end gap-1.5">
      <span className="text-14 font-medium text-[#344054]">
        {label}
        {required && '*'}
      </span>
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-hairline bg-white p-4">
      <h2 className="text-right text-24 font-medium text-accent">{title}</h2>
      {children}
    </div>
  );
}

function ChoiceRow({
  label,
  price,
  checked,
  disabled,
  onSelect,
}: {
  label: string;
  price?: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'flex w-full flex-row-reverse items-center justify-between gap-3 rounded-lg border p-3 text-right transition-colors',
        checked ? 'border-accent' : 'border-hairline hover:border-border-strong',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="flex flex-row-reverse items-center gap-3">
        <span
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-full border',
            checked ? 'border-accent bg-accent text-content-inverse' : 'border-border-strong',
          )}
        >
          {checked && <Check className="size-3.5" strokeWidth={3} />}
        </span>
        <span className="text-16 text-content-strong">{label}</span>
      </span>
      {price && <span className="font-dm text-16 font-medium text-accent">{price}</span>}
    </button>
  );
}

export default function CheckoutPage() {
  const t = useTranslations('CheckoutPage');
  const tAddr = useTranslations('CheckoutPage.address');
  const tShip = useTranslations('CheckoutPage.shipping');
  const tSummary = useTranslations('CheckoutPage.summary');
  const tErrors = useTranslations('CheckoutPage.errors');
  const params = useParams<{ locale: string }>();
  const isAr = params?.locale === 'ar';
  const locale = params?.locale ?? 'fr';
  const router = useRouter();

  const { cart, refetchCart } = useCart();
  const { customer, isAuthenticated, logout } = useAuth();

  // Once per checkout visit — the cart object keeps changing as shipping and
  // payment are picked, but that's still the same funnel entry.
  const checkoutTracked = React.useRef(false);
  React.useEffect(() => {
    if (!cart || cart.items.length === 0 || checkoutTracked.current) return;
    checkoutTracked.current = true;
    trackInitiateCheckout({
      value: cart.total,
      items: cart.items.map((item) => ({ sku: item.sku, quantity: item.quantity })),
    });
  }, [cart]);

  const [setCustomer] = useSetCustomerForOrderMutation();
  const [setShipping] = useSetOrderShippingAddressMutation();
  const [setBilling] = useSetOrderBillingAddressMutation();
  const [setShippingMethod] = useSetOrderShippingMethodMutation();
  const [transition] = useTransitionOrderToStateMutation();
  const [addPayment] = useAddPaymentToOrderMutation();

  const shippingQuery = useGetEligibleShippingMethodsQuery({ fetchPolicy: 'network-only' });
  const paymentQuery = useGetEligiblePaymentMethodsQuery({ fetchPolicy: 'network-only' });

  const [addr, setAddr] = React.useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    phone2: '',
    wilayaCode: '',
    communeCode: '',
  });
  const [selectedShipping, setSelectedShipping] = React.useState('');
  const [selectedPayment, setSelectedPayment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [staleSession, setStaleSession] = React.useState(false);
  const savedKeyRef = React.useRef('');

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

  const selectedWilaya = wilayas.find((w) => w.code === addr.wilayaCode);
  const communes = selectedWilaya?.communes ?? [];
  const name = (x: { name: string; nameAr: string }) => (isAr ? x.nameAr : x.name);

  const buildAddressInput = React.useCallback(() => {
    const commune = communes.find((c) => c.code === addr.communeCode);
    return {
      fullName: addr.fullName,
      streetLine1: commune ? name(commune) : (selectedWilaya ? name(selectedWilaya) : '—'),
      city: commune ? name(commune) : '',
      province: selectedWilaya ? name(selectedWilaya) : addr.wilayaCode,
      postalCode: commune?.postalCode || undefined,
      countryCode: 'DZ',
      phoneNumber: addr.phoneNumber,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addr, communes, selectedWilaya]);

  // Persist the shipping address as soon as the required fields are complete,
  // then refresh the eligible shipping methods (they depend on the address zone).
  const ready = !!(addr.fullName && addr.phoneNumber && addr.wilayaCode && addr.communeCode);
  React.useEffect(() => {
    if (!ready) return;
    const key = JSON.stringify([addr.fullName, addr.phoneNumber, addr.wilayaCode, addr.communeCode, addr.email]);
    if (key === savedKeyRef.current) return;
    const handle = setTimeout(async () => {
      try {
        if (!isAuthenticated) {
          const trimmed = addr.fullName.trim();
          const sp = trimmed.indexOf(' ');
          const firstName = sp === -1 ? trimmed : trimmed.slice(0, sp);
          const lastName = sp === -1 ? trimmed : trimmed.slice(sp + 1);
          const { data } = await setCustomer({
            variables: { input: { emailAddress: addr.email, firstName, lastName, phoneNumber: addr.phoneNumber || undefined } },
          });
          if (data?.setCustomerForOrder?.__typename === 'AlreadyLoggedInError') {
            setStaleSession(true);
            return;
          }
        }
        const input = buildAddressInput();
        await setShipping({ variables: { input } });
        await setBilling({ variables: { input } });
        savedKeyRef.current = key;
        await shippingQuery.refetch();
        await refetchCart();
      } catch {
        /* surfaced on final submit */
      }
    }, 600);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, addr]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-24 font-bold text-content-strong">{t('title')}</h1>
        <p className="text-16 text-content-muted">{t('emptyCart')}</p>
        <Button asChild>
          <Link href="/products">{t('browse')}</Link>
        </Button>
      </div>
    );
  }

  const shippingMethods = shippingQuery.data?.eligibleShippingMethods ?? [];
  const paymentMethods = paymentQuery.data?.eligiblePaymentMethods ?? [];

  async function onSelectShipping(id: string) {
    setSelectedShipping(id);
    try {
      await setShippingMethod({ variables: { shippingMethodId: [id] } });
      await refetchCart();
    } catch {
      /* ignore; retried on submit */
    }
  }

  async function placeOrder() {
    setError(null);
    if (!ready) {
      setError(tErrors('addressFailed'));
      return;
    }
    if (!selectedPayment) return;
    setSubmitting(true);
    try {
      // Ensure address + shipping method are persisted before paying.
      await setShipping({ variables: { input: buildAddressInput() } });
      if (selectedShipping) await setShippingMethod({ variables: { shippingMethodId: [selectedShipping] } });

      const { data: stateData } = await transition({ variables: { state: 'ArrangingPayment' } });
      if (stateData?.transitionOrderToState?.__typename === 'OrderStateTransitionError') {
        throw new Error(stateData.transitionOrderToState.message || tErrors('transitionFailed'));
      }
      const { data } = await addPayment({ variables: { input: { method: selectedPayment, metadata: {} } } });
      const resp = data?.addPaymentToOrder;
      if (resp?.__typename === 'Order') {
        await refetchCart();
        router.push(`/checkout/confirmation/${resp.code}`);
        return;
      }
      throw new Error((resp as { message?: string })?.message ?? tErrors('paymentFailed'));
    } catch (err) {
      setError(err instanceof Error ? err.message : tErrors('paymentFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  const subtotal = cart.subTotal + cart.discounts.reduce((s, d) => s + Math.abs(d.amountWithTax), 0);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto grid max-w-[1392px] grid-cols-1 gap-10 lg:grid-cols-[430px_minmax(0,1fr)] lg:gap-[69px]">
        {/* Summary (left) */}
        <aside className="order-2 flex h-fit flex-col gap-6 lg:order-1 lg:sticky lg:top-6">
          <h2 className="text-right text-32 font-medium text-accent">{tSummary('orderSummary')}</h2>

          <div className="flex gap-2">
            <input className={cn(inputCls, 'flex-1')} placeholder={tSummary('discountCode')} aria-label={tSummary('discountCode')} />
            <button type="button" className="rounded-lg border border-border-strong bg-white px-4 text-16 font-medium text-content-strong">
              {tSummary('apply')}
            </button>
          </div>

          <div className="flex flex-col gap-3 text-20 font-medium text-accent">
            <div className="flex items-center justify-between gap-4">
              <span className="font-dm">{formatDzdTotal(subtotal * 100, locale)}</span>
              <span>{tSummary('totalCount', { count: cart.totalQuantity })}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-dm">
                {cart.shipping > 0 ? formatDzdTotal(cart.shipping * 100, locale) : tSummary('shippingTbd')}
              </span>
              <span>{tSummary('shippingFee')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-hairline pt-4 text-20 font-bold text-accent">
            <span className="font-dm">{formatDzdTotal(cart.total * 100, locale)}</span>
            <span>{tSummary('grandTotal')}</span>
          </div>

          <Button onClick={placeOrder} disabled={!selectedPayment} loading={submitting} fullWidth size="lg">
            {submitting ? tSummary('placing') : tSummary('placeOrder')}
          </Button>
        </aside>

        {/* Form (right) */}
        <div className="order-1 flex flex-col gap-6 lg:order-2">
          <Link href="/cart" className="flex items-center justify-end gap-2 text-24 font-medium text-accent">
            <span>{t('backToCart')}</span>
            <ArrowLeft className="size-6 rtl:rotate-180" strokeWidth={1.75} />
          </Link>

          {error && <Alert intent="danger">{error}</Alert>}
          {staleSession && (
            <Alert intent="warning" title={tErrors('staleSessionTitle')}>
              <div className="flex flex-col gap-3">
                <p>{tErrors('staleSessionBody')}</p>
                <Button intent="secondary" onClick={async () => { await logout(); router.push('/products'); }}>
                  {tErrors('staleSessionReset')}
                </Button>
              </div>
            </Alert>
          )}

          {/* 1. Shipping details */}
          <Section title={t('sectionShipping')}>
            {!isAuthenticated && (
              <Field label={tAddr('email')} required>
                <input
                  type="email"
                  className={inputCls}
                  value={addr.email}
                  onChange={(e) => setAddr((a) => ({ ...a, email: e.target.value }))}
                />
              </Field>
            )}
            <Field label={tAddr('fullName')} required>
              <input
                className={inputCls}
                placeholder={tAddr('fullNamePh')}
                value={addr.fullName}
                onChange={(e) => setAddr((a) => ({ ...a, fullName: e.target.value }))}
              />
            </Field>
            <Field label={tAddr('phone')} required>
              <input
                type="tel"
                className={inputCls}
                placeholder={tAddr('phonePh')}
                value={addr.phoneNumber}
                onChange={(e) => setAddr((a) => ({ ...a, phoneNumber: e.target.value }))}
              />
            </Field>
            <Field label={tAddr('phone2')}>
              <input
                type="tel"
                className={inputCls}
                placeholder={tAddr('phone2Ph')}
                value={addr.phone2}
                onChange={(e) => setAddr((a) => ({ ...a, phone2: e.target.value }))}
              />
            </Field>
            <div className="flex w-full flex-col gap-4 sm:flex-row">
              <Field label={tAddr('wilaya')} required>
                <div className="relative w-full">
                  <select
                    className={cn(inputCls, 'appearance-none pl-9')}
                    value={addr.wilayaCode}
                    onChange={(e) => setAddr((a) => ({ ...a, wilayaCode: e.target.value, communeCode: '' }))}
                  >
                    <option value="">{tAddr('selectWilaya')}</option>
                    {wilayas.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} — {name(w)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-content-subtle" />
                </div>
              </Field>
              <Field label={tAddr('commune')} required>
                <div className="relative w-full">
                  <select
                    className={cn(inputCls, 'appearance-none pl-9')}
                    value={addr.communeCode}
                    disabled={!selectedWilaya}
                    onChange={(e) => setAddr((a) => ({ ...a, communeCode: e.target.value }))}
                  >
                    <option value="">{tAddr('selectCommune')}</option>
                    {communes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {name(c)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-content-subtle" />
                </div>
              </Field>
            </div>
          </Section>

          {/* 2. Delivery method */}
          <Section title={t('sectionDelivery')}>
            {shippingMethods.length === 0 ? (
              <p className="text-right text-16 text-content-muted">{tShip('empty')}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {shippingMethods.map((m) => (
                  <ChoiceRow
                    key={m.id}
                    label={m.name}
                    price={formatDzdTotal(m.priceWithTax, locale)}
                    checked={selectedShipping === m.id}
                    onSelect={() => onSelectShipping(m.id)}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* 3. Payment method */}
          <Section title={t('sectionPayment')}>
            <div className="flex flex-col gap-3">
              {paymentMethods.map((m) => (
                <ChoiceRow
                  key={m.id}
                  label={m.name}
                  checked={selectedPayment === m.code}
                  disabled={!m.isEligible}
                  onSelect={() => setSelectedPayment(m.code)}
                />
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
