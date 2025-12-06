import React, { useState } from 'react';
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
import { Tabs } from '../../components/ui/Tabs';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatDateTime, formatPrice } from '../../lib/utils';

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
  'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa'
];

const WILAYA_OPTIONS = [
  { value: '', label: 'Sélectionner une wilaya' },
  ...WILAYAS.map((w) => ({ value: w, label: w })),
];

const ORDER_STATE_LABELS: Record<string, string> = {
  Created: 'Créée',
  AddingItems: 'En cours',
  ArrangingPayment: 'Paiement',
  PaymentAuthorized: 'Autorisée',
  PaymentSettled: 'Payée',
  PartiallyShipped: 'Part. expédiée',
  Shipped: 'Expédiée',
  PartiallyDelivered: 'Part. livrée',
  Delivered: 'Livrée',
  Modifying: 'Modification',
  ArrangingAdditionalPayment: 'Paiement add.',
  Cancelled: 'Annulée',
};

const ORDER_STATE_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  Created: 'default',
  AddingItems: 'default',
  ArrangingPayment: 'warning',
  PaymentAuthorized: 'info',
  PaymentSettled: 'info',
  PartiallyShipped: 'warning',
  Shipped: 'info',
  PartiallyDelivered: 'warning',
  Delivered: 'success',
  Modifying: 'warning',
  ArrangingAdditionalPayment: 'warning',
  Cancelled: 'danger',
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

  const { data, loading, error, refetch } = useQuery(AdminCustomerDocument, {
    variables: { id: id! },
    skip: !id,
  });

  const [updateCustomer, { loading: updating }] = useMutation(UpdateCustomerDocument);
  const [deleteCustomer, { loading: deleting }] = useMutation(DeleteCustomerDocument);

  const customer = data?.customer;

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
        dispatch(addToast({
          message: 'Cette adresse email est déjà utilisée',
          type: 'error',
        }));
        return;
      }

      dispatch(addToast({
        message: 'Client mis à jour avec succès',
        type: 'success',
      }));
      setIsEditing(false);
      refetch();
    } catch (err) {
      dispatch(addToast({
        message: 'Erreur lors de la mise à jour',
        type: 'error',
      }));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCustomer({ variables: { id: id! } });
      dispatch(addToast({
        message: 'Client supprimé avec succès',
        type: 'success',
      }));
      navigate('/customers');
    } catch (err) {
      dispatch(addToast({
        message: 'Erreur lors de la suppression',
        type: 'error',
      }));
    }
    setShowDeleteDialog(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg">
            {error ? `Erreur: ${error.message}` : 'Client non trouvé'}
          </p>
          <Button variant="secondary" onClick={() => navigate('/customers')} className="mt-4">
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  const addresses = customer.addresses || [];
  const orders = customer.orders?.items || [];
  const totalOrders = customer.orders?.totalItems || 0;

  // Build tabs for the Tabs component
  const tabs = [
    {
      id: 'info',
      label: 'Informations',
      icon: <User className="h-4 w-4" />,
      content: isEditing ? (
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
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  error={touched.phoneNumber && errors.phoneNumber ? String(errors.phoneNumber) : undefined}
                />
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
                  error={touched.city && errors.city ? String(errors.city) : undefined}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  icon={<X className="h-4 w-4" />}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  loading={updating}
                  icon={<Save className="h-4 w-4" />}
                >
                  Enregistrer
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <div className="text-gray-500 text-center py-8">
          Cliquez sur "Modifier" pour éditer les informations du client.
        </div>
      ),
    },
    {
      id: 'addresses',
      label: `Adresses (${addresses.length})`,
      icon: <Home className="h-4 w-4" />,
      content: addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune adresse enregistrée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {address.company ? (
                    <Building className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Home className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="font-medium">{address.fullName}</span>
                </div>
                <div className="flex gap-2">
                  {address.defaultShippingAddress && (
                    <Badge variant="info" className="text-xs">Livraison</Badge>
                  )}
                  {address.defaultBillingAddress && (
                    <Badge variant="default" className="text-xs">Facturation</Badge>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {address.company && <p className="font-medium">{address.company}</p>}
                <p>{address.streetLine1}</p>
                {address.streetLine2 && <p>{address.streetLine2}</p>}
                <p>
                  {address.postalCode} {address.city}
                  {address.province && `, ${address.province}`}
                </p>
                <p>{address.country?.name}</p>
                {address.phoneNumber && (
                  <p className="flex items-center gap-1 mt-2">
                    <Phone className="h-3 w-3" />
                    {address.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'orders',
      label: `Commandes (${totalOrders})`,
      icon: <Package className="h-4 w-4" />,
      content: orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune commande</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      #{order.code}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.orderPlacedAt ? formatDateTime(order.orderPlacedAt) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={ORDER_STATE_VARIANTS[order.state] || 'default'}>
                      {ORDER_STATE_LABELS[order.state] || order.state}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    {formatPrice(order.totalWithTax)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalOrders > 10 && (
            <div className="bg-gray-50 px-6 py-3 text-center text-sm text-gray-500 border-t">
              Affichage des 10 dernières commandes sur {totalOrders}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-gray-600 mt-1">ID: {customer.id}</p>
          </div>
        </div>
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

      {/* Customer Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold text-2xl">
              {(customer.firstName?.[0] || '') + (customer.lastName?.[0] || '')}
            </span>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{customer.emailAddress}</p>
              </div>
            </div>
            {customer.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{customer.phoneNumber}</p>
                </div>
              </div>
            )}
            {customer.customFields?.wilaya && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Wilaya</p>
                  <p className="font-medium">
                    {customer.customFields.wilaya}
                    {customer.customFields.city && `, ${customer.customFields.city}`}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Inscrit le</p>
                <p className="font-medium">{formatDateTime(customer.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {customer.user?.verified ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <Badge variant={customer.user?.verified ? 'success' : 'warning'}>
                  {customer.user?.verified ? 'Vérifié' : 'Non vérifié'}
                </Badge>
              </div>
            </div>
            {customer.user?.lastLogin && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Dernière connexion</p>
                  <p className="font-medium">{formatDateTime(customer.user.lastLogin)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <Tabs tabs={tabs} defaultTab="info" />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer le client"
        message={
          <div>
            <p>Êtes-vous sûr de vouloir supprimer le client <strong>{customer.firstName} {customer.lastName}</strong> ?</p>
            <p className="mt-2 text-red-600">Cette action est irréversible.</p>
          </div>
        }
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
