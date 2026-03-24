import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Shield,
  Mail,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  AdminAdministratorsDocument,
  DeleteAdministratorDocument,
} from '../../graphql/generated/graphql';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { addToast } from '../../store/slices/uiSlice';
import { formatDateTime } from '../../lib/utils';

export const UserList: React.FC = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const pageSize = 10;

  const { data, loading, error, refetch } = useQuery(AdminAdministratorsDocument, {
    variables: {
      options: {
        skip: currentPage * pageSize,
        take: pageSize,
        sort: { createdAt: 'DESC' as any },
        filter: searchTerm
          ? {
              _or: [
                { firstName: { contains: searchTerm } },
                { lastName: { contains: searchTerm } },
                { emailAddress: { contains: searchTerm } },
              ],
            }
          : undefined,
      },
    },
  });

  const [deleteAdmin, { loading: deleting }] = useMutation(DeleteAdministratorDocument, {
    onCompleted: (result) => {
      if (result.deleteAdministrator.result === 'DELETED') {
        dispatch(addToast({ type: 'success', message: 'Administrateur supprimé avec succès' }));
        refetch();
      } else {
        dispatch(
          addToast({
            type: 'error',
            message: result.deleteAdministrator.message || 'Erreur lors de la suppression',
          })
        );
      }
      setDeleteId(null);
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.message }));
      setDeleteId(null);
    },
  });

  const administrators = data?.administrators?.items || [];
  const totalItems = data?.administrators?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handleDelete = () => {
    if (deleteId) {
      deleteAdmin({ variables: { id: deleteId } });
    }
  };

  const getRoleBadgeVariant = (code: string): 'default' | 'warning' | 'success' | 'danger' => {
    if (code === '__super_admin_role__' || code.toLowerCase().includes('super')) {
      return 'danger';
    }
    if (code.toLowerCase().includes('admin')) {
      return 'warning';
    }
    return 'default';
  };

  const formatRoleCode = (code: string): string => {
    if (code === '__super_admin_role__') return 'Super Admin';
    return code.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

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
      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer l'administrateur"
        message="Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible."
        confirmText={deleting ? 'Suppression...' : 'Supprimer'}
        loading={deleting}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administrateurs</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} administrateur{totalItems > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/users/roles"
            className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent flex items-center gap-2"
          >
            <Shield className="h-5 w-5" />
            Gérer les rôles
          </Link>
          <Link
            to="/users/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nouvel admin
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Administrators Table */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : administrators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Aucun administrateur trouvé</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-primary hover:text-primary/80"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Administrateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rôles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {administrators.map((admin) => (
                  <tr key={admin.id} className="hover:bg-accent">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-900/50 flex items-center justify-center">
                          <span className="text-blue-400 font-semibold">
                            {(admin.firstName?.[0] || '') + (admin.lastName?.[0] || '')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {admin.firstName} {admin.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">ID: {admin.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground flex items-center gap-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {admin.emailAddress}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {admin.user?.roles?.map((role) => (
                          <Badge
                            key={role.id}
                            variant={getRoleBadgeVariant(role.code)}
                            className="text-xs"
                          >
                            {formatRoleCode(role.code)}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.user?.verified ? (
                        <Badge variant="success" className="flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3" />
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" />
                          En attente
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {admin.user?.lastLogin
                        ? formatDateTime(admin.user.lastLogin)
                        : 'Jamais connecté'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/users/${admin.id}`}
                          className="text-primary hover:text-primary/80 p-2 rounded-lg hover:bg-primary/10"
                          title="Voir les détails"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                          to={`/users/${admin.id}/edit`}
                          className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-900/50"
                          title="Modifier"
                        >
                          <Pencil className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(admin.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/50"
                          title="Supprimer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-background/50 px-6 py-4 flex items-center justify-between border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage + 1} sur {totalPages} ({totalItems} administrateurs)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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
    </div>
  );
};
