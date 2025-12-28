import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { usePermissions } from '../../hooks/usePermissions';
import type { Permission } from '../../config/permissions.config';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Single permission required to access this route */
  permission?: Permission | string;
  /** Any of these permissions required (OR logic) */
  anyOf?: (Permission | string)[];
  /** All of these permissions required (AND logic) */
  allOf?: (Permission | string)[];
  /** If true, auto-detect permissions from PAGE_PERMISSIONS config based on current path */
  autoDetect?: boolean;
}

/**
 * Protected route component that checks authentication and permissions.
 *
 * @example
 * // Basic authentication check only
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 *
 * @example
 * // With specific permission
 * <ProtectedRoute permission="ReadCatalog">
 *   <ProductsPage />
 * </ProtectedRoute>
 *
 * @example
 * // With auto-detection from PAGE_PERMISSIONS config
 * <ProtectedRoute autoDetect>
 *   <ProductsPage />
 * </ProtectedRoute>
 *
 * @example
 * // With any of multiple permissions
 * <ProtectedRoute anyOf={['ReadOrder', 'ReadCustomer']}>
 *   <ReportsPage />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
  anyOf,
  allOf,
  autoDetect = false,
}) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    getRequiredPermissions,
  } = usePermissions();

  // First check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Determine required permissions
  let isAuthorized = true;
  let requiredPermissions: (Permission | string)[] = [];

  if (permission) {
    // Explicit single permission
    isAuthorized = hasPermission(permission as Permission);
    requiredPermissions = [permission];
  } else if (anyOf && anyOf.length > 0) {
    // Any of multiple permissions
    isAuthorized = hasAnyPermission(anyOf as Permission[]);
    requiredPermissions = anyOf;
  } else if (allOf && allOf.length > 0) {
    // All permissions required
    isAuthorized = hasAllPermissions(allOf as Permission[]);
    requiredPermissions = allOf;
  } else if (autoDetect) {
    // Auto-detect from PAGE_PERMISSIONS config
    isAuthorized = canAccessRoute(location.pathname);
    requiredPermissions = getRequiredPermissions(location.pathname);
  }

  // If not authorized, redirect to access denied page
  if (!isAuthorized) {
    return (
      <Navigate
        to="/access-denied"
        replace
        state={{
          from: location,
          requiredPermissions,
        }}
      />
    );
  }

  return <>{children}</>;
};
