import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { addToast } from '../../../store/slices/uiSlice';
import {
  ChannelsDocument,
  CreateChannelDocument,
  UpdateChannelDocument,
  DeleteChannelDocument,
  ZonesDocument,
  LanguageCode,
  CurrencyCode,
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

interface ChannelRow {
  id: string;
  code: string;
  token: string;
  defaultLanguageCode: LanguageCode;
  currencyCode: CurrencyCode;
  pricesIncludeTax: boolean;
  defaultShippingZone?: { id: string; name: string } | null;
  defaultTaxZone?: { id: string; name: string } | null;
}

const LANGUAGE_OPTIONS = [
  { value: LanguageCode.Fr, label: 'Français' },
  { value: LanguageCode.Ar, label: 'العربية' },
  { value: LanguageCode.En, label: 'English' },
];

const CURRENCY_OPTIONS = [{ value: CurrencyCode.Dzd, label: 'DZD' }];

export const ChannelSettings: React.FC = () => {
  const dispatch = useDispatch();

  const { data, loading, refetch } = useQuery(ChannelsDocument);
  const { data: zonesData } = useQuery(ZonesDocument);
  const [createChannel, { loading: creating }] = useMutation(CreateChannelDocument);
  const [updateChannel, { loading: updating }] = useMutation(UpdateChannelDocument);
  const [deleteChannel, { loading: deleting }] = useMutation(DeleteChannelDocument);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ChannelRow | null>(null);
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [languageCode, setLanguageCode] = useState<LanguageCode>(LanguageCode.Fr);
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(CurrencyCode.Dzd);
  const [pricesIncludeTax, setPricesIncludeTax] = useState(false);
  const [taxZoneId, setTaxZoneId] = useState('');
  const [shippingZoneId, setShippingZoneId] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const channels = (data?.channels?.items ?? []) as ChannelRow[];
  const zones = zonesData?.zones?.items ?? [];
  const saving = creating || updating;
  const zoneOptions = zones.map((z) => ({ value: z.id, label: z.name }));

  const openCreate = () => {
    setEditing(null);
    setCode('');
    setToken('');
    setLanguageCode(LanguageCode.Fr);
    setCurrencyCode(CurrencyCode.Dzd);
    setPricesIncludeTax(false);
    setTaxZoneId(zones[0]?.id ?? '');
    setShippingZoneId(zones[0]?.id ?? '');
    setModalOpen(true);
  };

  const openEdit = (channel: ChannelRow) => {
    setEditing(channel);
    setCode(channel.code);
    setToken(channel.token);
    setLanguageCode(channel.defaultLanguageCode);
    setCurrencyCode(channel.currencyCode);
    setPricesIncludeTax(channel.pricesIncludeTax);
    setTaxZoneId(channel.defaultTaxZone?.id ?? '');
    setShippingZoneId(channel.defaultShippingZone?.id ?? '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!code.trim()) {
      dispatch(addToast({ message: 'Le code est requis', type: 'warning' }));
      return;
    }
    if (!token.trim()) {
      dispatch(addToast({ message: 'Le token est requis', type: 'warning' }));
      return;
    }
    if (!taxZoneId) {
      dispatch(addToast({ message: 'La zone de taxe est requise', type: 'warning' }));
      return;
    }
    if (!shippingZoneId) {
      dispatch(addToast({ message: 'La zone de livraison est requise', type: 'warning' }));
      return;
    }
    try {
      if (editing) {
        const res = await updateChannel({
          variables: {
            input: {
              id: editing.id,
              code: code.trim(),
              token: token.trim(),
              defaultLanguageCode: languageCode,
              defaultCurrencyCode: currencyCode,
              pricesIncludeTax,
              defaultTaxZoneId: taxZoneId,
              defaultShippingZoneId: shippingZoneId,
            },
          },
        });
        const result = res.data?.updateChannel;
        if (result?.__typename === 'LanguageNotAvailableError') {
          dispatch(addToast({ message: result.message, type: 'error' }));
          return;
        }
        dispatch(addToast({ message: 'Canal mis à jour', type: 'success' }));
      } else {
        const res = await createChannel({
          variables: {
            input: {
              code: code.trim(),
              token: token.trim(),
              defaultLanguageCode: languageCode,
              defaultCurrencyCode: currencyCode,
              pricesIncludeTax,
              defaultTaxZoneId: taxZoneId,
              defaultShippingZoneId: shippingZoneId,
            },
          },
        });
        const result = res.data?.createChannel;
        if (result?.__typename === 'LanguageNotAvailableError') {
          dispatch(addToast({ message: result.message, type: 'error' }));
          return;
        }
        dispatch(addToast({ message: 'Canal créé', type: 'success' }));
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
      const r = await deleteChannel({ variables: { id: deletingId } });
      const result = r.data?.deleteChannel;
      if (result?.result === 'DELETED') {
        dispatch(addToast({ message: 'Canal supprimé', type: 'success' }));
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
          <h3 className="text-lg font-semibold text-foreground">Canaux</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les canaux de vente, leur langue, devise et zones par défaut
          </p>
        </div>
        <PermissionGate permission="CreateChannel" disableMode>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau canal
          </Button>
        </PermissionGate>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : channels.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Aucun canal</p>
      ) : (
        <div className="bg-muted/50 rounded-lg p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Langue</TableHead>
                <TableHead>Devise</TableHead>
                <TableHead>Zone taxe</TableHead>
                <TableHead>Zone livraison</TableHead>
                <TableHead>Prix TTC</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell className="font-medium text-foreground">{channel.code}</TableCell>
                  <TableCell>{channel.defaultLanguageCode}</TableCell>
                  <TableCell>{channel.currencyCode}</TableCell>
                  <TableCell>{channel.defaultTaxZone?.name ?? '—'}</TableCell>
                  <TableCell>{channel.defaultShippingZone?.name ?? '—'}</TableCell>
                  <TableCell>
                    {channel.pricesIncludeTax ? <Badge variant="success">Oui</Badge> : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <PermissionGate permission="UpdateChannel" disableMode>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(channel)}>
                          <Edit2 className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="DeleteChannel" disableMode>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(channel.id)}
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
        title={editing ? 'Modifier le canal' : 'Nouveau canal'}
        size="md"
      >
        <ModalContent>
          <div className="space-y-4">
            <Input
              label="Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ex. boutique-alger"
            />
            <Input
              label="Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ex. alger-token"
            />
            <Select
              label="Langue par défaut"
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value as LanguageCode)}
              options={LANGUAGE_OPTIONS}
            />
            <Select
              label="Devise par défaut"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
              options={CURRENCY_OPTIONS}
            />
            <Select
              label="Zone de taxe par défaut"
              value={taxZoneId}
              onChange={(e) => setTaxZoneId(e.target.value)}
              options={zoneOptions}
            />
            <Select
              label="Zone de livraison par défaut"
              value={shippingZoneId}
              onChange={(e) => setShippingZoneId(e.target.value)}
              options={zoneOptions}
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pricesIncludeTax}
                onChange={(e) => setPricesIncludeTax(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">
                Les prix incluent la taxe
              </span>
            </label>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={closeModal} disabled={saving}>
            Annuler
          </Button>
          <PermissionGate
            anyOf={editing ? ['UpdateChannel'] : ['CreateChannel']}
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
        title="Supprimer ce canal"
        message="Le canal par défaut ne peut pas être supprimé. Cette action est irréversible."
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
