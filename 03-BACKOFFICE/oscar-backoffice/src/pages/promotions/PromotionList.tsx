import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import {
  Tag,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Calendar,
  Users,
  Percent,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
  Copy,
  ToggleLeft,
  ToggleRight,
  Filter,
  X,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminPromotionsDocument,
  DeletePromotionDocument,
  UpdatePromotionDocument,
} from '../../graphql/generated/graphql';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatDateTime, formatDate } from '../../lib/utils';

type FilterStatus = 'all' | 'active' | 'inactive' | 'expired' | 'scheduled';

export const PromotionList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);
  const pageSize = 10;

  const { data, loading, error, refetch } = useQuery(AdminPromotionsDocument, {
    variables: {
      options: {
        skip: currentPage * pageSize,
        take: pageSize,
        sort: { createdAt: 'DESC' as any },
        filter: searchTerm
          ? {
              _or: [
                { name: { contains: searchTerm } },
                { couponCode: { contains: searchTerm } },
              ],
            }
          : undefined,
      },
    },
  });

  const [deletePromotion, { loading: deleting }] = useMutation(DeletePromotionDocument);
  const [updatePromotion] = useMutation(UpdatePromotionDocument);

  const promotions = data?.promotions?.items || [];
  const totalItems = data?.promotions?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Calculate promotion status
  const getPromotionStatus = (promo: any) => {
    const now = new Date();
    const startsAt = promo.startsAt ? new Date(promo.startsAt) : null;
    const endsAt = promo.endsAt ? new Date(promo.endsAt) : null;

    if (!promo.enabled) return 'inactive';
    if (endsAt && endsAt < now) return 'expired';
    if (startsAt && startsAt > now) return 'scheduled';
    return 'active';
  };

  // Filter promotions by status
  const filteredPromotions = useMemo(() => {
    if (statusFilter === 'all') return promotions;
    return promotions.filter((promo) => getPromotionStatus(promo) === statusFilter);
  }, [promotions, statusFilter]);

  // Get discount info from actions
  const getDiscountInfo = (promo: any) => {
    const action = promo.actions?.[0];
    if (!action) return { type: 'unknown', value: '-' };

    const discountArg = action.args?.find(
      (a: any) => a.name === 'discount' || a.name === 'discountPercentage' || a.name === 'amount'
    );

    if (action.code.includes('percentage') || action.code.includes('Percentage')) {
      return { type: 'percentage', value: discountArg?.value || '0' };
    }
    return { type: 'fixed', value: discountArg?.value || '0' };
  };

  // Get minimum order from conditions
  const getMinOrderAmount = (promo: any) => {
    const condition = promo.conditions?.find((c: any) =>
      c.code.includes('minimum_order') || c.code.includes('minimumOrder')
    );
    if (!condition) return null;
    const amountArg = condition.args?.find((a: any) => a.name === 'amount' || a.name === 'orderTotal');
    return amountArg?.value;
  };

  const handleDelete = async () => {
    if (!promotionToDelete) return;
    try {
      await deletePromotion({ variables: { id: promotionToDelete } });
      dispatch(addToast({ message: 'Code promo supprimé', type: 'success' }));
      refetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
    setDeleteDialogOpen(false);
    setPromotionToDelete(null);
  };

  const handleToggleEnabled = async (promo: any) => {
    try {
      await updatePromotion({
        variables: {
          input: {
            id: promo.id,
            enabled: !promo.enabled,
          },
        },
      });
      dispatch(
        addToast({
          message: promo.enabled ? 'Code promo désactivé' : 'Code promo activé',
          type: 'success',
        })
      );
      refetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    dispatch(addToast({ message: 'Code copié!', type: 'success' }));
  };

  const statusConfig: Record<string, { label: string; variant: any; icon: React.ReactNode }> = {
    active: {
      label: 'Actif',
      variant: 'success',
      icon: <CheckCircle className="h-3 w-3" />,
    },
    inactive: {
      label: 'Inactif',
      variant: 'default',
      icon: <XCircle className="h-3 w-3" />,
    },
    expired: {
      label: 'Expiré',
      variant: 'danger',
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    scheduled: {
      label: 'Programmé',
      variant: 'info',
      icon: <Clock className="h-3 w-3" />,
    },
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg">Erreur: {error.message}</p>
          <button
            onClick={() => refetch()}
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
          <h1 className="text-3xl font-bold text-foreground">Codes Promo</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} code{totalItems > 1 ? 's' : ''} promo
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/promotions/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Code Promo
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom ou code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'inactive', 'expired', 'scheduled'] as FilterStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {status === 'all'
                      ? 'Tous'
                      : status === 'active'
                        ? 'Actifs'
                        : status === 'inactive'
                          ? 'Inactifs'
                          : status === 'expired'
                            ? 'Expirés'
                            : 'Programmés'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Tag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Aucun code promo trouvé</p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
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
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Code / Nom
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Réduction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Validité
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Limites
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPromotions.map((promo) => {
                  const status = getPromotionStatus(promo);
                  const discount = getDiscountInfo(promo);
                  const minOrder = getMinOrderAmount(promo);
                  const config = statusConfig[status];

                  return (
                    <tr key={promo.id} className="hover:bg-accent/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Tag className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {promo.couponCode ? (
                                <button
                                  onClick={() => handleCopyCode(promo.couponCode!)}
                                  className="font-mono text-foreground font-bold bg-muted px-2 py-1 rounded hover:bg-accent transition-colors flex items-center gap-1"
                                  title="Cliquer pour copier"
                                >
                                  {promo.couponCode}
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                                </button>
                              ) : (
                                <span className="text-muted-foreground italic">Auto</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{promo.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {discount.type === 'percentage' ? (
                            <>
                              <Percent className="h-4 w-4 text-green-400" />
                              <span className="text-foreground font-medium">
                                {discount.value}%
                              </span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-green-400" />
                              <span className="text-foreground font-medium">
                                {(parseInt(discount.value) / 100).toLocaleString('fr-DZ')} DA
                              </span>
                            </>
                          )}
                        </div>
                        {minOrder && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Min: {(parseInt(minOrder) / 100).toLocaleString('fr-DZ')} DA
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          {promo.startsAt && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Début: {formatDate(promo.startsAt)}
                            </div>
                          )}
                          {promo.endsAt && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Fin: {formatDate(promo.endsAt)}
                            </div>
                          )}
                          {!promo.startsAt && !promo.endsAt && (
                            <span className="text-muted-foreground">Illimité</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="space-y-1">
                          {promo.usageLimit && (
                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {promo.usageLimit} total
                            </div>
                          )}
                          {promo.perCustomerUsageLimit && (
                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {promo.perCustomerUsageLimit}/client
                            </div>
                          )}
                          {!promo.usageLimit && !promo.perCustomerUsageLimit && (
                            <span className="text-muted-foreground text-sm">Illimité</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                          {config.icon}
                          {config.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleEnabled(promo)}
                            className={`p-2 rounded-lg transition-colors ${
                              promo.enabled
                                ? 'text-green-400 hover:bg-green-500/20'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                            title={promo.enabled ? 'Désactiver' : 'Activer'}
                          >
                            {promo.enabled ? (
                              <ToggleRight className="h-5 w-5" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                          </button>
                          <Link
                            to={`/promotions/${promo.id}`}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => {
                              setPromotionToDelete(promo.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage + 1} sur {totalPages} ({totalItems} codes)
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPromotionToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer le code promo"
        message="Êtes-vous sûr de vouloir supprimer ce code promo? Cette action est irréversible."
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
