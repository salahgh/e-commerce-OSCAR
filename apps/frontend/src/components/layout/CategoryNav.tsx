import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

const items = [
  { key: 'women', href: '/categories' },
  { key: 'men', href: '/categories' },
  { key: 'kids', href: '/categories' },
  { key: 'accessories', href: '/categories' },
] as const;

/** Top-level category links shown beneath the header search row (Figma sub-nav). */
export function CategoryNav({ className }: { className?: string }) {
  const t = useTranslations('Layout.categoryNav');
  return (
    <nav aria-label={t('ariaLabel')} className={cn('flex items-center gap-4', className)}>
      {items.map((item, i) => (
        <Link
          key={i}
          href={item.href}
          className="inline-flex items-center gap-1 p-1 text-16 text-accent transition-opacity hover:opacity-70"
        >
          <span>{t(item.key)}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Link>
      ))}
    </nav>
  );
}
