import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  MessageSquare,
  Edit2,
  Save,
  X,
  CheckCircle,
  XCircle,
  FileText,
  Phone,
  Mail,
  Calendar,
  Hash,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Copy,
  ExternalLink,
  Printer,
  MoreVertical,
  ChevronRight,
  Circle,
  Ban,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminOrderDocument,
  TransitionOrderToStateDocument,
  UpdateOrderCustomFieldsDocument,
  AddNoteToOrderDocument,
  CancelOrderDocument,
} from '../../graphql/generated/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatPrice, formatDateTime, formatDate } from '../../lib/utils';
import { printInvoice } from '../../lib/export-utils';

// Order status configuration with allowed transitions and colors
const ORDER_STATUS: Record<
  string,
  {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    next?: string[];
  }
> = {
  AddingItems: {
    label: 'En cours',
    variant: 'default',
    icon: <ShoppingBag className="h-4 w-4" />,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    next: ['ArrangingPayment', 'Cancelled'],
  },
  ArrangingPayment: {
    label: 'Paiement en attente',
    variant: 'info',
    icon: <CreditCard className="h-4 w-4" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    next: ['PaymentAuthorized', 'PaymentSettled', 'Cancelled'],
  },
  PaymentAuthorized: {
    label: 'Paiement autorisé',
    variant: 'info',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    next: ['PaymentSettled', 'Cancelled'],
  },
  PaymentSettled: {
    label: 'Payé',
    variant: 'success',
    icon: <DollarSign className="h-4 w-4" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    next: ['PartiallyShipped', 'Shipped', 'Cancelled'],
  },
  PartiallyShipped: {
    label: 'Partiellement expédié',
    variant: 'warning',
    icon: <Truck className="h-4 w-4" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    next: ['Shipped', 'PartiallyDelivered'],
  },
  Shipped: {
    label: 'Expédié',
    variant: 'info',
    icon: <Truck className="h-4 w-4" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    next: ['PartiallyDelivered', 'Delivered'],
  },
  PartiallyDelivered: {
    label: 'Partiellement livré',
    variant: 'warning',
    icon: <Package className="h-4 w-4" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    next: ['Delivered'],
  },
  Delivered: {
    label: 'Livré',
    variant: 'success',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  Modifying: {
    label: 'En modification',
    variant: 'warning',
    icon: <Edit2 className="h-4 w-4" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  ArrangingAdditionalPayment: {
    label: 'Paiement additionnel',
    variant: 'info',
    icon: <CreditCard className="h-4 w-4" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  Cancelled: {
    label: 'Annulé',
    variant: 'danger',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
};

// Order flow steps for progress visualization
const ORDER_FLOW = ['AddingItems', 'ArrangingPayment', 'PaymentSettled', 'Shipped', 'Delivered'];

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Local state
  const [editingTracking, setEditingTracking] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [activeTab, setActiveTab] = useState<'items' | 'history' | 'notes'>('items');

  // Fetch order data
  const { data, loading, error, refetch } = useQuery(AdminOrderDocument, {
    variables: { id: id! },
    skip: !id,
    onCompleted: (data) => {
      if (data?.order) {
        setTrackingNumber(data.order.customFields?.trackingNumber || '');
        setAdminNotes(data.order.customFields?.adminNotes || '');
      }
    },
  });

  // Mutations
  const [transitionOrder, { loading: transitioning }] = useMutation(TransitionOrderToStateDocument);
  const [updateCustomFields, { loading: updatingFields }] = useMutation(
    UpdateOrderCustomFieldsDocument
  );
  const [addNote, { loading: addingNote }] = useMutation(AddNoteToOrderDocument);
  const [cancelOrder, { loading: cancelling }] = useMutation(CancelOrderDocument);

  const order = data?.order;

  // Calculate order progress
  const orderProgress = useMemo(() => {
    if (!order) return 0;
    if (order.state === 'Cancelled') return -1;
    const currentIndex = ORDER_FLOW.indexOf(order.state);
    if (currentIndex === -1) {
      // Handle intermediate states
      if (['PaymentAuthorized'].includes(order.state)) return 2;
      if (['PartiallyShipped'].includes(order.state)) return 3;
      if (['PartiallyDelivered'].includes(order.state)) return 4;
      return 0;
    }
    return currentIndex;
  }, [order?.state]);

  // Calculate order statistics
  const orderStats = useMemo(() => {
    if (!order) return null;
    const totalItems = order.lines?.reduce((sum, line) => sum + line.quantity, 0) || 0;
    const uniqueProducts = order.lines?.length || 0;
    return { totalItems, uniqueProducts };
  }, [order]);

  // Handle state transition
  const handleTransition = async (newState: string) => {
    try {
      const result = await transitionOrder({
        variables: { id: id!, state: newState },
      });

      if (result.data?.transitionOrderToState) {
        const response = result.data.transitionOrderToState;
        if ('errorCode' in response) {
          dispatch(
            addToast({ message: response.message || 'Erreur lors de la transition', type: 'error' })
          );
        } else {
          dispatch(
            addToast({
              message: `Commande passée à "${ORDER_STATUS[newState]?.label}"`,
              type: 'success',
            })
          );
          refetch();
        }
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  // Handle tracking update
  const handleTrackingUpdate = async () => {
    try {
      await updateCustomFields({
        variables: {
          input: {
            id: id!,
            customFields: { trackingNumber },
          },
        },
      });
      dispatch(addToast({ message: 'Numéro de suivi mis à jour', type: 'success' }));
      setEditingTracking(false);
      refetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  // Handle admin notes update
  const handleNotesUpdate = async () => {
    try {
      await updateCustomFields({
        variables: {
          input: {
            id: id!,
            customFields: { adminNotes },
          },
        },
      });
      dispatch(addToast({ message: 'Notes mises à jour', type: 'success' }));
      setEditingNotes(false);
      refetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  // Handle adding note to history
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await addNote({
        variables: {
          input: {
            id: id!,
            note: newNote,
            isPublic: false,
          },
        },
      });
      dispatch(addToast({ message: 'Note ajoutée', type: 'success' }));
      setNewNote('');
      refetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  // Handle copy order code
  const handleCopyCode = () => {
    if (order) {
      navigator.clipboard.writeText(order.code);
      dispatch(addToast({ message: 'Code copié!', type: 'success' }));
    }
  };

  // Handle generate invoice
  const handleGenerateInvoice = () => {
    if (!order) return;

    printInvoice({
      code: order.code,
      orderPlacedAt: order.orderPlacedAt || order.createdAt,
      customer: order.customer
        ? {
            firstName: order.customer.firstName,
            lastName: order.customer.lastName,
            emailAddress: order.customer.emailAddress,
            phoneNumber: order.customer.phoneNumber || undefined,
          }
        : undefined,
      shippingAddress: order.shippingAddress
        ? {
            fullName: order.shippingAddress.fullName || '',
            streetLine1: order.shippingAddress.streetLine1 || '',
            streetLine2: order.shippingAddress.streetLine2 || undefined,
            city: order.shippingAddress.city || '',
            province: order.shippingAddress.province || undefined,
            postalCode: order.shippingAddress.postalCode || undefined,
            country: order.shippingAddress.country
              ? { name: order.shippingAddress.country }
              : undefined,
          }
        : undefined,
      lines: (order.lines || []).map((line) => ({
        productVariant: {
          name:
            line.productVariant?.product?.customFields?.nameFr ||
            line.productVariant?.product?.name ||
            line.productVariant?.name ||
            'Produit',
          sku: line.productVariant?.sku || '',
        },
        quantity: line.quantity,
        unitPriceWithTax: line.unitPriceWithTax,
        linePriceWithTax: line.linePriceWithTax,
      })),
      subTotalWithTax: order.subTotalWithTax,
      shippingWithTax: order.shippingWithTax,
      totalWithTax: order.totalWithTax,
      customFields: order.customFields
        ? {
            wilaya: order.customFields.wilaya || undefined,
            city: order.customer?.customFields?.city || order.shippingAddress?.city || undefined,
          }
        : undefined,
    });
  };

  // Handle cancel order
  const handleCancelOrder = async () => {
    try {
      const result = await cancelOrder({
        variables: {
          input: {
            orderId: id!,
            reason: cancellationReason || undefined,
          },
        },
      });

      if (result.data?.cancelOrder) {
        const response = result.data.cancelOrder;
        if ('errorCode' in response) {
          dispatch(
            addToast({ message: response.message || "Erreur lors de l'annulation", type: 'error' })
          );
        } else {
          dispatch(addToast({ message: 'Commande annulée', type: 'success' }));
          refetch();
        }
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
    setShowCancelDialog(false);
    setCancellationReason('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 bg-card rounded-xl">
        <Package className="h-20 w-20 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-xl mb-2">Commande non trouvée</p>
        <p className="text-muted-foreground/70 text-sm mb-6">
          Cette commande n'existe pas ou a été supprimée
        </p>
        <Button variant="primary" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux commandes
        </Button>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS[order.state] || {
    label: order.state,
    variant: 'default' as const,
    icon: <Circle className="h-4 w-4" />,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    next: [] as string[],
  };
  const nextStates = statusConfig.next || [];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-card to-background rounded-xl p-6 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Side - Order Info */}
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 bg-accent/50 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">Commande #{order.code}</h1>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  title="Copier le code"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </button>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor}`}
                >
                  <span className={statusConfig.color}>{statusConfig.icon}</span>
                  <span className={`text-sm font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {order.orderPlacedAt
                    ? `Passée le ${formatDate(order.orderPlacedAt)}`
                    : `Créée le ${formatDate(order.createdAt)}`}
                </span>
                {orderStats && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="flex items-center gap-1.5">
                      <Package className="h-4 w-4" />
                      {orderStats.totalItems} article{orderStats.totalItems > 1 ? 's' : ''}
                    </span>
                  </>
                )}
                {order.customFields?.wilaya && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {order.customFields.wilaya}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateInvoice}
              className="border-border hover:bg-accent"
            >
              <Printer className="h-4 w-4 mr-2" />
              Facture
            </Button>

            {nextStates.length > 0 && (
              <div className="flex items-center gap-2">
                {nextStates
                  .filter((s) => s !== 'Cancelled')
                  .map((state) => (
                    <Button
                      key={state}
                      variant="primary"
                      size="sm"
                      onClick={() => handleTransition(state)}
                      loading={transitioning}
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      {ORDER_STATUS[state]?.label || state}
                    </Button>
                  ))}
                {nextStates.includes('Cancelled') && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowCancelDialog(true)}
                    className="ml-2"
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Progress */}
        {order.state !== 'Cancelled' && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              {ORDER_FLOW.map((step, index) => {
                const stepConfig = ORDER_STATUS[step];
                const isCompleted = index < orderProgress;
                const isCurrent = index === orderProgress;
                const isPending = index > orderProgress;

                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center transition-all
                          ${isCompleted ? 'bg-green-500 text-white' : ''}
                          ${isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' : ''}
                          ${isPending ? 'bg-muted text-muted-foreground' : ''}
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          stepConfig?.icon || <Circle className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {stepConfig?.label || step}
                      </span>
                    </div>
                    {index < ORDER_FLOW.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          index < orderProgress ? 'bg-green-500' : 'bg-muted'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled Banner */}
        {order.state === 'Cancelled' && (
          <div className="mt-6 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Cette commande a été annulée</p>
              {order.customFields?.cancellationReason && (
                <p className="text-red-400 text-sm mt-1">
                  Raison: {order.customFields.cancellationReason}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Articles</p>
              <p className="text-xl font-bold text-foreground">{orderStats?.totalItems || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-foreground">
                {formatPrice(order.totalWithTax / 100)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paiement</p>
              <p className="text-lg font-medium text-foreground">
                {order.payments && order.payments.length > 0
                  ? order.payments[0].method
                  : 'En attente'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Truck className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Livraison</p>
              <p className="text-lg font-medium text-foreground">
                {formatPrice(order.shippingWithTax / 100)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex border-b border-border">
              {[
                { id: 'items', label: 'Articles', icon: <Package className="h-4 w-4" /> },
                { id: 'history', label: 'Historique', icon: <Clock className="h-4 w-4" /> },
                { id: 'notes', label: 'Notes', icon: <MessageSquare className="h-4 w-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary bg-accent/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/20'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Items Tab */}
              {activeTab === 'items' && (
                <div className="space-y-4">
                  {order.lines?.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border"
                    >
                      {line.productVariant?.product?.featuredAsset?.preview ? (
                        <img
                          src={line.productVariant.product.featuredAsset.preview}
                          alt=""
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium truncate">
                          {line.productVariant?.product?.customFields?.nameFr ||
                            line.productVariant?.product?.name ||
                            line.productVariant?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {line.productVariant?.sku}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(line.unitPriceWithTax / 100)} × {line.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          {formatPrice(line.linePriceWithTax / 100)}
                        </p>
                        <p className="text-sm text-muted-foreground">{line.quantity} unité(s)</p>
                      </div>
                    </div>
                  ))}

                  {/* Order Summary */}
                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Sous-total</span>
                      <span>{formatPrice(order.subTotalWithTax / 100)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Livraison</span>
                      <span>{formatPrice(order.shippingWithTax / 100)}</span>
                    </div>
                    {order.discounts && order.discounts.length > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Réductions</span>
                        <span>
                          -
                          {formatPrice(
                            order.discounts.reduce((sum, d) => sum + d.amountWithTax, 0) / 100
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-foreground pt-3 border-t border-border">
                      <span>Total</span>
                      <span>{formatPrice(order.totalWithTax / 100)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {order.history?.items && order.history.items.length > 0 ? (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                      {order.history.items.map((item, index) => (
                        <div key={item.id} className="relative pl-10 pb-6 last:pb-0">
                          <div
                            className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              item.type === 'ORDER_STATE_TRANSITION'
                                ? 'bg-blue-500/20 text-blue-400'
                                : item.type === 'ORDER_NOTE'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : item.type === 'ORDER_PAYMENT_TRANSITION'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {item.type === 'ORDER_STATE_TRANSITION' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : item.type === 'ORDER_NOTE' ? (
                              <MessageSquare className="h-4 w-4" />
                            ) : item.type === 'ORDER_PAYMENT_TRANSITION' ? (
                              <CreditCard className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          <div className="bg-background/50 rounded-lg p-4 border border-border">
                            <div className="flex items-start justify-between">
                              <div>
                                {item.type === 'ORDER_STATE_TRANSITION' && item.data && (
                                  <p className="text-foreground">
                                    Statut changé de{' '}
                                    <Badge variant="default" className="mx-1">
                                      {ORDER_STATUS[(item.data as any).from]?.label ||
                                        (item.data as any).from}
                                    </Badge>
                                    à{' '}
                                    <Badge variant="info" className="mx-1">
                                      {ORDER_STATUS[(item.data as any).to]?.label ||
                                        (item.data as any).to}
                                    </Badge>
                                  </p>
                                )}
                                {item.type === 'ORDER_NOTE' && item.data && (
                                  <p className="text-foreground italic">
                                    "{(item.data as any).note}"
                                  </p>
                                )}
                                {item.type === 'ORDER_PAYMENT_TRANSITION' && item.data && (
                                  <p className="text-foreground">
                                    Paiement: {(item.data as any).paymentState}
                                  </p>
                                )}
                                {![
                                  'ORDER_STATE_TRANSITION',
                                  'ORDER_NOTE',
                                  'ORDER_PAYMENT_TRANSITION',
                                ].includes(item.type) && (
                                  <p className="text-muted-foreground">{item.type}</p>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDateTime(item.createdAt)}
                              {item.administrator &&
                                ` • ${item.administrator.firstName} ${item.administrator.lastName}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun historique disponible</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-6">
                  {/* Add Note Form */}
                  <div className="flex gap-3">
                    <Input
                      placeholder="Ajouter une note à l'historique..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 bg-background border-border"
                    />
                    <Button onClick={handleAddNote} loading={addingNote} disabled={!newNote.trim()}>
                      Ajouter
                    </Button>
                  </div>

                  {/* Admin Notes */}
                  <div className="bg-background/50 rounded-lg p-4 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-foreground font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Notes internes
                      </h4>
                      {!editingNotes && (
                        <button
                          onClick={() => setEditingNotes(true)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {editingNotes ? (
                      <div className="space-y-3">
                        <TextArea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows={4}
                          placeholder="Notes internes sur la commande..."
                          className="bg-card border-border"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleNotesUpdate} loading={updatingFields}>
                            Enregistrer
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingNotes(false);
                              setAdminNotes(order.customFields?.adminNotes || '');
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {order.customFields?.adminNotes || 'Aucune note interne'}
                      </p>
                    )}
                  </div>

                  {/* Customer Notes */}
                  {order.customFields?.customerNotes && (
                    <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800/50">
                      <h4 className="text-yellow-300 font-medium flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4" />
                        Note du client
                      </h4>
                      <p className="text-yellow-200/80">{order.customFields.customerNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Client
            </h3>
            {order.customer ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 font-bold">
                      {order.customer.firstName?.[0]}
                      {order.customer.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <Link
                      to={`/customers/${order.customer.id}`}
                      className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      Voir le profil
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
                <div className="pt-3 border-t border-border space-y-2">
                  <a
                    href={`mailto:${order.customer.emailAddress}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    {order.customer.emailAddress}
                  </a>
                  {order.customer.phoneNumber && (
                    <a
                      href={`tel:${order.customer.phoneNumber}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="h-4 w-4" />
                      {order.customer.phoneNumber}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Client anonyme</p>
            )}
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-400" />
                Adresse de livraison
              </h3>
              <div className="space-y-1 text-muted-foreground">
                {order.shippingAddress.fullName && (
                  <p className="text-foreground font-medium">{order.shippingAddress.fullName}</p>
                )}
                {order.shippingAddress.streetLine1 && <p>{order.shippingAddress.streetLine1}</p>}
                {order.shippingAddress.streetLine2 && <p>{order.shippingAddress.streetLine2}</p>}
                <p>
                  {[
                    order.shippingAddress.city,
                    order.shippingAddress.province,
                    order.shippingAddress.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {order.customFields?.wilaya && (
                  <p className="mt-2 px-2 py-1 bg-muted rounded text-foreground inline-block">
                    Wilaya: {order.customFields.wilaya}
                  </p>
                )}
                {order.shippingAddress.phoneNumber && (
                  <p className="flex items-center gap-2 mt-2">
                    <Phone className="h-4 w-4" />
                    {order.shippingAddress.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-400" />
              Paiement
            </h3>
            {order.payments && order.payments.length > 0 ? (
              <div className="space-y-3">
                {order.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                  >
                    <div>
                      <p className="text-foreground font-medium">{payment.method}</p>
                      <Badge
                        variant={
                          payment.state === 'Settled'
                            ? 'success'
                            : payment.state === 'Declined'
                              ? 'danger'
                              : 'default'
                        }
                        className="mt-1"
                      >
                        {payment.state}
                      </Badge>
                    </div>
                    <p className="text-foreground font-bold">{formatPrice(payment.amount / 100)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Aucun paiement enregistré</p>
              </div>
            )}
          </div>

          {/* Shipping / Tracking */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-400" />
              Livraison
            </h3>

            {order.shippingLines && order.shippingLines.length > 0 && (
              <div className="mb-4 p-3 bg-background/50 rounded-lg">
                <p className="text-foreground font-medium">
                  {order.shippingLines[0].shippingMethod?.name}
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatPrice((order.shippingLines[0].priceWithTax || 0) / 100)}
                </p>
              </div>
            )}

            {/* Tracking Number */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Numéro de suivi</p>
                {!editingTracking && (
                  <button
                    onClick={() => setEditingTracking(true)}
                    className="text-primary hover:text-primary/80"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              {editingTracking ? (
                <div className="flex gap-2">
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="ABC123456"
                    className="flex-1 bg-background border-border"
                  />
                  <Button size="sm" onClick={handleTrackingUpdate} loading={updatingFields}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingTracking(false);
                      setTrackingNumber(order.customFields?.trackingNumber || '');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-foreground font-mono bg-background/50 px-3 py-2 rounded">
                  {order.customFields?.trackingNumber || (
                    <span className="text-muted-foreground">Non défini</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setCancellationReason('');
        }}
        onConfirm={handleCancelOrder}
        title="Annuler la commande"
        message={
          <div className="space-y-4">
            <p className="text-foreground">
              Êtes-vous sûr de vouloir annuler cette commande? Cette action est irréversible.
            </p>
            <TextArea
              label="Raison d'annulation"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={3}
              placeholder="Raison de l'annulation..."
              className="bg-card border-border"
            />
          </div>
        }
        confirmText="Annuler la commande"
        variant="danger"
        loading={cancelling}
      />
    </div>
  );
};
