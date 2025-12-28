import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Shield,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  AdminAdministratorDocument,
  DeleteAdministratorDocument,
} from '../../graphql/generated/graphql';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { addToast } from '../../store/slices/uiSlice';
import { formatDateTime } from '../../lib/utils';

export const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, loading, error } = useQuery(AdminAdministratorDocument, {
    variables: { id: id! },
    skip: !id,
  });

  const [deleteAdmin, { loading: deleting }] = useMutation(DeleteAdministratorDocument, {
    onCompleted: (result) => {
      if (result.deleteAdministrator.result === 'DELETED') {
        dispatch(addToast({ type: 'success', message: 'Administrateur supprimé avec succès' }));
        setTimeout(() => navigate('/users'), 1500);
      } else {
        dispatch(
          addToast({
            type: 'error',
            message: result.deleteAdministrator.message || 'Erreur lors de la suppression',
          })
        );
      }
      setShowDeleteDialog(false);
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.message }));
      setShowDeleteDialog(false);
    },
  });

  const admin = data?.administrator;

  const handleDelete = () => {
    if (id) {
      deleteAdmin({ variables: { id } });
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

  const formatPermission = (permission: string): string => {
    return permission
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg">Erreur: {error.message}</p>
          <button
            onClick={() => navigate('/users')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Administrateur non trouvé</p>
          <button
            onClick={() => navigate('/users')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer l'administrateur"
        message={`Êtes-vous sûr de vouloir supprimer ${admin.firstName} ${admin.lastName} ? Cette action est irréversible.`}
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
            <h1 className="text-3xl font-bold text-foreground">
              {admin.firstName} {admin.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">ID: {admin.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/users/${id}/edit`}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
          >
            <Pencil className="h-5 w-5" />
            Modifier
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="h-5 w-5" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Info */}
        <Card className="lg:col-span-2 bg-card border-border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Informations</h2>

            <div className="flex items-start gap-6 mb-6">
              <div className="h-20 w-20 rounded-full bg-blue-900/50 flex items-center justify-center">
                <span className="text-blue-400 font-bold text-2xl">
                  {(admin.firstName?.[0] || '') + (admin.lastName?.[0] || '')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground">
                  {admin.firstName} {admin.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{admin.emailAddress}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {admin.user?.verified ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Compte actif
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      En attente de vérification
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  Créé le
                </div>
                <p className="text-foreground mt-1">{formatDateTime(admin.createdAt)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="h-4 w-4" />
                  Dernière connexion
                </div>
                <p className="text-foreground mt-1">
                  {admin.user?.lastLogin ? formatDateTime(admin.user.lastLogin) : 'Jamais connecté'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Roles */}
        <Card className="bg-card border-border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Rôles assignés
            </h2>

            {admin.user?.roles && admin.user.roles.length > 0 ? (
              <div className="space-y-4">
                {admin.user.roles.map((role) => (
                  <div key={role.id} className="p-4 bg-background rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={getRoleBadgeVariant(role.code)}>
                        {formatRoleCode(role.code)}
                      </Badge>
                    </div>
                    {role.description && (
                      <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                    )}
                    {role.permissions && role.permissions.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {role.permissions.length} permission
                          {role.permissions.length > 1 ? 's' : ''}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 5).map((perm) => (
                            <span
                              key={perm}
                              className="text-xs px-2 py-1 bg-card text-muted-foreground rounded"
                            >
                              {formatPermission(perm)}
                            </span>
                          ))}
                          {role.permissions.length > 5 && (
                            <span className="text-xs px-2 py-1 bg-card text-muted-foreground rounded">
                              +{role.permissions.length - 5} autres
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucun rôle assigné</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
