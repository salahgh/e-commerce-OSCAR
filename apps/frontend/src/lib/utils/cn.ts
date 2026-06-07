import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The design system uses a custom numeric font-size scale (text-12, text-14, … text-40).
// tailwind-merge doesn't know these are font sizes, so by default it treats e.g. `text-18`
// as conflicting with text-color utilities like `text-accent-content` and drops the colour
// (which left the primary button with invisible text in dark mode). Register the scale so
// `text-{n}` is grouped as font-size and no longer collides with text colours.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['12', '14', '15', '16', '18', '20', '24', '32', '36', '40'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
