import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { Link } from '@/i18n/routing';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { box: 'h-8', line1: 'text-12', line2: 'text-12' },
  md: { box: 'h-10', line1: 'text-14', line2: 'text-14' },
  lg: { box: 'h-12', line1: 'text-16', line2: 'text-16' },
} as const;

export function Logo({ size = 'md', inverted, className }: LogoProps) {
  const t = useTranslations('Layout');
  const sx = sizeMap[size];
  return (
    <Link
      href="/"
      aria-label={t('logoAria')}
      className={cn(
        'inline-flex items-center justify-center font-bold leading-none tracking-wider transition-opacity hover:opacity-80',
        sx.box,
        inverted ? 'text-content-inverse' : 'text-content-strong',
        className,
      )}
    >
      <span className="flex flex-col items-center">
        <span className={cn('block', sx.line1)}>OSCAR</span>
        <span className={cn('block', sx.line2)}>NAJAR</span>
      </span>
    </Link>
  );
}
