import { cn } from '@/lib/utils/cn';

interface SliderDotsProps {
  count: number;
  active?: number;
  className?: string;
}

/** Decorative carousel pagination dots matching the Figma marketing banners. */
export function SliderDots({ count, active = 0, className }: SliderDotsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2.5', className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'rounded-full transition-all',
            i === active ? 'h-4 w-4 bg-accent' : 'h-3 w-3 bg-content-subtle opacity-50',
          )}
        />
      ))}
    </div>
  );
}
