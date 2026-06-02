'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Breadcrumb } from '@/components/ui';

interface InfoPageLayoutProps {
  /** Translation key for the page title (inside whatever namespace the caller uses). */
  title: React.ReactNode;
  /** Short intro paragraph beneath the title. */
  intro?: React.ReactNode;
  /** Optional breadcrumb crumbs, defaults to Home → title. */
  breadcrumbs?: Array<{ label: React.ReactNode; href?: string }>;
  /** Show a "Need help? Contact us" footer block. Defaults to true. */
  showContactCta?: boolean;
  children: React.ReactNode;
}

/**
 * Shared layout for the storefront's static information pages
 * (shipping, returns, terms, privacy, faq, about, etc).
 * Provides a consistent breadcrumb + title + intro + body wrapper
 * so individual page files stay tight and content-focused.
 */
export function InfoPageLayout({
  title,
  intro,
  breadcrumbs,
  showContactCta = true,
  children,
}: InfoPageLayoutProps) {
  const t = useTranslations('InfoPage');

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

      <header className="flex flex-col gap-3">
        <h1 className="text-32 font-bold text-content-strong md:text-40">{title}</h1>
        {intro && <p className="text-16 text-content-muted">{intro}</p>}
      </header>

      <div className="flex flex-col gap-6 text-15 text-content [&_h2]:mt-2 [&_h2]:text-20 [&_h2]:font-bold [&_h2]:text-content-strong [&_h3]:mt-2 [&_h3]:text-16 [&_h3]:font-semibold [&_h3]:text-content-strong [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:ps-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:ps-6 [&_a]:text-content-strong [&_a]:underline">
        {children}
      </div>

      {showContactCta && (
        <aside className="mt-4 rounded border border-border bg-bg-subtle p-6">
          <p className="text-14 text-content-muted">{t('helpHeading')}</p>
          <Link href="/contact" className="text-14 font-medium text-content-strong hover:underline">
            {t('helpCta')}
          </Link>
        </aside>
      )}
    </div>
  );
}
