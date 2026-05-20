import { useTranslations } from 'next-intl';

export function TopBar() {
  const t = useTranslations('TopBar');
  return (
    <div className="bg-accent text-accent-content">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-2 text-12 font-medium">
        {t('promo')}
      </div>
    </div>
  );
}
