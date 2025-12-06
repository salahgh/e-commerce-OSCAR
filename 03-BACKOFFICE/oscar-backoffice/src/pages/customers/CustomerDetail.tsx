import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  CheckCircle,
  XCircle,
  Package,
  Home,
  Building,
  Clock,
  Trash2,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Award,
  Star,
  Heart,
  Eye,
  MoreVertical,
  Copy,
  ExternalLink,
  Gift,
  Zap,
  Target,
  Activity,
  CreditCard,
  Truck,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Shield,
  AlertTriangle,
  Ban,
  UserCheck,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminCustomerDocument,
  UpdateCustomerDocument,
  DeleteCustomerDocument,
} from '../../graphql/generated/graphql';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatDateTime, formatPrice } from '../../lib/utils';

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
  'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa',
];

const WILAYA_OPTIONS = [
  { value: '', label: 'Sélectionner une wilaya' },
  ...WILAYAS.map((w) => ({ value: w, label: w })),
];

const ORDER_STATE_CONFIG: Record<string, {
  label: string;
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = {
  Created: { label: 'Créée', variant: 'default', icon: <Package className="h-3 w-3" />, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  AddingItems: { label: 'En cours', variant: 'default', icon: <ShoppingCart className="h-3 w-3" />, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  ArrangingPayment: { label: 'Paiement', variant: 'warning', icon: <CreditCard className="h-3 w-3" />, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  PaymentAuthorized: { label: 'Autorisée', variant: 'info', icon: <CheckCircle className="h-3 w-3" />, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  PaymentSettled: { label: 'Payée', variant: 'info', icon: <CheckCircle className="h-3 w-3" />, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  PartiallyShipped: { label: 'Part. expédiée', variant: 'warning', icon: <Truck className="h-3 w-3" />, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  Shipped: { label: 'Expédiée', variant: 'info', icon: <Truck className="h-3 w-3" />, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  PartiallyDelivered: { label: 'Part. livrée', variant: 'warning', icon: <Package className="h-3 w-3" />, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  Delivered: { label: 'Livrée', variant: 'success', icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  Modifying: { label: 'Modification', variant: 'warning', icon: <Edit2 className="h-3 w-3" />, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  ArrangingAdditionalPayment: { label: 'Paiement add.', variant: 'warning', icon: <CreditCard className="h-3 w-3" />, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  Cancelled: { label: 'Annulée', variant: 'danger', icon: <X className="h-3 w-3" />, color: 'text-red-400', bgColor: 'bg-red-500/20' },
};

// Customer tier based on lifetime value
const getCustomerTier = (lifetimeValue: number) => {
  if (lifetimeValue >= 10000000) return { name: 'Diamant', color: 'from-cyan-400 to-blue-500', icon: <Sparkles className="h-5 w-5" />, textColor: 'text-cyan-400' };
  if (lifetimeValue >= 5000000) return { name: 'Platine', color: 'from-purple-400 to-pink-500', icon: <Star className="h-5 w-5" />, textColor: 'text-purple-400' };
  if (lifetimeValue >= 2000000) return { name: 'Or', color: 'from-yellow-400 to-orange-500', icon: <Award className="h-5 w-5" />, textColor: 'text-yellow-400' };
  if (lifetimeValue >= 500000) return { name: 'Argent', color: 'from-gray-300 to-gray-500', icon: <Shield className="h-5 w-5" />, textColor: 'text-gray-300' };
  return { name: 'Bronze', color: 'from-orange-300 to-orange-600', icon: <Heart className="h-5 w-5" />, textColor: 'text-orange-400' };
};

const validationSchema = Yup.object({
  firstName: Yup.string().required('Prénom requis'),
  lastName: Yup.string().required('Nom requis'),
  emailAddress: Yup.string().email('Email invalide').required('Email requis'),
  phoneNumber: Yup.string(),
  wilaya: Yup.string(),
  city: Yup.string(),
});

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses'>('overview');

  const { data, loading, error, refetch } = useQuery(AdminCustomerDocument, {
    variables: { id: id! },
    skip: !id,
  });

  const [updateCustomer, { loading: updating }] = useMutation(UpdateCustomerDocument);
  const [deleteCustomer, { loading: deleting }] = useMutation(DeleteCustomerDocument);

  const customer = data?.customer;

  // Calculate customer statistics
  const customerStats = useMemo(() => {
    if (!customer) return null;

    const orders = customer.orders?.items || [];
    const totalOrders = customer.orders?.totalItems || 0;

    const completedOrders = orders.filter((o) =>
      ['PaymentSettled', 'Shipped', 'Delivered'].includes(o.state)
    );
    const cancelledOrders = orders.filter((o) => o.state === 'Cancelled');
    const deliveredOrders = orders.filter((o) => o.state === 'Delivered');

    const lifetimeValue = completedOrders.reduce((sum, o) => sum + (o.totalWithTax || 0), 0);
    const averageOrderValue = completedOrders.length > 0 ? lifetimeValue / completedOrders.length : 0;

    // Calculate order frequency (days between orders)
    const orderDates = orders
      .filter(o => o.orderPlacedAt)
      .map(o => new Date(o.orderPlacedAt).getTime())
      .sort((a, b) => a - b);

    let avgDaysBetweenOrders = 0;
    if (orderDates.length > 1) {
      const totalDays = (orderDates[orderDates.length - 1] - orderDates[0]) / (1000 * 60 * 60 * 24);
      avgDaysBetweenOrders = Math.round(totalDays / (orderDates.length - 1));
    }

    // Customer age (days since registration)
    const customerAge = Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    // Last order date
    const lastOrder = orders[0];
    const daysSinceLastOrder = lastOrder?.orderPlacedAt
      ? Math.floor((Date.now() - new Date(lastOrder.orderPlacedAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Completion rate
    const completionRate = totalOrders > 0 ? (deliveredOrders.length / totalOrders) * 100 : 0;

    // Order status distribution
    const statusDistribution: Record<string, number> = {};
    orders.forEach(o => {
      statusDistribution[o.state] = (statusDistribution[o.state] || 0) + 1;
    });

    return {
      totalOrders,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      deliveredOrders: deliveredOrders.length,
      lifetimeValue,
      averageOrderValue,
      avgDaysBetweenOrders,
      customerAge,
      daysSinceLastOrder,
      completionRate,
      statusDistribution,
      tier: getCustomerTier(lifetimeValue),
    };
  }, [customer]);

  const handleSave = async (values: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    wilaya: string;
    city: string;
  }) => {
    try {
      const result = await updateCustomer({
        variables: {
          input: {
            id: id!,
            firstName: values.firstName,
            lastName: values.lastName,
            emailAddress: values.emailAddress,
            phoneNumber: values.phoneNumber || null,
            customFields: {
              wilaya: values.wilaya || null,
              city: values.city || null,
            },
          },
        },
      });

      if (result.data?.updateCustomer?.__typename === 'EmailAddressConflictError') {
        dispatch(addToast({ message: 'Cette adresse email est déjà utilisée', type: 'error' }));
        return;
      }

      dispatch(addToast({ message: 'Client mis à jour avec succès', type: 'success' }));
      setIsEditing(false);
      refetch();
    } catch (err) {
      dispatch(addToast({ message: 'Erreur lors de la mise à jour', type: 'error' }));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCustomer({ variables: { id: id! } });
      dispatch(addToast({ message: 'Client supprimé avec succès', type: 'success' }));
      navigate('/customers');
    } catch (err) {
      dispatch(addToast({ message: 'Erreur lors de la suppression', type: 'error' }));
    }
    setShowDeleteDialog(false);
  };

  const handleCopyEmail = () => {
    if (customer?.emailAddress) {
      navigator.clipboard.writeText(customer.emailAddress);
      dispatch(addToast({ message: 'Email copié', type: 'success' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-400 mt-4">Chargement du profil client...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 bg-red-500/20 rounded-full mb-4">
          <AlertTriangle className="h-12 w-12 text-red-400" />
        </div>
        <p className="text-gray-300 text-lg font-medium mb-2">
          {error ? 'Erreur de chargement' : 'Client non trouvé'}
        </p>
        <p className="text-gray-500 text-sm mb-6">
          {error?.message || "Ce client n'existe pas ou a été supprimé"}
        </p>
        <Button variant="primary" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  const addresses = customer.addresses || [];
  const orders = customer.orders?.items || [];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl border border-gray-700">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative p-8">
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/customers')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-gray-300 hover:text-white transition-all group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Retour
            </button>
            <div className="flex items-center gap-3">
              {!isEditing && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                    icon={<Edit2 className="h-4 w-4" />}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteDialog(true)}
                    icon={<Trash2 className="h-4 w-4" />}
                  >
                    Supprimer
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              {/* Large Avatar */}
              <div className="relative group">
                <div className={`h-32 w-32 rounded-2xl bg-gradient-to-br ${customerStats?.tier.color || 'from-blue-500 to-purple-600'} p-1 shadow-2xl`}>
                  <div className="h-full w-full rounded-xl bg-gray-900 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {(customer.firstName?.[0] || '') + (customer.lastName?.[0] || '')}
                    </span>
                  </div>
                </div>
                {/* Verification Badge */}
                <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg ${
                  customer.user?.verified
                    ? 'bg-green-500'
                    : 'bg-yellow-500'
                }`}>
                  {customer.user?.verified ? (
                    <CheckCircle className="h-5 w-5 text-white" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>

              {/* Customer Tier Badge */}
              {customerStats && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${customerStats.tier.color} bg-opacity-20`}>
                  {customerStats.tier.icon}
                  <span className={`font-bold ${customerStats.tier.textColor}`}>
                    Client {customerStats.tier.name}
                  </span>
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {customer.firstName} {customer.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Client depuis {customerStats?.customerAge || 0} jours
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm bg-gray-700/50 px-2 py-1 rounded-lg">
                      ID: {customer.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Email */}
                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 group hover:border-blue-500/50 transition-all">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-white truncate">{customer.emailAddress}</p>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded-lg transition-all"
                    title="Copier"
                  >
                    <Copy className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-all">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Phone className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Téléphone</p>
                    <p className="text-white">{customer.phoneNumber || '-'}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Localisation</p>
                    <p className="text-white">
                      {customer.customFields?.wilaya || '-'}
                      {customer.customFields?.city && `, ${customer.customFields.city}`}
                    </p>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-yellow-500/50 transition-all">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Dernière connexion</p>
                    <p className="text-white">
                      {customer.user?.lastLogin ? formatDateTime(customer.user.lastLogin) : 'Jamais'}
                    </p>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/50 transition-all">
                  <div className={`p-2 rounded-lg ${customer.user?.verified ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                    {customer.user?.verified ? (
                      <UserCheck className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Statut</p>
                    <Badge variant={customer.user?.verified ? 'success' : 'warning'}>
                      {customer.user?.verified ? 'Vérifié' : 'Non vérifié'}
                    </Badge>
                  </div>
                </div>

                {/* Last Order */}
                {customerStats?.daysSinceLastOrder !== null && (
                  <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-pink-500/50 transition-all">
                    <div className="p-2 bg-pink-500/20 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-pink-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Dernière commande</p>
                      <p className="text-white">
                        Il y a {customerStats.daysSinceLastOrder} jours
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {customerStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-5 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-400">
                <Activity className="h-3 w-3" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{customerStats.totalOrders}</p>
            <p className="text-sm text-gray-400">Commandes totales</p>
          </div>

          {/* Lifetime Value */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-5 border border-green-500/20 hover:border-green-500/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <TrendingUp className="h-3 w-3" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{formatPrice(customerStats.lifetimeValue)}</p>
            <p className="text-sm text-gray-400">Valeur totale</p>
          </div>

          {/* Average Order */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-400">
                <BarChart3 className="h-3 w-3" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{formatPrice(customerStats.averageOrderValue)}</p>
            <p className="text-sm text-gray-400">Panier moyen</p>
          </div>

          {/* Delivered Orders */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <ArrowUpRight className="h-3 w-3" />
                {customerStats.completionRate.toFixed(0)}%
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{customerStats.deliveredOrders}</p>
            <p className="text-sm text-gray-400">Livrées</p>
          </div>

          {/* Cancelled Orders */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl p-5 border border-red-500/20 hover:border-red-500/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-red-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-red-400">
                <ArrowDownRight className="h-3 w-3" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{customerStats.cancelledOrders}</p>
            <p className="text-sm text-gray-400">Annulées</p>
          </div>

          {/* Order Frequency */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-xl p-5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <Zap className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Clock className="h-3 w-3" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {customerStats.avgDaysBetweenOrders || '∞'}
            </p>
            <p className="text-sm text-gray-400">Jours entre cmd</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-700">
        {[
          { id: 'overview' as const, label: 'Aperçu', icon: <PieChart className="h-4 w-4" /> },
          { id: 'orders' as const, label: `Commandes (${customerStats?.totalOrders || 0})`, icon: <Package className="h-4 w-4" /> },
          { id: 'addresses' as const, label: `Adresses (${addresses.length})`, icon: <Home className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all
              ${activeTab === tab.id
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-600'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edit Form or Info Display */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-400" />
                  Informations personnelles
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="p-6">
                {isEditing ? (
                  <Formik
                    initialValues={{
                      firstName: customer.firstName || '',
                      lastName: customer.lastName || '',
                      emailAddress: customer.emailAddress || '',
                      phoneNumber: customer.phoneNumber || '',
                      wilaya: customer.customFields?.wilaya || '',
                      city: customer.customFields?.city || '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSave}
                  >
                    {({ values, errors, touched, handleChange, handleBlur }) => (
                      <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Prénom"
                            name="firstName"
                            value={values.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.firstName && errors.firstName ? String(errors.firstName) : undefined}
                            required
                          />
                          <Input
                            label="Nom"
                            name="lastName"
                            value={values.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.lastName && errors.lastName ? String(errors.lastName) : undefined}
                            required
                          />
                        </div>
                        <Input
                          label="Email"
                          name="emailAddress"
                          type="email"
                          value={values.emailAddress}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.emailAddress && errors.emailAddress ? String(errors.emailAddress) : undefined}
                          required
                        />
                        <Input
                          label="Téléphone"
                          name="phoneNumber"
                          value={values.phoneNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Select
                            label="Wilaya"
                            name="wilaya"
                            value={values.wilaya}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            options={WILAYA_OPTIONS}
                          />
                          <Input
                            label="Ville"
                            name="city"
                            value={values.city}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} icon={<X className="h-4 w-4" />}>
                            Annuler
                          </Button>
                          <Button type="submit" loading={updating} icon={<Save className="h-4 w-4" />}>
                            Enregistrer
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prénom</p>
                        <p className="text-white font-medium">{customer.firstName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nom</p>
                        <p className="text-white font-medium">{customer.lastName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-white font-medium">{customer.emailAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Téléphone</p>
                      <p className="text-white font-medium">{customer.phoneNumber || '-'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Wilaya</p>
                        <p className="text-white font-medium">{customer.customFields?.wilaya || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ville</p>
                        <p className="text-white font-medium">{customer.customFields?.city || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Distribution */}
            {customerStats && customerStats.totalOrders > 0 && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-gray-400" />
                    Distribution des commandes
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {Object.entries(customerStats.statusDistribution).map(([status, count]) => {
                      const config = ORDER_STATE_CONFIG[status] || {
                        label: status,
                        color: 'text-gray-400',
                        bgColor: 'bg-gray-500/20',
                        icon: <Package className="h-3 w-3" />,
                      };
                      const percentage = (count / customerStats.totalOrders) * 100;
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`p-1 rounded ${config.bgColor}`}>
                                {config.icon}
                              </span>
                              <span className={config.color}>{config.label}</span>
                            </div>
                            <span className="text-white font-medium">{count}</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${config.bgColor.replace('/20', '')}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-4 bg-gray-700/30 rounded-full mb-4">
                  <Package className="h-12 w-12 text-gray-500" />
                </div>
                <p className="text-gray-300 text-lg font-medium mb-2">Aucune commande</p>
                <p className="text-gray-500 text-sm">Ce client n'a pas encore passé de commande</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-900/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Commande
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {orders.map((order) => {
                      const config = ORDER_STATE_CONFIG[order.state] || {
                        label: order.state,
                        color: 'text-gray-400',
                        bgColor: 'bg-gray-500/20',
                        icon: <Package className="h-3 w-3" />,
                      };
                      return (
                        <tr key={order.id} className="hover:bg-gray-700/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                {config.icon}
                              </div>
                              <div>
                                <Link
                                  to={`/orders/${order.id}`}
                                  className="text-white font-medium hover:text-blue-400 transition-colors"
                                >
                                  #{order.code}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300">
                              {order.orderPlacedAt ? formatDateTime(order.orderPlacedAt) : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                              {config.icon}
                              {config.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-white font-semibold">
                              {formatPrice(order.totalWithTax)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              to={`/orders/${order.id}`}
                              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Eye className="h-4 w-4" />
                              Voir
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {(customerStats?.totalOrders || 0) > 10 && (
                  <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700 text-center text-sm text-gray-400">
                    Affichage des 10 dernières commandes sur {customerStats?.totalOrders}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-4 bg-gray-700/30 rounded-full mb-4">
                  <MapPin className="h-12 w-12 text-gray-500" />
                </div>
                <p className="text-gray-300 text-lg font-medium mb-2">Aucune adresse</p>
                <p className="text-gray-500 text-sm">Ce client n'a pas encore enregistré d'adresse</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-5 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          {address.company ? (
                            <Building className="h-5 w-5 text-blue-400" />
                          ) : (
                            <Home className="h-5 w-5 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{address.fullName}</p>
                          {address.company && (
                            <p className="text-sm text-gray-400">{address.company}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {address.defaultShippingAddress && (
                          <Badge variant="info" className="text-xs">
                            <Truck className="h-3 w-3 mr-1" />
                            Livraison
                          </Badge>
                        )}
                        {address.defaultBillingAddress && (
                          <Badge variant="default" className="text-xs">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Facturation
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 space-y-1 ml-12">
                      <p>{address.streetLine1}</p>
                      {address.streetLine2 && <p>{address.streetLine2}</p>}
                      <p>
                        {address.postalCode} {address.city}
                        {address.province && `, ${address.province}`}
                      </p>
                      <p className="text-gray-400">{address.country?.name}</p>
                      {address.phoneNumber && (
                        <p className="flex items-center gap-1 mt-2 text-gray-400">
                          <Phone className="h-3 w-3" />
                          {address.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer le client"
        message={
          <div>
            <p>
              Êtes-vous sûr de vouloir supprimer le client{' '}
              <strong className="text-white">
                {customer.firstName} {customer.lastName}
              </strong>{' '}
              ?
            </p>
            <p className="mt-2 text-red-400">Cette action est irréversible.</p>
          </div>
        }
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
