'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';

  // Mock order data - will be replaced with actual order from GraphQL
  const mockOrder = {
    id: 'ORD-' + Date.now(),
    orderNumber: 'OSC-' + Math.random().toString(36).substring(7).toUpperCase(),
    date: new Date().toLocaleDateString('fr-FR'),
    total: 12500,
    estimatedDelivery: '3-5 jours ouvrables',
  };

  useEffect(() => {
    // Clear cart after successful order (in a real app)
    // This would be handled by the backend after order creation
  }, []);

  return (
    <div className="container-custom py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Commande confirmée!</h1>
          <p className="text-gray-600 text-lg">
            Merci pour votre commande. Nous l'avons bien reçue.
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6">
          <Card.Content className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-600">Numéro de commande</p>
                  <p className="text-xl font-bold text-primary">{mockOrder.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{mockOrder.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">
                    Votre commande sera livrée dans {mockOrder.estimatedDelivery}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Vous recevrez un email de confirmation avec tous les détails de votre commande.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Prochaines étapes</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span>
                      Nous préparons votre commande et vous envoyons un email de confirmation
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>Votre commande est expédiée et vous recevez un numéro de suivi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>Vous recevez votre commande à l'adresse indiquée</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Important Information */}
        <Card className="mb-6">
          <Card.Header>
            <h3 className="font-semibold">Informations importantes</h3>
          </Card.Header>
          <Card.Content>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Vérifiez votre boîte mail (y compris les spams) pour la confirmation</li>
              <li>• Conservez votre numéro de commande pour le suivi</li>
              <li>
                • En cas de problème, contactez notre service client avec votre numéro de commande
              </li>
              <li>• Vous pouvez suivre votre commande depuis votre compte</li>
            </ul>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="flex-1" size="lg">
            <Link href={`/${locale}/user/orders`}>
              <Package className="h-5 w-5 mr-2" />
              Voir mes commandes
            </Link>
          </Button>
          <Button asChild className="flex-1" size="lg">
            <Link href={`/${locale}/products`}>
              <ArrowRight className="h-5 w-5 mr-2" />
              Continuer mes achats
            </Link>
          </Button>
        </div>

        {/* Home Link */}
        <div className="mt-6 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
