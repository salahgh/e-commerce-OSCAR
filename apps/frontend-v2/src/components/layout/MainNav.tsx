import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

interface MainNavLink {
  href: string;
  label: string;
}

const links: MainNavLink[] = [
  { href: '/', label: 'الرئيسية' },
  { href: '/products', label: 'المتجر' },
  { href: '/categories', label: 'الفئات' },
  { href: '/about', label: 'من نحن' },
  { href: '/contact', label: 'اتصل بنا' },
];

export function MainNav({ className }: { className?: string }) {
  return (
    <nav aria-label="Navigation principale" className={cn('hidden lg:block', className)}>
      <ul className="flex items-center gap-6">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex h-10 items-center text-14 font-medium text-content transition-colors hover:text-content-strong"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
