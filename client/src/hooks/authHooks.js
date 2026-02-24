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

// ✅ FIXED: Protected route hook with proper loading state handling
export const useProtectedRoute = (navigate) => {
  const auth = useAuth();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Case 1: No token at all - immediate redirect
    if (!token) {
      console.log('🔒 No token found, redirecting to login');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    // Case 2: Still loading - wait for auth to verify
    if (auth.loading) {
      console.log('⏳ Auth still loading, waiting...');
      return;
    }
    
    // Case 3: Loading done but not authenticated - token invalid/expired
    if (!auth.isAuthenticated) {
      console.log('🔒 Token invalid or expired, redirecting to login');
      localStorage.removeItem('token'); // Clear invalid token
      navigate('/login', { state: { from: window.location.pathname } });
    }
    
  }, [auth.loading, auth.isAuthenticated, navigate]);

  return auth;
};

// ✅ Hook to get token
export const useToken = () => {
  return localStorage.getItem('token');
};

// ✅ Hook to check if user has specific role
export const useHasRole = (role) => {
  const { user } = useAuth();
  return user?.role === role;
};