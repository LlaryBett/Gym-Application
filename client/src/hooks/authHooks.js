// hooks/authHooks.js
import { useContext } from 'react';
import AuthContext from './authContextValue';

export const useAuth = () => useContext(AuthContext);

// Simple hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const { user, loading } = useAuth();
  return { isAuthenticated: !!user, loading };
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