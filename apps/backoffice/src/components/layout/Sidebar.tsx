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

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  /** If true, always show (e.g., Profile) */
  alwaysVisible?: boolean;
  /** If true, hide completely when user lacks permission (instead of disabling) */
  hideWhenNoAccess?: boolean;
}

// NOTE: access for each item is derived from the route → permission map
// (PAGE_PERMISSIONS) via `canAccessRoute`, the same source the router guard uses.
// Do NOT duplicate permission lists here — that's what previously let the sidebar
// and the guard disagree (e.g. Medias looked enabled but landed on /access-denied).
const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Produits', path: '/products' },
  { icon: FolderTree, label: 'Categories', path: '/categories' },
  { icon: Image, label: 'Medias', path: '/assets' },
  { icon: Palette, label: 'Attributs', path: '/facets' },
  { icon: ShoppingCart, label: 'Commandes', path: '/orders' },
  { icon: Users, label: 'Clients', path: '/customers' },
  { icon: Tag, label: 'Codes Promo', path: '/promotions' },
  { icon: Shield, label: 'Administrateurs', path: '/users' },
  { icon: UserCircle, label: 'Mon Profil', path: '/profile', alwaysVisible: true },
  { icon: BarChart3, label: 'Rapports', path: '/reports' },
  { icon: Settings, label: 'Parametres', path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();
  const { canAccessRoute, getRequiredPermissions, getPermissionDescription } = usePermissions();

  // Access is derived from the SAME route→permission mapping the router guard uses
  // (canAccessRoute → PAGE_PERMISSIONS, SuperAdmin-aware), so the sidebar can never
  // disagree with ProtectedRoute and present an item that then lands on /access-denied.
  const hasAccess = (item: MenuItem): boolean => {
    if (item.alwaysVisible) return true;
    return canAccessRoute(item.path);
  };

  // Get tooltip message for disabled items
  const getDisabledTooltip = (item: MenuItem): string => {
    const required = getRequiredPermissions(item.path);
    if (required.length === 0) return '';
    const permissionLabels = required.map((p) => getPermissionDescription(p));
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
