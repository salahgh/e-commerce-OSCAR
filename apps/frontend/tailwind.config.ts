import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',

      bg: {
        base: 'var(--bg-base)',
        subtle: 'var(--bg-subtle)',
        muted: 'var(--bg-muted)',
        elevated: 'var(--bg-elevated)',
        overlay: 'var(--bg-overlay)',
      },

      content: {
        strong: 'var(--content-strong)',
        DEFAULT: 'var(--content-default)',
        muted: 'var(--content-muted)',
        subtle: 'var(--content-subtle)',
        inverse: 'var(--content-inverse)',
      },

      border: {
        DEFAULT: 'var(--border-default)',
        strong: 'var(--border-strong)',
        input: 'var(--border-input)',
        focus: 'var(--border-focus)',
      },

      accent: {
        DEFAULT: 'var(--accent-default)',
        hover: 'var(--accent-hover)',
        pressed: 'var(--accent-pressed)',
        content: 'var(--accent-content)',
        disabled: 'var(--accent-disabled)',
      },

      state: {
        'info-bg': 'var(--state-info-bg)',
        'info-border': 'var(--state-info-border)',
        'info-content': 'var(--state-info-content)',
        'danger-bg': 'var(--state-danger-bg)',
        'danger-border': 'var(--state-danger-border)',
        'danger-content': 'var(--state-danger-content)',
        'success-bg': 'var(--state-success-bg)',
        'success-border': 'var(--state-success-border)',
        'success-content': 'var(--state-success-content)',
        'warning-bg': 'var(--state-warning-bg)',
        'warning-border': 'var(--state-warning-border)',
        'warning-content': 'var(--state-warning-content)',
      },

      /* Home / marketing palette */
      rating: 'var(--color-rating)',
      'logo-slate': 'var(--color-logo-slate)',
      link: 'var(--color-link-accent)',
      'ink-heading': 'var(--color-ink-heading)',
      'ink-muted': 'var(--color-ink-muted)',
      hairline: 'var(--color-hairline)',
    },

    fontFamily: {
      sans: ['var(--font-sans)'],
      arabic: ['var(--font-arabic)'],
      dm: ['var(--font-latin)'],
    },

    fontSize: {
      '12': ['var(--fs-12)', { lineHeight: 'var(--lh-16)' }],
      '14': ['var(--fs-14)', { lineHeight: 'var(--lh-24)' }],
      '16': ['var(--fs-16)', { lineHeight: 'var(--lh-24)' }],
      '18': ['var(--fs-18)', { lineHeight: 'var(--lh-32)' }],
      '20': ['1.25rem', { lineHeight: '1.5' }],
      '24': ['var(--fs-24)', { lineHeight: 'var(--lh-32)' }],
      '32': ['var(--fs-32)', { lineHeight: 'var(--lh-48)' }],
      '36': ['var(--fs-36)', { lineHeight: 'var(--lh-48)' }],
      '40': ['2.5rem', { lineHeight: '1.1' }],
      '48': ['var(--fs-48)', { lineHeight: 'var(--lh-48)' }],
    },

    fontWeight: {
      medium: '500',
      bold: '700',
      extrabold: '800',
    },

    spacing: {
      0: 'var(--space-0)',
      1: 'var(--space-1)',
      2: 'var(--space-2)',
      3: 'var(--space-3)',
      4: 'var(--space-4)',
      5: 'var(--space-5)',
      6: 'var(--space-6)',
      8: 'var(--space-8)',
      10: 'var(--space-10)',
      12: 'var(--space-12)',
      14: 'var(--space-14)',
      16: 'var(--space-16)',
      20: 'var(--space-20)',
      24: 'var(--space-24)',
      px: '1px',
      full: '100%',
    },

    borderRadius: {
      none: 'var(--radius-none)',
      sm: 'var(--radius-sm)',
      DEFAULT: 'var(--radius-md)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      full: 'var(--radius-full)',
    },

    boxShadow: {
      none: 'none',
      sm: 'var(--shadow-sm)',
      card: 'var(--shadow-card)',
      elevated: 'var(--shadow-elevated)',
      overlay: 'var(--shadow-overlay)',
    },

    transitionDuration: {
      fast: 'var(--duration-fast)',
      DEFAULT: 'var(--duration-base)',
      slow: 'var(--duration-slow)',
    },

    transitionTimingFunction: {
      standard: 'var(--easing-standard)',
      emphasized: 'var(--easing-emphasized)',
    },

    extend: {
      zIndex: {
        base: '0',
        dropdown: '50',
        overlay: '100',
        modal: '200',
        toast: '300',
      },
      keyframes: {
        'fade-in':       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up':      { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        'slide-in-right':{ '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        'slide-in-left': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(0)' } },
      },
      animation: {
        'fade-in':       'fade-in var(--duration-base) var(--easing-standard)',
        'slide-up':      'slide-up var(--duration-base) var(--easing-standard)',
        'slide-in-right':'slide-in-right var(--duration-slow) var(--easing-emphasized)',
        'slide-in-left': 'slide-in-left var(--duration-slow) var(--easing-emphasized)',
      },
    },
  },
  plugins: [],
};

export default config;
