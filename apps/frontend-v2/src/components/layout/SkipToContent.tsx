'use client';

import { useTranslations } from 'next-intl';

/**
 * Visually hidden link that becomes visible on focus, letting keyboard users
 * jump past the header straight into the main content. The page's `<main>`
 * elements must have `id="main"` for the anchor to resolve.
 */
export function SkipToContent() {
  const t = useTranslations('Layout');
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-overlay focus:rounded focus:bg-bg-elevated focus:px-4 focus:py-2 focus:text-14 focus:font-medium focus:text-content-strong focus:shadow-overlay focus:outline-none focus:ring-2 focus:ring-accent"
    >
      {t('skipToContent')}
    </a>
  );
}
