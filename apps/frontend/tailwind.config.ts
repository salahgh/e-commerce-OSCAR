import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // shadcn/ui semantic colors (CSS variables)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // OSCAR Figma Design System Colors
        primary: {
          DEFAULT: '#1E1E1E',
          foreground: 'hsl(var(--primary-foreground))',
          1: '#DFDFDF',
          2: '#B7B7B7',
          3: '#4D4D4D',
          4: '#1E1E1E',
          5: '#131313',
          6: '#000000',
        },
        secondary: {
          DEFAULT: '#FFD500',
          foreground: 'hsl(var(--secondary-foreground))',
          1: '#FFFDF5',
          2: '#FEF9E2',
          3: '#FCEEA6',
          4: '#F9D72A',
          5: '#D8B506',
          6: '#6E5C03',
        },
        'dark-text': {
          DEFAULT: '#010B38',
          1: 'rgba(1, 11, 56, 0.2)',
          2: 'rgba(1, 11, 56, 0.3)',
          3: 'rgba(1, 11, 56, 0.4)',
          4: 'rgba(1, 11, 56, 0.5)',
          5: 'rgba(1, 11, 56, 0.6)',
          6: 'rgba(1, 11, 56, 0.8)',
        },
        'light-text': {
          DEFAULT: '#FFFFFF',
          1: 'rgba(255, 255, 255, 0.2)',
          2: 'rgba(255, 255, 255, 0.3)',
          3: 'rgba(255, 255, 255, 0.4)',
          4: 'rgba(255, 255, 255, 0.5)',
          5: 'rgba(255, 255, 255, 0.6)',
          6: 'rgba(255, 255, 255, 0.8)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // OSCAR Figma Status Colors
        gray: {
          DEFAULT: '#FFFFFF',
          1: '#FAFBFF',
          2: '#EDEEF2',
          3: '#E1E2E5',
          4: '#D5D5D9',
          5: '#C8C9CC',
          6: '#646466',
        },
        success: {
          DEFAULT: '#2FD976',
          1: '#E5FFEE',
          2: '#99FFBB',
          3: '#66FF99',
          4: '#2EE56B',
          5: '#24B755',
          6: '#2EA154',
        },
        warning: {
          DEFAULT: '#FFBC1F',
          1: '#FFF7E5',
          2: '#FFDB87',
          3: '#FFCA4F',
          4: '#E5A91C',
          5: '#CC9619',
          6: '#B28416',
        },
        error: {
          DEFAULT: '#EB3E3E',
          1: '#FFE5E5',
          2: '#FF9999',
          3: '#FF6666',
          4: '#E53C3C',
          5: '#CC3636',
          6: '#B22F2F',
        },
        info: {
          DEFAULT: '#11CAEF',
          1: '#E5FBFF',
          2: '#99EEFF',
          3: '#66E6FF',
          4: '#43CBE5',
          5: '#29B1CC',
          6: '#1298B2',
        },
        // Chart colors for data visualization
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Sidebar colors
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        arabic: ['var(--font-noto-arabic)', ...fontFamily.sans],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
};

export default config;
