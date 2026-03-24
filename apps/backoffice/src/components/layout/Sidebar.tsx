import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  BarChart3,
  Settings,
  ChevronLeft,
  UserCircle,
  Shield,
  Tag,
  Image,
  Palette,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { usePermissions } from '../../hooks/usePermissions';
import { Tooltip } from '../ui/Tooltip';
import type { Permission } from '../../config/permissions.config';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  /** Permissions required to access (OR logic) */
  permissions?: Permission[];
  /** If true, always show (e.g., Profile) */
  alwaysVisible?: boolean;
  /** If true, hide completely when user lacks permission (instead of disabling) */
  hideWhenNoAccess?: boolean;
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/',
    permissions: ['ReadCatalog', 'ReadOrder', 'ReadCustomer'],
    hideWhenNoAccess: true,
  },
  {
    icon: Package,
    label: 'Produits',
    path: '/products',
    permissions: ['ReadCatalog'],
  },
  {
    icon: FolderTree,
    label: 'Categories',
    path: '/categories',
    permissions: ['ReadCatalog'],
  },
  {
    icon: Image,
    label: 'Medias',
    path: '/assets',
    permissions: ['ReadCatalog'],
  },
  {
    icon: Palette,
    label: 'Attributs',
    path: '/facets',
    permissions: ['ReadCatalog'],
  },
  {
    icon: ShoppingCart,
    label: 'Commandes',
    path: '/orders',
    permissions: ['ReadOrder'],
  },
  {
    icon: Users,
    label: 'Clients',
    path: '/customers',
    permissions: ['ReadCustomer'],
  },
  {
    icon: Tag,
    label: 'Codes Promo',
    path: '/promotions',
    permissions: ['ReadPromotion'],
  },
  {
    icon: Shield,
    label: 'Administrateurs',
    path: '/users',
    permissions: ['ReadAdministrator'],
  },
  {
    icon: UserCircle,
    label: 'Mon Profil',
    path: '/profile',
    alwaysVisible: true,
  },
  {
    icon: BarChart3,
    label: 'Rapports',
    path: '/reports',
    permissions: ['ReadOrder', 'ReadCustomer'],
  },
  {
    icon: Settings,
    label: 'Parametres',
    path: '/settings',
    permissions: ['ReadSettings'],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();
  const { hasAnyPermission, getPermissionDescription, isSuperAdmin } = usePermissions();

  // Check if user has permission to access a menu item
  const hasAccess = (item: MenuItem): boolean => {
    if (isSuperAdmin) return true;
    if (item.alwaysVisible) return true;
    if (!item.permissions || item.permissions.length === 0) return true;
    return hasAnyPermission(item.permissions);
  };

  // Get tooltip message for disabled items
  const getDisabledTooltip = (item: MenuItem): string => {
    if (!item.permissions || item.permissions.length === 0) return '';
    const permissionLabels = item.permissions.map((p) => getPermissionDescription(p));
    return `Permission requise: ${permissionLabels.join(' ou ')}`;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-30 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarOpen ? 'w-64' : 'lg:w-20'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              O
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-xl text-sidebar-foreground">OSCAR</span>
            )}
          </div>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:block hidden text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft
              className={cn('h-5 w-5 transition-transform', !sidebarOpen && 'rotate-180')}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const canAccess = hasAccess(item);

            // If user lacks access and item should be hidden, skip rendering
            if (!canAccess && item.hideWhenNoAccess) {
              return null;
            }

            // If user has access, render normal link
            if (canAccess) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-sidebar-active text-sidebar-active-foreground'
                      : 'text-sidebar-foreground hover:bg-accent',
                    !sidebarOpen && 'lg:justify-center'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            }

            // If user lacks permission, render disabled item with tooltip
            return (
              <Tooltip
                key={item.path}
                content={<p className="text-sm">{getDisabledTooltip(item)}</p>}
                position="right"
              >
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    'text-muted-foreground opacity-50 cursor-not-allowed',
                    !sidebarOpen && 'lg:justify-center'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </div>
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
