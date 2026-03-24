'use client';

import Link from 'next/link';
import { Truck, Clock, MapPin, Package, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui';

interface ShippingZone {
  name: string;
  wilayas: string[];
  delay: string;
  price: string;
}

const shippingZones: ShippingZone[] = [
  {
    name: 'Zone 1 - Alger et environs',
    wilayas: ['Alger', 'Blida', 'Boumerdès', 'Tipaza'],
    delay: '1-2 jours ouvrés',
    price: '300 DZD',
  },
  {
    name: 'Zone 2 - Villes côtières',
    wilayas: ['Oran', 'Constantine', 'Annaba', 'Béjaïa', 'Skikda', 'Jijel', 'Mostaganem', 'Chlef', 'Tizi Ouzou'],
    delay: '2-4 jours ouvrés',
    price: '400 DZD',
  },
  {
    name: 'Zone 3 - Hauts plateaux',
    wilayas: ['Sétif', 'Batna', 'M\'sila', 'Djelfa', 'Tiaret', 'Biskra', 'Médéa', 'Bouira', 'Bordj Bou Arréridj'],
    delay: '3-5 jours ouvrés',
    price: '500 DZD',
  },
  {
    name: 'Zone 4 - Sud',
    wilayas: ['Ouargla', 'Ghardaïa', 'Béchar', 'Adrar', 'Tamanrasset', 'Illizi', 'Tindouf'],
    delay: '5-7 jours ouvrés',
    price: '800 DZD',
  },
];

const features = [
  {
    icon: Truck,
    title: 'Livraison nationale',
    description: 'Nous livrons dans les 48 wilayas d\'Algérie',
  },
  {
    icon: Clock,
    title: 'Suivi en temps réel',
    description: 'Suivez votre colis à chaque étape de la livraison',
  },
  {
    icon: Package,
    title: 'Emballage soigné',
    description: 'Vos articles sont emballés avec soin pour assurer leur protection',
  },
  {
    icon: CheckCircle,
    title: 'Livraison gratuite',
    description: 'À partir de 10,000 DZD d\'achat',
  },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Informations de Livraison</h1>
            <p className="text-xl text-gray-100">
              Tout ce que vous devez savoir sur la livraison de vos commandes
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Shipping Zones */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Zones de Livraison et Tarifs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shippingZones.map((zone, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-primary text-white px-6 py-4">
                  <h3 className="font-semibold text-lg">{zone.name}</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-medium">{zone.delay}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-medium text-lg">{zone.price}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{zone.wilayas.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Free Shipping Banner */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Livraison Gratuite</h3>
                <p className="text-green-100">
                  Profitez de la livraison gratuite pour toute commande supérieure à 10,000 DZD !
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comment ça marche ?</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Passez commande</h3>
                <p className="text-sm text-gray-600">
                  Ajoutez vos articles au panier et validez votre commande
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Préparation</h3>
                <p className="text-sm text-gray-600">
                  Votre commande est préparée et emballée avec soin
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Expédition</h3>
                <p className="text-sm text-gray-600">
                  Vous recevez un SMS avec le numéro de suivi
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Livraison</h3>
                <p className="text-sm text-gray-600">
                  Le livreur vous contacte avant de passer
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations Importantes</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Vérification du colis</h3>
                  <p className="text-gray-600">
                    Veuillez vérifier l'état de votre colis en présence du livreur. En cas de problème visible,
                    vous pouvez refuser la livraison ou noter vos réserves sur le bon de livraison.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Contact avant livraison</h3>
                  <p className="text-gray-600">
                    Notre livreur vous contactera par téléphone avant la livraison pour confirmer votre disponibilité.
                    Assurez-vous que votre numéro de téléphone est correct lors de la commande.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Tentatives de livraison</h3>
                  <p className="text-gray-600">
                    En cas d'absence, 3 tentatives de livraison seront effectuées. Après 3 échecs,
                    le colis sera retourné à notre entrepôt et vous serez contacté pour reprogrammer la livraison.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="h-8 w-8" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">Des questions sur votre livraison ?</h3>
              <p className="text-gray-100">
                Notre service client est disponible pour répondre à toutes vos questions.
              </p>
            </div>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
