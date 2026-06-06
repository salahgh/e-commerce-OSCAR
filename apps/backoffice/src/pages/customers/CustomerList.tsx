import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  ShoppingCart,
  DollarSign,
  UserPlus,
  Trash2,
} from 'lucide-react';
import {
  AdminCustomersDocument,
  DeleteCustomerDocument,
} from '../../graphql/generated/graphql';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { formatDateTime, formatPrice } from '../../lib/utils';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { CreateCustomerDialog } from './CustomerDialogs';

const WILAYAS = [
  'Adrar',
  'Chlef',
  'Laghouat',
  'Oum El Bouaghi',
  'Batna',
  'Béjaïa',
  'Biskra',
  'Béchar',
  'Blida',
  'Bouira',
  'Tamanrasset',
  'Tébessa',
  'Tlemcen',
  'Tiaret',
  'Tizi Ouzou',
  'Alger',
  'Djelfa',
  'Jijel',
  'Sétif',
  'Saïda',
  'Skikda',
  'Sidi Bel Abbès',
  'Annaba',
  'Guelma',
  'Constantine',
  'Médéa',
  'Mostaganem',
  "M'Sila",
  'Mascara',
  'Ouargla',
  'Oran',
  'El Bayadh',
  'Illizi',
  'Bordj Bou Arréridj',
  'Boumerdès',
  'El Tarf',
  'Tindouf',
  'Tissemsilt',
  'El Oued',
  'Khenchela',
  'Souk Ahras',
  'Tipaza',
  'Mila',
  'Aïn Defla',
  'Naâma',
  'Aïn Témouchent',
  'Ghardaïa',
  'Relizane',
  'Timimoun',
  'Bordj Badji Mokhtar',
  'Ouled Djellal',
  'Béni Abbès',
  'In Salah',
  'In Guezzam',
  'Touggourt',
  'Djanet',
  "El M'Ghair",
  'El Meniaa',
];

export const CustomerList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [wilayaFilter, setWilayaFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const pageSize = 10;
  const [deleteCustomer, { loading: deleting }] = useMutation(DeleteCustomerDocument);

  // Build filter based on search term (searches email, firstName, or lastName)
  const buildFilter = () => {
    if (!searchTerm) return undefined;
    return {
      _or: [
        { emailAddress: { contains: searchTerm } },
        { firstName: { contains: searchTerm } },
        { lastName: { contains: searchTerm } },
      ],
    };
  };

  const { data, loading, error, refetch } = useQuery(AdminCustomersDocument, {
    variables: {
      options: {
        skip: currentPage * pageSize,
        take: pageSize,
        sort: { createdAt: 'DESC' as any },
        filter: buildFilter(),
      },
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    let succeeded = 0;
    let failed = 0;
    for (const id of ids) {
      try {
        const r = await deleteCustomer({ variables: { id } });
        if (r.data?.deleteCustomer?.result === 'DELETED') succeeded++;
        else failed++;
      } catch {
        failed++;
      }
    }
    dispatch(
      addToast({
        message:
          failed === 0
            ? `${succeeded} client${succeeded > 1 ? 's' : ''} supprimé${succeeded > 1 ? 's' : ''}`
            : `${succeeded} supprimé(s), ${failed} échec(s)`,
        type: failed === 0 ? 'success' : 'error',
      })
    );
    setSelectedIds(new Set());
    setShowBulkDeleteDialog(false);
    refetch();
  };

  const customers = data?.customers?.items || [];
  const totalItems = data?.customers?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Calculate stats for each customer
  const customersWithStats = useMemo(() => {
    return customers.map((customer) => {
      const orders = customer.orders?.items || [];
      const totalOrders = customer.orders?.totalItems || 0;
      const completedStates = ['PaymentSettled', 'Shipped', 'Delivered', 'PartiallyShipped', 'PartiallyDelivered'];
      const totalSpent = orders
        .filter((o) => completedStates.includes(o.state))
        .reduce((sum, o) => sum + (o.totalWithTax || 0), 0);
      return { ...customer, totalOrders, totalSpent };
    });
  }, [customers]);

  // Filter by wilaya locally
  const filteredCustomers = wilayaFilter
    ? customersWithStats.filter((c) => c.customFields?.wilaya === wilayaFilter)
    : customersWithStats;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg">Erreur: {error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} client{totalItems > 1 ? 's' : ''} enregistré{totalItems > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <PermissionGate permission="DeleteCustomer" disableMode>
              <Button
                variant="danger"
                onClick={() => setShowBulkDeleteDialog(true)}
                loading={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer ({selectedIds.size})
              </Button>
            </PermissionGate>
          )}
          <PermissionGate permission="CreateCustomer" disableMode>
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau client
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-card rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <select
            value={wilayaFilter}
            onChange={(e) => {
              setWilayaFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none md:w-64"
          >
            <option value="">Toutes les wilayas</option>
            {WILAYAS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Aucun client trouvé</p>
            {(searchTerm || wilayaFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setWilayaFilter('');
                }}
                className="mt-4 text-primary hover:text-primary/80"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-card/50">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredCustomers.length > 0 &&
                        filteredCustomers.every((c) => selectedIds.has(c.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(
                            new Set(filteredCustomers.map((c) => c.id))
                          );
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                      className="rounded border-border"
                      aria-label="Tout sélectionner"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Wilaya
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Commandes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total dépensé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Inscrit le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-accent">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(customer.id)}
                        onChange={() => toggleSelect(customer.id)}
                        className="rounded border-border"
                        aria-label={`Sélectionner ${customer.firstName} ${customer.lastName}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {(customer.firstName?.[0] || '') + (customer.lastName?.[0] || '')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">ID: {customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground flex items-center gap-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {customer.emailAddress}
                      </div>
                      {customer.phoneNumber && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {customer.phoneNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.customFields?.wilaya ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            {customer.customFields.wilaya}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ShoppingCart className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-foreground">
                          {customer.totalOrders}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-foreground">
                          {formatPrice(customer.totalSpent / 100)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.user?.verified ? (
                        <Badge variant="success" className="flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3" />
                          Vérifié
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" />
                          Non vérifié
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTime(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        to={`/customers/${customer.id}`}
                        className="text-primary hover:text-primary/80 p-2 rounded-lg hover:bg-primary/10 inline-flex"
                        title="Voir les détails"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-card/50 px-6 py-4 flex items-center justify-between border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage + 1} sur {totalPages} ({totalItems} clients)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CreateCustomerDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => refetch()}
      />
      <ConfirmDialog
        isOpen={showBulkDeleteDialog}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title={`Supprimer ${selectedIds.size} client${selectedIds.size > 1 ? 's' : ''} ?`}
        message="Cette action est irréversible. Les commandes existantes seront conservées mais ne seront plus liées à un client actif."
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
