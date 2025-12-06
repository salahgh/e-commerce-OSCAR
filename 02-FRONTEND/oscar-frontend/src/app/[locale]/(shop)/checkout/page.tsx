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
import {
  useGetEligibleShippingMethodsQuery,
  useGetEligiblePaymentMethodsQuery,
  useSetOrderShippingAddressMutation,
  useSetOrderShippingMethodMutation,
  useTransitionOrderToStateMutation,
  useAddPaymentToOrderMutation,
  useSetCustomerForOrderMutation,
} from '@/graphql/generated/graphql';

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
  const { cart, loading: cartLoading, refetchCart } = useCart();
  const { customer, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Checkout data
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>('');
  const [selectedPaymentMethodCode, setSelectedPaymentMethodCode] = useState<string>('');

  // GraphQL queries
  const { data: shippingMethodsData, loading: shippingLoading } = useGetEligibleShippingMethodsQuery({
    skip: currentStep < 2,
  });

  const { data: paymentMethodsData, loading: paymentLoading } = useGetEligiblePaymentMethodsQuery({
    skip: currentStep < 3,
  });

  // GraphQL mutations
  const [setShippingAddressMutation] = useSetOrderShippingAddressMutation();
  const [setShippingMethodMutation] = useSetOrderShippingMethodMutation();
  const [setCustomerMutation] = useSetCustomerForOrderMutation();
  const [transitionOrderMutation] = useTransitionOrderToStateMutation();
  const [addPaymentMutation] = useAddPaymentToOrderMutation();

  // Map shipping methods for UI
  const shippingMethods = (shippingMethodsData?.eligibleShippingMethods || []).map((method) => ({
    id: method.id,
    name: method.name,
    description: method.description || '',
    price: method.priceWithTax,
    estimatedDays: method.metadata?.estimatedDays || '3-5 jours ouvrables',
    icon: 'standard' as const,
  }));

  // Map payment methods for UI
  const paymentMethods = (paymentMethodsData?.eligiblePaymentMethods || []).map((method) => ({
    id: method.code,
    name: method.name,
    description: method.description || '',
    icon: method.code === 'cash-on-delivery' ? ('cash' as const) : ('card' as const),
    available: method.isEligible,
  }));

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      router.push(`/${locale}/cart`);
      toast.error('Votre panier est vide');
    }
  }, [cart, cartLoading, router, locale]);

  // Pre-fill shipping address if user is authenticated
  useEffect(() => {
    if (isAuthenticated && customer && !shippingAddress) {
      setShippingAddress({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.emailAddress || '',
        phone: customer.phoneNumber || '',
        address: '',
        wilaya: '',
        city: '',
        postalCode: '',
        notes: '',
      });
    }
  }, [isAuthenticated, customer, shippingAddress]);

  const handleShippingAddressSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      // Set customer for guest checkout
      if (!isAuthenticated) {
        const customerResult = await setCustomerMutation({
          variables: {
            input: {
              firstName: values.firstName,
              lastName: values.lastName,
              emailAddress: values.email,
              phoneNumber: values.phone,
            },
          },
        });

        if (customerResult.data?.setCustomerForOrder) {
          const response = customerResult.data.setCustomerForOrder;
          if ('errorCode' in response) {
            toast.error((response as any).message || 'Erreur lors de la définition du client');
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Set shipping address
      const result = await setShippingAddressMutation({
        variables: {
          input: {
            fullName: `${values.firstName} ${values.lastName}`,
            streetLine1: values.address,
            streetLine2: values.notes || '',
            city: values.city,
            province: values.wilaya,
            postalCode: values.postalCode || '',
            countryCode: 'DZ', // Algeria
            phoneNumber: values.phone,
          },
        },
      });

      if (result.data?.setOrderShippingAddress) {
        const response = result.data.setOrderShippingAddress;
        if ('errorCode' in response) {
          toast.error((response as any).message || 'Erreur lors de la définition de l\'adresse');
          setIsSubmitting(false);
          return;
        }

        setShippingAddress(values);
        await refetchCart();
        setCurrentStep(2);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la définition de l\'adresse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShippingMethodSubmit = async (methodId: string) => {
    setIsSubmitting(true);
    try {
      const result = await setShippingMethodMutation({
        variables: {
          shippingMethodId: [methodId],
        },
      });

      if (result.data?.setOrderShippingMethod) {
        const response = result.data.setOrderShippingMethod;
        if ('errorCode' in response) {
          toast.error((response as any).message || 'Erreur lors de la sélection de la méthode');
          setIsSubmitting(false);
          return;
        }

        setSelectedShippingMethodId(methodId);
        await refetchCart();
        setCurrentStep(3);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sélection de la méthode de livraison');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentMethodSubmit = (methodCode: string) => {
    setSelectedPaymentMethodCode(methodCode);
    setCurrentStep(4);
  };

  const handleOrderSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Transition order to ArrangingPayment state
      const transitionResult = await transitionOrderMutation({
        variables: {
          state: 'ArrangingPayment',
        },
      });

      if (transitionResult.data?.transitionOrderToState) {
        const response = transitionResult.data.transitionOrderToState;
        if ('errorCode' in response) {
          toast.error((response as any).message || 'Erreur lors de la transition de la commande');
          setIsSubmitting(false);
          return;
        }
      }

      // Add payment
      const paymentResult = await addPaymentMutation({
        variables: {
          input: {
            method: selectedPaymentMethodCode,
            metadata: {},
          },
        },
      });

      if (paymentResult.data?.addPaymentToOrder) {
        const response = paymentResult.data.addPaymentToOrder;
        if ('errorCode' in response) {
          toast.error((response as any).message || 'Erreur lors du paiement');
          setIsSubmitting(false);
          return;
        }

        // Success - order is complete
        if ('code' in response) {
          toast.success('Commande confirmée avec succès!');
          await refetchCart();
          router.push(`/${locale}/order-confirmation?code=${response.code}`);
        }
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
      <div className="container mx-auto px-4 py-8">
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

  // Empty cart check
  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  const selectedShipping = shippingMethods.find((m) => m.id === selectedShippingMethodId);
  const selectedPayment = paymentMethods.find((m) => m.id === selectedPaymentMethodCode);

  return (
    <div className="container mx-auto px-4 py-8">
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
              shippingMethods={shippingMethods}
              initialMethod={selectedShippingMethodId}
              onSubmit={handleShippingMethodSubmit}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <PaymentMethodForm
              paymentMethods={paymentMethods}
              initialMethod={selectedPaymentMethodCode}
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
              subtotal={cart.subTotal}
              discount={0}
              shippingCost={cart.shipping}
              total={cart.total}
              onEdit={handleEditStep}
              onSubmit={handleOrderSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Sidebar - Order Summary */}
        {currentStep < 4 && (
          <div className="lg:block hidden">
            <div className="sticky top-4">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
