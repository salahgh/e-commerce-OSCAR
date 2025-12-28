import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Permission } from '../../config/permissions.config';

// Vendure CurrentUser type
interface VendureUser {
  id: string;
  identifier: string;
  channels: Array<{
    id: string;
    code: string;
    token: string;
    permissions: string[];
  }>;
}

// Admin info
interface AdminInfo {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
}

interface AuthState {
  user: VendureUser | null;
  adminInfo: AdminInfo | null;
  channelToken: string | null;
  currentChannelId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const storedToken = localStorage.getItem('vendure_auth_token');
const storedChannelId = localStorage.getItem('vendure_channel_id');
const storedUser = localStorage.getItem('vendure_user');

// Try to parse stored user data
let parsedUser = null;
try {
  if (storedUser) {
    parsedUser = JSON.parse(storedUser);
  }
} catch (e) {
  console.error('Failed to parse stored user:', e);
  localStorage.removeItem('vendure_user');
}

const initialState: AuthState = {
  user: parsedUser,
  adminInfo: null,
  channelToken: storedToken,
  currentChannelId: storedChannelId,
  isAuthenticated: !!storedToken,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action: PayloadAction<{ user: VendureUser }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      // Store user data for persistence
      localStorage.setItem('vendure_user', JSON.stringify(action.payload.user));
      // Store the channel token and ID from the first channel
      if (action.payload.user.channels.length > 0) {
        const channel = action.payload.user.channels[0];
        state.channelToken = channel.token;
        state.currentChannelId = channel.id;
        localStorage.setItem('vendure_auth_token', channel.token);
        localStorage.setItem('vendure_channel_id', channel.id);
      }
    },
    // Action to restore user from Me query
    setUser: (state, action: PayloadAction<VendureUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('vendure_user', JSON.stringify(action.payload));
      // Update channel if needed
      if (action.payload.channels.length > 0 && !state.currentChannelId) {
        const channel = action.payload.channels[0];
        state.channelToken = channel.token;
        state.currentChannelId = channel.id;
        localStorage.setItem('vendure_auth_token', channel.token);
        localStorage.setItem('vendure_channel_id', channel.id);
      }
    },
    setCurrentChannel: (state, action: PayloadAction<string>) => {
      const channel = state.user?.channels.find((c) => c.id === action.payload);
      if (channel) {
        state.currentChannelId = channel.id;
        state.channelToken = channel.token;
        localStorage.setItem('vendure_auth_token', channel.token);
        localStorage.setItem('vendure_channel_id', channel.id);
      }
    },
    loginFailure: (state) => {
      state.loading = false;
    },
    setAdminInfo: (state, action: PayloadAction<AdminInfo>) => {
      state.adminInfo = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.adminInfo = null;
      state.channelToken = null;
      state.currentChannelId = null;
      state.isAuthenticated = false;
      localStorage.removeItem('vendure_auth_token');
      localStorage.removeItem('vendure_channel_id');
      localStorage.removeItem('vendure_user');
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  setAdminInfo,
  setCurrentChannel,
  setUser,
  logout,
} = authSlice.actions;
export default authSlice.reducer;

// ============ SELECTORS ============

// Base selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAdminInfo = (state: RootState) => state.auth.adminInfo;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentChannelId = (state: RootState) => state.auth.currentChannelId;

// Get current channel
export const selectCurrentChannel = createSelector(
  [selectUser, selectCurrentChannelId],
  (user, channelId) => {
    if (!user || !channelId) {
      // Return first channel if no current channel is set
      return user?.channels[0] || null;
    }
    return user.channels.find((c) => c.id === channelId) || user.channels[0] || null;
  }
);

// Get current permissions for the active channel
export const selectCurrentPermissions = createSelector([selectCurrentChannel], (channel) => {
  return (channel?.permissions || []) as Permission[];
});

// Check if user has SuperAdmin permission
export const selectIsSuperAdmin = createSelector([selectCurrentPermissions], (permissions) => {
  return permissions.includes('SuperAdmin' as Permission);
});

// Get all channels user has access to
export const selectUserChannels = createSelector([selectUser], (user) => {
  return user?.channels || [];
});

// Helper selector factory: check if user has a specific permission
export const makeSelectHasPermission = (permission: Permission) =>
  createSelector([selectCurrentPermissions, selectIsSuperAdmin], (permissions, isSuperAdmin) => {
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  });

// Helper selector factory: check if user has any of the specified permissions
export const makeSelectHasAnyPermission = (requiredPermissions: Permission[]) =>
  createSelector([selectCurrentPermissions, selectIsSuperAdmin], (permissions, isSuperAdmin) => {
    if (isSuperAdmin) return true;
    return requiredPermissions.some((p) => permissions.includes(p));
  });

// Helper selector factory: check if user has all of the specified permissions
export const makeSelectHasAllPermissions = (requiredPermissions: Permission[]) =>
  createSelector([selectCurrentPermissions, selectIsSuperAdmin], (permissions, isSuperAdmin) => {
    if (isSuperAdmin) return true;
    return requiredPermissions.every((p) => permissions.includes(p));
  });
