import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { ImageOff, Minus, Plus } from 'lucide-react';
import { AdminProductForOrderDocument } from '../../graphql/generated/graphql';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice, cn } from '../../lib/utils';
import { getColorHex, getContrastColor } from '../../lib/colors';
import { buildMatrix, choose, initialSelection, type MatrixProduct, type MatrixValue, type Selection } from '../../lib/variant-matrix';
import type { VariantPick } from '../../lib/order-edits';

// ──────────────────────────────────────────────────────────────────────────
// Variant chooser shared by "Ajouter un produit" and "Changer": one row per
// option group (colour swatches, size buttons), like the storefront product
// page. Each value shows whether it can still lead to a sellable variant
// (src/lib/variant-matrix.ts); the confirm button waits for one.
// ──────────────────────────────────────────────────────────────────────────

interface VariantChooserProps {
  productId: string;
  /** Pre-select this variant's options ("Changer"). */
  initialVariantId?: string;
  /** Marked "actuel" and not confirmable: the line already has it. */
  currentVariantId?: string;
  initialQuantity?: number;
  /** Hide the quantity stepper (a swap keeps the line's quantity). */
  hideQuantity?: boolean;
  confirmLabel: string;
  onConfirm: (variant: VariantPick, quantity: number) => void;
}

const thumb = (preview: string) => `${preview}${preview.includes('?') ? '&' : '?'}preset=small`;

const isColourGroup = (code: string, name: string) => /colou?r|couleur|لون/i.test(`${code} ${name}`);

const stateTitle: Record<MatrixValue['state'], string> = {
  available: '',
  'out-of-stock': 'Rupture de stock',
  unavailable: "N'existe pas avec ce choix",
};

const OptionButton: React.FC<{ value: MatrixValue; colour: boolean; selected: boolean; onClick: () => void }> = ({
  value,
  colour,
  selected,
  onClick,
}) => {
  const hex = colour ? getColorHex(value.name) : null;
  const dimmed = value.state !== 'available';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={value.state === 'unavailable'}
      title={stateTitle[value.state] || value.name}
      aria-pressed={selected}
      aria-label={`${value.name}${value.state === 'available' ? '' : ` (${stateTitle[value.state]})`}`}
      className={cn(
        'relative inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
        selected ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary' : 'border-border text-foreground hover:border-muted-foreground',
        dimmed && !selected && 'opacity-50',
        value.state === 'unavailable' && 'cursor-not-allowed',
      )}
    >
      {hex && (
        <span
          className="h-5 w-5 rounded-full border border-border shrink-0 flex items-center justify-center text-[10px]"
          style={{ backgroundColor: hex, color: getContrastColor(hex) }}
        />
      )}
      <span className={cn(value.state === 'out-of-stock' && 'line-through')}>{value.name}</span>
    </button>
  );
};

