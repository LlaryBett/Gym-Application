// hooks/authHooks.js
import { useContext, useEffect } from 'react';
import AuthContext from './authContextValue';

export const useAuth = () => useContext(AuthContext);

export const useRequireAuth = () => {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      console.warn('Authentication required');
    }
  }, [auth.loading, auth.isAuthenticated]);

  return auth;
};

// ✅ Updated: Protected route hook with token check
export const useProtectedRoute = (navigate) => {
  const auth = useAuth();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!auth.loading) {
      if (!token) {
        // No token at all
        navigate('/login', { state: { from: window.location.pathname } });
      } else if (!auth.isAuthenticated) {
        // Token exists but verification failed
        console.warn('Token invalid or expired');
        navigate('/login', { state: { from: window.location.pathname } });
      }
    }
  }, [auth.loading, auth.isAuthenticated, navigate]);

  return auth;
};

// ✅ NEW: Hook to get token
export const useToken = () => {
  return localStorage.getItem('token');
};

// ✅ NEW: Hook to check if user has specific role
export const useHasRole = (role) => {
  const { user } = useAuth();
  return user?.role === role;
};