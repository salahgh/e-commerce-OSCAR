// Server component. Promo bar copy is editable from messages.* under TopBar.promo
// but falls back to baked-in Arabic copy when the key is missing.
import { useTranslations } from 'next-intl';

export function TopBar() {
  let promo = 'خصم شامل التخفيضات التي تبدأ من 12000 دينار جزائري';
  try {
    const t = useTranslations('TopBar');
    promo = t('promo');
  } catch {
    // fall through to baked-in copy
  }
  return (
    <div className="bg-accent text-accent-content">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-2 text-12 font-medium">
        {promo}
      </div>
    </div>
  );
}