export const VariantChooser: React.FC<VariantChooserProps> = ({
  productId,
  initialVariantId,
  currentVariantId,
  initialQuantity = 1,
  hideQuantity,
  confirmLabel,
  onConfirm,
}) => {
  // Always refetch: stock changes with every sale and staff quote it to customers.
  const { data, loading, error } = useQuery(AdminProductForOrderDocument, {
    variables: { id: productId },
    fetchPolicy: 'cache-and-network',
  });
  const product = data?.product;

  const matrixProduct: MatrixProduct | null = useMemo(
    () =>
      product
        ? {
            optionGroups: product.optionGroups.map((g) => ({ id: g.id, code: g.code, name: g.name })),
            variants: product.variants.map((v) => ({
              id: v.id,
              name: v.name,
              sku: v.sku,
              enabled: v.enabled,
              priceWithTax: v.priceWithTax,
              stockOnHand: v.stockOnHand,
              stockAllocated: v.stockAllocated,
              trackInventory: v.trackInventory,
              options: v.options.map((o) => ({ id: o.id, code: o.code, name: o.name, groupId: o.groupId })),
            })),
          }
        : null,
    [product],
  );

  const [selection, setSelection] = useState<Selection>({});
  const [quantity, setQuantity] = useState(initialQuantity);
  // Initialise once per product: the background refetch must not wipe what staff picked.
  const [initialisedFor, setInitialisedFor] = useState<string | null>(null);

  useEffect(() => {
    const key = `${productId}:${initialVariantId ?? ''}`;
    if (matrixProduct && initialisedFor !== key) {
      setSelection(initialSelection(matrixProduct, initialVariantId));
      setInitialisedFor(key);
    }
  }, [matrixProduct, productId, initialVariantId, initialisedFor]);

  if (loading && !product) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }
  if (error || !product || !matrixProduct) {
    return <p className="py-6 text-sm text-red-400">Impossible de charger ce produit.</p>;
  }

  const matrix = buildMatrix(matrixProduct, selection);
  const variant = matrix.variant;
  const fullVariant = variant ? product.variants.find((v) => v.id === variant.id) : undefined;
  const image = fullVariant?.featuredAsset?.preview || product.featuredAsset?.preview;
  const isCurrent = !!variant && variant.id === currentVariantId;
  const missing = matrix.groups.filter((g) => !selection[g.id]).map((g) => g.name.toLowerCase());
  const prices = product.variants.filter((v) => v.enabled).map((v) => v.priceWithTax);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const canConfirm = matrix.sellable && !isCurrent && quantity > 0 && (matrix.stock === null || quantity <= matrix.stock);

  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {image ? (
            <img src={thumb(image)} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-foreground">{product.name}</p>
          <p className="text-sm text-muted-foreground">
            {variant
              ? formatPrice(variant.priceWithTax / 100)
              : minPrice === maxPrice
                ? formatPrice(minPrice / 100)
                : `${formatPrice(minPrice / 100)} – ${formatPrice(maxPrice / 100)}`}
          </p>
        </div>
      </div>

      {matrix.groups.map((group) => {
        const chosen = group.values.find((v) => v.id === selection[group.id]);
        return (
          <div key={group.id}>
            <p className="mb-2 text-sm text-muted-foreground">
              {group.name}
              {chosen && <span className="ml-2 font-medium text-foreground">{chosen.name}</span>}
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={group.name}>
              {group.values.map((value) => (
                <OptionButton
                  key={value.id}
                  value={value}
                  colour={isColourGroup(group.code, group.name)}
                  selected={selection[group.id] === value.id}
                  onClick={() => setSelection(choose(matrixProduct, selection, group.id, value.id))}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div className="rounded-lg border border-border bg-background/50 p-3 text-sm">
        {variant ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-foreground">
                {variant.name}
                {isCurrent && <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">actuel</span>}
              </p>
              <p className="text-xs text-muted-foreground">{variant.sku}</p>
            </div>
            <span
              className={cn(
                'text-sm font-medium',
                !variant.enabled ? 'text-muted-foreground' : matrix.stock === 0 ? 'text-red-400' : 'text-green-400',
              )}
            >
              {!variant.enabled
                ? 'Désactivé'
                : matrix.stock === null
                  ? 'Stock illimité'
                  : matrix.stock === 0
                    ? 'Rupture de stock'
                    : `Stock : ${matrix.stock}`}
            </span>
          </div>
        ) : missing.length ? (
          <p className="text-muted-foreground">Choisissez : {missing.join(', ')}</p>
        ) : (
          <p className="text-muted-foreground">Cette combinaison n'existe pas.</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {!hideQuantity ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Quantité</span>
            <div className="flex items-center rounded-lg border border-border">
              <button
                type="button"
                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Diminuer la quantité"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-foreground" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={matrix.stock !== null && quantity >= matrix.stock}
                aria-label="Augmenter la quantité"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <span />
        )}
        <Button
          disabled={!canConfirm}
          onClick={() =>
            variant &&
            onConfirm(
              {
                id: variant.id,
                // shop variant names are often just "Gris / 38"
                name: variant.name.includes(product.name) ? variant.name : `${product.name} – ${variant.name}`,
                sku: variant.sku,
                product: { id: product.id },
              },
              quantity,
            )
          }
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
};
