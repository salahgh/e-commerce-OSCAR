// SEO Configuration for OSCAR Fashion

export const siteConfig = {
  name: 'OSCAR Fashion',
  shortName: 'OSCAR',
  description: 'Boutique de mode en ligne en Algerie - Vetements, accessoires et chaussures pour homme et femme. Livraison partout en Algerie.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://oscarfashion.dz',
  ogImage: '/images/og-image.jpg',
  twitterHandle: '@oscarfashion_dz',
  locale: 'fr_DZ',
  defaultLocale: 'fr',
  locales: ['fr', 'en', 'ar'],

  // Organization details
  organization: {
    name: 'OSCAR Fashion',
    legalName: 'OSCAR Fashion SARL',
    email: 'contact@oscarfashion.dz',
    phone: '+213 XXX XXX XXX',
    address: {
      street: '',
      city: 'Alger',
      region: 'Alger',
      postalCode: '16000',
      country: 'DZ',
    },
    socialLinks: [
      'https://www.facebook.com/oscarfashion.dz',
      'https://www.instagram.com/oscarfashion_dz',
      'https://twitter.com/oscarfashion_dz',
    ],
  },

  // Default meta
  defaultMeta: {
    title: 'OSCAR Fashion - Mode en ligne en Algerie',
    titleTemplate: '%s | OSCAR Fashion',
    description: 'Decouvrez les dernieres tendances mode chez OSCAR Fashion. Vetements, accessoires et chaussures de qualite. Livraison rapide partout en Algerie.',
    keywords: [
      'mode algerie',
      'vetements algerie',
      'boutique en ligne algerie',
      'fashion dz',
      'vetements femme',
      'vetements homme',
      'accessoires mode',
      'chaussures algerie',
      'oscar fashion',
    ],
  },

  // Shipping info for structured data
  shipping: {
    currency: 'DZD',
    freeShippingThreshold: 5000,
    standardRate: 500,
    handlingDays: { min: 1, max: 2 },
    transitDays: { min: 2, max: 5 },
  },

  // Currency
  currency: {
    code: 'DZD',
    symbol: 'DA',
    name: 'Algerian Dinar',
  },
};

// Page-specific meta configurations
export const pageMeta = {
  home: {
    title: 'OSCAR Fashion - Votre boutique de mode en ligne',
    description: 'Decouvrez les dernieres collections de vetements, accessoires et chaussures. Mode feminine et masculine de qualite a prix abordables.',
  },
  products: {
    title: 'Tous nos produits',
    description: 'Parcourez notre catalogue complet de vetements, accessoires et chaussures. Filtrez par categorie, taille, couleur et prix.',
  },
  categories: {
    homme: {
      title: 'Mode Homme',
      description: 'Collection mode homme - T-shirts, chemises, pantalons, vestes et accessoires pour homme.',
    },
    femme: {
      title: 'Mode Femme',
      description: 'Collection mode femme - Robes, tops, jupes, pantalons et accessoires pour femme.',
    },
    accessoires: {
      title: 'Accessoires',
      description: 'Decouvrez notre selection d\'accessoires - sacs, ceintures, bijoux et plus.',
    },
    chaussures: {
      title: 'Chaussures',
      description: 'Collection de chaussures pour homme et femme - baskets, sandales, escarpins et bottines.',
    },
  },
  cart: {
    title: 'Mon Panier',
    description: 'Consultez votre panier et finalisez votre commande.',
    noIndex: true,
  },
  checkout: {
    title: 'Paiement',
    description: 'Finalisez votre commande en toute securite.',
    noIndex: true,
  },
  login: {
    title: 'Connexion',
    description: 'Connectez-vous a votre compte OSCAR Fashion.',
    noIndex: true,
  },
  register: {
    title: 'Inscription',
    description: 'Creez votre compte OSCAR Fashion pour profiter d\'avantages exclusifs.',
    noIndex: true,
  },
  profile: {
    title: 'Mon Profil',
    description: 'Gerez votre compte et vos informations personnelles.',
    noIndex: true,
  },
  orders: {
    title: 'Mes Commandes',
    description: 'Consultez l\'historique de vos commandes.',
    noIndex: true,
  },
  search: {
    title: 'Recherche',
    description: 'Recherchez parmi notre catalogue de produits.',
  },
  contact: {
    title: 'Contact',
    description: 'Contactez-nous pour toute question ou demande d\'information.',
  },
  about: {
    title: 'A Propos',
    description: 'Decouvrez l\'histoire et les valeurs d\'OSCAR Fashion.',
  },
  faq: {
    title: 'FAQ',
    description: 'Trouvez les reponses a vos questions frequentes.',
  },
  terms: {
    title: 'Conditions Generales',
    description: 'Consultez nos conditions generales de vente.',
  },
  privacy: {
    title: 'Politique de Confidentialite',
    description: 'Decouvrez comment nous protegeons vos donnees personnelles.',
  },
  shipping: {
    title: 'Livraison',
    description: 'Informations sur nos options et delais de livraison.',
  },
  returns: {
    title: 'Retours et Remboursements',
    description: 'Politique de retour et procedure de remboursement.',
  },
};

// Locale-specific configurations
export const localeConfig: Record<string, { locale: string; hreflang: string; name: string }> = {
  fr: { locale: 'fr_DZ', hreflang: 'fr-DZ', name: 'Francais' },
  en: { locale: 'en_DZ', hreflang: 'en-DZ', name: 'English' },
  ar: { locale: 'ar_DZ', hreflang: 'ar-DZ', name: 'العربية' },
};
