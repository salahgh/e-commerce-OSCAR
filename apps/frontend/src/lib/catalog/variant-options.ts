// Pure helpers behind the product page's variant picker. Vendure products carry
// arbitrary option groups and the catalogue spells them many ways ("Pointure",
// "Pointeurs", "Taille", "Tailles", "Taille.", "Marque" ...), so the page must
// render every group it finds instead of looking only for "taille" / "couleur".
import { sortSizes } from '@oscar/shared/facet-utils';

export type OptionLike = { code: string; name: string; group: { code: string; name: string } };
export type VariantLike = { options: OptionLike[] };

export type OptionGroupKind = 'size' | 'color' | 'other';

export type OptionGroupView = {
  code: string;
  name: string;
  kind: OptionGroupKind;
  values: Array<{ code: string; name: string }>;
};

/** Selected option code per option-group code. */
export type OptionSelections = Record<string, string | undefined>;

const SIZE_RE = /taille|size|pointure|pointeur|مقاس/i;
const COLOR_RE = /couleur|color|لون/i;

export function isSizeGroup(g: { code: string; name: string }): boolean {
  return SIZE_RE.test(g.code) || SIZE_RE.test(g.name);
}

export function isColorGroup(g: { code: string; name: string }): boolean {
  return COLOR_RE.test(g.code) || COLOR_RE.test(g.name);
}

function kindOf(g: { code: string; name: string }): OptionGroupKind {
  if (isSizeGroup(g)) return 'size';
  if (isColorGroup(g)) return 'color';
  return 'other';
}

const KIND_ORDER: Record<OptionGroupKind, number> = { size: 0, color: 1, other: 2 };

/** Every option group the variants use, sizes first, each size list in wearable order. */
export function optionGroupsOf(variants: VariantLike[]): OptionGroupView[] {
  const groups = new Map<string, OptionGroupView & { seen: Map<string, { code: string; name: string }> }>();
  for (const v of variants) {
    for (const o of v.options) {
      let g = groups.get(o.group.code);
      if (!g) {
        g = { code: o.group.code, name: o.group.name, kind: kindOf(o.group), values: [], seen: new Map() };
        groups.set(o.group.code, g);
      }
      if (!g.seen.has(o.code)) g.seen.set(o.code, { code: o.code, name: o.name });
    }
  }
  return Array.from(groups.values())
    .map(({ seen, ...g }) => {
      const values = Array.from(seen.values());
      if (g.kind === 'size') {
        const order = sortSizes(values.map((v) => v.name));
        values.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
      }
      return { ...g, values };
    })
    .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
}

/** Groups offering a single value need no choice: they start selected. */
export function initialSelections(groups: OptionGroupView[]): OptionSelections {
  const out: OptionSelections = {};
  for (const g of groups) if (g.values.length === 1) out[g.code] = g.values[0].code;
  return out;
}

/** The first group the shopper still has to choose from, if any. */
export function missingGroup(groups: OptionGroupView[], selections: OptionSelections): OptionGroupView | undefined {
  return groups.find((g) => !selections[g.code]);
}

/** First variant consistent with every choice made so far (unchosen groups match anything). */
export function matchVariant<V extends VariantLike>(variants: V[], selections: OptionSelections): V | undefined {
  return variants.find((v) =>
    v.options.every((o) => {
      const chosen = selections[o.group.code];
      return chosen === undefined || chosen === o.code;
    }),
  );
}

/** Distinct size names across products (clothing sizes then numeric pointures), for the listing filter. */
export function sizeNamesOf(products: Array<{ variants: VariantLike[] }>): string[] {
  const names = new Set<string>();
  for (const p of products) {
    for (const v of p.variants) {
      for (const o of v.options) if (isSizeGroup(o.group)) names.add(o.name);
    }
  }
  return sortSizes(Array.from(names));
}
