/**
 * Rules behind product returns (`registerReturn`), free of Vendure imports so
 * they can be unit-tested without a database.
 *
 * A return is recorded as a Vendure line cancellation on a shipped order: that
 * puts the units back in stock exactly once (a Cancellation stock movement) and
 * keeps the reason in the order history. The reason is stored as
 * "Retour — <label>[ — <details>]" so returns can be told apart from ordinary
 * cancellations and counted per reason in the reports.
 */

export const RETURN_REASONS = [
  { code: 'REFUSED', label: 'Refus à la livraison' },
  { code: 'SIZE', label: 'Taille ne convient pas' },
  { code: 'DEFECTIVE', label: 'Article défectueux' },
  { code: 'NOT_AS_DESCRIBED', label: 'Ne correspond pas à la description' },
  { code: 'CHANGED_MIND', label: "Le client a changé d'avis" },
  { code: 'OTHER', label: 'Autre' },
] as const;
export type ReturnReasonCode = (typeof RETURN_REASONS)[number]['code'];

export const RETURN_PREFIX = 'Retour — ';

/** Orders whose items have left the shop. */
export const RETURNABLE_STATES = ['PartiallyShipped', 'Shipped', 'PartiallyDelivered', 'Delivered'];

export function reasonLabel(code: string): string | null {
  return RETURN_REASONS.find(r => r.code === code)?.label ?? null;
}

/** Defective items should not go back on sale; everything else does by default. */
export function defaultRestock(code: string): boolean {
  return code !== 'DEFECTIVE';
}

/** The reason stored in the cancellation history entry, or null when invalid ("Autre" needs details). */
export function buildReturnReason(code: string, details?: string | null): string | null {
  const label = reasonLabel(code);
  if (!label) return null;
  const extra = (details ?? '').trim();
  if (code === 'OTHER') return extra ? `${RETURN_PREFIX}${extra}` : null;
  return `${RETURN_PREFIX}${label}${extra ? ` — ${extra}` : ''}`;
}

/** The reason label of a stored return reason (details dropped), or null when it is not a return. */
export function parseReturnReason(stored: string | null | undefined): string | null {
  if (!stored?.startsWith(RETURN_PREFIX)) return null;
  const rest = stored.slice(RETURN_PREFIX.length);
  const known = RETURN_REASONS.find(r => r.code !== 'OTHER' && (rest === r.label || rest.startsWith(`${r.label} — `)));
  return known ? known.label : 'Autre';
}

/**
 * Units of a line that can still be returned: shipped units minus those already
 * returned (Vendure's Cancellation movements are only created for shipped
 * units), never more than the line's current quantity.
 */
export function returnableQuantity(line: { quantity: number; fulfilled: number; returned: number }): number {
  return Math.max(0, Math.min(line.quantity, line.fulfilled - line.returned));
}

export interface ReturnLineInput {
  orderLineId: string;
  quantity: number;
}

/** French message explaining why the return is refused, or null. */
export function returnBlocker(
  state: string,
  requested: ReadonlyArray<ReturnLineInput>,
  returnable: ReadonlyMap<string, number>,
): string | null {
  if (!RETURNABLE_STATES.includes(state)) {
    return `Un retour n'est possible que pour une commande expédiée ou livrée (état actuel : ${state}).`;
  }
  const lines = requested.filter(l => l.quantity > 0);
  if (lines.length === 0) return 'Sélectionnez au moins un article à retourner.';
  for (const l of lines) {
    if (!Number.isInteger(l.quantity)) return 'Quantité invalide.';
    const max = returnable.get(String(l.orderLineId)) ?? 0;
    if (l.quantity > max) return `Quantité trop élevée pour un article (maximum retournable : ${max}).`;
  }
  return null;
}
