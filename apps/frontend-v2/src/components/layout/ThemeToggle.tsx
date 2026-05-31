'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations('Layout.theme');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={mounted ? (isDark ? t('switchToLight') : t('switchToDark')) : t('toggle')}
      className={`inline-flex h-10 w-10 items-center justify-center rounded text-content transition-colors hover:bg-bg-subtle ${className ?? ''}`}
    >
      {mounted ? (
        isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5 opacity-50" aria-hidden="true" />
      )}
    </button>
  );
}
