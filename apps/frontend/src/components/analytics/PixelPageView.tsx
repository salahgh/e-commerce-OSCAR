'use client';

import { useEffect } from 'react';
// next/navigation (not @/i18n/routing) so the locale prefix stays in the
// pathname — switching locale on the same page must still count as a view.
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/** Reports a page view to every ad pixel on initial load and each route change. */
export function PixelPageView() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return null;
}
