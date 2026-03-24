import React, { cloneElement, isValidElement } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Tooltip } from '../ui/Tooltip';
import type { Permission } from '../../config/permissions.config';

interface PermissionGateProps {
  /** Single permission required */
  permission?: Permission | string;
  /** Any of these permissions (OR logic) */
  anyOf?: (Permission | string)[];
  /** All of these permissions (AND logic) */
  allOf?: (Permission | string)[];
  /** If true, show disabled element with tooltip instead of hiding */
  disableMode?: boolean;
  /** Custom tooltip message when disabled */
  disabledTooltip?: string;
  /** Children to render if authorized */
  children: React.ReactNode;
  /** Fallback content when not authorized (used when disableMode is false) */
  fallback?: React.ReactNode;
}

/**
 * Component that gates access to its children based on user permissions.
 *
 * @example
 * // Single permission - hide if not authorized
 * <PermissionGate permission="CreateCatalog">
 *   <Button>Create Product</Button>
 * </PermissionGate>
 *
 * @example
 * // Single permission - disable if not authorized
 * <PermissionGate permission="DeleteCatalog" disableMode>
 *   <Button>Delete Product</Button>
 * </PermissionGate>
 *
 * @example
 * // Any of multiple permissions
 * <PermissionGate anyOf={['UpdateOrder', 'SuperAdmin']} disableMode>
 *   <Button>Update Order</Button>
 * </PermissionGate>
 *
 * @example
 * // All permissions required
 * <PermissionGate allOf={['UpdateCatalog', 'UpdateAsset']} disableMode>
 *   <Button>Update Product with Images</Button>
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  anyOf,
  allOf,
  disableMode = false,
  disabledTooltip,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, getPermissionDescription } =
    usePermissions();

  // Determine if user is authorized
  let isAuthorized = true;
  let requiredPermissions: (Permission | string)[] = [];

  if (permission) {
    isAuthorized = hasPermission(permission as Permission);
    requiredPermissions = [permission];
  } else if (anyOf && anyOf.length > 0) {
    isAuthorized = hasAnyPermission(anyOf as Permission[]);
    requiredPermissions = anyOf;
  } else if (allOf && allOf.length > 0) {
    isAuthorized = hasAllPermissions(allOf as Permission[]);
    requiredPermissions = allOf;
  }

  // If authorized, render children normally
  if (isAuthorized) {
    return <>{children}</>;
  }

  // If not authorized and not in disable mode, render fallback or nothing
  if (!disableMode) {
    return <>{fallback}</>;
  }

  // In disable mode, show disabled element with tooltip
  const tooltipMessage =
    disabledTooltip ||
    `Permission requise: ${requiredPermissions.map((p) => getPermissionDescription(p as Permission)).join(', ')}`;

  // Try to clone the child element with disabled state
  if (isValidElement(children)) {
    const disabledChild = cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      disabled: true,
      'aria-disabled': true,
      className:
        `${(children.props as { className?: string })?.className || ''} opacity-50 cursor-not-allowed`.trim(),
      onClick: (e: React.MouseEvent) => e.preventDefault(),
    });

    return (
      <Tooltip content={<p className="text-sm">{tooltipMessage}</p>}>
        <span className="inline-block">{disabledChild}</span>
      </Tooltip>
    );
  }

  // If children is not a valid element, wrap in a span
  return (
    <Tooltip content={<p className="text-sm">{tooltipMessage}</p>}>
      <span className="opacity-50 cursor-not-allowed inline-block">{children}</span>
    </Tooltip>
  );
};

/**
 * Specialized PermissionGate for CRUD operations on entities
 */
interface CrudPermissionGateProps {
  /** Entity name (products, orders, customers, etc.) */
  entity: string;
  /** CRUD operation */
  operation: 'create' | 'read' | 'update' | 'delete';
  /** If true, show disabled element with tooltip instead of hiding */
  disableMode?: boolean;
  /** Custom tooltip message when disabled */
  disabledTooltip?: string;
  /** Children to render if authorized */
  children: React.ReactNode;
  /** Fallback content when not authorized */
  fallback?: React.ReactNode;
}

/**
 * CRUD-specific permission gate that automatically maps entity + operation to permission
 *
 * @example
 * <CrudPermissionGate entity="products" operation="create" disableMode>
 *   <Button>Create Product</Button>
 * </CrudPermissionGate>
 */
export const CrudPermissionGate: React.FC<CrudPermissionGateProps> = ({
  entity,
  operation,
  disableMode = false,
  disabledTooltip,
  children,
  fallback = null,
}) => {
  const { canCreate, canRead, canUpdate, canDelete } = usePermissions();

  // Check permission based on operation
  let isAuthorized = false;
  switch (operation) {
    case 'create':
      isAuthorized = canCreate(entity as Parameters<typeof canCreate>[0]);
      break;
    case 'read':
      isAuthorized = canRead(entity as Parameters<typeof canRead>[0]);
      break;
    case 'update':
      isAuthorized = canUpdate(entity as Parameters<typeof canUpdate>[0]);
      break;
    case 'delete':
      isAuthorized = canDelete(entity as Parameters<typeof canDelete>[0]);
      break;
  }

  // Map operation to French label
  const operationLabels: Record<string, string> = {
    create: 'Créer',
    read: 'Voir',
    update: 'Modifier',
    delete: 'Supprimer',
  };

  const entityLabels: Record<string, string> = {
    products: 'produits',
    orders: 'commandes',
    customers: 'clients',
    administrators: 'administrateurs',
    settings: 'paramètres',
    promotions: 'promotions',
    assets: 'ressources',
  };

  const tooltip =
    disabledTooltip ||
    `Permission requise: ${operationLabels[operation]} ${entityLabels[entity] || entity}`;

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (!disableMode) {
    return <>{fallback}</>;
  }

  // In disable mode, show disabled element with tooltip
  if (isValidElement(children)) {
    const disabledChild = cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      disabled: true,
      'aria-disabled': true,
      className:
        `${(children.props as { className?: string })?.className || ''} opacity-50 cursor-not-allowed`.trim(),
      onClick: (e: React.MouseEvent) => e.preventDefault(),
    });

    return (
      <Tooltip content={<p className="text-sm">{tooltip}</p>}>
        <span className="inline-block">{disabledChild}</span>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={<p className="text-sm">{tooltip}</p>}>
      <span className="opacity-50 cursor-not-allowed inline-block">{children}</span>
    </Tooltip>
  );
};

export default PermissionGate;
