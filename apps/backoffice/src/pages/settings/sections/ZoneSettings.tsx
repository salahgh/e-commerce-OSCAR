import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { addToast } from '../../../store/slices/uiSlice';
import {
  ZonesDocument,
  CreateZoneDocument,
  UpdateZoneDocument,
  DeleteZoneDocument,
  AddMembersToZoneDocument,
  RemoveMembersFromZoneDocument,
  AdminCountriesDocument,
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

interface ZoneMember {
  id: string;
  name: string;
  code: string;
}

interface ZoneRow {
  id: string;
  name: string;
  members: ZoneMember[];
}

export const ZoneSettings: React.FC = () => {
  const dispatch = useDispatch();

  const { data, loading, refetch } = useQuery(ZonesDocument);
  const { data: countriesData } = useQuery(AdminCountriesDocument);
  const [createZone, { loading: creating }] = useMutation(CreateZoneDocument);
  const [updateZone, { loading: updating }] = useMutation(UpdateZoneDocument);
  const [deleteZone, { loading: deleting }] = useMutation(DeleteZoneDocument);
  const [addMembersToZone, { loading: addingMember }] = useMutation(AddMembersToZoneDocument);
  const [removeMembersFromZone, { loading: removingMember }] = useMutation(
    RemoveMembersFromZoneDocument
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ZoneRow | null>(null);
  const [name, setName] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [addCountryId, setAddCountryId] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const zones = (data?.zones?.items ?? []) as ZoneRow[];
  const countries = countriesData?.countries?.items ?? [];
  const saving = creating || updating;

  // The editing zone, re-read from the latest query data so member changes reflect live.
  const currentZone = editing ? zones.find((z) => z.id === editing.id) ?? editing : null;
  const memberCountryIds = new Set((currentZone?.members ?? []).map((m) => m.id));
  const availableCountries = countries.filter((c) => !memberCountryIds.has(c.id));

  const openCreate = () => {
    setEditing(null);
    setName('');
    setMemberIds([]);
    setModalOpen(true);
  };

  const openEdit = (zone: ZoneRow) => {
    setEditing(zone);
    setName(zone.name);
    setAddCountryId('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setMemberIds([]);
    setAddCountryId('');
  };

  const toggleMember = (id: string) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      dispatch(addToast({ message: 'Le nom est requis', type: 'warning' }));
      return;
    }
    try {
      if (editing) {
        await updateZone({ variables: { input: { id: editing.id, name: name.trim() } } });
        dispatch(addToast({ message: 'Zone mise à jour', type: 'success' }));
      } else {
        await createZone({
          variables: { input: { name: name.trim(), memberIds } },
        });
        dispatch(addToast({ message: 'Zone créée', type: 'success' }));
      }
      await refetch();
      closeModal();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  const handleAddMember = async () => {
    if (!editing || !addCountryId) return;
    try {
      await addMembersToZone({
        variables: { zoneId: editing.id, memberIds: [addCountryId] },
      });
      await refetch();
      setAddCountryId('');
      dispatch(addToast({ message: 'Pays ajouté', type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  const handleRemoveMember = async (countryId: string) => {
    if (!editing) return;
    try {
      await removeMembersFromZone({
        variables: { zoneId: editing.id, memberIds: [countryId] },
      });
      await refetch();
      dispatch(addToast({ message: 'Pays retiré', type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const r = await deleteZone({ variables: { id: deletingId } });
      const result = r.data?.deleteZone;
      if (result?.result === 'DELETED') {
        dispatch(addToast({ message: 'Zone supprimée', type: 'success' }));
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
          <h3 className="text-lg font-semibold text-foreground">Zones</h3>
          <p className="text-sm text-muted-foreground">
            Regroupez des pays en zones pour la taxe et la livraison
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle zone
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : zones.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Aucune zone</p>
      ) : (
        <div className="bg-muted/50 rounded-lg p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium text-foreground">{zone.name}</TableCell>
                  <TableCell>
                    <Badge variant="info">{zone.members?.length ?? 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(zone)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(zone.id)}
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
        title={editing ? 'Modifier la zone' : 'Nouvelle zone'}
        size="md"
      >
        <ModalContent>
          <div className="space-y-4">
            <Input
              label="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Algérie"
            />

            {editing ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-foreground">Pays membres</span>
                  {currentZone && currentZone.members.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {currentZone.members.map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-foreground"
                        >
                          {m.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.id)}
                            disabled={removingMember}
                            className="text-muted-foreground hover:text-red-400 disabled:opacity-50"
                            aria-label={`Retirer ${m.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Aucun pays</p>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      label="Ajouter un pays"
                      value={addCountryId}
                      onChange={(e) => setAddCountryId(e.target.value)}
                      options={[
                        { value: '', label: 'Sélectionner…' },
                        ...availableCountries.map((c) => ({ value: c.id, label: c.name })),
                      ]}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleAddMember}
                    loading={addingMember}
                    disabled={!addCountryId || addingMember}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-sm font-medium text-foreground">Pays membres</span>
                <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-border p-2 space-y-1">
                  {countries.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">Aucun pays disponible</p>
                  ) : (
                    countries.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-3 cursor-pointer rounded px-2 py-1 hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          checked={memberIds.includes(c.id)}
                          onChange={() => toggleMember(c.id)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">{c.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={closeModal} disabled={saving}>
            Fermer
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
        title="Supprimer cette zone"
        message="Si la zone est utilisée par des taux de taxe ou des méthodes de livraison, la suppression peut échouer."
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
