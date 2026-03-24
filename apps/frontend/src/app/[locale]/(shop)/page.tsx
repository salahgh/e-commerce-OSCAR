import { Metadata } from 'next';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { ShoppingBag, TrendingUp, Shield, Truck } from 'lucide-react';
import { HomePageJsonLd } from '@/components/seo';
import { generateMetadata as genMeta, siteConfig, pageMeta } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: pageMeta.home.title,
    description: pageMeta.home.description,
    canonical: '',
    openGraph: {
      type: 'website',
    },
  });
}

export default function HomePage() {
  const features = [
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      title: 'Large Sélection',
      description: 'Des milliers de produits de qualité',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Dernières Tendances',
      description: 'Collections actualisées régulièrement',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Paiement Sécurisé',
      description: 'Transactions 100% sécurisées',
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Livraison Rapide',
      description: 'Livraison à travers toute l\'Algérie',
    },
  ];

  return (
    <div>
      {/* Structured Data */}
      <HomePageJsonLd />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container-custom py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Découvrez l'Élégance avec OSCAR Fashion
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Les dernières tendances de la mode, directement chez vous en Algérie
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/products">Découvrir la Collection</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary" asChild>
                <Link href="/products">Parcourir les Catégories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Parcourir par Catégorie</h2>
            <p className="text-gray-600 text-lg">Trouvez ce que vous cherchez</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Hommes', 'Femmes', 'Accessoires', 'Nouveautés'].map((category) => (
              <Link
                key={category}
                href="/products"
                className="group relative aspect-square rounded-lg overflow-hidden bg-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold group-hover:scale-110 transition-transform">
                    {category}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à Commencer?</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Inscrivez-vous maintenant et recevez 10% de réduction sur votre première commande
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Créer un Compte</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
