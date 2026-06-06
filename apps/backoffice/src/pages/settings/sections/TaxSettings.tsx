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
  TaxRatesDocument,
  CreateTaxRateDocument,
  UpdateTaxRateDocument,
  DeleteTaxRateDocument,
  ZonesDocument,
} from '../../../graphql/generated/graphql';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
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
import { PermissionGate } from '../../../components/auth/PermissionGate';

interface TaxRateRow {
  id: string;
  name: string;
  value: number;
  enabled: boolean;
  category: { id: string; name: string };
  zone: { id: string; name: string };
}

const TaxRatesPanel: React.FC = () => {
  const dispatch = useDispatch();

  const { data, loading, refetch } = useQuery(TaxRatesDocument);
  const { data: categoriesData } = useQuery(TaxCategoriesDocument);
  const { data: zonesData } = useQuery(ZonesDocument);
  const [createTaxRate, { loading: creating }] = useMutation(CreateTaxRateDocument);
  const [updateTaxRate, { loading: updating }] = useMutation(UpdateTaxRateDocument);
  const [deleteTaxRate, { loading: deleting }] = useMutation(DeleteTaxRateDocument);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TaxRateRow | null>(null);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const rates = data?.taxRates?.items ?? [];
  const categories = categoriesData?.taxCategories?.items ?? [];
  const zones = zonesData?.zones?.items ?? [];
  const saving = creating || updating;

  const openCreate = () => {
    setEditing(null);
    setName('');
    setValue('');
    setCategoryId(categories[0]?.id ?? '');
    setZoneId(zones[0]?.id ?? '');
    setEnabled(true);
    setModalOpen(true);
  };

  const openEdit = (rate: TaxRateRow) => {
    setEditing(rate);
    setName(rate.name);
    setValue(String(rate.value));
    setCategoryId(rate.category.id);
    setZoneId(rate.zone.id);
    setEnabled(rate.enabled);
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
    if (!categoryId) {
      dispatch(addToast({ message: 'La catégorie est requise', type: 'warning' }));
      return;
    }
    if (!zoneId) {
      dispatch(addToast({ message: 'La zone est requise', type: 'warning' }));
      return;
    }
    try {
      if (editing) {
        await updateTaxRate({
          variables: {
            input: {
              id: editing.id,
              name: name.trim(),
              value: Number(value),
              enabled,
              categoryId,
              zoneId,
            },
          },
        });
        dispatch(addToast({ message: 'Taux mis à jour', type: 'success' }));
      } else {
        await createTaxRate({
          variables: {
            input: {
              name: name.trim(),
              value: Number(value),
              enabled,
              categoryId,
              zoneId,
            },
          },
        });
        dispatch(addToast({ message: 'Taux créé', type: 'success' }));
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
      const r = await deleteTaxRate({ variables: { id: deletingId } });
      const result = r.data?.deleteTaxRate;
      if (result?.result === 'DELETED') {
        dispatch(addToast({ message: 'Taux supprimé', type: 'success' }));
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
          <h3 className="text-lg font-semibold text-foreground">Taux de taxe</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les taux de taxe par zone et catégorie
          </p>
        </div>
        <PermissionGate permission="CreateTaxRate" disableMode>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau taux
          </Button>
        </PermissionGate>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : rates.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Aucun taux de taxe</p>
      ) : (
        <div className="bg-muted/50 rounded-lg p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Valeur (%)</TableHead>
                <TableHead>Activé</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium text-foreground">{rate.name}</TableCell>
                  <TableCell>{rate.zone?.name ?? '—'}</TableCell>
                  <TableCell>{rate.category?.name ?? '—'}</TableCell>
                  <TableCell>{rate.value}</TableCell>
                  <TableCell>
                    {rate.enabled ? <Badge variant="success">Oui</Badge> : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <PermissionGate permission="UpdateTaxRate" disableMode>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(rate)}>
                          <Edit2 className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="DeleteTaxRate" disableMode>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(rate.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1 text-red-400" />
                          Supprimer
                        </Button>
                      </PermissionGate>
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
        title={editing ? 'Modifier le taux' : 'Nouveau taux'}
        size="sm"
      >
        <ModalContent>
          <div className="space-y-4">
            <Input
              label="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. TVA standard"
            />
            <Input
              label="Valeur (%)"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="ex. 19"
            />
            <Select
              label="Catégorie"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Select
              label="Zone"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              options={zones.map((z) => ({ value: z.id, label: z.name }))}
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">Activé</span>
            </label>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={closeModal} disabled={saving}>
            Annuler
          </Button>
          <PermissionGate
            anyOf={editing ? ['UpdateTaxRate'] : ['CreateTaxRate']}
            disableMode
          >
            <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
              Enregistrer
            </Button>
          </PermissionGate>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Supprimer ce taux de taxe"
        message="Cette action est irréversible."
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

interface TaxCategoryRow {
  id: string;
  name: string;
  isDefault: boolean;
}

const TaxCategoriesPanel: React.FC = () => {
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
        <PermissionGate permission="CreateTaxCategory" disableMode>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle catégorie
          </Button>
        </PermissionGate>
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
                      <PermissionGate permission="UpdateTaxCategory" disableMode>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                          <Edit2 className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="DeleteTaxCategory" disableMode>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(category.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1 text-red-400" />
                          Supprimer
                        </Button>
                      </PermissionGate>
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
          <PermissionGate
            anyOf={editing ? ['UpdateTaxCategory'] : ['CreateTaxCategory']}
            disableMode
          >
            <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
              Enregistrer
            </Button>
          </PermissionGate>
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

export const TaxSettings: React.FC = () => (
  <div className="space-y-8">
    <TaxRatesPanel />
    <TaxCategoriesPanel />
  </div>
);
