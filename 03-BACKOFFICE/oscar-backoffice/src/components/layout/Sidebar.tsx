import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { toggleSidebar } from '../../store/slices/uiSlice';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Produits', path: '/products' },
  { icon: FolderTree, label: 'Categories', path: '/categories' },
  { icon: ShoppingCart, label: 'Commandes', path: '/orders' },
  { icon: Users, label: 'Clients', path: '/customers' },
  { icon: Shield, label: 'Administrateurs', path: '/users' },
  { icon: UserCircle, label: 'Mon Profil', path: '/profile' },
  { icon: BarChart3, label: 'Rapports', path: '/reports' },
  { icon: Settings, label: 'Parametres', path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();

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
            {sidebarOpen && <span className="font-semibold text-xl text-sidebar-foreground">OSCAR</span>}
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

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive ? 'bg-sidebar-active text-sidebar-active-foreground' : 'text-sidebar-foreground hover:bg-accent',
                  !sidebarOpen && 'lg:justify-center'
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
