'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Headless carousel state for the home media sliders. Wraps an active index and
 * provides next/prev/goTo. No-ops when there is 0 or 1 slide.
 */
export function useCarousel(length: number, opts?: { autoMs?: number }) {
  const [index, setIndex] = useState(0);

  // Keep the index in range if the slide count shrinks.
  useEffect(() => {
    if (index > length - 1) setIndex(length > 0 ? length - 1 : 0);
  }, [length, index]);

  const goTo = useCallback(
    (i: number) => {
      if (length <= 0) return;
      setIndex(((i % length) + length) % length);
    },
    [length],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!opts?.autoMs || length <= 1) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % length), opts.autoMs);
    return () => clearInterval(id);
  }, [opts?.autoMs, length]);

  return { index, next, prev, goTo };
}
