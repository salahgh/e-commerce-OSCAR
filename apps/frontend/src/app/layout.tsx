import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OSCAR Fashion - Mode & Elegance',
  description: 'Decouvrez les dernieres tendances de la mode chez OSCAR Fashion',
};

// Root layout is minimal - the [locale]/layout.tsx handles html/body
// This prevents hydration mismatches from duplicate html/body wrappers
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
