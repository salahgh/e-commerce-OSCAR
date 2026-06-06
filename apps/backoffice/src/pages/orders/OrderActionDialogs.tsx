import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  AddManualPaymentToOrderDocument,
  AdminPaymentMethodsForOrderDocument,
  ModifyOrderDocument,
  RefundOrderDocument,
} from '../../graphql/generated/graphql';
import { Modal, ModalContent, ModalFooter } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { formatPrice } from '../../lib/utils';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';

interface OrderPayment {
  id: string;
  method: string;
  state: string;
  amount: number;
}

interface OrderLineLite {
  id: string;
  quantity: number;
  productVariant?: { name?: string | null; sku?: string | null } | null;
}

// ──────────────────────────────────────────────────────────────────────────
// Refund dialog — refundOrder(input: { amount, paymentId, reason })
// ──────────────────────────────────────────────────────────────────────────

interface RefundDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payments: OrderPayment[];
  defaultPaymentId?: string | null;
  onSuccess: () => void;
}

export const RefundDialog: React.FC<RefundDialogProps> = ({
  isOpen,
  onClose,
  payments,
  defaultPaymentId,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const settledPayments = payments.filter((p) => p.state === 'Settled');
  const [paymentId, setPaymentId] = useState(defaultPaymentId || settledPayments[0]?.id || '');
  const [amountStr, setAmountStr] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaymentId(defaultPaymentId || settledPayments[0]?.id || '');
      const p = payments.find((x) => x.id === (defaultPaymentId || settledPayments[0]?.id));
      setAmountStr(p ? (p.amount / 100).toFixed(2) : '');
      setReason('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultPaymentId]);

  const [refund, { loading }] = useMutation(RefundOrderDocument);

  // Fall back to the first settled payment when paymentId is empty/stale (e.g. the
  // dialog opened before payments loaded). Without this the <select> visually shows
  // the first option while state stays '', so selectedPayment is undefined and the
  // refund max reads "0 DA", making refunds impossible until the user re-selects.
  const effectivePaymentId = settledPayments.some((p) => p.id === paymentId)
    ? paymentId
    : settledPayments[0]?.id || '';
  const selectedPayment = payments.find((p) => p.id === effectivePaymentId);
  const maxAmountDA = selectedPayment ? selectedPayment.amount / 100 : 0;
  const amount = Number(amountStr.replace(',', '.'));

  const handleSubmit = async () => {
    if (!effectivePaymentId) {
      dispatch(addToast({ message: 'Sélectionnez un paiement à rembourser', type: 'error' }));
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      dispatch(addToast({ message: 'Montant invalide', type: 'error' }));
      return;
    }
    try {
      const result = await refund({
        variables: {
          input: {
            paymentId: effectivePaymentId,
            amount: Math.round(amount * 100),
            reason: reason || undefined,
          },
        },
      });
      const response = result.data?.refundOrder;
      // No data (e.g. a GraphQL error under errorPolicy:'all') or a non-Refund
      // result is a FAILURE — previously this fell through to a false "success" toast.
      if (!response) {
        dispatch(
          addToast({
            message: result.errors?.[0]?.message || 'Échec du remboursement',
            type: 'error',
          })
        );
        return;
      }
      if ('__typename' in response && response.__typename !== 'Refund') {
        dispatch(
          addToast({ message: (response as any).message || 'Échec du remboursement', type: 'error' })
        );
        return;
      }
      dispatch(addToast({ message: 'Remboursement créé', type: 'success' }));
      onSuccess();
      onClose();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rembourser la commande" size="md">
      <ModalContent className="space-y-4">
        {settledPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun paiement réglé à rembourser sur cette commande.
          </p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Paiement à rembourser
              </label>
              <select
                value={effectivePaymentId}
                onChange={(e) => {
                  setPaymentId(e.target.value);
                  const p = payments.find((x) => x.id === e.target.value);
                  if (p) setAmountStr((p.amount / 100).toFixed(2));
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              >
                {settledPayments.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} — {p.method} — {formatPrice(p.amount / 100)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Montant à rembourser (DA)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={maxAmountDA}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: {formatPrice(maxAmountDA)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Motif</label>
              <TextArea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Produit défectueux, retour client, ..."
                className="bg-background border-border"
              />
            </div>
          </>
        )}
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <PermissionGate permission="UpdateOrder" disableMode>
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={settledPayments.length === 0 || !amount}
          >
            Rembourser
          </Button>
        </PermissionGate>
      </ModalFooter>
    </Modal>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Manual payment dialog — addManualPaymentToOrder
// ──────────────────────────────────────────────────────────────────────────

interface ManualPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

export const ManualPaymentDialog: React.FC<ManualPaymentDialogProps> = ({
  isOpen,
  onClose,
  orderId,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { data: pmData } = useQuery(AdminPaymentMethodsForOrderDocument, {
    skip: !isOpen,
  });
  const methods = pmData?.paymentMethods?.items ?? [];

  const [method, setMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (isOpen && methods.length && !method) {
      setMethod(methods[0].code);
    }
  }, [isOpen, methods, method]);

  const [pay, { loading }] = useMutation(AddManualPaymentToOrderDocument);

  const handleSubmit = async () => {
    if (!method) {
      dispatch(addToast({ message: 'Sélectionnez une méthode de paiement', type: 'error' }));
      return;
    }
    try {
      const result = await pay({
        variables: {
          input: {
            orderId,
            method,
            transactionId: transactionId || undefined,
            // Vendure's Payment.metadata is non-null in the DB; pass an empty
            // object so the insert doesn't fail.
            metadata: {},
          },
        },
      });
      const response = result.data?.addManualPaymentToOrder;
      if (response && '__typename' in response && response.__typename !== 'Order') {
        dispatch(
          addToast({
            message: (response as any).message || 'Échec de l’enregistrement du paiement',
            type: 'error',
          })
        );
        return;
      }
      dispatch(addToast({ message: 'Paiement enregistré', type: 'success' }));
      setTransactionId('');
      onSuccess();
      onClose();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer un paiement manuel" size="md">
      <ModalContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Cette action règle le montant restant de la commande via la méthode choisie. Utilisez-la
          pour confirmer un paiement à la livraison ou un virement reçu.
        </p>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Méthode</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
          >
            {methods.length === 0 ? (
              <option value="">Aucune méthode disponible</option>
            ) : (
              methods.map((m) => (
                <option key={m.id} value={m.code}>
                  {m.name} ({m.code})
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Référence de la transaction (optionnel)
          </label>
          <Input
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="N° de bon, référence virement, ..."
            className="bg-background border-border"
          />
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <PermissionGate permission="UpdateOrder" disableMode>
          <Button onClick={handleSubmit} loading={loading} disabled={!method}>
            Enregistrer
          </Button>
        </PermissionGate>
      </ModalFooter>
    </Modal>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Modify order dialog — modifyOrder (simplified: line quantities + surcharge)
// ──────────────────────────────────────────────────────────────────────────

interface ModifyOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  lines: OrderLineLite[];
  onSuccess: () => void;
}

export const ModifyOrderDialog: React.FC<ModifyOrderDialogProps> = ({
  isOpen,
  onClose,
  orderId,
  lines,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const initialQty = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of lines) map[l.id] = l.quantity;
    return map;
  }, [lines]);

  const [quantities, setQuantities] = useState<Record<string, number>>(initialQty);
  const [surchargeDescription, setSurchargeDescription] = useState('');
  const [surchargeAmount, setSurchargeAmount] = useState('');
  const [note, setNote] = useState('');
  const [dryRun, setDryRun] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setQuantities(initialQty);
      setSurchargeDescription('');
      setSurchargeAmount('');
      setNote('');
      setDryRun(true);
    }
  }, [isOpen, initialQty]);

  const [modify, { loading }] = useMutation(ModifyOrderDocument);

  const handleSubmit = async () => {
    const adjustOrderLines = lines
      .filter((l) => quantities[l.id] !== l.quantity)
      .map((l) => ({ orderLineId: l.id, quantity: Math.max(0, quantities[l.id] || 0) }));

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

    if (adjustOrderLines.length === 0 && !surcharges && !note) {
      dispatch(addToast({ message: 'Aucune modification à appliquer', type: 'error' }));
      return;
    }

    try {
      const result = await modify({
        variables: {
          input: {
            orderId,
            dryRun,
            adjustOrderLines: adjustOrderLines.length ? adjustOrderLines : undefined,
            surcharges,
            note: note || undefined,
          },
        },
      });
      const response = result.data?.modifyOrder;
      if (response && '__typename' in response && response.__typename !== 'Order') {
        dispatch(
          addToast({
            message: (response as any).message || 'Modification refusée',
            type: 'error',
          })
        );
        return;
      }
      dispatch(
        addToast({
          message: dryRun ? 'Aperçu OK — décochez "Aperçu" pour appliquer' : 'Commande modifiée',
          type: 'success',
        })
      );
      if (!dryRun) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier la commande" size="lg">
      <ModalContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Lignes de commande</p>
          <div className="space-y-2">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex items-center justify-between gap-3 p-3 bg-background/50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium truncate">
                    {line.productVariant?.name || line.productVariant?.sku || `Ligne ${line.id}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{line.productVariant?.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Qté</span>
                  <Input
                    type="number"
                    min={0}
                    value={quantities[line.id] ?? line.quantity}
                    onChange={(e) =>
                      setQuantities({ ...quantities, [line.id]: Number(e.target.value) })
                    }
                    className="w-20 bg-background border-border"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Description du surcoût (optionnel)
            </label>
            <Input
              value={surchargeDescription}
              onChange={(e) => setSurchargeDescription(e.target.value)}
              placeholder="Frais de livraison express, ..."
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Montant (DA, peut être négatif)
            </label>
            <Input
              type="number"
              step="0.01"
              value={surchargeAmount}
              onChange={(e) => setSurchargeAmount(e.target.value)}
              className="bg-background border-border"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Note d'historique
          </label>
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Raison de la modification"
            className="bg-background border-border"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="rounded border-border"
          />
          Aperçu (ne pas enregistrer)
        </label>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <PermissionGate permission="UpdateOrder" disableMode>
          <Button onClick={handleSubmit} loading={loading}>
            {dryRun ? 'Prévisualiser' : 'Appliquer'}
          </Button>
        </PermissionGate>
      </ModalFooter>
    </Modal>
  );
};
