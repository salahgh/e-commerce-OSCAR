import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { isValidHexColor } from '../../lib/colors';

export interface ColorPickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Common colors palette for quick selection
const PRESET_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
  '#808080', // Gray
  '#C0C0C0', // Silver
  '#FFD700', // Gold
  '#F5F5DC', // Beige
  '#000080', // Navy
  '#008080', // Teal
  '#4B0082', // Indigo
  '#FF6347', // Tomato
];

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  value,
  onChange,
  label,
  error,
  disabled = false,
  className,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Auto-add # if user starts typing hex without it
    if (val && !val.startsWith('#')) {
      val = '#' + val;
    }

    setInputValue(val);

    // Only call onChange if it's a valid hex color
    if (isValidHexColor(val)) {
      onChange(val.toUpperCase());
    }
  };

  const handleInputBlur = () => {
    // Reset to last valid value if current input is invalid
    if (!isValidHexColor(inputValue) && value) {
      setInputValue(value);
    } else if (isValidHexColor(inputValue)) {
      onChange(inputValue.toUpperCase());
    }
  };

  const handlePresetClick = (color: string) => {
    setInputValue(color);
    onChange(color);
    setShowPicker(false);
  };

  const isValidColor = isValidHexColor(inputValue);
  const displayColor = isValidColor ? inputValue : (value || '#CCCCCC');

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="flex items-center gap-2">
          {/* Color preview swatch */}
          <button
            type="button"
            onClick={() => !disabled && setShowPicker(!showPicker)}
            disabled={disabled}
            className={cn(
              'w-10 h-10 rounded-lg border-2 flex-shrink-0 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary',
              error ? 'border-destructive' : 'border-input'
            )}
            style={{ backgroundColor: displayColor }}
          />

          {/* Hex input */}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={() => !disabled && setShowPicker(true)}
            placeholder="#000000"
            disabled={disabled}
            className={cn(
              'flex-1 px-3 py-2 border rounded-lg bg-card text-foreground font-mono',
              'placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
              'focus:border-transparent transition-colors',
              'disabled:bg-muted disabled:cursor-not-allowed',
              error ? 'border-destructive' : 'border-input',
              !isValidColor && inputValue && 'border-destructive'
            )}
          />
        </div>

        {/* Color picker dropdown */}
        {showPicker && !disabled && (
          <div className="absolute z-50 mt-2 p-3 bg-card border border-border rounded-lg shadow-lg w-full max-w-[280px]">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Couleurs prédéfinies
            </div>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handlePresetClick(color)}
                  className={cn(
                    'w-8 h-8 rounded-md border-2 transition-all',
                    'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring',
                    value === color ? 'border-primary ring-2 ring-primary/50' : 'border-border',
                    color === '#FFFFFF' && 'border-gray-300'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {/* Native color picker */}
            <div className="mt-3 pt-3 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="color"
                  value={displayColor}
                  onChange={(e) => {
                    const newColor = e.target.value.toUpperCase();
                    setInputValue(newColor);
                    onChange(newColor);
                  }}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  Choisir une couleur personnalisée
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      {!error && !isValidColor && inputValue && (
        <p className="mt-1 text-sm text-destructive">Format invalide (ex: #FF0000)</p>
      )}
    </div>
  );
};

export default ColorPickerField;
