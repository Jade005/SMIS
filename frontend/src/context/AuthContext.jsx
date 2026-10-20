import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    const token = localStorage.getItem('smis_token');

    try {
      if (token) {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setAuthError(null);
      } else {
        // Ping health endpoint to confirm server availability on initial load
        await api.get('/health', { timeout: 3500 });
        setAuthError(null);
      }
    } catch (err) {
      console.error('Initial backend connection check:', err);
      const isNetworkError =
        !err.response ||
        err.code === 'ERR_NETWORK' ||
        err.code === 'ECONNABORTED' ||
        err.message?.includes('Network Error');

      if (isNetworkError) {
        setAuthError("Can't connect to the server");
        // Keep loading true so the error state displays on the branded LoadingScreen
        return;
      }

      // If token expired or unauthorized (401/403), gracefully clear token
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('smis_token');
        setUser(null);
        setAuthError(null);
      }
    } finally {
      // If no network error occurred, mark initial loading as complete
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password, portal) => {
    const res = await api.post('/auth/login', { email, password, portal });
    const { token, user: userData } = res.data;
    localStorage.setItem('smis_token', token);

    // Brief smooth loading transition before role dashboard displays
    setIsLoggingIn(true);
    setUser(userData);
    await new Promise((r) => setTimeout(r, 650));
    setIsLoggingIn(false);

    return userData;
  };

  const logout = async () => {
    // Brief smooth loading transition while redirecting
    setIsLoggingOut(true);
    await new Promise((r) => setTimeout(r, 450));
    localStorage.removeItem('smis_token');
    setUser(null);
    setIsLoggingOut(false);
  };

  const retryAuth = () => {
    checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        authError,
        isLoggingIn,
        isLoggingOut,
        login,
        logout,
        retryAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
