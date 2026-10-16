import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Plus, Repeat, Trash2, Undo2, X } from 'lucide-react';
import { AddNoteToOrderDocument, ModifyOrderGuidedDocument } from '../../graphql/generated/graphql';
import { Modal, ModalContent, ModalFooter } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { formatPrice } from '../../lib/utils';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import {
  buildModification,
  describeEdits,
  emptyEdits,
  lineLabel,
  type EditableLine,
  type OrderEdits,
  type VariantPick,
} from '../../lib/order-edits';
import { ProductPickerDialog } from './ProductPickerDialog';
import { VariantChooser } from './VariantChooser';

// ──────────────────────────────────────────────────────────────────────────
// Modify order dialog — modifyOrderGuided (Oscar plugin)
//
// Vendure's raw modifyOrder needs the order moved into "Modifying" first and the
// price difference settled by the caller; the plugin mutation does all of that
// in one transaction. Flow here: change quantities, swap a line for another
// variant of the same product ("Changer" → VariantChooser dialog), add products
// ("Ajouter un produit" → ProductPickerDialog), add a surcharge → "Aperçu" (dry
// run, nothing saved, shows the new lines and total) → "Appliquer". Everything
// goes out as ONE modification (src/lib/order-edits.ts), so a swap can never
// end up half-applied.
// ──────────────────────────────────────────────────────────────────────────

interface ModifyOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderState: string;
  currentTotalWithTax: number;
  currentShippingWithTax: number;
  lines: EditableLine[];
  onSuccess: () => void;
}

interface ModificationPreview {
  totalWithTax: number;
  subTotalWithTax: number;
  shippingWithTax: number;
  lines: Array<{ id: string; name: string; quantity: number; linePriceWithTax: number }>;
}

const variantLabel = (v: VariantPick) => v.name || v.sku || v.id;

