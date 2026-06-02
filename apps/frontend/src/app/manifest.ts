import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OSCAR Najar',
    short_name: 'OSCAR',
    description: "OSCAR Najar — la mode élégante au cœur de l'Algérie.",
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#1E1E1E',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'fr',
    dir: 'ltr',
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Boutique', short_name: 'Boutique', url: '/products' },
      { name: 'Catégories', short_name: 'Catégories', url: '/categories' },
      { name: 'Panier', short_name: 'Panier', url: '/cart' },
    ],
  };
}
