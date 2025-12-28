import { useMemo, useCallback } from 'react';
import { useAppSelector } from './useAppSelector';
import {
  selectCurrentPermissions,
  selectIsSuperAdmin,
  selectCurrentChannel,
} from '../store/slices/authSlice';
import {
  CRUD_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  getRoutePermissions,
  type Permission,
} from '../config/permissions.config';

/**
 * Hook for checking user permissions in the Oscar Backoffice
 *
 * Usage:
 * ```tsx
 * const { hasPermission, canCreate, canUpdate, canDelete } = usePermissions();
 *
 * if (hasPermission('CreateCatalog')) {
 *   // Show create button
 * }
 *
 * if (canUpdate('products')) {
 *   // Allow editing
 * }
 * ```
 */
export const usePermissions = () => {
  const permissions = useAppSelector(selectCurrentPermissions);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const currentChannel = useAppSelector(selectCurrentChannel);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission: Permission | string): boolean => {
      if (isSuperAdmin) return true;
      return permissions.includes(permission as Permission);
    },
    [permissions, isSuperAdmin]
  );

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (requiredPermissions: (Permission | string)[]): boolean => {
      if (isSuperAdmin) return true;
      return requiredPermissions.some((p) => permissions.includes(p as Permission));
    },
    [permissions, isSuperAdmin]
  );

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (requiredPermissions: (Permission | string)[]): boolean => {
      if (isSuperAdmin) return true;
      return requiredPermissions.every((p) => permissions.includes(p as Permission));
    },
    [permissions, isSuperAdmin]
  );

  /**
   * Check if user can CREATE an entity
   */
  const canCreate = useCallback(
    (entity: keyof typeof CRUD_PERMISSIONS): boolean => {
      if (isSuperAdmin) return true;
      const permission = CRUD_PERMISSIONS[entity]?.create;
      return permission ? permissions.includes(permission) : false;
    },
    [permissions, isSuperAdmin]
  );

  /**
   * Check if user can READ an entity
   */
  const canRead = useCallback(
    (entity: keyof typeof CRUD_PERMISSIONS): boolean => {
      if (isSuperAdmin) return true;
      const permission = CRUD_PERMISSIONS[entity]?.read;
      return permission ? permissions.includes(permission) : false;
    },
    [permissions, isSuperAdmin]
  );

  /**
   * Check if user can UPDATE an entity
   */
  const canUpdate = useCallback(
    (entity: keyof typeof CRUD_PERMISSIONS): boolean => {
      if (isSuperAdmin) return true;
      const permission = CRUD_PERMISSIONS[entity]?.update;
      return permission ? permissions.includes(permission) : false;
    },
    [permissions, isSuperAdmin]
  );

  /**
   * Check if user can DELETE an entity
   */
  const canDelete = useCallback(
    (entity: keyof typeof CRUD_PERMISSIONS): boolean => {
      if (isSuperAdmin) return true;
      const permission = CRUD_PERMISSIONS[entity]?.delete;
      return permission ? permissions.includes(permission) : false;
    },
    [permissions, isSuperAdmin]
  );

  /**
   * Check if user can access a specific route
   */
  const canAccessRoute = useCallback(
    (path: string): boolean => {
      if (isSuperAdmin) return true;
      const routePermissions = getRoutePermissions(path);
      if (!routePermissions) return true; // No permissions required
      return routePermissions.some((p) => permissions.includes(p));
    },
    [permissions, isSuperAdmin]
  );

  /**
   * Get required permissions for a route
   */
  const getRequiredPermissions = useCallback((path: string): Permission[] => {
    return getRoutePermissions(path) || [];
  }, []);

  /**
   * Get human-readable description for a permission
   */
  const getPermissionDescription = useCallback((permission: Permission | string): string => {
    return PERMISSION_DESCRIPTIONS[permission as Permission] || permission;
  }, []);

  /**
   * Get list of missing permissions for a route
   */
  const getMissingPermissions = useCallback(
    (path: string): Permission[] => {
      if (isSuperAdmin) return [];
      const required = getRoutePermissions(path) || [];
      return required.filter((p) => !permissions.includes(p));
    },
    [permissions, isSuperAdmin]
  );

  return useMemo(
    () => ({
      // State
      permissions,
      isSuperAdmin,
      currentChannel,

      // Permission checks
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,

      // CRUD shortcuts
      canCreate,
      canRead,
      canUpdate,
      canDelete,

      // Route checks
      canAccessRoute,
      getRequiredPermissions,
      getMissingPermissions,

      // Utilities
      getPermissionDescription,
    }),
    [
      permissions,
      isSuperAdmin,
      currentChannel,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canCreate,
      canRead,
      canUpdate,
      canDelete,
      canAccessRoute,
      getRequiredPermissions,
      getMissingPermissions,
      getPermissionDescription,
    ]
  );
};

export default usePermissions;
