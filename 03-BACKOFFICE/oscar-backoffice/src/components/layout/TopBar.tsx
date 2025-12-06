import React from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { AdminLogoutDocument } from '../../graphql/generated/graphql';

export const TopBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const adminInfo = useAppSelector((state) => state.auth.adminInfo);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const [logoutMutation] = useMutation(AdminLogoutDocument);

  const handleLogout = async () => {
    try {
      await logoutMutation();
    } catch (error) {
      console.error('Logout error:', error);
    }
    dispatch(logout());
    navigate('/login');
  };

  // Get display name
  const displayName = adminInfo
    ? `${adminInfo.firstName} ${adminInfo.lastName}`
    : user?.identifier || 'Admin';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="text-gray-400 hover:text-gray-200 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-100">Back-Office OSCAR</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700">
          <Bell className="h-5 w-5" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700"
          >
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {getInitials(displayName)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-100">{displayName}</p>
              <p className="text-xs text-gray-400">Administrateur</p>
            </div>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-20">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  <User className="h-4 w-4" />
                  Mon profil
                </button>
                <hr className="my-1 border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/30"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
