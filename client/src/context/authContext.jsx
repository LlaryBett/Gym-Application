import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import AuthContext from '../hooks/authContextValue';
import { useNavigate } from 'react-router-dom';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ Check auth status immediately on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found');
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await authAPI.getCurrentUser();
      
      if (response.success && response.data?.user) {
        console.log('✅ User authenticated:', response.data.user);
        setUser(response.data.user);
      } else {
        console.log('❌ Not authenticated');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth verification failed:', error);
      
      // Handle account suspension (check for suspended_at field which indicates suspension)
      if (error.status === 403 && error.suspended_at) {
        console.log('⚠️ Account is suspended');
        navigate('/suspended', { 
          state: { 
            reason: error.reason || 'Violation of terms of service',
            suspended_at: error.suspended_at,
            membershipNumber: error.membershipNumber || 'N/A'
          } 
        });
        setLoading(false);
        return;
      }
      
      if (error.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
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
        // Store token
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        // Return full response data including redirect
        return { 
          success: true, 
          user: response.data.user,
          data: {
            redirect: response.data.redirect
          }
        };
      }
      
      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      console.log('🔴 Login catch error:', error);
      console.log('Error status:', error.status);
      console.log('Error message:', error.message);
      
      // Handle any 403 error (suspended, inactive, etc) - redirect to suspended page
      if (error.status === 403) {
        console.log('✅ Account inactive/suspended - throwing suspension error');
        const suspensionError = new Error('Account suspended');
        suspensionError.suspended = true;
        suspensionError.reason = error.reason || 'Your account is not active. Please contact support.';
        suspensionError.suspended_at = error.suspended_at || new Date().toISOString();
        throw suspensionError;
      }
      
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
      
      return { success: false, error: response.message || 'Registration failed' };
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
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
      navigate('/login');
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const clearError = () => {
    setError(null);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.some(role => user.role === role);
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