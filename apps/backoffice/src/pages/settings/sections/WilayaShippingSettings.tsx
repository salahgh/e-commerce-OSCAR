import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { ChevronDown, ChevronRight, MapPin, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';
import {
  CreateDeliveryCommuneDocument,
  CreateDeliveryWilayaDocument,
  DeleteDeliveryCommuneDocument,
  DeleteDeliveryWilayaDocument,
  DeliveryWilayasDocument,
  UpdateDeliveryCommuneDocument,
  UpdateDeliveryWilayaDocument,
  UpdateWilayaShippingPricesDocument,
} from '../../../graphql/generated/graphql';
import { SHIPPING_ZONE_LABELS, type DeliveryCommune, type DeliveryWilaya } from '../../../hooks/useDeliveryWilayas';
import { addToast } from '../../../store/slices/uiSlice';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
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

type Mode = 'home' | 'office';
/** Text typed per mode, in DZD. A missing key means the field is untouched. */
type Draft = Partial<Record<Mode, string>>;

const MODES: ReadonlyArray<{ key: Mode; label: string }> = [
  { key: 'home', label: 'Domicile (DA)' },
  { key: 'office', label: 'Bureau (DA)' },
];

const ZONE_OPTIONS = Object.entries(SHIPPING_ZONE_LABELS).map(([value, label]) => ({ value, label }));

const stored = (row: DeliveryWilaya, mode: Mode): number | null =>
  mode === 'home' ? row.homePrice ?? null : row.officePrice ?? null;

const toText = (minor: number | null): string => (minor == null ? '' : String(minor / 100));

/** DZD text → centimes; empty → null (mode not offered); invalid → undefined. */
function parseDzd(text: string): number | null | undefined {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const dzd = Number(trimmed);
  return Number.isFinite(dzd) && dzd >= 0 ? Math.round(dzd * 100) : undefined;
}

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

const smallInputCls =
  'px-3 py-1.5 bg-card border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary';

// ──────────────────────────────────────────────────────────────────────────
// Wilaya create / edit modal
// ──────────────────────────────────────────────────────────────────────────

interface WilayaFormProps {
  isOpen: boolean;
  onClose: () => void;
  /** Editing an existing wilaya; absent = creating one. */
  wilaya?: DeliveryWilaya;
}

const WilayaFormModal: React.FC<WilayaFormProps> = ({ isOpen, onClose, wilaya }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ code: '', name: '', nameAr: '', shippingZone: '3', home: '', office: '' });
  const [create, { loading: creating }] = useMutation(CreateDeliveryWilayaDocument, {
    refetchQueries: [DeliveryWilayasDocument],
  });
  const [update, { loading: updating }] = useMutation(UpdateDeliveryWilayaDocument);

  React.useEffect(() => {
    if (!isOpen) return;
    setForm(
      wilaya
        ? {
            code: wilaya.code,
            name: wilaya.name,
            nameAr: wilaya.nameAr,
            shippingZone: String(wilaya.shippingZone),
            home: toText(wilaya.homePrice ?? null),
            office: toText(wilaya.officePrice ?? null),
          }
        : { code: '', name: '', nameAr: '', shippingZone: '3', home: '', office: '' }
    );
  }, [isOpen, wilaya]);

  const home = parseDzd(form.home);
  const office = parseDzd(form.office);
  const valid =
    /^\d{2}$/.test(form.code.trim()) &&
    form.name.trim() !== '' &&
    form.nameAr.trim() !== '' &&
    home !== undefined &&
    office !== undefined;

  const submit = async () => {
    if (!valid) return;
    try {
      if (wilaya) {
        await update({
          variables: {
            input: {
              id: wilaya.id,
              name: form.name.trim(),
              nameAr: form.nameAr.trim(),
              shippingZone: Number(form.shippingZone),
              homePrice: home,
              officePrice: office,
            },
          },
        });
        dispatch(addToast({ message: `Wilaya ${form.name.trim()} mise à jour`, type: 'success' }));
      } else {
        await create({
          variables: {
            input: {
              code: form.code.trim(),
              name: form.name.trim(),
              nameAr: form.nameAr.trim(),
              shippingZone: Number(form.shippingZone),
              homePrice: home,
              officePrice: office,
            },
          },
        });
        dispatch(addToast({ message: `Wilaya ${form.name.trim()} ajoutée`, type: 'success' }));
      }
      onClose();
    } catch (err) {
      dispatch(addToast({ message: errorMessage(err, "Erreur lors de l'enregistrement"), type: 'error' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={wilaya ? `Modifier ${wilaya.name}` : 'Nouvelle wilaya'} size="md">
      <ModalContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Code"
            value={form.code}
            disabled={!!wilaya}
            maxLength={2}
            placeholder="70"
            helperText={wilaya ? undefined : 'Deux chiffres, unique'}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <div className="col-span-2">
            <Select
              label="Zone de délai"
              value={form.shippingZone}
              options={ZONE_OPTIONS}
              onChange={(e) => setForm({ ...form, shippingZone: e.target.value })}
            />
          </div>
        </div>
        <Input
          label="Nom (français)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Nom (arabe)"
          dir="rtl"
          value={form.nameAr}
          onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Domicile (DA)"
            type="number"
            min={0}
            step={50}
            placeholder="Non proposé"
            value={form.home}
            error={home === undefined ? 'Prix invalide' : undefined}
            onChange={(e) => setForm({ ...form, home: e.target.value })}
          />
          <Input
            label="Bureau (DA)"
            type="number"
            min={0}
            step={50}
            placeholder="Non proposé"
            value={form.office}
            error={office === undefined ? 'Prix invalide' : undefined}
            onChange={(e) => setForm({ ...form, office: e.target.value })}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Un prix laissé vide signifie que ce mode de livraison n'est pas proposé dans la wilaya.
        </p>
      </ModalContent>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={submit} loading={creating || updating} disabled={!valid}>
          {wilaya ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Communes of one wilaya
// ──────────────────────────────────────────────────────────────────────────

interface CommuneFormProps {
  isOpen: boolean;
  onClose: () => void;
  wilaya: DeliveryWilaya;
  /** Editing an existing commune; absent = creating one. */
  commune?: DeliveryCommune;
}

const CommuneFormModal: React.FC<CommuneFormProps> = ({ isOpen, onClose, wilaya, commune }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', nameAr: '', postalCode: '' });
  const [create, { loading: creating }] = useMutation(CreateDeliveryCommuneDocument, {
    refetchQueries: [DeliveryWilayasDocument],
  });
  const [update, { loading: updating }] = useMutation(UpdateDeliveryCommuneDocument);

  React.useEffect(() => {
    if (!isOpen) return;
    setForm(
      commune
        ? { name: commune.name, nameAr: commune.nameAr, postalCode: commune.postalCode ?? '' }
        : { name: '', nameAr: '', postalCode: '' }
    );
  }, [isOpen, commune]);

  const valid = form.name.trim() !== '' && form.nameAr.trim() !== '';

  const submit = async () => {
    if (!valid) return;
    const fields = { name: form.name.trim(), nameAr: form.nameAr.trim(), postalCode: form.postalCode.trim() || null };
    try {
      if (commune) {
        await update({ variables: { input: { id: commune.id, ...fields } } });
        dispatch(addToast({ message: `Commune ${fields.name} mise à jour`, type: 'success' }));
      } else {
        await create({ variables: { input: { wilayaId: wilaya.id, ...fields } } });
        dispatch(addToast({ message: `Commune ${fields.name} ajoutée à ${wilaya.name}`, type: 'success' }));
      }
      onClose();
    } catch (err) {
      dispatch(addToast({ message: errorMessage(err, "Erreur lors de l'enregistrement"), type: 'error' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={commune ? `Modifier ${commune.name}` : `Nouvelle commune — ${wilaya.name}`}
      size="sm"
    >
      <ModalContent className="space-y-4">
        <Input label="Nom (français)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input
          label="Nom (arabe)"
          dir="rtl"
          value={form.nameAr}
          onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
        />
        <Input
          label="Code postal"
          value={form.postalCode}
          placeholder="Facultatif"
          onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
        />
      </ModalContent>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={submit} loading={creating || updating} disabled={!valid}>
          {commune ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const CommunesPanel: React.FC<{ wilaya: DeliveryWilaya }> = ({ wilaya }) => {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState<DeliveryCommune | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<DeliveryCommune | undefined>();
  const [update] = useMutation(UpdateDeliveryCommuneDocument);
  const [remove, { loading: removing }] = useMutation(DeleteDeliveryCommuneDocument, {
    refetchQueries: [DeliveryWilayasDocument],
  });

  const toggle = async (commune: DeliveryCommune) => {
    try {
      await update({ variables: { input: { id: commune.id, active: !commune.active } } });
    } catch (err) {
      dispatch(addToast({ message: errorMessage(err, 'Erreur lors de la mise à jour'), type: 'error' }));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove({ variables: { id: deleting.id } });
      dispatch(addToast({ message: `Commune ${deleting.name} supprimée`, type: 'success' }));
      setDeleting(undefined);
    } catch (err) {
      dispatch(addToast({ message: errorMessage(err, 'Erreur lors de la suppression'), type: 'error' }));
    }
  };

  return (
    <div className="bg-card/60 border-t border-border px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-foreground">
          Communes de {wilaya.name}{' '}
          <span className="text-muted-foreground font-normal">({wilaya.communes.length})</span>
        </p>
        <PermissionGate permission="UpdateShippingMethod" disableMode>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter une commune
          </Button>
        </PermissionGate>
      </div>
      {wilaya.communes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune commune — les clients de cette wilaya ne peuvent pas commander.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {wilaya.communes.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-2 rounded border border-border px-3 py-1.5 text-sm ${
                c.active ? '' : 'opacity-60'
              }`}
            >
              <input
                type="checkbox"
                checked={c.active}
                aria-label={`${c.name} — proposée`}
                title={c.active ? 'Proposée aux clients' : 'Masquée'}
                onChange={() => toggle(c)}
              />
              <span className="flex-1 truncate text-foreground">
                {c.name}
                <span className="ml-2 text-muted-foreground" dir="rtl">
                  {c.nameAr}
                </span>
              </span>
              {c.postalCode && <span className="text-xs text-muted-foreground">{c.postalCode}</span>}
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Modifier ${c.name}`}
                onClick={() => {
                  setEditing(c);
                  setFormOpen(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-red-500"
                aria-label={`Supprimer ${c.name}`}
                onClick={() => setDeleting(c)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <CommuneFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} wilaya={wilaya} commune={editing} />
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(undefined)}
        onConfirm={confirmDelete}
        loading={removing}
        variant="danger"
        title="Supprimer la commune"
        confirmText="Supprimer"
        message={
          <>
            Supprimer <strong>{deleting?.name}</strong> ? Les commandes existantes conservent leur adresse. Pour
            la masquer temporairement, décochez-la plutôt.
          </>
        }
      />
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Main section
// ──────────────────────────────────────────────────────────────────────────

/**
 * Delivery destinations: the wilayas customers can be delivered to, their
 * communes, delay zone, on/off switch and the two delivery prices. Prices are
 * shown and edited in DZD (the API stores centimes) and saved in bulk; the
 * other fields save immediately.
 */
export const WilayaShippingSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { data, loading, refetch } = useQuery(DeliveryWilayasDocument);
  const [updatePrices, { loading: saving }] = useMutation(UpdateWilayaShippingPricesDocument);
  const [updateWilaya] = useMutation(UpdateDeliveryWilayaDocument);
  const [deleteWilaya, { loading: deletingWilaya }] = useMutation(DeleteDeliveryWilayaDocument, {
    refetchQueries: [DeliveryWilayasDocument],
  });

  const [edited, setEdited] = useState<Record<string, Draft>>({});
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryWilaya | undefined>();
  const [deleting, setDeleting] = useState<DeliveryWilaya | undefined>();

  const all = useMemo(() => data?.deliveryWilayas ?? [], [data]);
  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return all;
    return all.filter((w) => w.code.includes(q) || w.name.toLowerCase().includes(q) || w.nameAr.includes(q));
  }, [all, filter]);

  /** Value a price field would be saved with: the typed text if valid, else the stored price. */
  const resolved = (row: DeliveryWilaya, mode: Mode): number | null => {
    const text = edited[row.code]?.[mode];
    if (text === undefined) return stored(row, mode);
    const parsed = parseDzd(text);
    return parsed === undefined ? stored(row, mode) : parsed;
  };
  const isDirty = (row: DeliveryWilaya, mode: Mode) => resolved(row, mode) !== stored(row, mode);
  const dirtyRows = all.filter((row) => MODES.some(({ key }) => isDirty(row, key)));

  const handleSave = async () => {
    if (dirtyRows.length === 0) return;
    try {
      await updatePrices({
        variables: {
          input: dirtyRows.map((row) => ({
            code: row.code,
            homePrice: resolved(row, 'home'),
            officePrice: resolved(row, 'office'),
          })),
        },
      });
      dispatch(
        addToast({
          message: `Tarifs mis à jour (${dirtyRows.length} wilaya${dirtyRows.length > 1 ? 's' : ''})`,
          type: 'success',
        })
      );
      setEdited({});
      await refetch();
    } catch (err) {
      dispatch(addToast({ message: errorMessage(err, 'Erreur lors de la mise à jour'), type: 'error' }));
    }
  };

  const setDraft = (code: string, mode: Mode, text: string) =>
    setEdited((prev) => ({ ...prev, [code]: { ...prev[code], [mode]: text } }));

  const patchWilaya = async (row: DeliveryWilaya, patch: { active?: boolean; shippingZone?: number }) => {
    try {
      await updateWilaya({ variables: { input: { id: row.id, ...patch } } });
    } catch (err) {
      dispatch(addToast({ message: errorMessage(err, 'Erreur lors de la mise à jour'), type: 'error' }));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteWilaya({ variables: { id: deleting.id } });
      dispatch(addToast({ message: `Wilaya ${deleting.name} supprimée`, type: 'success' }));
      setDeleting(undefined);
    } catch (err) {
      dispatch(addToast({ message: errorMessage(err, 'Erreur lors de la suppression'), type: 'error' }));
    }
  };

  const inactiveCount = all.filter((w) => !w.active).length;

  return (
    <div className="bg-muted/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-500" />
            Destinations et tarifs de livraison
          </h3>
          <p className="text-sm text-muted-foreground">
            Wilayas et communes proposées au client, zone de délai et prix de la livraison à domicile et au bureau du
            transporteur. Une wilaya désactivée disparaît du site et de l'application ; un prix vide retire ce mode
            dans la wilaya.
          </p>
        </div>
        <PermissionGate permission="UpdateShippingMethod" disableMode>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle wilaya
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              loading={saving}
              disabled={saving || dirtyRows.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les tarifs{dirtyRows.length > 0 ? ` (${dirtyRows.length})` : ''}
            </Button>
          </div>
        </PermissionGate>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Rechercher une wilaya…"
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {!loading && (
          <p className="text-sm text-muted-foreground">
            {all.length} wilaya{all.length > 1 ? 's' : ''}
            {inactiveCount > 0 ? `, ${inactiveCount} désactivée${inactiveCount > 1 ? 's' : ''}` : ''}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          {filter ? 'Aucune wilaya ne correspond' : 'Aucune wilaya — ajoutez-en une ou exécutez les migrations'}
        </p>
      ) : (
        <div className="max-h-[560px] overflow-y-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="w-16">Code</TableHead>
                <TableHead>Wilaya</TableHead>
                <TableHead className="w-20 text-center">Active</TableHead>
                <TableHead className="w-56">Zone de délai</TableHead>
                {MODES.map(({ key, label }) => (
                  <TableHead key={key} className="w-36 text-right">
                    {label}
                  </TableHead>
                ))}
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((w) => (
                <React.Fragment key={w.id}>
                  <TableRow className={w.active ? undefined : 'opacity-60'}>
                    <TableCell>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={expanded === w.id ? 'Masquer les communes' : 'Afficher les communes'}
                        aria-expanded={expanded === w.id}
                        onClick={() => setExpanded(expanded === w.id ? null : w.id)}
                      >
                        {expanded === w.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{w.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{w.name}</span>
                      <span className="ml-2 text-muted-foreground" dir="rtl">
                        {w.nameAr}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {w.communes.length} commune{w.communes.length > 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={w.active}
                        aria-label={`${w.name} — active`}
                        onChange={(e) => patchWilaya(w, { active: e.target.checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        value={w.shippingZone}
                        aria-label={`${w.name} — zone de délai`}
                        onChange={(e) => patchWilaya(w, { shippingZone: Number(e.target.value) })}
                        className={`w-full text-sm ${smallInputCls}`}
                      >
                        {ZONE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    {MODES.map(({ key, label }) => (
                      <TableCell key={key} className="text-right">
                        <input
                          type="number"
                          min={0}
                          step={50}
                          placeholder="—"
                          aria-label={`${w.name} — ${label}`}
                          value={edited[w.code]?.[key] ?? toText(stored(w, key))}
                          onChange={(e) => setDraft(w.code, key, e.target.value)}
                          className={`w-28 text-right ${smallInputCls} ${isDirty(w, key) ? 'border-primary' : ''}`}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={`Modifier ${w.name}`}
                          onClick={() => {
                            setEditing(w);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-red-500"
                          aria-label={`Supprimer ${w.name}`}
                          onClick={() => setDeleting(w)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded === w.id && (
                    <TableRow>
                      <TableCell colSpan={6 + MODES.length} className="p-0">
                        <CommunesPanel wilaya={w} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <WilayaFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} wilaya={editing} />
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(undefined)}
        onConfirm={confirmDelete}
        loading={deletingWilaya}
        variant="danger"
        title="Supprimer la wilaya"
        confirmText="Supprimer"
        message={
          <>
            Supprimer <strong>{deleting?.name}</strong> et ses {deleting?.communes.length ?? 0} communes ? Les commandes
            existantes conservent leur adresse. Si la livraison y est seulement suspendue, décochez plutôt « Active ».
          </>
        }
      />
    </div>
  );
};
