'use client';

import * as React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

export function SearchBar({ className }: { className?: string }) {
  const t = useTranslations('Layout.header');
  const router = useRouter();
  const [q, setQ] = React.useState('');
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
      }}
      className={className}
    >
      <div className="flex items-center gap-2 rounded-md border border-hairline bg-bg-elevated px-3 py-3.5">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchAria')}
          className="min-w-0 flex-1 bg-transparent text-16 text-content-strong outline-none placeholder:text-content-subtle"
        />
        <SearchIcon className="h-5 w-5 shrink-0 text-content-strong" strokeWidth={1.75} />
      </div>
    </form>
  );
}
