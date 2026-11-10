import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Undo2 } from 'lucide-react';
import { ReturnStatsDocument } from '../../graphql/generated/graphql';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice } from '../../lib/utils';

interface Props {
  /** Number of days back, as the other report tabs use it. */
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  ranges: ReadonlyArray<{ value: string; label: string }>;
}

/** Returns registered in the period (registerReturn), per reason, valued at the price paid. */
export const ReturnsReport: React.FC<Props> = ({ dateRange, onDateRangeChange, ranges }) => {
  const variables = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - Number.parseInt(dateRange, 10) * 24 * 60 * 60 * 1000);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [dateRange]);
  const { data, loading, error } = useQuery(ReturnStatsDocument, { variables, fetchPolicy: 'cache-and-network' });
  const stats = data?.returnStats;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground">Retours</h3>
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary"
        >
          {ranges.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {loading && !stats ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : stats && stats.returns > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Metric label="Retours enregistrés" value={String(stats.returns)} />
            <Metric label="Articles retournés" value={String(stats.units)} />
            <Metric label="Valeur retournée" value={formatPrice(stats.value / 100)} />
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Raison</th>
                  <th className="px-4 py-3 text-right font-medium">Retours</th>
                  <th className="px-4 py-3 text-right font-medium">Articles</th>
                  <th className="px-4 py-3 text-right font-medium">Valeur</th>
                  <th className="px-4 py-3 text-right font-medium">Part</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.byReason.map((r) => (
                  <tr key={r.reason}>
                    <td className="px-4 py-3 text-foreground">{r.reason}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.returns}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.units}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPrice(r.value / 100)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {Math.round((r.returns / stats.returns) * 100)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Undo2 className="h-8 w-8" />
          <p>Aucun retour enregistré sur la période.</p>
          <p className="text-xs">Les retours s'enregistrent depuis la fiche commande (bouton « Retour »).</p>
        </div>
      )}
    </div>
  );
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
