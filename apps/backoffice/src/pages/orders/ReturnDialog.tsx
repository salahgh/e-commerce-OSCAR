import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Minus, Plus, Undo2 } from 'lucide-react';
import { RegisterReturnDocument, ReturnDialogDataDocument } from '../../graphql/generated/graphql';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { Modal, ModalContent, ModalFooter } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { TextArea } from '../../components/ui/TextArea';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice } from '../../lib/utils';
import { lineLabel, type EditableLine } from '../../lib/order-edits';

interface ReturnLine extends EditableLine {
  unitPriceWithTax: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  lines: ReturnLine[];
  onSuccess: () => void;
}

/**
 * Register returned items on a shipped or delivered order (registerReturn):
 * pick the units, a reason, and whether they go back on sale. Defective items
 * default to "not restocked".
 */
export const ReturnDialog: React.FC<Props> = ({ isOpen, onClose, orderId, lines, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { data, loading } = useQuery(ReturnDialogDataDocument, {
    variables: { orderId },
    skip: !isOpen,
    fetchPolicy: 'network-only',
  });
  const [registerReturn, { loading: saving }] = useMutation(RegisterReturnDocument);

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reasonCode, setReasonCode] = useState('');
  const [details, setDetails] = useState('');
  const [restock, setRestock] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setQuantities({});
      setReasonCode('');
      setDetails('');
      setRestock(true);
    }
  }, [isOpen]);

  const returnable = useMemo(
    () => new Map((data?.returnableLines ?? []).map((l) => [String(l.orderLineId), l.quantity])),
    [data]
  );
  const selected = lines
    .map((l) => ({ line: l, quantity: quantities[l.id] ?? 0 }))
    .filter((s) => s.quantity > 0);
  const value = selected.reduce((sum, s) => sum + s.quantity * s.line.unitPriceWithTax, 0);
  const canSubmit =
    selected.length > 0 && !!reasonCode && (reasonCode !== 'OTHER' || details.trim().length > 0);

  const setQty = (lineId: string, q: number) => {
    const max = returnable.get(lineId) ?? 0;
    setQuantities((prev) => ({ ...prev, [lineId]: Math.max(0, Math.min(max, q)) }));
  };

  const onReason = (code: string) => {
    setReasonCode(code);
    setRestock(code !== 'DEFECTIVE');
  };

  const submit = async () => {
    try {
      await registerReturn({
        variables: {
          input: {
            orderId,
            lines: selected.map((s) => ({ orderLineId: s.line.id, quantity: s.quantity })),
            reasonCode,
            details: details.trim() || null,
            restock,
          },
        },
      });
      dispatch(addToast({ message: 'Retour enregistré', type: 'success' }));
      onSuccess();
      onClose();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || "Échec de l'enregistrement du retour", type: 'error' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer un retour" size="lg">
      <ModalContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Articles retournés</p>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {lines.map((line) => {
                  const max = returnable.get(String(line.id)) ?? 0;
                  const q = quantities[line.id] ?? 0;
                  return (
                    <li key={line.id} className="flex items-center gap-3 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{lineLabel(line)}</p>
                        <p className="text-xs text-muted-foreground">
                          {max > 0 ? `${max} retournable${max > 1 ? 's' : ''}` : 'Rien à retourner'} ·{' '}
                          {formatPrice(line.unitPriceWithTax / 100)} / unité
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Moins"
                          onClick={() => setQty(line.id, q - 1)}
                          disabled={q <= 0}
                          className="rounded border border-border p-1 disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center tabular-nums text-foreground">{q}</span>
                        <button
                          type="button"
                          aria-label="Plus"
                          onClick={() => setQty(line.id, q + 1)}
                          disabled={q >= max}
                          className="rounded border border-border p-1 disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Select
              label="Raison du retour *"
              value={reasonCode}
              onChange={(e) => onReason(e.target.value)}
              options={[
                { value: '', label: '— Choisir une raison —' },
                ...(data?.returnReasons ?? []).map((r) => ({ value: r.code, label: r.label })),
              ]}
            />
            <TextArea
              label={reasonCode === 'OTHER' ? 'Précisez la raison *' : 'Précisions (facultatif)'}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              className="bg-card border-border"
            />
            <label className="flex items-start gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={restock}
                onChange={(e) => setRestock(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Remettre en stock
                <span className="block text-xs text-muted-foreground">
                  Décochez pour un article défectueux : il ne sera pas remis en vente.
                </span>
              </span>
            </label>
            {selected.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Valeur retournée : <strong className="text-foreground">{formatPrice(value / 100)}</strong>. Si la
                commande n'est pas encore encaissée, le montant à encaisser à la livraison est recalculé ;
                sinon le montant à rembourser est noté dans l'historique.
              </p>
            )}
          </div>
        )}
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button onClick={submit} loading={saving} disabled={!canSubmit}>
          <Undo2 className="mr-1 h-4 w-4" />
          Enregistrer le retour
        </Button>
      </ModalFooter>
    </Modal>
  );
};
