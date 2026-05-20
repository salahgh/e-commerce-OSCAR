'use client';

import * as React from 'react';
import { Ruler } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';

// Placeholder size chart — replace with merchant-provided data when available.
const SIZE_CHART = [
  { size: 'XS', chest: '82-86', waist: '64-68', hip: '90-94' },
  { size: 'S', chest: '86-90', waist: '68-72', hip: '94-98' },
  { size: 'M', chest: '90-94', waist: '72-76', hip: '98-102' },
  { size: 'L', chest: '94-98', waist: '76-80', hip: '102-106' },
  { size: 'XL', chest: '98-102', waist: '80-84', hip: '106-110' },
  { size: 'XXL', chest: '102-106', waist: '84-88', hip: '110-114' },
];

export function SizeGuideDialog({ className }: { className?: string }) {
  const t = useTranslations('ProductPage');
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 text-12 text-content-muted underline-offset-2 hover:underline ${className ?? ''}`}
        >
          <Ruler className="h-3.5 w-3.5" />
          {t('sizeGuide')}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogTitle>{t('sizeGuideTitle')}</DialogTitle>
        <DialogDescription className="mt-1">{t('sizeGuideIntro')}</DialogDescription>
        <div className="mt-4 overflow-x-auto rounded border border-border">
          <table className="min-w-full divide-y divide-border text-14">
            <thead className="bg-bg-subtle text-content-muted">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{t('sizeGuideHeaderSize')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('sizeGuideHeaderChest')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('sizeGuideHeaderWaist')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('sizeGuideHeaderHip')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SIZE_CHART.map((row) => (
                <tr key={row.size}>
                  <td className="px-3 py-2 font-medium text-content-strong">{row.size}</td>
                  <td className="px-3 py-2 text-content-muted">{row.chest}</td>
                  <td className="px-3 py-2 text-content-muted">{row.waist}</td>
                  <td className="px-3 py-2 text-content-muted">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-12 text-content-subtle">{t('sizeGuideFootnote')}</p>
      </DialogContent>
    </Dialog>
  );
}
