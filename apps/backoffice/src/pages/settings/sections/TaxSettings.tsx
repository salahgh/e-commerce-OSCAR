import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { addToast } from '../../../store/slices/uiSlice';
import {
  TaxCategoriesDocument,
  CreateTaxCategoryDocument,
  UpdateTaxCategoryDocument,
  DeleteTaxCategoryDocument,
} from '../../../graphql/generated/graphql';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal, ModalContent, ModalFooter } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table';

interface TaxCategoryRow {
  id: string;
  name: string;
  isDefault: boolean;
}

export const TaxSettings: React.FC = () => {
  const dispatch = useDispatch();

  const { data, loading, refetch } = useQuery(TaxCategoriesDocument);
  const [createTaxCategory, { loading: creating }] = useMutation(CreateTaxCategoryDocument);
  const [updateTaxCategory, { loading: updating }] = useMutation(UpdateTaxCategoryDocument);
  const [deleteTaxCategory, { loading: deleting }] = useMutation(DeleteTaxCategoryDocument);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TaxCategoryRow | null>(null);
  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories = data?.taxCategories?.items ?? [];
  const saving = creating || updating;

  const openCreate = () => {
    setEditing(null);
    setName('');
    setIsDefault(false);
    setModalOpen(true);
  };

  const openEdit = (category: TaxCategoryRow) => {
    setEditing(category);
    setName(category.name);
    setIsDefault(category.isDefault);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      dispatch(addToast({ message: 'Le nom est requis', type: 'warning' }));
      return;
    }
    try {
      if (editing) {
        await updateTaxCategory({
          variables: { input: { id: editing.id, name: name.trim(), isDefault } },
        });
        dispatch(addToast({ message: 'Catégorie mise à jour', type: 'success' }));
      } else {
        await createTaxCategory({
          variables: { input: { name: name.trim(), isDefault } },
        });
        dispatch(addToast({ message: 'Catégorie créée', type: 'success' }));
      }
      await refetch();
      closeModal();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const r = await deleteTaxCategory({ variables: { id: deletingId } });
      const result = r.data?.deleteTaxCategory;
      if (result?.result === 'DELETED') {
        dispatch(addToast({ message: 'Catégorie supprimée', type: 'success' }));
        await refetch();
      } else {
        dispatch(
          addToast({ message: result?.message || 'Impossible de supprimer', type: 'error' })
        );
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Catégories de taxe</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les catégories de taxe applicables aux produits
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Aucune catégorie de taxe</p>
      ) : (
        <div className="bg-muted/50 rounded-lg p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Par défaut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium text-foreground">{category.name}</TableCell>
                  <TableCell>
                    {category.isDefault ? <Badge variant="success">Oui</Badge> : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(category.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1 text-red-400" />
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        size="sm"
      >
        <ModalContent>
          <div className="space-y-4">
            <Input
              label="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Standard"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">
                Catégorie par défaut
              </span>
            </label>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={closeModal} disabled={saving}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
            Enregistrer
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Supprimer cette catégorie de taxe"
        message="Si la catégorie est utilisée par des produits ou des taux de taxe, la suppression peut échouer."
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
