'use client';

import { useTranslations } from 'next-intl';
import { CategoryCircles } from '@/components/patterns';
import { PageHeader } from '@/components/layout';

export default function CategoriesPage() {
  const t = useTranslations('CategoriesPage');

  return (
    <div className="flex flex-col">
      <PageHeader
        breadcrumbs={[{ label: t('breadcrumbHome'), href: '/' }, { label: t('breadcrumbAll') }]}
        title={t('title')}
        description={t('subtitle')}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Single backend-driven category component (top-level collections). */}
        <CategoryCircles source="roots" align="center" limit={50} />
      </div>
    </div>
  );
}
