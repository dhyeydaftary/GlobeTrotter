import React, { createContext, useContext, useState, useEffect } from 'react';
import { get } from '../api/client';
import Spinner from '../components/Spinner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('globetrotter_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const rehydrateUser = async () => {
      const storedToken = localStorage.getItem('globetrotter_token');
      if (storedToken) {
        try {
          const userData = await get('/auth/me');
          if (isMounted) {
            setUser(userData);
            setToken(storedToken);
          }
        } catch (err) {
          // Stored token is stale/invalid (or backend rejected it) — don't trust it, log out cleanly.
          if (isMounted) {
            localStorage.removeItem('globetrotter_token');
            setUser(null);
            setToken(null);
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    rehydrateUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('globetrotter_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('globetrotter_token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token && user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
