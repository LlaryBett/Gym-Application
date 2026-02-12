import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api'; // Changed: import authAPI directly
import AuthContext from '../hooks/authContextValue';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData) => {
    setError(null);
    try {
      const response = await authAPI.login(loginData);
      
      if (response.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      setError(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        return { 
          success: true, 
          user: response.data.member || response.data.user 
        };
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      setError(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const clearError = () => {
    setError(null);
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || user?.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.some(role => user.roles?.includes(role) || user.role === role);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}