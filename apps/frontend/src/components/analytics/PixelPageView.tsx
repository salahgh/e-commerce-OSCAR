'use client';

import { useEffect } from 'react';
// next/navigation (not @/i18n/routing) so the locale prefix stays in the
// pathname — switching locale on the same page must still count as a view.
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics/meta-pixel';

/** Fires a Meta Pixel PageView on initial load and every route change. */
export function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return null;
}
