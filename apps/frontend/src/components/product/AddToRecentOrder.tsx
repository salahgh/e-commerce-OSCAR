'use client';

import { useTranslations } from 'next-intl';
import { PackagePlus } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { isFinalExtendError, minutesLeft } from '@/lib/checkout/recent-order';
import { useRecentOrder, type ExtendItem, type ExtendOutcome } from '@/lib/checkout/use-recent-order';

/** Toast for a failed extension; shared by the product page and checkout. */
export function extendErrorMessage(
  t: (key: 'insufficientStock' | 'closed' | 'failed') => string,
  outcome: Extract<ExtendOutcome, { ok: false }>,
): string {
  if (outcome.errorCode === 'INSUFFICIENT_STOCK_ERROR') return t('insufficientStock');
  if (isFinalExtendError(outcome.errorCode)) return t('closed');
  return outcome.message || t('failed');
}

/**
 * Product page offer shown for 30 minutes after checkout: add the selected
 * variant to the order just placed instead of starting a second order.
 * `getItem` validates the selection (and toasts) and returns null if incomplete.
 */
export function AddToRecentOrder({ getItem }: { getItem: () => ExtendItem | null }) {
  const t = useTranslations('RecentOrder');
  const toast = useToast();
  const { recent, adding, addItems } = useRecentOrder();
  if (!recent) return null;

  async function onAdd() {
    const item = getItem();
    if (!item) return;
    const outcome = await addItems([item]);
    if (!outcome) return toast.error(t('closed'));
    if (outcome.ok) toast.success(t('added', { code: outcome.code }));
    else toast.error(extendErrorMessage(t, outcome));
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-accent/40 bg-accent/5 p-4">
      <p className="flex items-start gap-2 text-14 text-content-strong">
        <PackagePlus className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
        <span>{t('banner', { code: recent.code, minutes: minutesLeft(recent) })}</span>
      </p>
      <button
        type="button"
        onClick={onAdd}
        disabled={adding}
        aria-busy={adding || undefined}
        className="flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2 text-18 font-medium text-content-inverse disabled:opacity-60"
      >
        {t('addToOrder')}
      </button>
    </div>
  );
}
