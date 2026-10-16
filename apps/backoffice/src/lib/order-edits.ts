/**
 * Pure logic behind the "Modifier la commande" dialog: turns what staff did
 * (changed quantities, swapped a line for another variant, added products)
 * into one `ModifyOrderInput` for `modifyOrderGuided`, so a swap is never
 * half-applied. Vendure would merge a re-added variant into its existing
 * line anyway; doing it here keeps the preview equal to what gets applied.
 */

export interface VariantPick {
  id: string;
  name?: string | null;
  sku?: string | null;
  product?: { id: string; name?: string | null } | null;
}

export interface EditableLine {
  id: string;
  quantity: number;
  productVariant?: VariantPick | null;
}

export interface Addition {
  variant: VariantPick;
  quantity: number;
}

export interface OrderEdits {
  /** Quantity typed for an existing line, by line id (absent = unchanged). */
  quantities: Record<string, number>;
  /** Replacement variant for an existing line, by line id. */
  swaps: Record<string, VariantPick>;
  additions: Addition[];
}

export interface ModificationLines {
  adjustOrderLines?: { orderLineId: string; quantity: number }[];
  addItems?: { productVariantId: string; quantity: number }[];
}

export const emptyEdits = (): OrderEdits => ({ quantities: {}, swaps: {}, additions: [] });

const clampQty = (q: number | undefined, fallback: number) =>
  Number.isFinite(q) ? Math.max(0, Math.trunc(q as number)) : fallback;

/** "Basket – Gris / 38": shop variant names are often only the options. */
export function lineLabel(line: EditableLine): string {
  const v = line.productVariant;
  const name = v?.name || v?.sku;
  if (!name) return `Ligne ${line.id}`;
  const product = v?.product?.name;
  return product && !name.includes(product) ? `${product} – ${name}` : name;
}
const variantLabel = (v: VariantPick) => v.name || v.sku || v.id;

export function buildModification(lines: EditableLine[], edits: OrderEdits): ModificationLines | null {
  // final quantity of every existing line
  const finalQty = new Map<string, number>();
  for (const line of lines) {
    finalQty.set(line.id, edits.swaps[line.id] ? 0 : clampQty(edits.quantities[line.id], line.quantity));
  }

  // lines that keep their variant, so an added variant can merge into them
  const lineOfVariant = new Map<string, EditableLine>();
  for (const line of lines) {
    if (!edits.swaps[line.id] && line.productVariant?.id) lineOfVariant.set(line.productVariant.id, line);
  }

  const toAdd = new Map<string, number>();
  const add = (variant: VariantPick, quantity: number) => {
    if (quantity <= 0) return;
    const existing = lineOfVariant.get(variant.id);
    if (existing) finalQty.set(existing.id, (finalQty.get(existing.id) ?? 0) + quantity);
    else toAdd.set(variant.id, (toAdd.get(variant.id) ?? 0) + quantity);
  };

  for (const line of lines) {
    const swap = edits.swaps[line.id];
    if (swap) add(swap, clampQty(edits.quantities[line.id], line.quantity));
  }
  for (const a of edits.additions) add(a.variant, clampQty(a.quantity, 0));

  const adjustOrderLines = lines
    .filter((l) => finalQty.get(l.id) !== l.quantity)
    .map((l) => ({ orderLineId: l.id, quantity: finalQty.get(l.id)! }));
  const addItems = [...toAdd].map(([productVariantId, quantity]) => ({ productVariantId, quantity }));

  if (adjustOrderLines.length === 0 && addItems.length === 0) return null;
  return {
    adjustOrderLines: adjustOrderLines.length ? adjustOrderLines : undefined,
    addItems: addItems.length ? addItems : undefined,
  };
}

/** Default history note, e.g. "Pantalon M → Pantalon L ; Chemise retiré ; + 2 × Veste". */
export function describeEdits(lines: EditableLine[], edits: OrderEdits): string {
  const parts: string[] = [];
  for (const line of lines) {
    const swap = edits.swaps[line.id];
    if (swap) {
      parts.push(`${lineLabel(line)} → ${variantLabel(swap)}`);
      continue;
    }
    const qty = clampQty(edits.quantities[line.id], line.quantity);
    if (qty === line.quantity) continue;
    parts.push(qty === 0 ? `${lineLabel(line)} retiré` : `${lineLabel(line)} : ${line.quantity} → ${qty}`);
  }
  for (const a of edits.additions) {
    const qty = clampQty(a.quantity, 0);
    if (qty > 0) parts.push(`+ ${qty} × ${variantLabel(a.variant)}`);
  }
  return parts.join(' ; ');
}

export interface StockLike {
  trackInventory: string;
  stockOnHand: number;
  stockAllocated: number;
}

/** Units that can still be sold; `null` when the variant does not track inventory. */
export function availableStock(v: StockLike): number | null {
  // INHERIT follows the global setting, which is "tracked" in this shop.
  if (v.trackInventory === 'FALSE') return null;
  return Math.max(0, v.stockOnHand - v.stockAllocated);
}
