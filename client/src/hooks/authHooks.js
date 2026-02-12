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
