import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { Link } from '@/i18n/routing';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** Render as white (for dark backgrounds / dark mode). */
  inverted?: boolean;
  className?: string;
}

/** Heights mirror the Figma OSCAR monogram (aspect ratio ≈ 1.30). */
const sizeMap = {
  sm: 'h-10',
  md: 'h-[58px]',
  lg: 'h-24',
} as const;

export function Logo({ size = 'md', inverted, className }: LogoProps) {
  const t = useTranslations('Layout');
  return (
    <Link
      href="/"
      aria-label={t('logoAria')}
      className={cn(
        'inline-flex items-center transition-opacity hover:opacity-80',
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home/logo-oscar.svg"
        alt="OSCAR"
        className={cn('w-auto', sizeMap[size], inverted && 'brightness-0 invert')}
      />
    </Link>
  );
}
