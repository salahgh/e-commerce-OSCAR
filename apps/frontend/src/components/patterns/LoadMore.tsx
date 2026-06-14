'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadMoreProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  label?: string;
  loadingLabel?: string;
}

/**
 * Infinite-scroll trigger. Auto-loads the next page when its sentinel nears the
 * viewport (IntersectionObserver), and exposes an accessible "Load more" button
 * as the keyboard / no-JS fallback and the observer target. Renders nothing once
 * there is no more to load.
 */
export function LoadMore({
  hasMore,
  loading,
  onLoadMore,
  label = 'Load more',
  loadingLabel = 'Loading…',
}: LoadMoreProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  // Keep the latest callback without re-subscribing the observer each render.
  const onLoadMoreRef = React.useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  React.useEffect(() => {
    if (!hasMore || loading) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin: '600px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading]);

  if (!hasMore) return null;

  return (
    <div ref={ref} className="flex justify-center py-10">
      <button
        type="button"
        onClick={() => onLoadMoreRef.current()}
        disabled={loading}
        aria-busy={loading}
        className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-16 text-content-strong transition-colors hover:bg-bg-muted disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? loadingLabel : label}
      </button>
    </div>
  );
}
