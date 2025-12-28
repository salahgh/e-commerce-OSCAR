import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Award, Users, Globe, Sparkles, Target, Eye, Shield } from 'lucide-react';
import { Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'À Propos - OSCAR Fashion',
  description: 'Découvrez l\'histoire d\'OSCAR Fashion, notre mission et nos valeurs. La mode algérienne redéfinie.',
};

const values = [
  {
    icon: <Heart className="h-8 w-8" />,
    title: 'Passion',
    description: 'Nous sommes passionnés par la mode et déterminés à offrir le meilleur à nos clients.',
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: 'Qualité',
    description: 'Chaque produit est soigneusement sélectionné pour garantir une qualité exceptionnelle.',
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Service Client',
    description: 'Notre équipe est dédiée à vous offrir une expérience d\'achat exceptionnelle.',
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: 'Accessibilité',
    description: 'La mode de qualité accessible à tous, partout en Algérie.',
  },
];

const milestones = [
  { year: '2018', title: 'Création', description: 'OSCAR Fashion voit le jour à Alger' },
  { year: '2019', title: 'Expansion', description: 'Ouverture de notre premier showroom' },
  { year: '2021', title: 'E-commerce', description: 'Lancement de notre boutique en ligne' },
  { year: '2023', title: 'National', description: 'Livraison dans toutes les wilayas d\'Algérie' },
  { year: '2024', title: 'Innovation', description: 'Nouvelles fonctionnalités et collections exclusives' },
];

const stats = [
  { value: '50K+', label: 'Clients Satisfaits' },
  { value: '48', label: 'Wilayas Livrées' },
  { value: '1000+', label: 'Produits' },
  { value: '24h', label: 'Support Client' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Notre Histoire</h1>
            <p className="text-xl text-gray-100">
              OSCAR Fashion, c'est plus qu'une boutique de mode. C'est une vision de l'élégance algérienne,
              une passion pour le style et un engagement envers l'excellence.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Notre Parcours</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">Une aventure née de la passion</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  OSCAR Fashion est né en 2018 d'une vision simple mais ambitieuse : rendre la mode de qualité
                  accessible à tous les Algériens. Fondée par une équipe passionnée de mode et de commerce,
                  notre entreprise a commencé comme une petite boutique à Alger.
                </p>
                <p>
                  Aujourd'hui, nous sommes fiers de servir des milliers de clients à travers toute l'Algérie.
                  Notre engagement envers la qualité, le service client et l'innovation nous a permis de
                  devenir une référence dans le secteur de la mode en ligne en Algérie.
                </p>
                <p>
                  Chaque vêtement que nous proposons est soigneusement sélectionné pour répondre aux attentes
                  de nos clients en termes de style, de qualité et de prix. Nous croyons que tout le monde
                  mérite de se sentir bien dans ses vêtements.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Sparkles className="h-24 w-24 text-primary mx-auto mb-4" />
                    <p className="text-2xl font-bold text-gray-900">Depuis 2018</p>
                    <p className="text-gray-600">Au service de la mode algérienne</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-primary">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Notre Mission</h3>
              <p className="text-gray-600">
                Offrir aux Algériens une expérience d'achat de mode exceptionnelle, en combinant des produits
                de qualité, des prix accessibles et un service client irréprochable. Nous nous engageons à
                rendre la mode tendance accessible à tous.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-secondary">
              <div className="w-14 h-14 bg-secondary/30 rounded-xl flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-gray-700" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Notre Vision</h3>
              <p className="text-gray-600">
                Devenir la première destination de mode en ligne en Algérie, reconnue pour notre qualité,
                notre innovation et notre engagement envers la satisfaction client. Nous aspirons à redéfinir
                l'expérience du shopping en Algérie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Ce qui nous définit</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Nos Valeurs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-primary">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Notre Évolution</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Les Étapes Clés</h2>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white rounded-xl shadow-lg p-6 inline-block">
                      <span className="text-3xl font-bold text-primary">{milestone.year}</span>
                      <h3 className="text-xl font-semibold mt-2">{milestone.title}</h3>
                      <p className="text-gray-600 mt-1">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10 w-4 h-4 bg-primary rounded-full border-4 border-white shadow" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 flex flex-col justify-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Notre Engagement</h2>
                <p className="text-gray-600 mb-6">
                  Chez OSCAR Fashion, nous nous engageons à offrir une expérience d'achat transparente et sécurisée.
                  Nous garantissons la qualité de nos produits et nous nous efforçons de dépasser vos attentes
                  à chaque commande.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Produits authentiques et de qualité
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Livraison rapide dans toute l'Algérie
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Service client réactif et à l'écoute
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Politique de retour flexible
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary to-primary-dark p-12 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-6xl font-bold mb-4">100%</p>
                  <p className="text-xl">Satisfaction garantie</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Rejoignez l'aventure OSCAR</h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Découvrez notre collection et faites partie de la communauté OSCAR Fashion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/products">Découvrir la Collection</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white hover:text-primary"
              asChild
            >
              <Link href="/contact">Nous Contacter</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
