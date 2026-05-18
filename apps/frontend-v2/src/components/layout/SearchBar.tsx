'use client';

import * as React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { Input } from '@/components/ui';

export function SearchBar({ className }: { className?: string }) {
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
      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث في المتجر…"
        leadingIcon={<SearchIcon className="h-4 w-4" />}
        aria-label="Recherche"
      />
    </form>
  );
}
