/**
 * Pure logic behind the variant chooser (order dialog: "Ajouter" and "Changer").
 * Turns a product's variants into one row of values per option group, the way
 * the storefront product page does, and tells for each value whether picking
 * it can lead to a sellable variant given what is already chosen.
 */
import { SIZE_ORDER, sortSizes } from '@oscar/shared';
import { availableStock } from './order-edits';

export interface MatrixOption {
  id: string;
  code: string;
  name: string;
  groupId: string;
}

export interface MatrixVariant {
  id: string;
  name: string;
  sku: string;
  enabled: boolean;
  priceWithTax: number;
  stockOnHand: number;
  stockAllocated: number;
  trackInventory: string;
  options: MatrixOption[];
}

export interface MatrixProduct {
  optionGroups: { id: string; code: string; name: string }[];
  variants: MatrixVariant[];
}

/** groupId → chosen option id */
export type Selection = Record<string, string>;

/**
 * - available: some sellable variant has this value and the other choices
 * - out-of-stock: matching variants exist and are enabled, but none has stock
 * - unavailable: no enabled variant has this value with the other choices
 */
export type OptionState = 'available' | 'out-of-stock' | 'unavailable';

export interface MatrixValue {
  id: string;
  code: string;
  name: string;
  state: OptionState;
}

export interface MatrixGroup {
  id: string;
  code: string;
  name: string;
  values: MatrixValue[];
}

export interface Matrix {
  groups: MatrixGroup[];
  /** The variant matching a complete selection, or null. */
  variant: MatrixVariant | null;
  /** Units left for `variant`; null when inventory is not tracked. */
  stock: number | null;
  sellable: boolean;
}

const isSellable = (v: MatrixVariant) => v.enabled && availableStock(v) !== 0;

const optionIn = (v: MatrixVariant, groupId: string) => v.options.find((o) => o.groupId === groupId)?.id;

/** Variants compatible with every chosen option except `ignoreGroup`'s. */
function compatible(variants: MatrixVariant[], selection: Selection, ignoreGroup?: string) {
  return variants.filter((v) =>
    Object.entries(selection).every(([groupId, optionId]) => groupId === ignoreGroup || optionIn(v, groupId) === optionId),
  );
}

const isSizeName = (name: string) => SIZE_ORDER.includes(name.trim().toUpperCase()) || !Number.isNaN(parseFloat(name));

/** Sizes (letters or numbers) are sorted; anything else (colours...) keeps the catalogue order. */
function sortValues(values: MatrixValue[]): MatrixValue[] {
  if (!values.every((v) => isSizeName(v.name))) return values;
  const byName = new Map(values.map((v) => [v.name, v]));
  return sortSizes(values.map((v) => v.name)).map((n) => byName.get(n)!);
}

export function buildMatrix(product: MatrixProduct, selection: Selection): Matrix {
  const groups: MatrixGroup[] = product.optionGroups.map((g) => {
    const seen = new Map<string, MatrixOption>();
    for (const variant of product.variants) {
      const option = variant.options.find((o) => o.groupId === g.id);
      if (option && !seen.has(option.id)) seen.set(option.id, option);
    }
    const others = compatible(product.variants, selection, g.id);
    const values = [...seen.values()].map((o): MatrixValue => {
      const withIt = others.filter((v) => optionIn(v, g.id) === o.id && v.enabled);
      const state: OptionState = withIt.some(isSellable) ? 'available' : withIt.length ? 'out-of-stock' : 'unavailable';
      return { id: o.id, code: o.code, name: o.name, state };
    });
    // catalogue names like "Taille.." read badly in "Choisissez : taille.."
    return { id: g.id, code: g.code, name: g.name.replace(/[.\s]+$/, ''), values: sortValues(values) };
  });

  const complete = groups.every((g) => selection[g.id]);
  const variant = complete ? (compatible(product.variants, selection)[0] ?? null) : null;
  const stock = variant ? availableStock(variant) : null;
  return { groups, variant, stock, sellable: !!variant && isSellable(variant) };
}

/** Selection to open the chooser with: a given variant's options, else every single-value group. */
export function initialSelection(product: MatrixProduct, variantId?: string): Selection {
  if (variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return {};
    return Object.fromEntries(variant.options.map((o) => [o.groupId, o.id]));
  }
  const selection: Selection = {};
  for (const g of product.optionGroups) {
    const ids = new Set(product.variants.map((v) => optionIn(v, g.id)).filter(Boolean));
    if (ids.size === 1) selection[g.id] = [...ids][0]!;
  }
  return selection;
}

/**
 * Selection after clicking `optionId` in `groupId`. Clicking the chosen value
 * clears it. Other choices stay only if an enabled variant still has them
 * all; otherwise they are dropped, so staff never end up on a combination
 * that does not exist or is switched off.
 */
export function choose(product: MatrixProduct, selection: Selection, groupId: string, optionId: string): Selection {
  if (selection[groupId] === optionId) {
    const { [groupId]: _removed, ...rest } = selection;
    return rest;
  }
  const next = { ...selection, [groupId]: optionId };
  const stillPossible = compatible(product.variants, next).some((v) => v.enabled);
  return stillPossible ? next : { [groupId]: optionId };
}
