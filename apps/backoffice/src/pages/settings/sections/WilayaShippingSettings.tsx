import React, { useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { MapPin, Save, Search } from 'lucide-react';
import { addToast } from '../../../store/slices/uiSlice';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table';
import { PermissionGate } from '../../../components/auth/PermissionGate';

// Raw documents (not codegen): these operations come from the oscar-plugin
// admin-api extension; regenerate graphql codegen against a running backend
// to migrate them to generated documents.
const WILAYA_SHIPPING_PRICES = gql`
  query WilayaShippingPrices {
    wilayaShippingPrices {
      id
      code
      name
      nameAr
      homePrice
      officePrice
    }
  }
`;

const UPDATE_WILAYA_SHIPPING_PRICES = gql`
  mutation UpdateWilayaShippingPrices($input: [UpdateWilayaShippingPriceInput!]!) {
    updateWilayaShippingPrices(input: $input) {
      id
      code
      homePrice
      officePrice
    }
  }
`;

interface WilayaShippingPrice {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  /** Minor units (centimes); null = home delivery not offered. */
  homePrice: number | null;
  /** Minor units (centimes); null = office pickup not offered. */
  officePrice: number | null;
}

type Mode = 'home' | 'office';
/** Text typed per mode, in DZD. A missing key means the field is untouched. */
type Draft = Partial<Record<Mode, string>>;

const MODES: ReadonlyArray<{ key: Mode; label: string }> = [
  { key: 'home', label: 'Domicile (DA)' },
  { key: 'office', label: 'Bureau (DA)' },
];

const stored = (row: WilayaShippingPrice, mode: Mode): number | null =>
  mode === 'home' ? row.homePrice : row.officePrice;

const toText = (minor: number | null): string => (minor == null ? '' : String(minor / 100));

/** DZD text → centimes; empty → null (mode not offered); invalid → undefined. */
function parseDzd(text: string): number | null | undefined {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const dzd = Number(trimmed);
  return Number.isFinite(dzd) && dzd >= 0 ? Math.round(dzd * 100) : undefined;
}

/**
 * Editable table of the 69 wilayas' delivery prices, one column per delivery
 * mode (home delivery / courier office pickup). Prices are shown and edited
 * in DZD; the API stores centimes. An empty price means the mode is not
 * offered in that wilaya. Only modified rows are sent.
 */
export const WilayaShippingSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { data, loading, refetch } = useQuery<{ wilayaShippingPrices: WilayaShippingPrice[] }>(
    WILAYA_SHIPPING_PRICES
  );
  const [updatePrices, { loading: saving }] = useMutation(UPDATE_WILAYA_SHIPPING_PRICES);

  const [edited, setEdited] = useState<Record<string, Draft>>({});
  const [filter, setFilter] = useState('');

  const rows = useMemo(() => {
    const all = data?.wilayaShippingPrices ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (w) => w.code.includes(q) || w.name.toLowerCase().includes(q) || w.nameAr.includes(q)
    );
  }, [data, filter]);

  /** Value a field would be saved with: the typed text if valid, else the stored price. */
  const resolved = (row: WilayaShippingPrice, mode: Mode): number | null => {
    const text = edited[row.code]?.[mode];
    if (text === undefined) return stored(row, mode);
    const parsed = parseDzd(text);
    return parsed === undefined ? stored(row, mode) : parsed;
  };

  const isDirty = (row: WilayaShippingPrice, mode: Mode) => resolved(row, mode) !== stored(row, mode);

  const dirtyRows = (data?.wilayaShippingPrices ?? []).filter((row) =>
    MODES.some(({ key }) => isDirty(row, key))
  );

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
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur lors de la mise à jour', type: 'error' }));
    }
  };

  const setDraft = (code: string, mode: Mode, text: string) =>
    setEdited((prev) => ({ ...prev, [code]: { ...prev[code], [mode]: text } }));

  return (
    <div className="bg-muted/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-500" />
            Livraison par wilaya
          </h3>
          <p className="text-sm text-muted-foreground">
            Prix de la livraison à domicile et au bureau du transporteur, appliqués au checkout selon la
            wilaya du client. Laisser vide pour ne pas proposer ce mode dans la wilaya.
          </p>
        </div>
        <PermissionGate permission="UpdateShippingMethod" disableMode>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={saving || dirtyRows.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer{dirtyRows.length > 0 ? ` (${dirtyRows.length})` : ''}
          </Button>
        </PermissionGate>
      </div>

      <div className="relative mb-3 max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Rechercher une wilaya…"
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          {filter ? 'Aucune wilaya ne correspond' : 'Aucune wilaya — exécutez les migrations'}
        </p>
      ) : (
        <div className="max-h-[480px] overflow-y-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Code</TableHead>
                <TableHead>Wilaya</TableHead>
                {MODES.map(({ key, label }) => (
                  <TableHead key={key} className="w-40 text-right">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((w) => (
                <TableRow key={w.code}>
                  <TableCell>
                    <Badge variant="default">{w.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{w.name}</span>
                    <span className="ml-2 text-muted-foreground" dir="rtl">
                      {w.nameAr}
                    </span>
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
                        className={`w-28 px-3 py-1.5 bg-card border rounded text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary ${
                          isDirty(w, key) ? 'border-primary' : 'border-border'
                        }`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
