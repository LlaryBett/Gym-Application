import api from './api';

const authService = {
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },

  register: async (data) => {
    return api.post('/auth/register', data);
  },

  logout: async () => {
    return api.post('/auth/logout');
  },

  getCurrentUser: async () => {
    return api.get('/auth/me');
  }
};

export default authService;
