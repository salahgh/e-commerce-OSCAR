import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { ShoppingCart, Trash2, Plus, Minus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MyCartDocument, UpdateCartItemDocument, RemoveFromCartDocument, ClearCartDocument } from '../../graphql/generated/graphql';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { formatPrice } from '../../lib/utils';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ id: number; name: string } | null>(null);

  const { data, loading, error } = useQuery(MyCartDocument);

  const [updateCartItem, { loading: updating }] = useMutation(UpdateCartItemDocument, {
    refetchQueries: [{ query: MyCartDocument }],
  });

  const [removeFromCart, { loading: removing }] = useMutation(RemoveFromCartDocument, {
    refetchQueries: [{ query: MyCartDocument }],
  });

  const [clearCart, { loading: clearing }] = useMutation(ClearCartDocument, {
    refetchQueries: [{ query: MyCartDocument }],
  });

  const handleUpdateQuantity = async (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    try {
      await updateCartItem({
        variables: {
          itemId,
          input: { quantity: newQuantity },
        },
      });
      dispatch(
        addToast({
          message: 'Quantité mise à jour',
          type: 'success',
        })
      );
    } catch (error: any) {
      console.error('Update cart item error:', error);
      dispatch(
        addToast({
          message: error.message || 'Erreur lors de la mise à jour',
          type: 'error',
        })
      );
    }
  };

  const handleRemoveItem = async () => {
    if (!itemToRemove) return;

    try {
      await removeFromCart({
        variables: { itemId: itemToRemove.id },
      });
      dispatch(
        addToast({
          message: 'Article retiré du panier',
          type: 'success',
        })
      );
      setItemToRemove(null);
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      dispatch(
        addToast({
          message: error.message || 'Erreur lors de la suppression',
          type: 'error',
        })
      );
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      dispatch(
        addToast({
          message: 'Panier vidé avec succès',
          type: 'success',
        })
      );
      setShowClearConfirm(false);
    } catch (error: any) {
      console.error('Clear cart error:', error);
      dispatch(
        addToast({
          message: error.message || 'Erreur lors du vidage du panier',
          type: 'error',
        })
      );
    }
  };

  const cart = data?.myCart;
  const items = cart?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8" />
            Mon Panier
          </h1>
          <p className="text-gray-600 mt-1">Panier administrateur pour tests et débogage</p>
        </div>
        {items.length > 0 && (
          <div className="flex gap-3">
            <Button variant="danger" onClick={() => setShowClearConfirm(true)}>
              Vider le panier
            </Button>
            <Button onClick={() => navigate('/orders/create')}>
              Créer une commande
            </Button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Chargement du panier...</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Erreur: {error.message}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Votre panier est vide</h3>
              <p className="text-gray-500 mb-6">Ajoutez des produits pour créer une commande de test</p>
              <Button onClick={() => navigate('/products')}>
                Parcourir les produits
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cart Items */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{items.length} article{items.length > 1 ? 's' : ''} dans le panier</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {items.map((item) => (
                    item && (
                      <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName || ''}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{item.productName}</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              {item.selectedSize && (
                                <p>Taille: <span className="font-medium">{item.selectedSize}</span></p>
                              )}
                              {item.selectedColor && (
                                <p>Couleur: <span className="font-medium">{item.selectedColor}</span></p>
                              )}
                              <p className="text-lg font-semibold text-gray-900 mt-2">
                                {formatPrice(Number(item.price))}
                              </p>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col items-end justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setItemToRemove({ id: Number(item.id), name: item.productName || '' })}
                              icon={<Trash2 className="h-4 w-4 text-red-600" />}
                            />
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateQuantity(Number(item.id), item.quantity || 1, -1)}
                                disabled={updating || (item.quantity || 1) <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-semibold">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateQuantity(Number(item.id), item.quantity || 1, 1)}
                                disabled={updating}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-lg font-bold text-gray-900 mt-2">
                              {formatPrice(Number(item.subtotal))}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span className="font-semibold">{formatPrice(Number(cart?.totalAmount || 0))}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span className="font-semibold">À calculer</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(Number(cart?.totalAmount || 0))}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Ce panier est destiné aux tests administrateur. Utilisez "Créer une commande" pour générer une commande de test.
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => navigate('/orders/create')}
                  >
                    Créer une commande
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Remove Item Confirmation */}
      <ConfirmDialog
        isOpen={itemToRemove !== null}
        onClose={() => setItemToRemove(null)}
        onConfirm={handleRemoveItem}
        title="Retirer l'article"
        message={`Êtes-vous sûr de vouloir retirer "${itemToRemove?.name}" du panier ?`}
        confirmText="Retirer"
        cancelText="Annuler"
        loading={removing}
      />

      {/* Clear Cart Confirmation */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearCart}
        title="Vider le panier"
        message="Êtes-vous sûr de vouloir vider complètement le panier ? Cette action est irréversible."
        confirmText="Vider le panier"
        cancelText="Annuler"
        loading={clearing}
      />
    </div>
  );
};
