import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0d0d0d' },
      ],
    },
    layout: 'centered',
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
    direction: {
      name: 'Direction',
      description: 'Text direction (LTR/RTL)',
      defaultValue: 'ltr',
      toolbar: {
        icon: 'paragraph',
        items: [
          { value: 'ltr', title: 'LTR' },
          { value: 'rtl', title: 'RTL (Arabic)' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      const direction = context.globals.direction || 'ltr';

      // Apply theme class to document
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        document.documentElement.setAttribute('dir', direction);

        // Update background based on theme
        document.body.style.backgroundColor = theme === 'dark' ? '#0d0d0d' : '#ffffff';
        document.body.style.color = theme === 'dark' ? '#fafafa' : '#0d0d0d';
      }

      return (
        <div
          className={`${theme} min-h-screen`}
          dir={direction}
          style={{
            padding: '2rem',
            backgroundColor: theme === 'dark' ? '#0d0d0d' : '#ffffff',
            color: theme === 'dark' ? '#fafafa' : '#0d0d0d'
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
