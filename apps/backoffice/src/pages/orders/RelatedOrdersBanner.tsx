import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { Copy, Merge } from 'lucide-react';
import { MergeOrdersDocument, RelatedOrdersDocument } from '../../graphql/generated/graphql';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { formatDateTime, formatPrice } from '../../lib/utils';

/** Only unshipped COD orders awaiting confirmation can be merged (see backend mergeBlocker). */
const MERGEABLE = 'PaymentAuthorized';

interface Props {
  orderId: string;
  orderCode: string;
  orderState: string;
  statusLabel: (state: string) => string;
  onMerged: () => void;
}

/**
 * Possible duplicates: other orders from the same phone number placed within
 * 24 hours. Customers often order one product at a time; staff can pull the
 * other order's items into this one (the other order is cancelled with the
 * reason "Fusionnée dans la commande …").
 */
export const RelatedOrdersBanner: React.FC<Props> = ({ orderId, orderCode, orderState, statusLabel, onMerged }) => {
  const dispatch = useAppDispatch();
  const { data, refetch } = useQuery(RelatedOrdersDocument, {
    variables: { orderId },
    fetchPolicy: 'cache-and-network',
  });
  const [mergeOrders, { loading: merging }] = useMutation(MergeOrdersDocument);
  const [source, setSource] = useState<{ id: string; code: string; itemCount: number } | null>(null);

  const related = data?.relatedOrders ?? [];
  if (related.length === 0) return null;

  const handleMerge = async () => {
    if (!source) return;
    try {
      await mergeOrders({ variables: { targetOrderId: orderId, sourceOrderId: source.id } });
      dispatch(
        addToast({ message: `Commande ${source.code} fusionnée dans ${orderCode}`, type: 'success' })
      );
      setSource(null);
      await refetch();
      onMerged();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Échec de la fusion', type: 'error' }));
      setSource(null);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
      <p className="flex items-center gap-2 font-medium text-amber-400">
        <Copy className="h-4 w-4" />
        Doublon possible : {related.length} autre{related.length > 1 ? 's' : ''} commande
        {related.length > 1 ? 's' : ''} du même numéro de téléphone en 24 h
      </p>
      <ul className="mt-3 space-y-2">
        {related.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <Link to={`/orders/${r.id}`} className="font-semibold text-foreground hover:text-primary">
              {r.code}
            </Link>
            <span className="text-muted-foreground">{formatDateTime(r.orderPlacedAt)}</span>
            <span className="text-muted-foreground">{statusLabel(r.state)}</span>
            <span className="text-muted-foreground">
              {r.itemCount} article{r.itemCount > 1 ? 's' : ''} · {formatPrice(r.totalWithTax / 100)}
            </span>
            {r.state === MERGEABLE && orderState === MERGEABLE && r.itemCount > 0 && (
              <PermissionGate permission="UpdateOrder" disableMode>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSource({ id: r.id, code: r.code, itemCount: r.itemCount })}
                >
                  <Merge className="mr-1 h-4 w-4" />
                  Fusionner dans cette commande
                </Button>
              </PermissionGate>
            )}
          </li>
        ))}
      </ul>
      {orderState !== MERGEABLE && (
        <p className="mt-2 text-xs text-muted-foreground">
          La fusion n'est possible que si les deux commandes sont « Nouvelle » (non expédiées, paiement à la livraison).
        </p>
      )}
      <ConfirmDialog
        isOpen={!!source}
        onClose={() => setSource(null)}
        onConfirm={handleMerge}
        title="Fusionner les commandes"
        message={
          source && (
            <p className="text-foreground">
              {source.itemCount > 1 ? `Les ${source.itemCount} articles` : "L'article"} de la commande{' '}
              <strong>{source.code}</strong> {source.itemCount > 1 ? 'seront ajoutés' : 'sera ajouté'} à{' '}
              <strong>{orderCode}</strong>, puis{' '}
              <strong>{source.code}</strong> sera annulée (raison : « Fusionnée dans la commande {orderCode} »).
              Le montant à encaisser à la livraison est recalculé (une seule livraison).
            </p>
          )
        }
        confirmText="Fusionner"
        variant="warning"
        loading={merging}
      />
    </div>
  );
};
