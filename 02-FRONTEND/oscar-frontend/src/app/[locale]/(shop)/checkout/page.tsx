'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckoutSteps,
  ShippingAddressForm,
  ShippingMethodForm,
  PaymentMethodForm,
  OrderReview,
} from '@/components/checkout';
import { CartSummary } from '@/components/cart';
import { Skeleton } from '@/components/ui';
import toast from 'react-hot-toast';
import { useCreateOrderMutation } from '@/graphql/generated/graphql';

// Mock data for shipping and payment methods
const mockShippingMethods = [
  {
    id: 'standard',
    name: 'Livraison Standard',
    description: 'Livraison à domicile ou au bureau',
    price: 0,
    estimatedDays: '3-5 jours ouvrables',
    icon: 'standard' as const,
  },
  {
    id: 'express',
    name: 'Livraison Express',
    description: 'Livraison rapide à domicile',
    price: 500,
    estimatedDays: '1-2 jours ouvrables',
    icon: 'express' as const,
  },
  {
    id: 'economy',
    name: 'Livraison Économique',
    description: 'Point relais le plus proche',
    price: 0,
    estimatedDays: '5-7 jours ouvrables',
    icon: 'economy' as const,
  },
];

const mockPaymentMethods = [
  {
    id: 'cash_on_delivery',
    name: 'Paiement à la livraison',
    description: 'Payez en espèces lors de la réception de votre commande',
    icon: 'cash' as const,
    available: true,
  },
  {
    id: 'card',
    name: 'Carte bancaire',
    description: 'Visa, Mastercard, CIB',
    icon: 'card' as const,
    available: false,
  },
  {
    id: 'digital_wallet',
    name: 'Portefeuille numérique',
    description: 'BaridiMob, CCP',
    icon: 'digital' as const,
    available: false,
  },
];

const steps = [
  { number: 1, label: 'Livraison', description: 'Adresse' },
  { number: 2, label: 'Méthode', description: 'Livraison' },
  { number: 3, label: 'Paiement', description: 'Mode' },
  { number: 4, label: 'Vérification', description: 'Commande' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GraphQL mutation
  const [createOrderMutation] = useCreateOrderMutation();

  // Checkout data
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      router.push(`/${locale}/cart`);
      toast.error('Votre panier est vide');
    }
  }, [cart, cartLoading, router, locale]);

  // Pre-fill shipping address if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !shippingAddress) {
      setShippingAddress({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: '',
        wilaya: '',
        city: '',
        postalCode: '',
        notes: '',
      });
    }
  }, [isAuthenticated, user, shippingAddress]);

  const handleShippingAddressSubmit = (values: any) => {
    setShippingAddress(values);
    setCurrentStep(2);
  };

  const handleShippingMethodSubmit = (methodId: string) => {
    setSelectedShippingMethod(methodId);
    setCurrentStep(3);
  };

  const handlePaymentMethodSubmit = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setCurrentStep(4);
  };

  const handleOrderSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Format shipping address for backend
      const fullShippingAddress = [
        shippingAddress.address,
        shippingAddress.city,
        shippingAddress.wilaya,
        shippingAddress.postalCode,
      ]
        .filter(Boolean)
        .join(', ');

      const phoneNumber = shippingAddress.phone || user?.phone || '';

      // Create order via GraphQL mutation
      const { data } = await createOrderMutation({
        variables: {
          input: {
            shippingAddress: fullShippingAddress,
            phoneNumber,
            paymentMethod: selectedPayment?.name || 'Paiement à la livraison',
            notes: shippingAddress.notes || '',
          },
        },
      });

      if (data?.createOrder) {
        // Clear cart after successful order
        await clearCart();

        toast.success('Commande confirmée avec succès!');

        // Redirect to order detail page
        router.push(`/${locale}/user/orders/${data.createOrder.id}`);
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast.error(error.message || 'Erreur lors de la confirmation de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
  };

  // Loading state
  if (cartLoading) {
    return (
      <div className="container-custom py-8">
        <Skeleton className="h-12 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  // Empty cart check (redundant with useEffect redirect, but good fallback)
  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  const selectedShipping = mockShippingMethods.find((m) => m.id === selectedShippingMethod);
  const selectedPayment = mockPaymentMethods.find((m) => m.id === selectedPaymentMethod);

  const subtotal = cart.subtotal || 0;
  const discount = cart.discount || 0;
  const shippingCost = selectedShipping?.price || 0;
  const total = subtotal - discount + shippingCost;

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Finaliser ma commande</h1>

      {/* Progress Steps */}
      <CheckoutSteps currentStep={currentStep} steps={steps} />

      {/* Checkout Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <ShippingAddressForm
              initialValues={shippingAddress}
              onSubmit={handleShippingAddressSubmit}
            />
          )}

          {currentStep === 2 && (
            <ShippingMethodForm
              shippingMethods={mockShippingMethods}
              initialMethod={selectedShippingMethod}
              onSubmit={handleShippingMethodSubmit}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <PaymentMethodForm
              paymentMethods={mockPaymentMethods}
              initialMethod={selectedPaymentMethod}
              onSubmit={handlePaymentMethodSubmit}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && shippingAddress && selectedShipping && selectedPayment && (
            <OrderReview
              shippingAddress={shippingAddress}
              shippingMethod={selectedShipping}
              paymentMethod={selectedPayment}
              cartItems={cart.items}
              subtotal={subtotal}
              discount={discount}
              shippingCost={shippingCost}
              total={total}
              onEdit={handleEditStep}
              onSubmit={handleOrderSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Sidebar - Order Summary (hidden on review step as it's included there) */}
        {currentStep < 4 && (
          <div className="lg:block hidden">
            <div className="sticky top-4">
              <CartSummary showCoupon={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
