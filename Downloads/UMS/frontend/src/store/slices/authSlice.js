import { createSlice } from '@reduxjs/toolkit';
import { setAccessToken, clearAccessToken } from '../../api/axiosInstance';

// User metadata stored in sessionStorage (non-sensitive: username, role only)
const loadUserMeta = () => {
  try {
    const raw = sessionStorage.getItem('ums_user_meta');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const userMeta = loadUserMeta();

const initialState = {
  // accessToken intentionally NOT stored here — lives in axiosInstance memory
  isAuthenticated: !!userMeta,
  user: userMeta, // { username, role, userId }
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      const { accessToken, refreshToken, username, role, userId } = action.payload;

      // Store access token in memory only
      setAccessToken(accessToken);

      // Store refresh token in sessionStorage (not localStorage)
      sessionStorage.setItem('ums_refresh_token', refreshToken);

      // Store non-sensitive user metadata in sessionStorage for page reload recovery
      const meta = { username, role, userId };
      sessionStorage.setItem('ums_user_meta', JSON.stringify(meta));

      state.isAuthenticated = true;
      state.user = meta;
      state.loading = false;
      state.error = null;
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      clearAccessToken();
      sessionStorage.removeItem('ums_refresh_token');
      sessionStorage.removeItem('ums_user_meta');
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    // Called on app boot when restoring session via refresh token
    restoreSession(state, action) {
      const { accessToken, username, role, userId } = action.payload;
      setAccessToken(accessToken);
      const meta = { username, role, userId };
      sessionStorage.setItem('ums_user_meta', JSON.stringify(meta));
      state.isAuthenticated = true;
      state.user = meta;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError, restoreSession } =
  authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectRole = (state) => state.auth.user?.role;

export default authSlice.reducer;
