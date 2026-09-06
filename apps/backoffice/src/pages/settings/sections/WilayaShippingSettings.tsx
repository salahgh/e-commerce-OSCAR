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
      price
    }
  }
`;

const UPDATE_WILAYA_SHIPPING_PRICES = gql`
  mutation UpdateWilayaShippingPrices($input: [UpdateWilayaShippingPriceInput!]!) {
    updateWilayaShippingPrices(input: $input) {
      id
      code
      price
    }
  }
`;

interface WilayaShippingPrice {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  /** Minor units (centimes). */
  price: number;
}

/**
 * Editable table of the 69 wilayas' delivery prices. Prices are shown and
 * edited in DZD; the API stores centimes. Only modified rows are sent.
 */
export const WilayaShippingSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { data, loading, refetch } = useQuery<{ wilayaShippingPrices: WilayaShippingPrice[] }>(
    WILAYA_SHIPPING_PRICES
  );
  const [updatePrices, { loading: saving }] = useMutation(UPDATE_WILAYA_SHIPPING_PRICES);

  // Edited prices in DZD, keyed by wilaya code.
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('');

  const rows = useMemo(() => {
    const all = data?.wilayaShippingPrices ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (w) => w.code.includes(q) || w.name.toLowerCase().includes(q) || w.nameAr.includes(q)
    );
  }, [data, filter]);

  const dirtyCodes = Object.keys(edited).filter((code) => {
    const row = data?.wilayaShippingPrices.find((w) => w.code === code);
    if (!row) return false;
    const dzd = Number(edited[code]);
    return Number.isFinite(dzd) && dzd >= 0 && Math.round(dzd * 100) !== row.price;
  });

  const handleSave = async () => {
    if (dirtyCodes.length === 0) return;
    try {
      await updatePrices({
        variables: {
          input: dirtyCodes.map((code) => ({
            code,
            price: Math.round(Number(edited[code]) * 100),
          })),
        },
      });
      dispatch(
        addToast({
          message: `Tarifs mis à jour (${dirtyCodes.length} wilaya${dirtyCodes.length > 1 ? 's' : ''})`,
          type: 'success',
        })
      );
      setEdited({});
      await refetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur lors de la mise à jour', type: 'error' }));
    }
  };

  return (
    <div className="bg-muted/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-500" />
            Livraison par wilaya
          </h3>
          <p className="text-sm text-muted-foreground">
            Prix de livraison à domicile appliqué au checkout selon la wilaya du client
          </p>
        </div>
        <PermissionGate permission="UpdateShippingMethod" disableMode>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={saving || dirtyCodes.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer{dirtyCodes.length > 0 ? ` (${dirtyCodes.length})` : ''}
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
                <TableHead className="w-44 text-right">Prix livraison (DA)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((w) => {
                const value = edited[w.code] ?? String(w.price / 100);
                const dirty = dirtyCodes.includes(w.code);
                return (
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
                    <TableCell className="text-right">
                      <input
                        type="number"
                        min={0}
                        step={50}
                        value={value}
                        onChange={(e) =>
                          setEdited((prev) => ({ ...prev, [w.code]: e.target.value }))
                        }
                        className={`w-28 px-3 py-1.5 bg-card border rounded text-right text-foreground focus:outline-none focus:ring-1 focus:ring-primary ${
                          dirty ? 'border-primary' : 'border-border'
                        }`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
