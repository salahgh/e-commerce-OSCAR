import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ar', 'fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
});

// Create navigation utilities
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
