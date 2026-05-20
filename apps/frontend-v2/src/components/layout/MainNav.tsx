import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

const links = [
  { href: '/', key: 'home' },
  { href: '/products', key: 'shop' },
  { href: '/categories', key: 'categories' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const;

export function MainNav({ className }: { className?: string }) {
  const t = useTranslations('Layout.nav');
  return (
    <nav aria-label={t('ariaLabel')} className={cn('hidden lg:block', className)}>
      <ul className="flex items-center gap-6">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex h-10 items-center text-14 font-medium text-content transition-colors hover:text-content-strong"
            >
              {t(link.key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
