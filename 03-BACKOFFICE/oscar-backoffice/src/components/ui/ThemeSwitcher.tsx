import React from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { Theme } from '../../store/slices/themeSlice';
import { cn } from '../../lib/utils';

interface ThemeSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'toggle';
}

const themeOptions: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'light',
    label: 'Clair',
    icon: <Sun className="h-4 w-4" />,
    description: 'Theme clair avec fond blanc',
  },
  {
    value: 'dark',
    label: 'Sombre',
    icon: <Moon className="h-4 w-4" />,
    description: 'Theme sombre standard',
  },
  {
    value: 'actuelle',
    label: 'Actuelle',
    icon: <Palette className="h-4 w-4" />,
    description: 'Theme sombre bleu (original)',
  },
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ variant = 'dropdown' }) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentTheme = themeOptions.find((t) => t.value === theme);

  if (variant === 'toggle') {
    return (
      <button
        onClick={() => {
          const themes: Theme[] = ['light', 'dark', 'actuelle'];
          const currentIndex = themes.indexOf(theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex]);
        }}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title={`Theme: ${currentTheme?.label}`}
      >
        {currentTheme?.icon}
      </button>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              'p-2 rounded-md transition-colors',
              theme === option.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
            title={option.label}
          >
            {option.icon}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title="Changer le theme"
      >
        {currentTheme?.icon}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-20">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium text-foreground">Theme</p>
            </div>
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors',
                  theme === option.value
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {option.icon}
                <div className="flex-1 text-left">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
                {theme === option.value && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
