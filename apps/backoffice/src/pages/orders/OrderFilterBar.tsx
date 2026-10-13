import React, { useEffect, useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { useDeliveryWilayas } from '../../hooks/useDeliveryWilayas';
import { cn } from '../../lib/utils';
import { DATE_PRESETS, type OrderListState } from './order-list-params';

interface Props {
  state: OrderListState;
  onChange: (patch: Partial<OrderListState>) => void;
  onReset: () => void;
}

const controlCls =
  'h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30';

function presetKeyFor(state: OrderListState): string {
  const now = new Date();
  const hit = DATE_PRESETS.find((p) => {
    const r = p.range(now);
    return r.from === state.from && r.to === state.to;
  });
  return hit ? hit.key : state.from || state.to ? 'custom' : '';
}

function fmtDay(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * One row of controls: search, wilaya, period. Amount range hides behind "Plus".
 * Every change goes straight to the URL through `onChange`; the search box is
 * the only debounced one.
 */
export const OrderFilterBar: React.FC<Props> = ({ state, onChange, onReset }) => {
  const { names: wilayaNames } = useDeliveryWilayas();
  const [search, setSearch] = useState(state.q);
  const debounced = useDebounce(search.trim(), 300);
  const [showMore, setShowMore] = useState(!!(state.min || state.max));

  // Typing -> URL (debounced); URL -> input when a chip clears it or the page is reloaded.
  useEffect(() => {
    if (debounced !== state.q) onChange({ q: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  useEffect(() => {
    setSearch((current) => (current.trim() === state.q ? current : state.q));
  }, [state.q]);

  const presetKey = presetKeyFor(state);
  const chips: Array<{ key: string; label: string; clear: Partial<OrderListState> }> = [];
  if (state.q) chips.push({ key: 'q', label: `« ${state.q} »`, clear: { q: '' } });
  if (state.wilaya) chips.push({ key: 'wilaya', label: state.wilaya, clear: { wilaya: '' } });
  if (state.from || state.to) {
    const preset = DATE_PRESETS.find((p) => p.key === presetKey);
    const label = preset
      ? preset.label
      : state.from && state.to
        ? `${fmtDay(state.from)} → ${fmtDay(state.to)}`
        : state.from
          ? `depuis le ${fmtDay(state.from)}`
          : `jusqu'au ${fmtDay(state.to)}`;
    chips.push({ key: 'date', label, clear: { from: '', to: '' } });
  }
  if (state.min || state.max) {
    const label =
      state.min && state.max
        ? `${state.min} – ${state.max} DZD`
        : state.min
          ? `≥ ${state.min} DZD`
          : `≤ ${state.max} DZD`;
    chips.push({ key: 'amount', label, clear: { min: '', max: '' } });
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="N° de commande ou nom du client"
            aria-label="Rechercher"
            className={cn(controlCls, 'w-full pl-9 pr-9')}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Effacer la recherche"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <select
          value={state.wilaya}
          onChange={(e) => onChange({ wilaya: e.target.value })}
          aria-label="Wilaya"
          className={cn(controlCls, 'lg:w-52')}
        >
          <option value="">Toutes les wilayas</option>
          {wilayaNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={presetKey}
          onChange={(e) => {
            const preset = DATE_PRESETS.find((p) => p.key === e.target.value);
            if (preset) onChange(preset.range(new Date()));
            else if (e.target.value === '') onChange({ from: '', to: '' });
          }}
          aria-label="Période"
          className={cn(controlCls, 'lg:w-44')}
        >
          <option value="">Toute période</option>
          {DATE_PRESETS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
          <option value="custom" disabled={presetKey !== 'custom'}>
            Personnalisée
          </option>
        </select>

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          className={cn(
            controlCls,
            'inline-flex items-center gap-2 font-medium hover:bg-accent',
            showMore && 'border-primary text-primary'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Plus
        </button>
      </div>

      {showMore && (
        <div className="flex flex-col gap-3 rounded-lg bg-accent/40 p-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Du
            <input
              type="date"
              value={state.from}
              max={state.to || undefined}
              onChange={(e) => onChange({ from: e.target.value })}
              className={controlCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Au
            <input
              type="date"
              value={state.to}
              min={state.from || undefined}
              onChange={(e) => onChange({ to: e.target.value })}
              className={controlCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Montant min (DZD)
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={state.min}
              onChange={(e) => onChange({ min: e.target.value })}
              className={cn(controlCls, 'w-36')}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Montant max (DZD)
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={state.max}
              onChange={(e) => onChange({ max: e.target.value })}
              className={cn(controlCls, 'w-36')}
            />
          </label>
        </div>
      )}

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-3 pr-1 text-primary"
            >
              {chip.label}
              <button
                type="button"
                onClick={() => onChange(chip.clear)}
                aria-label={`Retirer le filtre ${chip.label}`}
                className="rounded-full p-0.5 hover:bg-primary/20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onReset}
            className="ml-1 text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Tout effacer
          </button>
        </div>
      )}
    </div>
  );
};
