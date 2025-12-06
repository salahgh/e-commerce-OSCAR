import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

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
  isAuthenticated: boolean;
  loading: boolean;
}

const storedToken = localStorage.getItem('vendure_auth_token');

const initialState: AuthState = {
  user: null,
  adminInfo: null,
  channelToken: storedToken,
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
      // Store the channel token from the first channel
      if (action.payload.user.channels.length > 0) {
        const token = action.payload.user.channels[0].token;
        state.channelToken = token;
        localStorage.setItem('vendure_auth_token', token);
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
      state.isAuthenticated = false;
      localStorage.removeItem('vendure_auth_token');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, setAdminInfo, logout } = authSlice.actions;
export default authSlice.reducer;
