import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'OSCAR Najar', template: '%s · OSCAR Najar' },
  description: "OSCAR Najar — la mode élégante au cœur de l'Algérie.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
