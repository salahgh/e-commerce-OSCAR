import { cn } from '@/lib/utils/cn';

interface SliderDotsProps {
  count: number;
  active?: number;
  className?: string;
  /** When provided, dots become interactive buttons that seek to a slide. */
  onDotClick?: (i: number) => void;
}

/** Carousel pagination dots matching the Figma marketing banners. */
export function SliderDots({ count, active = 0, className, onDotClick }: SliderDotsProps) {
  const interactive = !!onDotClick;
  return (
    <div
      className={cn('flex items-center justify-center gap-2.5', className)}
      aria-hidden={interactive ? undefined : 'true'}
    >
      {Array.from({ length: count }).map((_, i) => {
        const cls = cn(
          'rounded-full transition-all',
          i === active ? 'h-4 w-4 bg-accent' : 'h-3 w-3 bg-content-subtle opacity-50',
        );
        return interactive ? (
          <button
            key={i}
            type="button"
            aria-label={`Aller à la diapo ${i + 1}`}
            aria-current={i === active}
            onClick={() => onDotClick!(i)}
            className={cls}
          />
        ) : (
          <span key={i} className={cls} />
        );
      })}
    </div>
  );
}
