import React from 'react';
import { cn } from '../../lib/utils';
import { getColorHex, getContrastColor, isValidHexColor } from '../../lib/colors';

export interface ColorSwatchProps {
  /** Color name (e.g., "Black", "Blue") or hex code (e.g., "#FF0000") */
  color: string;
  /** Hex code from API (takes priority over color name lookup) */
  hex?: string | null;
  /** Size of the swatch */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Show color name label */
  showLabel?: boolean;
  /** Whether this swatch is selected */
  selected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const labelSizeClasses = {
  xs: 'text-[9px]',
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
};

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  hex,
  size = 'sm',
  showLabel = false,
  selected = false,
  onClick,
  className,
}) => {
  // Determine the hex color to use
  // Priority: 1. hex prop from API, 2. color if it's already a hex, 3. lookup by name
  let displayHex: string | null = null;

  if (hex && isValidHexColor(hex)) {
    displayHex = hex;
  } else if (isValidHexColor(color)) {
    displayHex = color;
  } else {
    displayHex = getColorHex(color);
  }

  // If no hex found, show a gray swatch with text
  if (!displayHex) {
    return (
      <div
        className={cn('inline-flex items-center gap-1', onClick && 'cursor-pointer', className)}
        onClick={onClick}
        title={color}
      >
        <div
          className={cn(
            sizeClasses[size],
            'rounded-full bg-gray-400 flex items-center justify-center',
            'border border-gray-500',
            selected && 'ring-2 ring-primary ring-offset-1'
          )}
        >
          <span className="text-[6px] text-gray-700 font-bold">?</span>
        </div>
        {showLabel && (
          <span className={cn(labelSizeClasses[size], 'text-muted-foreground')}>{color}</span>
        )}
      </div>
    );
  }

  const isWhiteOrLight =
    displayHex.toLowerCase() === '#ffffff' || displayHex.toLowerCase() === '#f5f5dc';
  const contrastColor = getContrastColor(displayHex);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
      title={color}
    >
      <div
        className={cn(
          sizeClasses[size],
          'rounded-full flex-shrink-0',
          isWhiteOrLight && 'border border-gray-400',
          !isWhiteOrLight && 'border border-gray-600',
          selected && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
        )}
        style={{ backgroundColor: displayHex }}
      >
        {selected && (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className={cn('w-3 h-3', contrastColor === 'white' ? 'text-white' : 'text-black')}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      {showLabel && <span className={cn(labelSizeClasses[size], 'text-foreground')}>{color}</span>}
    </div>
  );
};

export default ColorSwatch;
