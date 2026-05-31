'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckoutSteps,
  ShippingAddressForm,
  BillingAddressForm,
  ShippingMethodForm,
  PaymentMethodForm,
  OrderReview,
} from '@/components/checkout';
import { CartSummary } from '@/components/cart';
import { Button, Card, Skeleton } from '@/components/ui';
import {
  ShoppingCart,
  ArrowLeft,
  Lock,
  Truck,
  CreditCard,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils/formatters';
import { wilayas, getCommunesByWilayaCode } from '@/lib/data/algeria';
import {
  useGetEligibleShippingMethodsQuery,
  useGetEligiblePaymentMethodsQuery,
  useSetOrderShippingAddressMutation,
  useSetOrderBillingAddressMutation,
  useSetOrderShippingMethodMutation,
  useTransitionOrderToStateMutation,
  useAddPaymentToOrderMutation,
  useSetCustomerForOrderMutation,
} from '@/graphql/generated/graphql';

const steps = [
  { number: 1, label: 'Adresse', description: 'Livraison' },
  { number: 2, label: 'Facturation', description: 'Adresse' },
  { number: 3, label: 'Méthode', description: 'Expédition' },
  { number: 4, label: 'Paiement', description: 'Mode' },
  { number: 5, label: 'Confirmation', description: 'Commande' },
];

// Maps a checkout form's values (wilaya/commune codes) to a Vendure
// CreateAddressInput. Shared by the shipping and billing submit handlers.
const buildAddressInput = (values: any) => {
  const wilaya = wilayas.find((w) => w.code === values.wilaya);
  const commune = getCommunesByWilayaCode(values.wilaya).find((c) => c.code === values.commune);
  return {
    fullName: `${values.firstName} ${values.lastName}`,
    streetLine1: values.address,
    streetLine2: values.notes || '',
    city: commune?.name || values.commune,
    province: wilaya?.name || values.wilaya,
    postalCode: values.postalCode || '',
    countryCode: 'DZ',
    phoneNumber: values.phone,
  };
};

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const { cart, loading: cartLoading, refetchCart } = useCart();
  const { customer, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileOrderSummaryOpen, setMobileOrderSummaryOpen] = useState(false);

  // Checkout data
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [billingAddress, setBillingAddress] = useState<any>(null); // null = same as shipping
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>('');
  const [selectedPaymentMethodCode, setSelectedPaymentMethodCode] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // GraphQL queries
  const { data: shippingMethodsData, loading: shippingLoading } = useGetEligibleShippingMethodsQuery({
    skip: currentStep < 3,
  });

  const { data: paymentMethodsData, loading: paymentLoading } = useGetEligiblePaymentMethodsQuery({
    skip: currentStep < 4,
  });

  // GraphQL mutations
  const [setShippingAddressMutation] = useSetOrderShippingAddressMutation();
  const [setBillingAddressMutation] = useSetOrderBillingAddressMutation();
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
    id: method.id,
    code: method.code,
    name: method.name,
    description: method.description || '',
    icon: method.code === 'cash-on-delivery' ? ('cash' as const) :
          method.code === 'baridimob' ? ('baridimob' as const) : ('cib' as const),
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
        commune: '',
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
        variables: { input: buildAddressInput(values) },
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la définition de l\'adresse');
    } finally {
      setIsSubmitting(false);
    }
  };

  // billingValues === null  =>  bill to the shipping address.
  const handleBillingAddressSubmit = async (billingValues: any | null) => {
    setIsSubmitting(true);
    try {
      const source = billingValues ?? shippingAddress;
      const result = await setBillingAddressMutation({
        variables: { input: buildAddressInput(source) },
      });

      if (result.data?.setOrderBillingAddress) {
        const response = result.data.setOrderBillingAddress;
        if ('errorCode' in response) {
          toast.error(
            (response as any).message || 'Erreur lors de la définition de l\'adresse de facturation'
          );
          setIsSubmitting(false);
          return;
        }

        setBillingAddress(billingValues);
        await refetchCart();
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la définition de l\'adresse de facturation');
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
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sélection de la méthode de livraison');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentMethodSubmit = (methodCode: string, accepted: boolean) => {
    setSelectedPaymentMethodCode(methodCode);
    setTermsAccepted(accepted);
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (cartLoading) {
    return (
      <div className="container-custom py-6 md:py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-16 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <div className="hidden lg:block">
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
  const selectedPayment = paymentMethods.find((m) => m.code === selectedPaymentMethodCode);

  // Get wilaya and commune names for display
  const getAddressDisplayInfo = () => {
    if (!shippingAddress) return null;
    const wilaya = wilayas.find((w) => w.code === shippingAddress.wilaya);
    const communes = getCommunesByWilayaCode(shippingAddress.wilaya);
    const commune = communes.find((c) => c.code === shippingAddress.commune);
    return {
      ...shippingAddress,
      wilayaName: wilaya?.name || shippingAddress.wilaya,
      communeName: commune?.name || shippingAddress.commune,
    };
  };

  const displayAddress = getAddressDisplayInfo();

  // Resolve the billing address for review (null = same as shipping).
  const getBillingDisplayInfo = () => {
    if (!billingAddress) return null;
    const wilaya = wilayas.find((w) => w.code === billingAddress.wilaya);
    const commune = getCommunesByWilayaCode(billingAddress.wilaya).find(
      (c) => c.code === billingAddress.commune
    );
    return {
      firstName: billingAddress.firstName,
      lastName: billingAddress.lastName,
      address: billingAddress.address,
      city: commune?.name || billingAddress.commune,
      wilaya: wilaya?.name || billingAddress.wilaya,
      postalCode: billingAddress.postalCode,
      phone: billingAddress.phone,
    };
  };

  const displayBillingAddress = getBillingDisplayInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-40">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/cart`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Retour au panier</span>
            </Link>
            <h1 className="text-lg md:text-xl font-bold">Finaliser ma commande</h1>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Paiement sécurisé</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 md:py-8">
        {/* Progress Steps */}
        <div className="mb-6 md:mb-8">
          <CheckoutSteps currentStep={currentStep} steps={steps} />
        </div>

        {/* Mobile Order Summary Toggle */}
        <div className="lg:hidden mb-6">
          <Card>
            <button
              onClick={() => setMobileOrderSummaryOpen(!mobileOrderSummaryOpen)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {mobileOrderSummaryOpen ? 'Masquer' : 'Voir'} le résumé ({cart.items?.length || 0} article{(cart.items?.length || 0) > 1 ? 's' : ''})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">{formatPrice(cart.total || 0)}</span>
                {mobileOrderSummaryOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>
            {mobileOrderSummaryOpen && (
              <div className="border-t p-4">
                <CartSummary />
              </div>
            )}
          </Card>
        </div>

        {/* Checkout Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <Card.Content className="p-4 md:p-6">
                {currentStep === 1 && (
                  <ShippingAddressForm
                    initialValues={shippingAddress}
                    onSubmit={handleShippingAddressSubmit}
                    isAuthenticated={isAuthenticated}
                    isSubmitting={isSubmitting}
                  />
                )}

                {currentStep === 2 && (
                  <BillingAddressForm
                    shippingValues={shippingAddress}
                    initialValues={shippingAddress}
                    onSubmit={handleBillingAddressSubmit}
                    onBack={() => handleEditStep(1)}
                    isSubmitting={isSubmitting}
                  />
                )}

                {currentStep === 3 && (
                  <ShippingMethodForm
                    shippingMethods={shippingMethods}
                    initialMethod={selectedShippingMethodId}
                    onSubmit={handleShippingMethodSubmit}
                    onBack={() => handleEditStep(2)}
                  />
                )}

                {currentStep === 4 && (
                  <PaymentMethodForm
                    paymentMethods={paymentMethods.length > 0 ? paymentMethods : undefined}
                    initialMethod={selectedPaymentMethodCode}
                    onSubmit={handlePaymentMethodSubmit}
                    onBack={() => handleEditStep(3)}
                    isSubmitting={isSubmitting}
                  />
                )}

                {currentStep === 5 && displayAddress && selectedShipping && selectedPayment && (
                  <OrderReview
                    shippingAddress={{
                      ...displayAddress,
                      city: displayAddress.communeName,
                      wilaya: displayAddress.wilayaName,
                    }}
                    billingAddress={displayBillingAddress}
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
              </Card.Content>
            </Card>
          </div>

          {/* Sidebar - Order Summary (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <CartSummary />

              {/* Security Badges */}
              <Card className="mt-4">
                <Card.Content className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span>Paiement 100% sécurisé</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <span>Livraison dans les 48 wilayas</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <span>Plusieurs moyens de paiement</span>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              {/* Help Link */}
              <div className="mt-4 text-center">
                <Link
                  href={`/${locale}/contact`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Besoin d'aide ? Contactez-nous
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
