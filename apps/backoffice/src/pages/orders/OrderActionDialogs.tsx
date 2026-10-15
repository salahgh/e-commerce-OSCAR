import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  AddManualPaymentToOrderDocument,
  AdminPaymentMethodsForOrderDocument,
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
