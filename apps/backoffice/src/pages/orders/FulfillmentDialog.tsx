import React, { useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { Modal, ModalContent, ModalFooter } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { addToast } from '../../store/slices/uiSlice';
import { CreateFulfillmentDocument } from '../../graphql/generated/graphql';

// Minimal structural shapes taken from the AdminOrder query. Kept local so the dialog
// is not coupled to the full generated query type.
export interface FulfillmentDialogOrderLine {
  id: string;
  quantity: number;
  productVariant: { name: string; sku: string; product?: { name?: string | null } | null };
}
export interface FulfillmentDialogOrder {
  id: string;
  lines: FulfillmentDialogOrderLine[];
  fulfillments?: ReadonlyArray<{ lines: ReadonlyArray<{ orderLineId: string; quantity: number }> }> | null;
}

interface FulfillmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: FulfillmentDialogOrder;
  onFulfilled: () => void;
}

// Remaining fulfillable quantity for an order line = ordered minus already-fulfilled.
export function remainingQuantity(
  line: FulfillmentDialogOrderLine,
  fulfillments: FulfillmentDialogOrder['fulfillments'],
): number {
  const fulfilled = (fulfillments ?? [])
    .flatMap((f) => Array.from(f.lines))
    .filter((fl) => fl.orderLineId === line.id)
    .reduce((sum, fl) => sum + fl.quantity, 0);
  return Math.max(0, line.quantity - fulfilled);
}

export const FulfillmentDialog: React.FC<FulfillmentDialogProps> = ({
  isOpen,
  onClose,
  order,
  onFulfilled,
}) => {
  const dispatch = useDispatch();
  const [createFulfillment, { loading }] = useMutation(CreateFulfillmentDocument);
  const [method, setMethod] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const fulfillableLines = useMemo(
    () =>
      order.lines
        .map((line) => ({ line, remaining: remainingQuantity(line, order.fulfillments) }))
        .filter((x) => x.remaining > 0),
    [order.lines, order.fulfillments],
  );

  // Effective qty for a line: explicit edit, otherwise default to the full remaining qty.
  const qtyFor = (lineId: string, remaining: number) =>
    quantities[lineId] === undefined ? remaining : quantities[lineId];

  const totalSelected = fulfillableLines.reduce(
    (sum, x) => sum + qtyFor(x.line.id, x.remaining),
    0,
  );

  const handleSubmit = async () => {
    const lines = fulfillableLines
      .map((x) => ({ orderLineId: x.line.id, quantity: qtyFor(x.line.id, x.remaining) }))
      .filter((l) => l.quantity > 0);
    if (lines.length === 0) {
      dispatch(addToast({ message: 'Sélectionnez au moins un article', type: 'warning' }));
      return;
    }
    try {
      const res = await createFulfillment({
        variables: {
          input: {
            lines,
            handler: {
              code: 'manual-fulfillment',
              arguments: [
                { name: 'method', value: method },
                { name: 'trackingCode', value: trackingCode },
              ],
            },
          },
        },
      });
      const result = res.data?.addFulfillmentToOrder;
      if (result && result.__typename === 'Fulfillment') {
        dispatch(addToast({ message: 'Expédition créée', type: 'success' }));
        onFulfilled();
        onClose();
      } else {
        dispatch(
          addToast({
            message:
              (result as { message?: string } | undefined)?.message ||
              'Échec de la création de l’expédition',
            type: 'error',
          }),
        );
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une expédition" size="lg">
      <ModalContent className="space-y-4">
        {fulfillableLines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tous les articles ont déjà été expédiés.
          </p>
        ) : (
          <div className="space-y-3">
            {fulfillableLines.map(({ line, remaining }) => (
              <div key={line.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {line.productVariant.product?.name || line.productVariant.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {line.productVariant.sku} · {remaining} restant(s) sur {line.quantity}
                  </p>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={remaining}
                  value={qtyFor(line.id, remaining)}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value || '0', 10);
                    const v = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(remaining, parsed));
                    setQuantities((q) => ({ ...q, [line.id]: v }));
                  }}
                  className="w-24"
                />
              </div>
            ))}
            <Input
              label="Méthode / Transporteur"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="Yalidine, ZR Express…"
            />
            <Input
              label="Numéro de suivi"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
            />
          </div>
        )}
      </ModalContent>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <PermissionGate permission="UpdateOrder" disableMode>
          <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={totalSelected === 0}>
            Créer l’expédition
          </Button>
        </PermissionGate>
      </ModalFooter>
    </Modal>
  );
};