export const ModifyOrderDialog: React.FC<ModifyOrderDialogProps> = ({
  isOpen,
  onClose,
  orderId,
  orderState,
  currentTotalWithTax,
  currentShippingWithTax,
  lines,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [edits, setEdits] = useState<OrderEdits>(emptyEdits);
  const [swapFor, setSwapFor] = useState<EditableLine | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [surchargeDescription, setSurchargeDescription] = useState('');
  const [surchargeAmount, setSurchargeAmount] = useState('');
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState<ModificationPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEdits(emptyEdits());
      setSwapFor(null);
      setPickerOpen(false);
      setSurchargeDescription('');
      setSurchargeAmount('');
      setNote('');
      setPreview(null);
    }
  }, [isOpen]);

  // no-cache: a dry-run result is an Order with the real id, and Apollo would
  // otherwise merge the previewed lines/total into the cached order behind
  // the dialog as if they had been applied.
  const [modify] = useMutation(ModifyOrderGuidedDocument, { fetchPolicy: 'no-cache' });
  // Vendure keeps the modification note on the OrderModification record, which the
  // history tab does not show; a plain order note makes the reason visible there.
  const [addNote] = useMutation(AddNoteToOrderDocument);

  const update = (next: Partial<OrderEdits>) => {
    setEdits((prev) => ({ ...prev, ...next }));
    setPreview(null);
  };
  const setQuantity = (lineId: string, quantity: number) =>
    update({ quantities: { ...edits.quantities, [lineId]: quantity } });
  const setSwap = (lineId: string, variant: VariantPick | null) => {
    const swaps = { ...edits.swaps };
    if (variant) swaps[lineId] = variant;
    else delete swaps[lineId];
    update({ swaps });
    setSwapFor(null);
  };
  const addVariant = (variant: VariantPick, quantity: number) =>
    update({ additions: [...edits.additions, { variant, quantity }] });
  const setAdditionQuantity = (index: number, quantity: number) =>
    update({ additions: edits.additions.map((a, i) => (i === index ? { ...a, quantity } : a)) });
  const removeAddition = (index: number) => update({ additions: edits.additions.filter((_, i) => i !== index) });

  const buildInput = (dryRun: boolean) => {
    const modification = buildModification(lines, edits);
    const surchargeNum = Number(surchargeAmount.replace(',', '.'));
    const surcharges =
      surchargeDescription.trim() && Number.isFinite(surchargeNum) && surchargeNum !== 0
        ? [
            {
              description: surchargeDescription.trim(),
              sku: '',
              price: Math.round(surchargeNum * 100),
              priceIncludesTax: true,
              taxRate: 0,
              taxDescription: '',
            },
          ]
        : undefined;
    if (!modification && !surcharges) return null;
    return {
      orderId,
      dryRun,
      ...modification,
      surcharges,
      note: note.trim() || describeEdits(lines, edits) || undefined,
    };
  };

  const run = async (dryRun: boolean) => {
    const input = buildInput(dryRun);
    if (!input) {
      dispatch(addToast({ message: 'Aucune modification à appliquer', type: 'error' }));
      return;
    }
    const setBusy = dryRun ? setPreviewing : setApplying;
    setBusy(true);
    try {
      const result = await modify({ variables: { input } });
      const response = result.data?.modifyOrderGuided;
      if (!response) {
        dispatch(addToast({ message: 'Réponse vide du serveur', type: 'error' }));
        return;
      }
      if (response.__typename !== 'Order') {
        const message =
          'message' in response && response.message
            ? ERROR_MESSAGES[(response as any).errorCode] || response.message
            : 'Modification refusée';
        dispatch(addToast({ message, type: 'error' }));
        return;
      }
      if (dryRun) {
        setPreview({
          totalWithTax: response.totalWithTax,
          subTotalWithTax: response.subTotalWithTax,
          shippingWithTax: response.shippingWithTax,
          // a removed line comes back with quantity 0
          lines: response.lines
            .filter((l) => l.quantity > 0)
            .map((l) => ({
              id: l.id,
              name: lineLabel(l),
              quantity: l.quantity,
              linePriceWithTax: l.linePriceWithTax,
            })),
        });
        return;
      }
      const delta = response.totalWithTax - currentTotalWithTax;
      const suffix =
        response.state === 'ArrangingAdditionalPayment'
          ? ' — paiement additionnel à enregistrer'
          : delta > 0 && orderState === 'PaymentAuthorized'
            ? ' — montant à encaisser mis à jour'
            : '';
      if (input.note) {
        try {
          await addNote({ variables: { input: { id: orderId, note: `Commande modifiée : ${input.note}`, isPublic: false } } });
        } catch {
          // the modification itself went through; the note is a convenience
        }
      }
      dispatch(addToast({ message: `Commande modifiée${suffix}`, type: 'success' }));
      onSuccess();
      onClose();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const delta = preview ? preview.totalWithTax - currentTotalWithTax : 0;
  const shippingChanged = preview ? preview.shippingWithTax !== currentShippingWithTax : false;
  const isCod = orderState === 'PaymentAuthorized';
  const summary = describeEdits(lines, edits);

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier la commande" size="lg">
      <ModalContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Lignes de commande</p>
          <div className="space-y-2">
            {lines.map((line) => {
              const swap = edits.swaps[line.id];
              const qty = edits.quantities[line.id] ?? line.quantity;
              const removed = !swap && qty === 0;
              const label = lineLabel(line);
              const productId = line.productVariant?.product?.id;
              return (
                <div key={line.id} className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {swap ? (
                        <p className="text-foreground truncate">
                          <span className="line-through text-muted-foreground">{label}</span>
                          <span className="mx-2 text-muted-foreground">→</span>
                          <span className="font-medium">{variantLabel(swap)}</span>
                        </p>
                      ) : (
                        <p className={`font-medium truncate ${removed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {label}
                          {removed && <span className="ml-2 text-xs font-normal no-underline">retiré</span>}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">{swap ? swap.sku : line.productVariant?.sku}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Qté</span>
                      <Input
                        type="number"
                        min={0}
                        value={qty}
                        onChange={(e) => setQuantity(line.id, Number(e.target.value))}
                        className="w-20 bg-background border-border"
                        aria-label={`Quantité ${label}`}
                      />
                      {swap ? (
                        <Button variant="ghost" size="sm" onClick={() => setSwap(line.id, null)} title="Annuler le remplacement">
                          <Undo2 className="h-4 w-4 mr-1" />
                          Annuler
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!productId}
                          onClick={() => setSwapFor(line)}
                          title="Remplacer par une autre taille ou couleur"
                        >
                          <Repeat className="h-4 w-4 mr-1" />
                          Changer
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => (removed ? setQuantity(line.id, line.quantity) : setQuantity(line.id, 0))}
                        title={removed ? 'Rétablir la ligne' : 'Retirer la ligne'}
                        aria-label={removed ? `Rétablir ${label}` : `Retirer ${label}`}
                      >
                        {removed ? <Undo2 className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-red-400" />}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Produits ajoutés</p>
            <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter un produit
            </Button>
          </div>
          {edits.additions.length === 0 && <p className="text-sm text-muted-foreground">Aucun.</p>}
          {edits.additions.length > 0 && (
            <div className="space-y-2 mb-3">
              {edits.additions.map((a, index) => (
                <div
                  key={`${a.variant.id}-${index}`}
                  className="flex items-center justify-between gap-3 p-3 bg-background/50 rounded-lg border border-green-800/40"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">
                      <Plus className="inline h-4 w-4 mr-1 text-green-400" />
                      {variantLabel(a.variant)}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.variant.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Qté</span>
                    <Input
                      type="number"
                      min={1}
                      value={a.quantity}
                      onChange={(e) => setAdditionQuantity(index, Number(e.target.value))}
                      className="w-20 bg-background border-border"
                      aria-label={`Quantité ${variantLabel(a.variant)}`}
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeAddition(index)} title="Ne pas ajouter" aria-label={`Ne pas ajouter ${variantLabel(a.variant)}`}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Description du surcoût (optionnel)
            </label>
            <Input
              value={surchargeDescription}
              onChange={(e) => {
                setSurchargeDescription(e.target.value);
                setPreview(null);
              }}
              placeholder="Frais de livraison express, remise commerciale, ..."
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Montant (DA, négatif = remise)
            </label>
            <Input
              type="number"
              step="0.01"
              value={surchargeAmount}
              onChange={(e) => {
                setSurchargeAmount(e.target.value);
                setPreview(null);
              }}
              className="bg-background border-border"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Raison (note d'historique)
          </label>
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={summary || 'Demande du client par téléphone, ...'}
            className="bg-background border-border"
          />
          {summary && !note.trim() && (
            <p className="mt-1 text-xs text-muted-foreground">Sans texte, la note sera : « {summary} »</p>
          )}
        </div>

        {preview && (
          <div className="rounded-lg border border-border bg-background/50 p-4 space-y-1 text-sm">
            <p className="text-xs font-medium text-muted-foreground mb-2">Après modification</p>
            {preview.lines.map((l) => (
              <div key={l.id} className="flex justify-between text-foreground">
                <span className="truncate">
                  {l.quantity} × {l.name}
                </span>
                <span>{formatPrice(l.linePriceWithTax / 100)}</span>
              </div>
            ))}
            {preview.lines.length === 0 && <p className="text-muted-foreground">Aucune ligne.</p>}
            <div className="flex justify-between text-muted-foreground border-t border-border pt-2 mt-2">
              <span>Total actuel</span>
              <span>{formatPrice(currentTotalWithTax / 100)}</span>
            </div>
            <div className={`flex justify-between ${shippingChanged ? 'text-amber-400' : 'text-muted-foreground'}`}>
              <span>Livraison{shippingChanged ? ' (recalculée)' : ''}</span>
              <span>
                {shippingChanged && (
                  <span className="line-through text-muted-foreground mr-2">{formatPrice(currentShippingWithTax / 100)}</span>
                )}
                {preview.shippingWithTax === 0 && shippingChanged ? 'Offerte' : formatPrice(preview.shippingWithTax / 100)}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-foreground">
              <span>Nouveau total</span>
              <span>{formatPrice(preview.totalWithTax / 100)}</span>
            </div>
            <div
              className={`flex justify-between ${
                delta > 0 ? 'text-amber-400' : delta < 0 ? 'text-green-400' : 'text-muted-foreground'
              }`}
            >
              <span>Différence</span>
              <span>
                {delta > 0 ? '+' : ''}
                {formatPrice(delta / 100)}
              </span>
            </div>
            <p className="pt-2 text-xs text-muted-foreground">
              {delta === 0
                ? 'Le total ne change pas.'
                : isCod
                  ? delta > 0
                    ? 'Paiement à la livraison : le livreur encaissera le nouveau total.'
                    : 'Paiement à la livraison : le livreur encaissera le nouveau total (un avoir est enregistré sur le paiement).'
                  : delta > 0
                    ? 'Commande déjà payée : elle passera en « Paiement additionnel » jusqu\'à l\'enregistrement du complément.'
                    : 'Commande déjà payée : un remboursement de la différence est enregistré.'}
            </p>
          </div>
        )}
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Fermer
        </Button>
        <Button variant="outline" onClick={() => run(true)} loading={previewing}>
          Aperçu
        </Button>
        <PermissionGate permission="UpdateOrder" disableMode>
          <Button onClick={() => run(false)} loading={applying} disabled={!preview}>
            Appliquer
          </Button>
        </PermissionGate>
      </ModalFooter>
    </Modal>

    <ProductPickerDialog isOpen={isOpen && pickerOpen} onClose={() => setPickerOpen(false)} onPick={addVariant} />

    <Modal
      isOpen={isOpen && !!swapFor}
      onClose={() => setSwapFor(null)}
      title={swapFor ? `Changer : ${lineLabel(swapFor)}` : 'Changer'}
      size="md"
    >
      <ModalContent>
        {swapFor?.productVariant?.product?.id && (
          <VariantChooser
            productId={swapFor.productVariant.product.id}
            initialVariantId={swapFor.productVariant.id}
            currentVariantId={swapFor.productVariant.id}
            hideQuantity
            confirmLabel="Remplacer"
            onConfirm={(variant) => setSwap(swapFor.id, variant)}
          />
        )}
      </ModalContent>
    </Modal>
    </>
  );
};

const ERROR_MESSAGES: Record<string, string> = {
  ORDER_MODIFICATION_STATE_ERROR: 'Cette commande ne peut plus être modifiée (déjà expédiée ou annulée).',
  NO_CHANGES_SPECIFIED_ERROR: 'Aucune modification à appliquer.',
  INSUFFICIENT_STOCK_ERROR: 'Stock insuffisant pour cette quantité.',
  NEGATIVE_QUANTITY_ERROR: 'La quantité ne peut pas être négative.',
  REFUND_PAYMENT_ID_MISSING_ERROR: 'Impossible de baisser le total : aucun paiement à créditer.',
  PAYMENT_METHOD_MISSING_ERROR: 'Aucun moyen de paiement pour le complément.',
  INELIGIBLE_SHIPPING_METHOD_ERROR: 'Le mode de livraison n\'est plus éligible avec ces lignes.',
};
