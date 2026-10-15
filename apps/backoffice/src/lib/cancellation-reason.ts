/**
 * Why an order was cancelled. Vendure's `cancelOrder` stores the reason only in
 * an ORDER_CANCELLATION history entry and never fills the `cancellationReason`
 * custom field. The field still wins when set; the history entry is the usual source.
 */

interface HistoryEntry {
  type: string;
  data?: unknown;
}

const clean = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);

/** `history` is expected newest first, as the order page queries it. */
export function cancellationReason(
  customField: string | null | undefined,
  history: HistoryEntry[] | null | undefined,
): string | null {
  const fromField = clean(customField);
  if (fromField) return fromField;
  const entry = (history ?? []).find((h) => h.type === 'ORDER_CANCELLATION');
  return clean((entry?.data as { reason?: unknown } | undefined)?.reason);
}
