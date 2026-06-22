'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ArrowDownUp, Check } from 'lucide-react';
import { useGetProductsQuery, SortOrder } from '@oscar/graphql-shop/generated';
import { Alert } from '@/components/ui';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { ProductCard, ProductCardSkeleton, CategoryCircles, type ProductCardData } from '@/components/patterns';
import { variantDiscount } from '@/lib/format/discount';
import { cn } from '@/lib/utils/cn';

const TAKE = 48;

type SortKey = 'popular' | 'newest' | 'top' | 'price-asc' | 'price-desc';

type Item = {
  id: string;
  slug: string;
  name: string;
  featuredAsset?: { preview: string } | null;
  variants: Array<{ priceWithTax: number; currencyCode: string; options: Array<{ code: string; name: string; group: { code: string; name: string } }> }>;
};

function toCardData(p: Item): ProductCardData {
  const v = p.variants[0];
  return {
    slug: p.slug,
    name: p.name,
    imageUrl: p.featuredAsset?.preview ?? null,
    currencyCode: v?.currencyCode ?? 'DZD',
    ...variantDiscount(v),
  };
}

const minPriceOf = (p: Item) => Math.min(...p.variants.map((v) => v.priceWithTax));

/** Outlined toolbar control (Figma "متغيرات الأرار"). */
function ToolbarButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 text-18 font-medium text-content-strong transition-colors hover:border-border-strong"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function ProductsPage() {
  const t = useTranslations('ProductsPage');

  const { data, loading, error } = useGetProductsQuery({
    variables: { options: { take: TAKE, sort: { createdAt: SortOrder.Desc } } },
  });
  const items = (data?.products.items ?? []) as Item[];

  // Price bounds (cents) from the loaded set.
  const bounds = React.useMemo<[number, number]>(() => {
    if (items.length === 0) return [0, 0];
    const prices = items.map(minPriceOf);
    return [Math.min(...prices), Math.max(...prices)];
  }, [items]);

  const [sortKey, setSortKey] = React.useState<SortKey>('newest');
  const [priceRange, setPriceRange] = React.useState<[number, number] | null>(null);
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);

  // Available sizes across the loaded products — deduped by NAME (each product has
  // its own size-option codes, so keying by code yields one chip per product).
  const sizes = React.useMemo(() => {
    const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', 'XXXL', 'ONE SIZE'];
    const names = new Set<string>();
    for (const p of items) {
      for (const v of p.variants) {
        for (const o of v.options) {
          if (/taille|size|مقاس/i.test(o.group.code) || /taille|size|مقاس/i.test(o.group.name)) names.add(o.name);
        }
      }
    }
    const rank = (n: string) => {
      const i = order.indexOf(n.trim().toUpperCase());
      return i === -1 ? order.length : i;
    };
    return Array.from(names, (name) => ({ code: name, name })).sort((a, b) => rank(a.name) - rank(b.name));
  }, [items]);

  const shown = React.useMemo(() => {
    let list = items.slice();
    if (priceRange) list = list.filter((p) => minPriceOf(p) >= priceRange[0] && minPriceOf(p) <= priceRange[1]);
    if (selectedSizes.length > 0) {
      list = list.filter((p) =>
        p.variants.some((v) => v.options.some((o) => selectedSizes.includes(o.name))),
      );
    }
    switch (sortKey) {
      case 'price-asc':
        list.sort((a, b) => minPriceOf(a) - minPriceOf(b));
        break;
      case 'price-desc':
        list.sort((a, b) => minPriceOf(b) - minPriceOf(a));
        break;
      default:
        break; // 'newest' is the fetch order; 'popular'/'top' fall back to it
    }
    return list;
  }, [items, priceRange, selectedSizes, sortKey]);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto flex max-w-[1392px] flex-col gap-6">
        <CategoryCircles size={78} align="end" limit={6} />

        {/* Toolbar: title (right in RTL) + filters (left). Stacked on mobile, title on top. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h1 className="w-full text-right text-24 font-medium text-accent sm:w-auto sm:text-32">{t('title')}</h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <SizeFilter sizes={sizes} selected={selectedSizes} onApply={setSelectedSizes} />
            <PriceFilter bounds={bounds} value={priceRange} onApply={setPriceRange} />
            <SortMenu value={sortKey} onApply={setSortKey} />
          </div>
        </div>

        {error && (
          <Alert intent="danger" title={t('errorTitle')}>
            {error.message}
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : shown.map((p) => <ProductCard key={p.id} product={toCardData(p)} />)}
        </div>

        {!loading && shown.length === 0 && <p className="py-12 text-center text-content-muted">{t('empty')}</p>}
      </div>
    </div>
  );
}

/* ---------------- Filter / sort modals ---------------- */

function ModalActions({ onReset, resetLabel, count, saveLabel }: { onReset: () => void; resetLabel: string; count: number; saveLabel: string }) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <button type="button" onClick={onReset} className="flex-1 rounded-lg border border-border-strong bg-white px-4 py-2 text-16 font-medium text-content-strong">
        {resetLabel}
      </button>
      <button type="submit" className="flex-1 rounded-lg bg-accent px-4 py-2 text-16 font-medium text-content-inverse">
        {saveLabel} ({count})
      </button>
    </div>
  );
}

