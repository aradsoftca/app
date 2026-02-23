import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { apiService, setAccessToken, clearAccessToken } from '../services/api';
import { formatErrorForDisplay, logError } from '../utils/errorHandler';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // SEC-TOKEN-01: Restore session from HttpOnly cookie (refresh token) on startup.
    // The access token is NEVER stored on disk — we re-obtain it via the HttpOnly cookie.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // Show cached user metadata immediately for fast UI, then validate
      const cached = JSON.parse(storedUser);
      setUser(cached);
      // Silently refresh to get a new access token from the HttpOnly cookie
      apiService.refreshToken()
        .then(res => {
          const { accessToken, user: refreshedUser } = res.data;
          setAccessToken(accessToken);
          // Re-validate tier/email from server to prevent localStorage spoofing
          const validated = refreshedUser
            ? { ...cached, tier: refreshedUser.tier, email: refreshedUser.email }
            : cached;
          localStorage.setItem('user', JSON.stringify(validated));
          setUser(validated);
        })
        .catch(() => {
          // Cookie expired or invalid — force re-login
          clearAccessToken();
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.login(email, password);
      const { user: userData, accessToken } = response.data;

      // SEC-TOKEN-01: Store access token in memory only — never in localStorage.
      // The server sets the HttpOnly refreshToken cookie automatically on login.
      setAccessToken(accessToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = formatErrorForDisplay(err);
      logError(err, 'Login');
      setError(errorMessage);
      // Pass through HTTP status for rate limiting (429) handling
      const status = err?.response?.status;
      const retryAfter = parseInt(err?.response?.headers?.['retry-after'] || '60', 10);
      const code = err?.response?.data?.code;
      return { success: false, error: errorMessage, status, retryAfter, code };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.register(email, password);
      const { user: userData, accessToken } = response.data;

      // SEC-TOKEN-01: Same as login — access token in memory, cookie from server.
      setAccessToken(accessToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      logError(err, 'Register');
      const errorMessage = formatErrorForDisplay(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // SEC-TOKEN-01: No refreshToken arg — backend reads cookie and invalidates all sessions.
      await apiService.logout();
    } catch (err) {
      logError(err, 'Logout');
    } finally {
      // Clear in-memory access token and non-sensitive user metadata
      clearAccessToken();
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
