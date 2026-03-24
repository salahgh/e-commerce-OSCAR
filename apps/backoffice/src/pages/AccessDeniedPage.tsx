import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Home, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { usePermissions } from '../hooks/usePermissions';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { Permission } from '../config/permissions.config';

interface LocationState {
  from?: { pathname: string };
  requiredPermissions?: (Permission | string)[];
}

/**
 * Access Denied page displayed when user lacks required permissions
 */
export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { permissions, getPermissionDescription, isSuperAdmin } = usePermissions();

  const state = location.state as LocationState | null;
  const attemptedPath = state?.from?.pathname || '/';
  const requiredPermissions = state?.requiredPermissions || [];

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="w-12 h-12 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-foreground mb-2">Accès Refusé</h1>
        <p className="text-center text-muted-foreground mb-8">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>

        {/* Attempted path */}
        {attemptedPath !== '/' && (
          <div className="bg-card rounded-lg p-4 mb-6 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Page demandée:</p>
            <code className="text-sm font-mono text-foreground">{attemptedPath}</code>
          </div>
        )}

        {/* Required permissions */}
        {requiredPermissions.length > 0 && (
          <div className="bg-card rounded-lg p-4 mb-6 border border-border">
            <p className="text-sm text-muted-foreground mb-3">Permissions requises:</p>
            <div className="flex flex-wrap gap-2">
              {requiredPermissions.map((permission) => (
                <Badge key={permission} variant="danger">
                  {getPermissionDescription(permission as Permission)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Current permissions */}
        <div className="bg-card rounded-lg p-4 mb-8 border border-border">
          <p className="text-sm text-muted-foreground mb-3">Vos permissions actuelles:</p>
          {isSuperAdmin ? (
            <Badge variant="success">SuperAdmin (Tous les droits)</Badge>
          ) : permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {permissions.slice(0, 10).map((permission) => (
                <Badge key={permission} variant="info">
                  {getPermissionDescription(permission)}
                </Badge>
              ))}
              {permissions.length > 10 && (
                <Badge variant="default">+{permissions.length - 10} autres</Badge>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Aucune permission assignée</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleGoBack}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="flex-1"
          >
            Retour
          </Button>
          <Button
            variant="primary"
            onClick={handleGoToDashboard}
            icon={<Home className="w-4 h-4" />}
            className="flex-1"
          >
            Tableau de bord
          </Button>
          <Button
            variant="danger"
            onClick={handleLogout}
            icon={<LogOut className="w-4 h-4" />}
            className="flex-1"
          >
            Déconnexion
          </Button>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Si vous pensez que c'est une erreur, veuillez contacter votre administrateur.
        </p>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
