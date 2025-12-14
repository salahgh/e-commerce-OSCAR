import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
  Key,
} from 'lucide-react';
import {
  AdminRolesDocument,
  DeleteRoleDocument,
} from '../../graphql/generated/graphql';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { addToast } from '../../store/slices/uiSlice';
import { formatDateTime } from '../../lib/utils';

export const RoleList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const pageSize = 10;

  const { data, loading, error, refetch } = useQuery(AdminRolesDocument, {
    variables: {
      options: {
        skip: currentPage * pageSize,
        take: pageSize,
        sort: { createdAt: 'DESC' as any },
        filter: searchTerm
          ? {
              _or: [
                { code: { contains: searchTerm } },
                { description: { contains: searchTerm } },
              ],
            }
          : undefined,
      },
    },
  });

  const [deleteRole, { loading: deleting }] = useMutation(DeleteRoleDocument, {
    onCompleted: (result) => {
      if (result.deleteRole.result === 'DELETED') {
        dispatch(addToast({ type: 'success', message: 'Rôle supprimé avec succès' }));
        refetch();
      } else {
        dispatch(addToast({
          type: 'error',
          message: result.deleteRole.message || 'Erreur lors de la suppression',
        }));
      }
      setDeleteId(null);
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.message }));
      setDeleteId(null);
    },
  });

  const roles = data?.roles?.items || [];
  const totalItems = data?.roles?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handleDelete = () => {
    if (deleteId) {
      deleteRole({ variables: { id: deleteId } });
    }
  };

  const formatRoleCode = (code: string): string => {
    if (code === '__super_admin_role__') return 'Super Admin';
    return code
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
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

  const isSystemRole = (code: string): boolean => {
    return code === '__super_admin_role__' || code === '__customer_role__';
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
        title="Supprimer le rôle"
        message="Êtes-vous sûr de vouloir supprimer ce rôle ? Les administrateurs ayant ce rôle perdront les permissions associées."
        confirmText={deleting ? 'Suppression...' : 'Supprimer'}
        loading={deleting}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des rôles</h1>
            <p className="text-muted-foreground mt-1">
              {totalItems} rôle{totalItems > 1 ? 's' : ''} défini{totalItems > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link
          to="/users/roles/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nouveau rôle
        </Link>
      </div>

      {/* Search */}
      <div className="bg-card rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par code ou description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Aucun rôle trouvé</p>
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
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-accent">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-900/50 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <Badge variant={getRoleBadgeVariant(role.code)}>
                            {formatRoleCode(role.code)}
                          </Badge>
                          {isSystemRole(role.code) && (
                            <p className="text-xs text-muted-foreground mt-1">Rôle système</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground max-w-xs truncate">
                        {role.description || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {role.permissions?.length || 0} permission{(role.permissions?.length || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTime(role.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isSystemRole(role.code) && (
                          <>
                            <Link
                              to={`/users/roles/${role.id}/edit`}
                              className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-900/50"
                              title="Modifier"
                            >
                              <Pencil className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => setDeleteId(role.id)}
                              className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/50"
                              title="Supprimer"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
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
                  Page {currentPage + 1} sur {totalPages} ({totalItems} rôles)
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
