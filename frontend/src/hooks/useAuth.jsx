import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../api/axios';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = () => {
      const access = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');

      const finish = () => setLoading(false);

      // Helper: set session from stored user and token
      const setSessionFromStorage = () => {
        try {
          if (!storedUser) return false;
          if (!access) return false;
          const decoded = jwtDecode(access);
          if (decoded.exp * 1000 > Date.now()) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
            return true;
          }
          return false;
        } catch (e) {
          console.error('Error decoding token on init:', e);
          return false;
        }
      };

      // 1) If access is valid, rehydrate session
      if (setSessionFromStorage()) {
        finish();
        return;
      }

      // 2) If access missing/expired but refresh exists, try refreshing
      if (refresh && storedUser) {
        authAPI
          .refreshToken(refresh)
          .then((resp) => {
            const { access: newAccess } = resp.data || {};
            if (newAccess) {
              localStorage.setItem('access_token', newAccess);
              // Rehydrate user
              setUser(JSON.parse(storedUser));
              setIsAuthenticated(true);
            } else {
              // No access returned, logout
              logout();
            }
          })
          .catch((err) => {
            console.warn('Auto-refresh on init failed:', err?.response?.data || err?.message);
            logout();
          })
          .finally(finish);
        return;
      }

      // 3) No valid tokens, ensure logged out
      logout();
      finish();
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      const { access, refresh, user } = response.data;

      // Store tokens and user data
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
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
