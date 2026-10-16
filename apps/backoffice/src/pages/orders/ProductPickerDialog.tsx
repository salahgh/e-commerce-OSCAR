import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { ArrowLeft, ImageOff, Search } from 'lucide-react';
import { AdminCollectionsLiteDocument, AdminProductPickerSearchDocument, SortOrder } from '../../graphql/generated/graphql';
import { Modal, ModalContent } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice } from '../../lib/utils';
import { useDebounce } from '../../hooks/useDebounce';
import { flattenTree } from '../../lib/collection-filters';
import type { VariantPick } from '../../lib/order-edits';
import { VariantChooser } from './VariantChooser';

// ──────────────────────────────────────────────────────────────────────────
// "Ajouter un produit": step 1 finds the product (search + category, photo
// cards from the search index), step 2 picks the variant with VariantChooser.
// ──────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;

const thumb = (preview: string) => `${preview}${preview.includes('?') ? '&' : '?'}preset=small`;

interface ProductPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPick: (variant: VariantPick, quantity: number) => void;
}

type PriceLike = { __typename?: string; value?: number; min?: number; max?: number };

const priceLabel = (p: PriceLike) =>
  p.value != null
    ? formatPrice(p.value / 100)
    : p.min === p.max
      ? formatPrice((p.min ?? 0) / 100)
      : `${formatPrice((p.min ?? 0) / 100)} – ${formatPrice((p.max ?? 0) / 100)}`;

export const ProductPickerDialog: React.FC<ProductPickerDialogProps> = ({ isOpen, onClose, onPick }) => {
  const [term, setTerm] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [page, setPage] = useState(0);
  const [productId, setProductId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTerm('');
      setCollectionId('');
      setPage(0);
      setProductId(null);
    }
  }, [isOpen]);

  const debouncedTerm = useDebounce(term.trim(), 300);
  useEffect(() => setPage(0), [debouncedTerm, collectionId]);

  const collections = useQuery(AdminCollectionsLiteDocument, {
    variables: { options: { take: 500 } },
    skip: !isOpen,
  });
  const categoryOptions = useMemo(
    () => flattenTree(collections.data?.collections.items ?? []),
    [collections.data],
  );

  const search = useQuery(AdminProductPickerSearchDocument, {
    variables: {
      input: {
        term: debouncedTerm || undefined,
        collectionId: collectionId || undefined,
        groupByProduct: true,
        take: PAGE_SIZE,
        skip: page * PAGE_SIZE,
        sort: debouncedTerm ? undefined : { name: SortOrder.Asc },
      },
    },
    skip: !isOpen || !!productId,
    fetchPolicy: 'cache-and-network',
  });
  const items = search.data?.search.items ?? [];
  const total = search.data?.search.totalItems ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={productId ? 'Choisir la variante' : 'Ajouter un produit'} size="xl">
      <ModalContent className="space-y-4">
        {productId ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setProductId(null)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour aux produits
            </Button>
            <VariantChooser
              productId={productId}
              confirmLabel="Ajouter à la commande"
              onConfirm={(variant, quantity) => {
                onPick(variant, quantity);
                onClose();
              }}
            />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Rechercher par nom ou SKU..."
                  className="pl-9 bg-background border-border"
                  aria-label="Rechercher un produit"
                />
              </div>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground sm:w-64"
                aria-label="Catégorie"
              >
                <option value="">Toutes les catégories</option>
                {categoryOptions.map((row) => (
                  <option key={row.id} value={row.id}>
                    {'  '.repeat(row.depth)}
                    {row.depth > 0 ? '└ ' : ''}
                    {row.collection.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-h-[55vh]">
            {search.loading && !search.data ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Aucun produit trouvé.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {items.map((item) => (
                  <button
                    key={item.productId}
                    type="button"
                    onClick={() => setProductId(item.productId)}
                    className="group overflow-hidden rounded-lg border border-border bg-background/50 text-left transition-colors hover:border-primary"
                  >
                    <div className="relative aspect-square bg-muted">
                      {item.productAsset?.preview ? (
                        <img
                          src={thumb(item.productAsset.preview)}
                          alt={item.productName}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <ImageOff className="h-6 w-6" />
                        </div>
                      )}
                      {!item.inStock && (
                        <span className="absolute left-2 top-2 rounded bg-red-900/80 px-1.5 py-0.5 text-xs text-red-200">
                          Rupture
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
                        {item.productName}
                      </p>
                      <p className="text-xs text-muted-foreground">{priceLabel(item.priceWithTax as PriceLike)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            </div>

            {total > PAGE_SIZE && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {total} produits · page {page + 1} / {pages}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    Précédent
                  </Button>
                  <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
