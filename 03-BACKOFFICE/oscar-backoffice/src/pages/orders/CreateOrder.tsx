import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ShoppingCart, PackageCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { MyCartDocument, CreateOrderDocument } from '../../graphql/generated/graphql';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { formatPrice } from '../../lib/utils';
import { PAYMENT_METHOD_LABELS } from '../../constants';

const validationSchema = Yup.object({
  paymentMethod: Yup.string()
    .required('Méthode de paiement requise')
    .oneOf(['CASH_ON_DELIVERY', 'CIB', 'BARIDIMOB'], 'Méthode de paiement invalide'),
  phoneNumber: Yup.string()
    .required('Numéro de téléphone requis')
    .matches(/^(0)(5|6|7)[0-9]{8}$/, 'Format de téléphone invalide (ex: 0551234567)'),
  shippingAddress: Yup.string()
    .required('Adresse de livraison requise')
    .min(10, 'L\'adresse doit contenir au moins 10 caractères'),
  notes: Yup.string(),
});

export const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: cartData, loading: cartLoading } = useQuery(MyCartDocument);

  const [createOrder, { loading: creating }] = useMutation(CreateOrderDocument, {
    refetchQueries: [{ query: MyCartDocument }],
  });

  const formik = useFormik({
    initialValues: {
      paymentMethod: 'CASH_ON_DELIVERY',
      phoneNumber: '',
      shippingAddress: '',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const result = await createOrder({
          variables: {
            input: {
              paymentMethod: values.paymentMethod,
              phoneNumber: values.phoneNumber,
              shippingAddress: values.shippingAddress,
              notes: values.notes || undefined,
            },
          },
        });

        dispatch(
          addToast({
            message: `Commande ${result.data?.createOrder?.orderNumber} créée avec succès`,
            type: 'success',
          })
        );

        navigate(`/orders/${result.data?.createOrder?.id}`);
      } catch (error: any) {
        console.error('Create order error:', error);
        dispatch(
          addToast({
            message: error.message || 'Erreur lors de la création de la commande',
            type: 'error',
          })
        );
      }
    },
  });

  const cart = cartData?.myCart;
  const items = cart?.items || [];

  // Check if cart is empty
  if (!cartLoading && items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Créer une commande</h1>
          <p className="text-gray-600 mt-1">Créez une nouvelle commande à partir de votre panier</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Votre panier est vide</h3>
              <p className="text-gray-500 mb-6">
                Ajoutez des produits à votre panier avant de créer une commande
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/cart')}>
                  Voir le panier
                </Button>
                <Button onClick={() => navigate('/products')}>
                  Parcourir les produits
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Créer une commande</h1>
        <p className="text-gray-600 mt-1">Commande administrative pour tests et débogage</p>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment & Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de paiement et contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select
                    label="Méthode de paiement"
                    {...formik.getFieldProps('paymentMethod')}
                    error={formik.touched.paymentMethod && formik.errors.paymentMethod ? formik.errors.paymentMethod : undefined}
                    options={[
                      { value: 'CASH_ON_DELIVERY', label: PAYMENT_METHOD_LABELS.CASH_ON_DELIVERY },
                      { value: 'CIB', label: PAYMENT_METHOD_LABELS.CIB },
                      { value: 'BARIDIMOB', label: PAYMENT_METHOD_LABELS.BARIDIMOB },
                    ]}
                  />

                  <Input
                    label="Numéro de téléphone"
                    placeholder="0551234567"
                    {...formik.getFieldProps('phoneNumber')}
                    error={formik.touched.phoneNumber && formik.errors.phoneNumber ? formik.errors.phoneNumber : undefined}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Adresse de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <TextArea
                  label="Adresse complète"
                  placeholder="Rue, ville, wilaya..."
                  rows={4}
                  {...formik.getFieldProps('shippingAddress')}
                  error={formik.touched.shippingAddress && formik.errors.shippingAddress ? formik.errors.shippingAddress : undefined}
                />
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes (optionnel)</CardTitle>
              </CardHeader>
              <CardContent>
                <TextArea
                  label="Instructions de livraison ou commentaires"
                  placeholder="Notes supplémentaires..."
                  rows={3}
                  {...formik.getFieldProps('notes')}
                  error={formik.touched.notes && formik.errors.notes ? formik.errors.notes : undefined}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Cart Summary */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Récapitulatif ({items.length} article{items.length > 1 ? 's' : ''})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Items List */}
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {items.map((item) => (
                        item && (
                          <div key={item.id} className="flex gap-3 text-sm">
                            <div className="flex-shrink-0">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName || ''}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <ShoppingCart className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              <p className="text-gray-500">Qté: {item.quantity}</p>
                              {item.selectedSize && (
                                <p className="text-gray-500 text-xs">Taille: {item.selectedSize}</p>
                              )}
                              {item.selectedColor && (
                                <p className="text-gray-500 text-xs">Couleur: {item.selectedColor}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {formatPrice(Number(item.subtotal))}
                              </p>
                            </div>
                          </div>
                        )
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Sous-total</span>
                        <span className="font-semibold">{formatPrice(Number(cart?.totalAmount || 0))}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Livraison</span>
                        <span className="font-semibold">À calculer</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total estimé</span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatPrice(Number(cart?.totalAmount || 0))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <Button
                        type="submit"
                        className="w-full"
                        loading={creating}
                        disabled={creating || !formik.isValid}
                        icon={<PackageCheck className="h-5 w-5" />}
                      >
                        Créer la commande
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/cart')}
                      >
                        Retour au panier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