function PriceFilter({ bounds, value, onApply }: { bounds: [number, number]; value: [number, number] | null; onApply: (v: [number, number] | null) => void }) {
  const t = useTranslations('ProductsPage');
  const [open, setOpen] = React.useState(false);
  const [lo, setLo] = React.useState(value?.[0] ?? bounds[0]);
  const [hi, setHi] = React.useState(value?.[1] ?? bounds[1]);

  React.useEffect(() => {
    setLo(value?.[0] ?? bounds[0]);
    setHi(value?.[1] ?? bounds[1]);
  }, [open, value, bounds]);

  const dzd = (cents: number) => `${Math.round(cents / 100)} دج`;
  const pct = (cents: number) => (bounds[1] === bounds[0] ? 0 : ((cents - bounds[0]) / (bounds[1] - bounds[0])) * 100);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 text-18 font-medium text-content-strong transition-colors hover:border-border-strong">
          <ChevronDown className="size-5" strokeWidth={1.75} />
          <span>{t('filterPrice')}</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-right text-24 font-[600] text-accent">{t('priceTitle')}</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onApply(lo <= bounds[0] && hi >= bounds[1] ? null : [Math.min(lo, hi), Math.max(lo, hi)]);
            setOpen(false);
          }}
          className="mt-6 flex flex-col gap-6"
        >
          <div className="relative h-6">
            <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-border" />
            <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent" style={{ insetInlineStart: `${pct(lo)}%`, width: `${Math.max(0, pct(hi) - pct(lo))}%` }} />
            <input type="range" min={bounds[0]} max={bounds[1]} value={lo} onChange={(e) => setLo(Math.min(Number(e.target.value), hi))} className="pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent" aria-label={t('from')} />
            <input type="range" min={bounds[0]} max={bounds[1]} value={hi} onChange={(e) => setHi(Math.max(Number(e.target.value), lo))} className="pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent" aria-label={t('to')} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex flex-1 flex-col gap-1 text-right">
              <span className="text-14 text-content-muted">{t('to')}</span>
              <span className="rounded-lg border border-border px-3 py-2 text-16 text-content-strong">{dzd(hi)}</span>
            </label>
            <label className="flex flex-1 flex-col gap-1 text-right">
              <span className="text-14 text-content-muted">{t('from')}</span>
              <span className="rounded-lg border border-border px-3 py-2 text-16 text-content-strong">{dzd(lo)}</span>
            </label>
          </div>
          <ModalActions onReset={() => { setLo(bounds[0]); setHi(bounds[1]); }} resetLabel={t('reset')} count={1} saveLabel={t('save')} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SortMenu({ value, onApply }: { value: SortKey; onApply: (v: SortKey) => void }) {
  const t = useTranslations('ProductsPage');
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<SortKey>(value);
  React.useEffect(() => setDraft(value), [open, value]);

  const options: Array<{ key: SortKey; label: string }> = [
    { key: 'popular', label: t('sortPopular') },
    { key: 'newest', label: t('sortNewest') },
    { key: 'top', label: t('sortTopRated') },
    { key: 'price-asc', label: t('sortPriceAsc') },
    { key: 'price-desc', label: t('sortPriceDesc') },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border-strong bg-white px-3 text-18 font-medium text-content-strong transition-colors hover:border-[#646466]">
          <ArrowDownUp className="size-5" strokeWidth={1.75} />
          <span>{t('filterSort')}</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-right text-24 font-[600] text-accent">{t('sortTitle')}</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onApply(draft);
            setOpen(false);
          }}
          className="mt-6 flex flex-col"
        >
          <ul className="flex flex-col">
            {options.map((o) => (
              <li key={o.key}>
                <button
                  type="button"
                  onClick={() => setDraft(o.key)}
                  className="flex w-full items-center justify-between gap-2 py-3 text-right text-18 text-content-strong"
                >
                  <span>{o.label}</span>
                  <span className={cn('flex size-5 items-center justify-center rounded-full border', draft === o.key ? 'border-accent bg-accent text-content-inverse' : 'border-border-strong')}>
                    {draft === o.key && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <ModalActions onReset={() => setDraft('newest')} resetLabel={t('clearAll')} count={1} saveLabel={t('save')} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SizeFilter({ sizes, selected, onApply }: { sizes: Array<{ code: string; name: string }>; selected: string[]; onApply: (v: string[]) => void }) {
  const t = useTranslations('ProductsPage');
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<string[]>(selected);
  React.useEffect(() => setDraft(selected), [open, selected]);

  const toggle = (code: string) => setDraft((d) => (d.includes(code) ? d.filter((c) => c !== code) : [...d, code]));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 text-18 font-medium text-content-strong transition-colors hover:border-border-strong">
          <ChevronDown className="size-5" strokeWidth={1.75} />
          <span>{t('filterSize')}</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-right text-24 font-[600] text-accent">{t('filterSize')}</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onApply(draft);
            setOpen(false);
          }}
          className="mt-6 flex flex-col gap-4"
        >
          {sizes.length === 0 ? (
            <p className="py-4 text-right text-16 text-content-muted">{t('empty')}</p>
          ) : (
            <ul className="flex flex-col">
              {sizes.map((s) => (
                <li key={s.code}>
                  <button
                    type="button"
                    onClick={() => toggle(s.code)}
                    className="flex w-full items-center justify-between gap-2 py-3 text-right text-18 text-content-strong"
                  >
                    <span>{s.name}</span>
                    <span
                      className={cn(
                        'flex size-5 items-center justify-center rounded border',
                        draft.includes(s.code) ? 'border-accent bg-accent text-content-inverse' : 'border-border-strong',
                      )}
                    >
                      {draft.includes(s.code) && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ModalActions onReset={() => setDraft([])} resetLabel={t('clearAll')} count={draft.length} saveLabel={t('save')} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
