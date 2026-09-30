import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser((prev) => ({ ...prev, ...res.data }));
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: jwtToken, userId, name, role } = response.data;
    const userData = { userId, name, email, role, token: jwtToken };

    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
    return response.data;
  };

  const register = async (name, email, password, role = 'CUSTOMER') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { token: jwtToken, userId, role: userRole } = response.data;
    const userData = { userId, name, email, role: userRole, token: jwtToken };

    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
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
