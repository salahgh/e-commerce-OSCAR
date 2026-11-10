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

/**
 * Reasons staff pick from when cancelling. Free text used to be optional and
 * came back as dozens of spellings of "pas dispo"; a fixed list makes the
 * reports countable. The stored reason is the label, plus details when given.
 */
export const CANCELLATION_REASONS = [
  'Article ou taille non disponible',
  'Client injoignable',
  'Annulée à la demande du client',
  'Commande en double',
  'Faux numéro / commande non sérieuse',
  'Autre',
] as const;
export type CancellationReasonPreset = (typeof CANCELLATION_REASONS)[number];

/** The reason to send to `cancelOrder`, or null while the choice is incomplete ("Autre" needs details). */
export function buildCancellationReason(preset: string, details: string): string | null {
  if (!(CANCELLATION_REASONS as readonly string[]).includes(preset)) return null;
  const extra = details.trim();
  if (preset === 'Autre') return extra || null;
  return extra ? `${preset} — ${extra}` : preset;
}
