import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('NotFoundPage');
  return (
    <main className="mx-auto max-w-3xl px-6 py-32 text-center">
      <p className="text-12 uppercase tracking-wide text-content-muted">{t('code')}</p>
      <h1 className="mt-4 text-36 font-bold text-content-strong">{t('title')}</h1>
      <p className="mt-4 text-16 text-content-muted">{t('body')}</p>
    </main>
  );
}
