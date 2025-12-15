'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Button, Card, Skeleton } from '@/components/ui';
import {
  CheckCircle,
  Package,
  ArrowRight,
  Home,
  Truck,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Clock,
  Copy,
  Check,
  ShoppingBag,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatters';
import { useGetOrderByCodeQuery } from '@/graphql/generated/graphql';
import Image from 'next/image';

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || 'fr';
  const orderCode = searchParams.get('code');

  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  // Fetch order details
  const { data, loading, error } = useGetOrderByCodeQuery({
    variables: { code: orderCode || '' },
    skip: !orderCode,
  });

  const order = data?.orderByCode;

  // Copy order number to clipboard
  const copyOrderNumber = () => {
    if (order?.code) {
      navigator.clipboard.writeText(order.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-6 w-48 mx-auto" />
          </div>
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <Package className="h-12 w-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Commande introuvable</h1>
          <p className="text-gray-600 mb-8">
            Nous n'avons pas pu trouver les détails de votre commande. Si vous avez bien passé une commande,
            vérifiez votre email de confirmation ou contactez notre service client.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href={`/${locale}/products`}>
                <ShoppingBag className="h-5 w-5 mr-2" />
                Continuer mes achats
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/${locale}/contact`}>
                <MessageCircle className="h-5 w-5 mr-2" />
                Contacter le support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const shippingAddress = order.shippingAddress;
  const paymentMethod = order.payments?.[0]?.method || 'cash-on-delivery';
  const estimatedDelivery = '3-5 jours ouvrables';

  return (
    <div className="container-custom py-8 md:py-16">
      <div className="max-w-3xl mx-auto">
        {/* Confetti Animation (CSS) */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
            <div className="confetti-container">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][
                      Math.floor(Math.random() * 5)
                    ],
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full mb-4 animate-bounce-once">
            <CheckCircle className="h-12 w-12 md:h-14 md:w-14 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Commande confirmée !</h1>
          <p className="text-gray-600 text-lg">
            Merci pour votre commande. Nous l'avons bien reçue.
          </p>
        </div>

        {/* Order Number Card */}
        <Card className="mb-6 border-2 border-primary/20 bg-primary/5">
          <Card.Content className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-600 mb-1">Numéro de commande</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl md:text-2xl font-bold text-primary">{order.code}</p>
                  <button
                    onClick={copyOrderNumber}
                    className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    title="Copier le numéro"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-600 mb-1">Date de commande</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Delivery Info */}
        <Card className="mb-6">
          <Card.Content className="p-4 md:p-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Livraison estimée: {estimatedDelivery}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Vous recevrez un email et un SMS avec le numéro de suivi dès l'expédition.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <Card>
            <Card.Header className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold">Adresse de livraison</h3>
              </div>
            </Card.Header>
            <Card.Content className="pt-0">
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{shippingAddress?.fullName}</p>
                <p>{shippingAddress?.streetLine1}</p>
                {shippingAddress?.streetLine2 && <p>{shippingAddress.streetLine2}</p>}
                <p>
                  {shippingAddress?.city}, {shippingAddress?.province}
                </p>
                {shippingAddress?.postalCode && <p>{shippingAddress.postalCode}</p>}
                {shippingAddress?.phoneNumber && (
                  <p className="flex items-center gap-1 mt-2">
                    <Phone className="h-4 w-4" />
                    {shippingAddress.phoneNumber}
                  </p>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Payment Method */}
          <Card>
            <Card.Header className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold">Mode de paiement</h3>
              </div>
            </Card.Header>
            <Card.Content className="pt-0">
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium text-gray-900">
                  {paymentMethod === 'cash-on-delivery'
                    ? 'Paiement à la livraison'
                    : paymentMethod === 'cib-card'
                    ? 'Carte CIB / EDAHABIA'
                    : paymentMethod === 'baridimob'
                    ? 'BaridiMob'
                    : paymentMethod}
                </p>
                {paymentMethod === 'cash-on-delivery' && (
                  <p className="text-yellow-600 dark:text-yellow-400">
                    Préparez le montant de {formatPrice(order.totalWithTax)} en espèces
                  </p>
                )}
                <p className="text-gray-500">
                  Statut: <span className="font-medium text-green-600">Confirmé</span>
                </p>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mb-6">
          <Card.Header>
            <h3 className="font-semibold">Articles commandés ({order.lines?.length || 0})</h3>
          </Card.Header>
          <Card.Content>
            <div className="divide-y">
              {order.lines?.map((item: any) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.featuredAsset?.preview && (
                      <Image
                        src={item.featuredAsset.preview}
                        alt={item.productVariant.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{item.productVariant.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Quantité: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-primary">{formatPrice(item.linePriceWithTax)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(order.subTotalWithTax)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Livraison</span>
                <span>
                  {order.shippingWithTax === 0 ? 'Gratuite' : formatPrice(order.shippingWithTax)}
                </span>
              </div>
              {order.discounts?.length > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Réductions</span>
                  <span>
                    -{formatPrice(order.discounts.reduce((acc: number, d: any) => acc + d.amountWithTax, 0))}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-bold">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(order.totalWithTax)}</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <Card.Header>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold">Prochaines étapes</h3>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Confirmation par email</p>
                  <p className="text-sm text-gray-600">
                    Un email de confirmation avec tous les détails vous a été envoyé
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Préparation</p>
                  <p className="text-sm text-gray-600">
                    Notre équipe prépare votre commande avec soin
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Expédition</p>
                  <p className="text-sm text-gray-600">
                    Vous recevrez un SMS avec le numéro de suivi
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Livraison</p>
                  <p className="text-sm text-gray-600">
                    Le livreur vous contactera avant de passer
                  </p>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Important Information */}
        <Card className="mb-6 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <Card.Header>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Informations importantes
              </h3>
            </div>
          </Card.Header>
          <Card.Content>
            <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>Vérifiez votre boîte mail (y compris les spams) pour la confirmation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>
                  Conservez votre numéro de commande <strong>{order.code}</strong> pour le suivi
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>En cas de problème, contactez-nous avec votre numéro de commande</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>Vérifiez le contenu de votre colis en présence du livreur</span>
              </li>
            </ul>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="flex-1" size="lg">
            <Link href={`/${locale}/user/orders/${order.code}`}>
              <Package className="h-5 w-5 mr-2" />
              Suivre ma commande
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

        {/* Need Help Section */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
          <h3 className="font-semibold mb-2">Besoin d'aide ?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Notre équipe est disponible pour répondre à toutes vos questions
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@oscarfashion.dz"
              className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="h-4 w-4" />
              support@oscarfashion.dz
            </a>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a
              href="tel:+21323XXXXXX"
              className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              +213 23 XX XX XX
            </a>
          </div>
        </div>
      </div>

      {/* Confetti Styles */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes bounce-once {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: confetti-fall 3s ease-out forwards;
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
