'use client';

import Link from 'next/link';
import { RefreshCw, Package, Clock, CheckCircle, XCircle, AlertTriangle, CreditCard, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui';

const eligibleItems = [
  'Articles non portés et non lavés',
  'Articles avec toutes les étiquettes d\'origine',
  'Articles dans leur emballage d\'origine',
  'Articles retournés dans les 7 jours suivant la réception',
];

const nonEligibleItems = [
  'Sous-vêtements et maillots de bain (pour des raisons d\'hygiène)',
  'Articles soldés ou en promotion (échangeables uniquement)',
  'Articles personnalisés ou sur mesure',
  'Articles endommagés par le client',
  'Articles sans étiquettes ou emballage d\'origine',
];

const returnSteps = [
  {
    step: 1,
    title: 'Connectez-vous',
    description: 'Accédez à votre compte et rendez-vous dans "Mes Commandes"',
    icon: CheckCircle,
  },
  {
    step: 2,
    title: 'Sélectionnez l\'article',
    description: 'Choisissez l\'article à retourner et le motif du retour',
    icon: Package,
  },
  {
    step: 3,
    title: 'Imprimez le bon',
    description: 'Téléchargez et imprimez votre bon de retour',
    icon: RefreshCw,
  },
  {
    step: 4,
    title: 'Expédiez le colis',
    description: 'Emballez l\'article et déposez-le au point relais',
    icon: Clock,
  },
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Retours & Échanges</h1>
            <p className="text-xl text-gray-100">
              Votre satisfaction est notre priorité. Découvrez notre politique de retour simple et transparente.
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Policy Overview */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">7 jours</h3>
                <p className="text-gray-600">Pour retourner votre article</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">7-14 jours</h3>
                <p className="text-gray-600">Pour le remboursement</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuit</h3>
                <p className="text-gray-600">Pour les produits défectueux</p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Return */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comment effectuer un retour ?</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {returnSteps.map((item) => (
                <div key={item.step} className="text-center relative">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  {item.step < 4 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Eligible / Non-Eligible */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Eligible */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-green-500 text-white px-6 py-4 flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                <h3 className="font-semibold text-lg">Articles éligibles au retour</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {eligibleItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Non-Eligible */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-red-500 text-white px-6 py-4 flex items-center gap-3">
                <XCircle className="h-6 w-6" />
                <h3 className="font-semibold text-lg">Articles non éligibles</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {nonEligibleItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Exchange Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Échanges</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Échange de taille
                </h3>
                <p className="text-gray-600 mb-4">
                  Vous souhaitez échanger un article contre une autre taille ? C'est possible sous réserve de disponibilité.
                  Suivez simplement la procédure de retour et indiquez la taille souhaitée.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Échange gratuit pour la première demande
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Envoi prioritaire de la nouvelle taille
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Échange contre un autre article
                </h3>
                <p className="text-gray-600 mb-4">
                  Pour échanger contre un article différent, veuillez d'abord effectuer un retour.
                  Une fois le remboursement effectué, vous pourrez passer une nouvelle commande.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Soumis aux conditions de retour standard
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Les articles soldés ne sont pas remboursables
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Refund Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Remboursement</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Délai de remboursement</h3>
                  <p className="text-gray-600">
                    Une fois votre retour reçu et validé par notre équipe, le remboursement est effectué sous 7 à 14 jours ouvrés.
                    Vous recevrez un email de confirmation dès que le remboursement sera traité.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Mode de remboursement</h3>
                  <p className="text-gray-600">
                    Le remboursement est effectué sur le même moyen de paiement utilisé lors de l'achat :
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Carte CIB/EDAHABIA : remboursement sur votre carte</li>
                    <li>• BaridiMob : remboursement sur votre compte BaridiMob</li>
                    <li>• Paiement à la livraison : virement sur compte CCP ou BaridiMob</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Frais de retour</h3>
                  <p className="text-gray-600">
                    Les frais de retour sont à votre charge (entre 300 et 500 DZD selon votre zone).
                    Exception : en cas de produit défectueux ou d'erreur de notre part, les frais de retour sont entièrement pris en charge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Defective Products */}
        <section className="mb-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Produit défectueux ou erreur de livraison ?</h3>
                <p className="text-gray-700 mb-4">
                  Si vous avez reçu un article défectueux ou un article différent de votre commande,
                  contactez-nous immédiatement. Nous prendrons en charge les frais de retour et vous proposerons
                  un échange ou un remboursement complet.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>+213 23 XX XX XX</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>retours@oscarfashion.dz</span>
                  </div>
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
              <h3 className="text-xl font-bold mb-2">Besoin d'aide pour votre retour ?</h3>
              <p className="text-gray-100">
                Notre équipe est disponible pour vous accompagner dans votre démarche de retour.
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
